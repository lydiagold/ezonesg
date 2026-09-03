import { randomUUID } from 'node:crypto';
import { ok, parseBody } from '../../lib/http.js';
import { presignUpload } from '../../lib/s3.js';
import { audit } from '../../lib/audit.js';

/**
 * POST /api/admin/uploads/presign
 * Body: { folder, contentType, contentLength, filename }
 * Returns a short-lived presigned PUT URL. The browser uploads bytes straight to
 * S3 (they never pass through the Lambda). Type/extension/size are validated.
 */
export async function adminPresignUpload(event, actor) {
  const body = parseBody(event);
  const result = await presignUpload(
    {
      folder: body.folder,
      contentType: body.contentType,
      contentLength: Number(body.contentLength),
      filename: body.filename,
    },
    () => `${Date.now().toString(36)}-${randomUUID()}`
  );
  await audit(actor, { action: 'IMAGE_UPLOAD_PRESIGNED', entity: 'image', entityId: result.key });
  return ok(result);
}
