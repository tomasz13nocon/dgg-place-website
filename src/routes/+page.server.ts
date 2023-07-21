import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
// import fs from 'fs/promises';
// import PNG from 'pngjs';
import sharp from 'sharp';

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

	await sharp(Uint8Array.from(destData), {
		raw: { width: destWidth, height: destHeight, channels: 4 }
	}).toFile('out.png');
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const image = data.get('image');

		if (!(image instanceof File)) {
			return fail(400, { error: 'image is required and must be a file' });
		}
		try {
			await convertImage(image);
		} catch (e) {
			return fail(400, { error: 'Error processing image' });
		}

		if (!name) {
			// return fail(400, { error: 'name is required' });
		}

		return { success: true, name };
	}
} satisfies Actions;
