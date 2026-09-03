import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SETTINGS } from '../config/business.config';

export interface SeoData {
  title: string;
  description?: string;
  /** Absolute or root-relative path for the canonical URL. */
  path?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

/**
 * Lightweight per-route SEO: document title, meta description, OpenGraph tags,
 * and canonical link. Basic SEO without introducing Angular SSR in Phase 1.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  update(data: SeoData): void {
    const fullTitle = `${data.title} | ${SETTINGS.businessName}`;
    this.title.setTitle(fullTitle);

    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
    }
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:type', content: data.type ?? 'website' });
    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
    }

    const url = `https://${SETTINGS.domain}${data.path ?? ''}`;
    this.meta.updateTag({ property: 'og:url', content: url });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
