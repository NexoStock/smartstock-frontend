import { Routes } from '@angular/router';

export const alertsRoutes: Routes = [
  {
    path: 'alerts',
    loadComponent: () => import('./views/alert-list').then((m) => m.AlertList),
    data: { titleKey: 'alerts.alertList.title', context: 'alerts', stories: ["US12", "US32"], mockups: ["M15", "M15A", "M38"] },
  },
  {
    path: 'settings',
    loadComponent: () => import('./views/notification-settings').then((m) => m.NotificationSettings),
    data: { titleKey: 'alerts.notificationSettings.title', context: 'alerts', stories: ["US09", "US10"], mockups: ["M36", "M37"] },
  },
];
