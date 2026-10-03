import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from '../application/iam.store';
import { BusinessType } from '../../shared/config/menu';

export const authenticationGuard: CanActivateFn = () =>
  inject(IamStore).isSignedIn() ? true : inject(Router).createUrlTree(['/sign-in']);

// Example: canActivate: [businessTypeGuard(['minimarket'])]
export const businessTypeGuard = (types: BusinessType[]): CanActivateFn => () =>
  types.includes(inject(IamStore).businessType()) ? true : inject(Router).createUrlTree(['/dashboard']);
