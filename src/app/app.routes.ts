import { Routes } from '@angular/router';
import { authenticationGuard } from './iam/infrastructure/authentication.guard';
import { iamRoutes } from './iam/presentation/iam.routes';

export const routes: Routes = [
  ...iamRoutes, // /sign-in, /sign-up, /forgot-password (public, without layout)
  {
    path: '',
    loadComponent: () => import('./shared/presentation/components/layout').then((m) => m.Layout),
    canActivate: [authenticationGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '', loadChildren: () => import('./analytics/presentation/analytics.routes').then((m) => m.analyticsRoutes) },
      { path: '', loadChildren: () => import('./catalog/presentation/catalog.routes').then((m) => m.catalogRoutes) },
      { path: '', loadChildren: () => import('./devices/presentation/devices.routes').then((m) => m.devicesRoutes) },
      { path: '', loadChildren: () => import('./inventory/presentation/inventory.routes').then((m) => m.inventoryRoutes) },
      { path: '', loadChildren: () => import('./alerts/presentation/alerts.routes').then((m) => m.alertsRoutes) },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/presentation/views/page-not-found').then((m) => m.PageNotFound),
  },
];
