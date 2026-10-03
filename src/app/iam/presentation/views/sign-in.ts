import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthLayout } from '../../../shared/presentation/components/auth-layout';
import { IamStore } from '../../application/iam.store';
import { BusinessType } from '../../../shared/config/menu';

@Component({
  selector: 'app-sign-in',
  imports: [AuthLayout, MatButtonModule, TranslatePipe],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);

  // TEMPORARY: lets the team test both menus until the IAM step is done.
  enterAs(businessType: BusinessType): void {
    this.iam.startSession({ token: 'dev-token', email: `${businessType}@dev.local`, businessType });
    this.router.navigateByUrl('/dashboard');
  }
}
