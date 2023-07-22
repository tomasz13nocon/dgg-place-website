import { BUCKET, s3 } from '$lib/s3';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export const load = async ({ params }) => {
	let imageFilenames: string[] = [];

	let truncated = true;
	let continuationToken;
	while (truncated) {
		const response = await s3.send(
			new ListObjectsV2Command({
				Bucket: BUCKET,
				// Prefix: `${S3_IMAGE_PATH}${size}`,
				ContinuationToken: continuationToken
			})
		);

		imageFilenames = imageFilenames.concat(response.Contents.map((content) => content.Key));

		truncated = response.IsTruncated;
		if (truncated) {
			continuationToken = response.NextContinuationToken;
		}
	}

	return {
		images: imageFilenames
	};
};

export const actions = {
	default: async ({ request }) => {
		return { success: true };
	}
};
