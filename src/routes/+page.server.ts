import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import sharp from 'sharp';
import fs from 'fs/promises';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import { BUCKET, BUCKET_URL, s3 } from '$lib/s3';

/** Returns sharp object as raw data */
async function convertImage(inputImage: File) {
	const inputBuffer = await inputImage.arrayBuffer();

	const { width, height } = await sharp(inputBuffer).metadata();
	const { data } = await sharp(inputBuffer).raw().toBuffer({ resolveWithObject: true });

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
		const merge = data.get('merge');
		const mergeImage = data.get('mergeImage');
		const x = data.get('x');
		const y = data.get('y');
		console.log(mergeImage);

		if (
			!(image instanceof File) ||
			image.type !== 'image/png' ||
			(merge &&
				(!x ||
					!y ||
					isNaN(+x) ||
					isNaN(+y) ||
					!(mergeImage instanceof File) ||
					mergeImage.type !== 'image/png'))
		) {
			return fail(400, { error: 'required fields missing or wrong type' });
		}
		// TODO validate image res not exceeding bottom right

		const filename = `${image.name.endsWith('.png') ? image.name.slice(0, -4) : image.name
			}-${genHex(12)}.png`;
		let result;
		try {
			result = await convertImage(image);
			result = await result.png().toBuffer();

			// await fs.mkdir('./static/conversions', { recursive: true });

			if (merge) {
				const template = await (mergeImage as File).arrayBuffer();
				let merged = await sharp(template)
					.composite([{ input: result, left: +x! * 3, top: +y! * 3 }])
					.png()
					.toBuffer();

				await fs.writeFile(`./static/conversions/template_${filename}`, merged);
			}

			await fs.writeFile(`./static/conversions/${filename}`, result);
		} catch (e) {
			console.log(e);
			return fail(400, { error: 'Error converting image' });
		}

		return {
			conversionSuccess: true,
			imageUrl: `/conversions/${filename}`,
			templateUrl: merge ? `/conversions/template_${filename}` : undefined
		};
	}

	// submit: async ({ request }) => {
	// 	const data = await request.formData();
	// 	const image = data.get('image');
	// 	const x = data.get('x');
	// 	const y = data.get('y');
	//
	// 	if (!image || !(image instanceof File)) {
	// 		return fail(400, { error: 'required fields missing or wrong type' });
	// 	}
	//
	// 	// const filename = `${x}_${y}_${name}_${genHex(12)}.png`;
	// 	const filename = `${genHex(16)}.png`;
	// 	try {
	// 		await s3.send(
	// 			new PutObjectCommand({
	// 				Bucket: BUCKET,
	// 				Key: filename,
	// 				Body: await image.arrayBuffer(),
	// 				ContentType: 'image/png'
	// 			})
	// 		);
	// 	} catch (e) {
	// 		console.log(e);
	// 		return fail(400, { error: 'Error uploading image' });
	// 	}
	//
	// 	return { submissionSuccess: true, name };
	// }
} satisfies Actions;
