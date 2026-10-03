import { Component } from '@angular/core';
import { AuthLayout } from '../../../shared/presentation/components/auth-layout';
import { PlaceholderView } from '../../../shared/presentation/components/placeholder-view';

@Component({
  selector: 'app-sign-up',
  imports: [AuthLayout, PlaceholderView],
  template: '<app-auth-layout><app-placeholder-view /></app-auth-layout>',
})
export class SignUp {}
