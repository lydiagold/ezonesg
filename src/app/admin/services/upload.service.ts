import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminApiService } from '../admin-api.service';

export type UploadFolder = 'products' | 'homepage' | 'banners' | 'categories';

export interface UploadResult {
  key: string;
  previewUrl: string;
}

/**
 * Two-step secure upload: (1) ask the admin API for a presigned PUT URL, (2) PUT
 * the bytes straight to S3. Image bytes never pass through the Lambda, and the
 * bucket is never publicly writable.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly api = inject(AdminApiService);
  private readonly http = inject(HttpClient);

  async upload(file: File, folder: UploadFolder): Promise<UploadResult> {
    const presign = await firstValueFrom(this.api.presignUpload({
      folder,
      contentType: file.type,
      contentLength: file.size,
      filename: file.name,
    }));

    // Direct PUT to S3. Content-Type MUST match what was signed.
    await firstValueFrom(this.http.put(presign.uploadUrl, file, {
      headers: { 'Content-Type': presign.contentType },
    }));

    return { key: presign.key, previewUrl: presign.previewUrl };
  }
}
