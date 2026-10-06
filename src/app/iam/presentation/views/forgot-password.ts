import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { AuthLayout } from '../../../shared/presentation/components/auth-layout';
import { FormField } from '../../../shared/presentation/components/form-field';
import { IamStore } from '../../application/iam.store';

// US03 · M25 forgot password, M26 reset link sent (the link expires in 24 hours)
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, TranslatePipe, AuthLayout, FormField, AlertBanner],
  template: `
    <app-auth-layout>
      @if (sentTo(); as email) {
        <section class="sent" aria-labelledby="sent-title">
          <h1 id="sent-title">{{ 'iam.forgotPassword.sentTitle' | translate }}</h1>
          <p>{{ 'iam.forgotPassword.sentText' | translate }}<br /><strong>{{ email }}</strong></p>
          <p class="ss-muted">{{ 'iam.forgotPassword.expires' | translate }}</p>
          <div class="row">
            <a mat-stroked-button routerLink="/sign-in">{{ 'iam.forgotPassword.back' | translate }}</a>
            <button mat-button type="button" [disabled]="store.loading()" (click)="send()">{{ 'iam.forgotPassword.resend' | translate }}</button>
          </div>
        </section>
      } @else {
        <h1>{{ 'iam.forgotPassword.title' | translate }}</h1>
        <p class="ss-muted">{{ 'iam.forgotPassword.subtitle' | translate }}</p>
        @if (failed()) { <app-alert-banner tone="error">{{ 'shared.error' | translate }}</app-alert-banner> }
        <form [formGroup]="form" (ngSubmit)="send()" novalidate>
          <app-form-field [id]="'email'" [label]="'iam.field.email' | translate" [error]="emailError()">
            <input id="email" class="ss-input" type="email" formControlName="email" autocomplete="username"
                   [attr.aria-invalid]="!!emailError()" [attr.aria-describedby]="emailError() ? 'email-error' : null" />
          </app-form-field>
          <button mat-flat-button type="submit" class="full" [disabled]="store.loading()">{{ 'iam.forgotPassword.submit' | translate }}</button>
        </form>
        <p class="switch"><a routerLink="/sign-in">{{ 'iam.forgotPassword.back' | translate }}</a></p>
      }
    </app-auth-layout>
  `,
  styles: `
    .full { width: 100%; }
    .switch { text-align: center; margin-top: 1.25rem; }
    .sent { display: grid; gap: 0.5rem; }
    .row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  `,
})
export class ForgotPassword {
  protected readonly store = inject(IamStore);
  private readonly translate = inject(TranslateService);

  protected readonly sentTo = signal<string | null>(null);
  protected readonly failed = signal(false);
  private readonly submitted = signal(false);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  protected emailError(): string {
    return this.submitted() && this.form.controls.email.invalid ? this.translate.instant('iam.error.email') : '';
  }

  protected send(): void {
    this.submitted.set(true);
    this.failed.set(false);
    if (this.form.invalid) return;
    const { email } = this.form.getRawValue();
    this.store.requestPasswordReset(email).subscribe((ok) => (ok ? this.sentTo.set(email) : this.failed.set(true)));
  }
}