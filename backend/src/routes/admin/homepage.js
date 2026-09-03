import { ok, HttpError, parseBody } from '../../lib/http.js';
import { getConfig, putConfig, DEFAULT_HOMEPAGE } from '../../lib/store.js';
import { audit } from '../../lib/audit.js';
import { presignGet } from '../../lib/s3.js';

/** GET /api/admin/homepage — full editable config (seeded from defaults). */
export async function adminGetHomepage() {
  const cfg = (await getConfig('homepage')) ?? DEFAULT_HOMEPAGE;
  return ok(await withPreviewUrls(cfg));
}

/**
 * PUT /api/admin/homepage — save the whole homepage config.
 * Simple single-document model (no draft/publish) per the spec's "don't
 * over-engineer" guidance; Save === Publish for v1.
 */
export async function adminSaveHomepage(event, actor) {
  const body = parseBody(event);
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Invalid homepage config');
  // Shallow-merge onto defaults so a partial save never drops a section.
  const merged = { ...DEFAULT_HOMEPAGE, ...body };
  const saved = await putConfig('homepage', merged);
  await audit(actor, { action: 'HOMEPAGE_PUBLISHED', entity: 'homepage', entityId: 'homepage' });
  return ok(saved);
}

/** Attach presigned GET URLs for any S3 image keys so the editor can preview them. */
async function withPreviewUrls(cfg) {
  const clone = JSON.parse(JSON.stringify(cfg));
  const resolve = async key => (key ? presignGet(key) : '');

  if (clone.hero) {
    clone.hero.desktopImageUrl = await resolve(clone.hero.desktopImageKey);
    clone.hero.mobileImageUrl = await resolve(clone.hero.mobileImageKey);
  }
  for (const c of clone.categoryCards?.items ?? []) c.imageUrl = await resolve(c.imageKey);
  for (const b of clone.banners?.items ?? []) {
    b.imageUrl = await resolve(b.imageKey);
    b.mobileImageUrl = await resolve(b.mobileImageKey);
  }
  return clone;
}
