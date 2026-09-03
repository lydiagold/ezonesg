import { Injectable, signal } from '@angular/core';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { environment } from '../../../environments/environment';

export interface AdminIdentity {
  email: string;
  groups: string[];
}

/**
 * Thin wrapper over amazon-cognito-identity-js (SRP auth, no client secret) — the
 * Cognito-recommended lightweight browser approach. Tokens live only in the SDK's
 * managed storage; the app never persists raw credentials itself. Backend
 * authorization (API Gateway JWT authorizer + MASTER_ADMIN group check) remains
 * authoritative — this service is purely for obtaining/refreshing tokens.
 */
@Injectable({ providedIn: 'root' })
export class CognitoAuthService {
  /** True when a user pool + client are configured (post terraform apply). */
  readonly configured = Boolean(environment.cognito.userPoolId && environment.cognito.clientId);

  /** Reactive identity for the admin shell; null when signed out. */
  readonly identity = signal<AdminIdentity | null>(null);

  private readonly pool = this.configured
    ? new CognitoUserPool({
        UserPoolId: environment.cognito.userPoolId,
        ClientId: environment.cognito.clientId,
      })
    : null;

  /** In-flight user during a NEW_PASSWORD_REQUIRED / MFA challenge. */
  private challengeUser: CognitoUser | null = null;
  private userAttributes: Record<string, string> = {};

  private cognitoUser(email: string): CognitoUser {
    return new CognitoUser({ Username: email, Pool: this.pool! });
  }

  /**
   * Attempt sign-in. Resolves to:
   *  - { status: 'OK' } on success
   *  - { status: 'NEW_PASSWORD_REQUIRED' } → call completeNewPassword()
   *  - { status: 'MFA' } → call sendMfaCode()
   */
  signIn(email: string, password: string): Promise<{ status: 'OK' | 'NEW_PASSWORD_REQUIRED' | 'MFA' }> {
    this.ensureConfigured();
    const user = this.cognitoUser(email);
    const auth = new AuthenticationDetails({ Username: email, Password: password });

    return new Promise((resolve, reject) => {
      user.authenticateUser(auth, {
        onSuccess: session => { this.onSession(session); resolve({ status: 'OK' }); },
        onFailure: err => reject(normalizeError(err)),
        newPasswordRequired: (attrs) => {
          this.challengeUser = user;
          // Cognito rejects these immutable fields on the update call.
          delete attrs.email_verified;
          delete attrs.email;
          this.userAttributes = attrs ?? {};
          resolve({ status: 'NEW_PASSWORD_REQUIRED' });
        },
        totpRequired: () => { this.challengeUser = user; resolve({ status: 'MFA' }); },
        mfaRequired: () => { this.challengeUser = user; resolve({ status: 'MFA' }); },
      });
    });
  }

  /** Complete the first-login forced password change. */
  completeNewPassword(newPassword: string): Promise<void> {
    if (!this.challengeUser) return Promise.reject(new Error('No password challenge in progress'));
    return new Promise((resolve, reject) => {
      this.challengeUser!.completeNewPasswordChallenge(newPassword, this.userAttributes, {
        onSuccess: session => { this.onSession(session); this.challengeUser = null; resolve(); },
        onFailure: err => reject(normalizeError(err)),
      });
    });
  }

  /** Submit a TOTP code for an MFA challenge. */
  sendMfaCode(code: string): Promise<void> {
    if (!this.challengeUser) return Promise.reject(new Error('No MFA challenge in progress'));
    return new Promise((resolve, reject) => {
      this.challengeUser!.sendMFACode(code, {
        onSuccess: session => { this.onSession(session); this.challengeUser = null; resolve(); },
        onFailure: err => reject(normalizeError(err)),
      }, 'SOFTWARE_TOKEN_MFA');
    });
  }

  forgotPassword(email: string): Promise<void> {
    this.ensureConfigured();
    const user = this.cognitoUser(email);
    return new Promise((resolve, reject) => {
      user.forgotPassword({ onSuccess: () => resolve(), onFailure: err => reject(normalizeError(err)) });
    });
  }

  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    this.ensureConfigured();
    const user = this.cognitoUser(email);
    return new Promise((resolve, reject) => {
      user.confirmPassword(code, newPassword, { onSuccess: () => resolve(), onFailure: err => reject(normalizeError(err)) });
    });
  }

  /** Fresh, valid ID token (auto-refreshes via the refresh token). '' if none. */
  getIdToken(): Promise<string> {
    if (!this.pool) return Promise.resolve('');
    const user = this.pool.getCurrentUser();
    if (!user) return Promise.resolve('');
    return new Promise(resolve => {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) { resolve(''); return; }
        this.hydrateIdentity(session);
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }

  /** Restore identity from an existing session on app start; false if none. */
  async restoreSession(): Promise<boolean> {
    const token = await this.getIdToken();
    return Boolean(token);
  }

  signOut(): void {
    const user = this.pool?.getCurrentUser();
    user?.signOut();
    this.identity.set(null);
    this.challengeUser = null;
  }

  private onSession(session: CognitoUserSession) {
    this.hydrateIdentity(session);
  }

  private hydrateIdentity(session: CognitoUserSession) {
    const payload = session.getIdToken().decodePayload() as Record<string, unknown>;
    const groups = normalizeGroups(payload['cognito:groups']);
    this.identity.set({
      email: (payload['email'] as string) || (payload['cognito:username'] as string) || '',
      groups,
    });
  }

  private ensureConfigured() {
    if (!this.pool) {
      throw new Error('Admin sign-in is not configured yet. Set environment.cognito after terraform apply.');
    }
  }
}

function normalizeGroups(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') return raw.replace(/^\[|\]$/g, '').split(/[\s,]+/).filter(Boolean);
  return [];
}

/** Map raw Cognito errors to friendly, non-leaky messages. */
function normalizeError(err: unknown): Error {
  const e = err as { code?: string; message?: string };
  const map: Record<string, string> = {
    NotAuthorizedException: 'Incorrect email or password.',
    UserNotFoundException: 'Incorrect email or password.',
    PasswordResetRequiredException: 'A password reset is required. Use "Forgot password".',
    CodeMismatchException: 'That code is incorrect. Please try again.',
    ExpiredCodeException: 'That code has expired. Request a new one.',
    LimitExceededException: 'Too many attempts. Please wait and try again.',
    InvalidPasswordException: 'Password does not meet the policy (12+ chars, upper, lower, number, symbol).',
  };
  return new Error((e.code && map[e.code]) || e.message || 'Authentication failed.');
}
