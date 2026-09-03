import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CognitoAuthService } from './cognito-auth.service';

/**
 * Route guard for /admin/*. Redirects unauthenticated users to /admin/login.
 * This is a UX convenience ONLY — the backend (API Gateway JWT authorizer +
 * MASTER_ADMIN group check) is the real authority. Never rely on this alone.
 */
export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(CognitoAuthService);
  const router = inject(Router);

  const hasSession = await auth.restoreSession();
  if (hasSession) return true;

  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};
