import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpError } from './http.js';

// @aws-sdk/* (incl. s3-request-presigner) ships in the Lambda Node 20 runtime, so
// nothing is vendored — consistent with lib/db.js.
const s3 = new S3Client({});

const BUCKET = process.env.IMAGES_BUCKET;
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);

// Allow-list of image types → canonical extension. Rejects anything else.
const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

// Uploads are confined to these key prefixes; the bucket is never broadly writable.
const ALLOWED_FOLDERS = new Set(['products', 'homepage', 'banners', 'categories']);

/**
 * Validate an upload request and return a short-lived presigned PUT URL plus the
 * object key and a presigned GET URL for immediate preview. The browser PUTs the
 * bytes directly to S3 — they never pass through the Lambda.
 */
export async function presignUpload({ folder, contentType, contentLength, filename }, keyGen) {
  if (!ALLOWED_FOLDERS.has(folder)) throw new HttpError(400, 'Invalid upload folder');
  const ext = ALLOWED[contentType];
  if (!ext) throw new HttpError(400, 'Unsupported image type');
  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    throw new HttpError(400, 'Missing file size');
  }
  if (contentLength > MAX_BYTES) {
    throw new HttpError(400, `Image exceeds ${Math.round(MAX_BYTES / 1024 / 1024)}MB limit`);
  }

  const safeExt = sanitizeExt(filename, ext);
  const key = `${folder}/${keyGen()}.${safeExt}`;

  const putUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      // Enforce the declared size at S3 too (defence in depth beyond the check above).
      ContentLength: contentLength,
    }),
    { expiresIn: 300 } // 5 minutes to complete the upload
  );

  const getUrl = await presignGet(key);
  return { key, uploadUrl: putUrl, previewUrl: getUrl, maxBytes: MAX_BYTES, contentType };
}

/** Presigned GET for serving/previewing a private object. */
export function presignGet(key, expiresIn = 3600) {
  if (!key) return Promise.resolve('');
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export async function deleteObject(key) {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

function sanitizeExt(filename, fallback) {
  const m = /\.([a-z0-9]{2,5})$/i.exec(filename || '');
  const raw = (m?.[1] || fallback).toLowerCase();
  return raw === 'jpeg' ? 'jpg' : raw;
}
