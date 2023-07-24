import { S3Client } from '@aws-sdk/client-s3';
import { ACCOUNT_ID, S3_ACCESS_KEY, S3_SECRET_KEY } from '$env/static/private';

export const s3 = new S3Client({
	// region: 'us-east-1',
	region: 'auto',
	endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY
	}
});

// export const BUCKET = 'dgg-place';
// export const BUCKET_URL = `https://${BUCKET}.s3.amazonaws.com`;
export const BUCKET = 'dggplace';
export const BUCKET_URL = `https://pub-fb5232a982784e8bbaa92a00fdb66273.r2.dev`;
