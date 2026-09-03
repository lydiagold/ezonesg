import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CognitoAuthService } from '../../auth/cognito-auth.service';

type Mode = 'signin' | 'newPassword' | 'mfa' | 'forgot' | 'forgotConfirm';

/**
 * EZONE-branded admin login. Drives the Cognito flows: sign-in, first-login
 * forced password change, TOTP MFA, and forgot-password. No password ever leaves
 * this component except to Cognito over SRP.
 */
@Component({
  selector: 'ez-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="admin-login">
      <div class="admin-login__card">
        <div class="admin-login__brand"><img src="assets/images/ezone-logo.png" alt="" /> EZONE</div>
        <p class="center muted" style="margin-bottom:1.25rem">Storefront administration</p>

        <div *ngIf="!auth.configured" class="admin-alert err">
          Admin sign-in isn't configured yet. Set <code>environment.cognito</code> from the Terraform
          <code>cognito</code> output after deploying.
        </div>

        <div *ngIf="error()" class="admin-alert err">{{ error() }}</div>
        <div *ngIf="notice()" class="admin-alert ok">{{ notice() }}</div>

        <!-- Sign in -->
        <form *ngIf="mode() === 'signin'" (ngSubmit)="signIn()">
          <div class="field">
            <label>Email</label>
            <input class="input" type="email" name="email" [(ngModel)]="email" autocomplete="username" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input class="input" type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required />
          </div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" [disabled]="busy() || !auth.configured">
            {{ busy() ? 'Signing in…' : 'Sign in' }}
          </button>
          <p class="center" style="margin-top:1rem">
            <a class="muted" href="#" (click)="switch('forgot', $event)">Forgot password?</a>
          </p>
        </form>

        <!-- Forced new password on first login -->
        <form *ngIf="mode() === 'newPassword'" (ngSubmit)="setNewPassword()">
          <p class="muted" style="margin-bottom:1rem">Set a new password to finish setting up your account.</p>
          <div class="field">
            <label>New password</label>
            <input class="input" type="password" name="np" [(ngModel)]="newPassword" autocomplete="new-password" required />
            <p class="field-error" style="color:var(--ez-text-muted)">Min 12 chars, with upper, lower, number and symbol.</p>
          </div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" [disabled]="busy()">
            {{ busy() ? 'Saving…' : 'Set password & continue' }}
          </button>
        </form>

        <!-- TOTP MFA -->
        <form *ngIf="mode() === 'mfa'" (ngSubmit)="submitMfa()">
          <p class="muted" style="margin-bottom:1rem">Enter the 6-digit code from your authenticator app.</p>
          <div class="field">
            <label>Authentication code</label>
            <input class="input" type="text" inputmode="numeric" name="code" [(ngModel)]="code" autocomplete="one-time-code" required />
          </div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" [disabled]="busy()">Verify</button>
        </form>

        <!-- Forgot: request code -->
        <form *ngIf="mode() === 'forgot'" (ngSubmit)="requestReset()">
          <p class="muted" style="margin-bottom:1rem">We'll email you a reset code.</p>
          <div class="field">
            <label>Email</label>
            <input class="input" type="email" name="femail" [(ngModel)]="email" autocomplete="username" required />
          </div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" [disabled]="busy()">Send reset code</button>
          <p class="center" style="margin-top:1rem"><a class="muted" href="#" (click)="switch('signin', $event)">Back to sign in</a></p>
        </form>

        <!-- Forgot: confirm code + new password -->
        <form *ngIf="mode() === 'forgotConfirm'" (ngSubmit)="confirmReset()">
          <div class="field">
            <label>Reset code</label>
            <input class="input" type="text" name="rcode" [(ngModel)]="code" autocomplete="one-time-code" required />
          </div>
          <div class="field">
            <label>New password</label>
            <input class="input" type="password" name="rnp" [(ngModel)]="newPassword" autocomplete="new-password" required />
          </div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" [disabled]="busy()">Reset password</button>
          <p class="center" style="margin-top:1rem"><a class="muted" href="#" (click)="switch('signin', $event)">Back to sign in</a></p>
        </form>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  readonly auth = inject(CognitoAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  newPassword = '';
  code = '';

  readonly mode = signal<Mode>('signin');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  switch(mode: Mode, ev?: Event) {
    ev?.preventDefault();
    this.error.set(''); this.notice.set('');
    this.mode.set(mode);
  }

  async signIn() {
    await this.run(async () => {
      const res = await this.auth.signIn(this.email.trim(), this.password);
      if (res.status === 'OK') return this.done();
      if (res.status === 'NEW_PASSWORD_REQUIRED') this.switch('newPassword');
      if (res.status === 'MFA') this.switch('mfa');
    });
  }

  async setNewPassword() {
    await this.run(async () => { await this.auth.completeNewPassword(this.newPassword); this.done(); });
  }

  async submitMfa() {
    await this.run(async () => { await this.auth.sendMfaCode(this.code.trim()); this.done(); });
  }

  async requestReset() {
    await this.run(async () => {
      await this.auth.forgotPassword(this.email.trim());
      this.notice.set('If that email exists, a reset code is on its way.');
      this.switch('forgotConfirm');
      this.notice.set('Check your email for the reset code.');
    });
  }

  async confirmReset() {
    await this.run(async () => {
      await this.auth.confirmForgotPassword(this.email.trim(), this.code.trim(), this.newPassword);
      this.notice.set('Password reset. You can sign in now.');
      this.password = '';
      this.switch('signin');
      this.notice.set('Password reset. Please sign in.');
    });
  }

  private done() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin';
    this.router.navigateByUrl(returnUrl);
  }

  private async run(fn: () => Promise<void>) {
    this.busy.set(true); this.error.set('');
    try { await fn(); }
    catch (e: any) { this.error.set(e?.message || 'Something went wrong.'); }
    finally { this.busy.set(false); }
  }
}
