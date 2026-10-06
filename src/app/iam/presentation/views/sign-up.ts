import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BusinessType } from '../../../shared/config/menu';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { AuthLayout } from '../../../shared/presentation/components/auth-layout';
import { FormField } from '../../../shared/presentation/components/form-field';
import { IamStore } from '../../application/iam.store';

// US01 · M22 register, M23 email already registered, M24 register success
@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatButtonToggleModule, TranslatePipe, AuthLayout, FormField, AlertBanner],
  template: `
    <app-auth-layout>
      @if (created(); as account) {
        <section class="done" aria-labelledby="done-title">
          <p class="ok" aria-hidden="true">✓</p>
          <h1 id="done-title">{{ 'iam.signUp.successTitle' | translate }}</h1>
          <p>{{ 'iam.signUp.successText' | translate }}<br /><strong>{{ account.email }}</strong></p>
          <p><strong>{{ ('iam.businessType.' + account.businessType) | translate }}</strong> · {{ 'iam.signUp.menuReady' | translate }}</p>
          <button mat-flat-button type="button" (click)="goToDashboard()">{{ 'iam.signUp.goDashboard' | translate }}</button>
        </section>
      } @else {
        <h1>{{ 'iam.signUp.title' | translate }}</h1>
        <p class="ss-muted">{{ 'iam.signUp.subtitle' | translate }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <app-form-field [id]="'businessName'" [label]="'iam.field.businessName' | translate" [error]="fieldError('businessName')">
            <input id="businessName" class="ss-input" formControlName="businessName" autocomplete="organization"
                   [attr.aria-invalid]="!!fieldError('businessName')" [attr.aria-describedby]="fieldError('businessName') ? 'businessName-error' : null" />
          </app-form-field>

          <app-form-field [id]="'email'" [label]="'iam.field.email' | translate" [error]="fieldError('email')">
            <input id="email" class="ss-input" type="email" formControlName="email" autocomplete="username"
                   [attr.aria-invalid]="!!fieldError('email')" [attr.aria-describedby]="fieldError('email') ? 'email-error' : null" />
          </app-form-field>

          <app-form-field [id]="'password'" [label]="'iam.field.password' | translate" [error]="fieldError('password')">
            <input id="password" class="ss-input" type="password" formControlName="password" autocomplete="new-password"
                   [attr.aria-invalid]="!!fieldError('password')" [attr.aria-describedby]="fieldError('password') ? 'password-error' : null" />
          </app-form-field>

          <div class="type">
            <span id="type-label" class="label">{{ 'iam.field.businessType' | translate }}</span>
            <mat-button-toggle-group formControlName="businessType" aria-labelledby="type-label">
              <mat-button-toggle value="minimarket">{{ 'iam.businessType.minimarket' | translate }}</mat-button-toggle>
              <mat-button-toggle value="bodega">{{ 'iam.businessType.bodega' | translate }}</mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          @if (serverError()) { <app-alert-banner tone="error">{{ 'shared.error' | translate }}</app-alert-banner> }
          <button mat-flat-button type="submit" class="full" [disabled]="store.loading()">{{ 'iam.signUp.submit' | translate }}</button>
        </form>

        <p class="switch">{{ 'iam.signUp.have' | translate }} <a routerLink="/sign-in">{{ 'iam.signUp.signIn' | translate }}</a></p>
      }
    </app-auth-layout>
  `,
  styles: `
    .full { width: 100%; margin-top: 1rem; }
    .type { display: grid; gap: 0.35rem; margin-bottom: 0.5rem; }
    .label { font-weight: 600; font-size: 0.85rem; }
    .switch { text-align: center; margin-top: 1.25rem; }
    .done { text-align: center; display: grid; gap: 0.5rem; justify-items: center; }
    .ok { font-size: 2.5rem; margin: 0; color: var(--ss-success); }
  `,
})
export class SignUp {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly created = signal<{ email: string; businessType: BusinessType } | null>(null);
  protected readonly emailTaken = signal(false);
  protected readonly serverError = signal(false);
  private readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    businessName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    businessType: new FormControl<BusinessType>('minimarket', { nonNullable: true }),
  });

  protected fieldError(name: 'businessName' | 'email' | 'password'): string {
    if (name === 'email' && this.emailTaken()) return this.translate.instant('iam.signUp.emailTaken'); // M23
    if (!this.submitted() || this.form.controls[name].valid) return '';
    return this.translate.instant(`iam.error.${name}`);
  }

  protected submit(): void {
    this.submitted.set(true);
    this.emailTaken.set(false);
    this.serverError.set(false);
    if (this.form.invalid) return;
    const request = this.form.getRawValue();
    this.store.signUp(request).subscribe((result) => {
      if (result === 'OK') this.created.set({ email: request.email, businessType: request.businessType }); // M24
      else if (result === 'EMAIL_TAKEN') this.emailTaken.set(true);
      else this.serverError.set(true);
    });
  }

  protected goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}