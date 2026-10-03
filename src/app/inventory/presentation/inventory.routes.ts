import { Routes } from '@angular/router';
import { businessTypeGuard } from '../../iam/infrastructure/authentication.guard';

export const inventoryRoutes: Routes = [
  {
    path: 'comparison',
    canActivate: [businessTypeGuard(['minimarket'])],
    loadComponent: () => import('./views/comparison').then((m) => m.Comparison),
    data: { titleKey: 'inventory.comparison.title', context: 'inventory', stories: ["US11", "US12"], mockups: ["M39"] },
  },
  {
    path: 'sales',
    loadComponent: () => import('./views/sale-list').then((m) => m.SaleList),
    data: { titleKey: 'inventory.saleList.title', context: 'inventory', stories: ["US27"], mockups: ["M9", "M10"] },
  },
  {
    path: 'sales/new',
    loadComponent: () => import('./views/sale-new').then((m) => m.SaleNew),
    data: { titleKey: 'inventory.saleNew.title', context: 'inventory', stories: ["US26"], mockups: ["M11", "M12", "M13"] },
  },
  {
    path: 'sales/:id',
    loadComponent: () => import('./views/sale-details').then((m) => m.SaleDetails),
    data: { titleKey: 'inventory.saleDetails.title', context: 'inventory', stories: ["US28"], mockups: ["M14"] },
  },
  {
    path: 'purchases',
    loadComponent: () => import('./views/purchase-list').then((m) => m.PurchaseList),
    data: { titleKey: 'inventory.purchaseList.title', context: 'inventory', stories: ["US31"], mockups: ["M1", "M2"] },
  },
  {
    path: 'purchases/suppliers',
    loadComponent: () => import('./views/supplier-list').then((m) => m.SupplierList),
    data: { titleKey: 'inventory.supplierList.title', context: 'inventory', stories: ["US29"], mockups: ["M7", "M7A", "M8", "M7B"] },
  },
  {
    path: 'purchases/new',
    loadComponent: () => import('./views/purchase-new').then((m) => m.PurchaseNew),
    data: { titleKey: 'inventory.purchaseNew.title', context: 'inventory', stories: ["US30", "US32"], mockups: ["M3", "M4", "M16"] },
  },
  {
    path: 'purchases/:id',
    loadComponent: () => import('./views/purchase-details').then((m) => m.PurchaseDetails),
    data: { titleKey: 'inventory.purchaseDetails.title', context: 'inventory', stories: ["US30"], mockups: ["M5", "M6", "M5A", "M6A"] },
  },
];
