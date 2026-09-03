import { ok } from '../lib/http.js';
import { getConfig, DEFAULT_HOMEPAGE } from '../lib/store.js';
import { presignGet } from '../lib/s3.js';

/**
 * GET /api/homepage — PUBLIC homepage configuration for the storefront.
 *
 * Returns only presentation content (hero, sections, banners, cards, copy). No
 * sensitive settings are ever included. Image keys are resolved to presigned GET
 * URLs so private S3 objects render without making the bucket public.
 */
export async function getPublicHomepage() {
  const cfg = (await getConfig('homepage')) ?? DEFAULT_HOMEPAGE;
  return ok(await withPublicUrls(cfg));
}

async function withPublicUrls(cfg) {
  const c = JSON.parse(JSON.stringify(cfg));
  const url = key => (key && !key.startsWith('assets/') ? presignGet(key, 6 * 3600) : Promise.resolve(key ? key : ''));

  if (c.hero) {
    c.hero.desktopImageUrl = await url(c.hero.desktopImageKey);
    c.hero.mobileImageUrl = await url(c.hero.mobileImageKey);
  }
  for (const card of c.categoryCards?.items ?? []) card.imageUrl = await url(card.imageKey);
  for (const b of c.banners?.items ?? []) {
    b.imageUrl = await url(b.imageKey);
    b.mobileImageUrl = await url(b.mobileImageKey);
  }
  return c;
}
