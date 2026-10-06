import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { AuthLayout } from '../../../shared/presentation/components/auth-layout';
import { FormField } from '../../../shared/presentation/components/form-field';
import { IamStore } from '../../application/iam.store';

// US02 · M20 sign in, M21 wrong credentials
@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, TranslatePipe, AuthLayout, FormField, AlertBanner],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  protected readonly store = inject(IamStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly failed = signal(false);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  private readonly submitted = signal(false);

  protected fieldError(name: 'email' | 'password'): string {
    const control = this.form.controls[name];
    if (name === 'password' && this.failed()) return this.translate.instant('iam.signIn.invalidField');
    if (!this.submitted() || control.valid) return '';
    return this.translate.instant(name === 'email' ? 'iam.error.email' : 'iam.error.password');
  }

  protected submit(): void {
    this.submitted.set(true);
    this.failed.set(false);
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.store.signIn(email, password).subscribe((result) => {
      if (result === 'OK') this.router.navigateByUrl('/dashboard');
      else this.failed.set(true); // R3: it never says which of the two data failed
    });
  }
}