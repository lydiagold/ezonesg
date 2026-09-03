import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HomepageConfig, DEFAULT_HOMEPAGE } from '../models/homepage.model';

/**
 * Supplies the public homepage configuration. In mock mode (or if the API fails),
 * returns the built-in defaults so the storefront always renders — the admin
 * config is a progressive enhancement, never a hard dependency.
 */
@Injectable({ providedIn: 'root' })
export class HomepageService {
  private readonly http = inject(HttpClient);

  get(): Observable<HomepageConfig> {
    if (environment.useMock) return of(DEFAULT_HOMEPAGE);
    return this.http.get<Partial<HomepageConfig>>(`${environment.apiBaseUrl}/api/homepage`).pipe(
      // Merge onto defaults so a partial/older config never leaves a section blank.
      map(cfg => ({ ...DEFAULT_HOMEPAGE, ...cfg })),
      catchError(() => of(DEFAULT_HOMEPAGE)),
    );
  }
}
