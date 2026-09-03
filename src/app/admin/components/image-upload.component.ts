import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService, UploadFolder } from '../services/upload.service';

/**
 * Reusable image picker. Uploads via presigned S3 PUT and emits the resulting
 * object key. Shows a live preview. Validates type/size client-side too (the
 * backend re-validates authoritatively).
 */
@Component({
  selector: 'ez-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ez-upload">
      <div class="ez-upload__preview" [class.empty]="!previewUrl()">
        <img *ngIf="previewUrl()" [src]="previewUrl()" [alt]="label" />
        <span *ngIf="!previewUrl()" class="muted">No image</span>
      </div>
      <div class="ez-upload__actions">
        <label class="btn btn-outline">
          {{ uploading() ? 'Uploading…' : (previewUrl() ? 'Replace' : 'Upload') }}
          <input type="file" accept="image/*" hidden (change)="onPick($event)" [disabled]="uploading()" />
        </label>
        <button *ngIf="previewUrl()" type="button" class="btn btn-ghost" (click)="clear()" [disabled]="uploading()">Remove</button>
      </div>
      <p *ngIf="error()" class="field-error">{{ error() }}</p>
    </div>
  `,
  styles: [`
    .ez-upload { display: flex; flex-direction: column; gap: 0.5rem; }
    .ez-upload__preview {
      width: 100%; max-width: 240px; aspect-ratio: 4/3; border: 1px dashed var(--ez-border-strong);
      border-radius: var(--ez-radius-sm); display: grid; place-items: center; overflow: hidden;
      background: var(--ez-surface-muted);
    }
    .ez-upload__preview img { width: 100%; height: 100%; object-fit: contain; }
    .ez-upload__actions { display: flex; gap: 0.5rem; align-items: center; }
    .ez-upload__actions label { margin: 0; }
  `],
})
export class ImageUploadComponent {
  private readonly uploads = inject(UploadService);

  @Input() folder: UploadFolder = 'products';
  @Input() label = 'Image';
  /** Existing preview URL (e.g. presigned GET from the API). */
  @Input() set value(url: string | undefined) { if (url !== undefined) this.previewUrl.set(url); }
  /** Emits the S3 object key to store on the entity. Empty string when cleared. */
  @Output() keyChange = new EventEmitter<string>();
  /** Emits key + presigned preview URL together, for live rendering. */
  @Output() uploaded = new EventEmitter<{ key: string; previewUrl: string }>();

  readonly previewUrl = signal<string>('');
  readonly uploading = signal(false);
  readonly error = signal<string>('');

  private static readonly MAX = 5 * 1024 * 1024;

  async onPick(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error.set('');

    if (!file.type.startsWith('image/')) { this.error.set('Please choose an image file.'); return; }
    if (file.size > ImageUploadComponent.MAX) { this.error.set('Image must be 5MB or smaller.'); return; }

    this.uploading.set(true);
    try {
      const { key, previewUrl } = await this.uploads.upload(file, this.folder);
      this.previewUrl.set(previewUrl);
      this.keyChange.emit(key);
      this.uploaded.emit({ key, previewUrl });
    } catch (e: any) {
      this.error.set(e?.error?.error || e?.message || 'Upload failed.');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  clear() {
    this.previewUrl.set('');
    this.keyChange.emit('');
  }
}
