import { Routes } from '@angular/router';

export const devicesRoutes: Routes = [
  {
    path: 'sensors',
    loadComponent: () => import('./views/sensor-list').then((m) => m.SensorList),
    data: { titleKey: 'devices.sensorList.title', context: 'devices', stories: ["US06", "US07"], mockups: ["M31"] },
  },
  {
    path: 'sensors/link',
    loadComponent: () => import('./views/sensor-link').then((m) => m.SensorLink),
    data: { titleKey: 'devices.sensorLink.title', context: 'devices', stories: ["US04"], mockups: ["M32", "M33"] },
  },
  {
    path: 'sensors/:id/threshold',
    loadComponent: () => import('./views/sensor-threshold').then((m) => m.SensorThreshold),
    data: { titleKey: 'devices.sensorThreshold.title', context: 'devices', stories: ["US05"], mockups: ["M34", "M35"] },
  },
];
