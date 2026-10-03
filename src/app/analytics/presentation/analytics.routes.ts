import { Routes } from '@angular/router';
import { businessTypeGuard } from '../../iam/infrastructure/authentication.guard';

export const analyticsRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./views/dashboard').then((m) => m.Dashboard),
    data: { titleKey: 'analytics.dashboard.title', context: 'analytics', stories: ["US15"], mockups: ["M17"] },
  },
  {
    path: 'reports',
    canActivate: [businessTypeGuard(['minimarket'])],
    loadComponent: () => import('./views/reports').then((m) => m.Reports),
    data: { titleKey: 'analytics.reports.title', context: 'analytics', stories: ["US25"], mockups: ["M18"] },
  },
];
