import { S3Client } from '@aws-sdk/client-s3';
import { S3_ACCESS_KEY, S3_SECRET_KEY } from '$env/static/private';

export const s3 = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY
	}
});

export const BUCKET = 'dgg-place';
