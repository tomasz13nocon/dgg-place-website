import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { BUCKET, s3 } from '$lib/s3';

/** Returns sharp object as raw data */
async function convertImage(inputImage: File) {
	const inputBuffer = await inputImage.arrayBuffer();

	const { width, height } = await sharp(inputBuffer).metadata();
	const { data, info } = await sharp(inputBuffer).raw().toBuffer({ resolveWithObject: true });

	if (width === undefined || height === undefined) {
		throw new Error('Image width or height is undefined');
	}

	const destWidth = width * 3;
	const destHeight = height * 3;
	let destData = new Array(destWidth * destHeight * 4).fill(0);
	let k = 0;

	for (let i = 1; i < destHeight; i += 3) {
		for (let j = 1; j < destWidth; j += 3) {
			let destI = (i * destWidth + j) * 4;
			destData[destI] = data[k];
			destData[destI + 1] = data[k + 1];
			destData[destI + 2] = data[k + 2];
			destData[destI + 3] = data[k + 3];
			k += 4;
		}
	}

	return sharp(Uint8Array.from(destData), {
		raw: { width: destWidth, height: destHeight, channels: 4 }
	});
}

const genHex = (size: number) =>
	[...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export const actions = {
	convert: async ({ request }) => {
		const data = await request.formData();
		const image = data.get('image');

		if (!(image instanceof File)) {
			return fail(400, { error: 'required fields missing or wrong type' });
		}

		let result;
		try {
			result = await convertImage(image);
			result = await result.png().toBuffer();
		} catch (e) {
			console.log(e);
			return fail(400, { error: 'Error converting image' });
		}

		const filename = `${genHex(20)}.png`;
		try {
			await s3.send(
				new PutObjectCommand({
					Bucket: BUCKET,
					Key: `conversions/${filename}`,
					Body: result,
					ContentType: 'image/png'
				})
			);
		} catch (e) {
			console.log(e);
			return fail(400, { error: 'Error uploading image' });
		}

		return {
			conversionSuccess: true,
			imageUrl: `https://${BUCKET}.s3.amazonaws.com/conversions/${filename}`
		};
	},

	submit: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const image = data.get('image');
		const x = data.get('x');
		const y = data.get('y');

		if (
			!name ||
			!image ||
			!x ||
			!y ||
			typeof name !== 'string' ||
			isNaN(+x) ||
			isNaN(+y) ||
			!(image instanceof File)
		) {
			return fail(400, { error: 'required fields missing or wrong type' });
		}

		if (name.includes('_')) {
			return fail(400, { error: 'name cannot contain underscore' });
		}

		const filename = `${x}_${y}_${name}_${genHex(12)}.png`;
		try {
			await s3.send(
				new PutObjectCommand({
					Bucket: BUCKET,
					Key: filename,
					Body: await image.arrayBuffer(),
					ContentType: 'image/png'
				})
			);
		} catch (e) {
			console.log(e);
			return fail(400, { error: 'Error uploading image' });
		}

		return { submissionSuccess: true, name };
	}
} satisfies Actions;
