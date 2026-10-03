import { Routes } from '@angular/router';

export const iamRoutes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./views/sign-in').then((m) => m.SignIn),
    data: { titleKey: 'iam.signIn.title', context: 'iam', stories: ["US02"], mockups: ["M20", "M21"] },
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./views/sign-up').then((m) => m.SignUp),
    data: { titleKey: 'iam.signUp.title', context: 'iam', stories: ["US01"], mockups: ["M22", "M23", "M24"] },
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./views/forgot-password').then((m) => m.ForgotPassword),
    data: { titleKey: 'iam.forgotPassword.title', context: 'iam', stories: ["US03"], mockups: ["M25", "M26"] },
  },
];
