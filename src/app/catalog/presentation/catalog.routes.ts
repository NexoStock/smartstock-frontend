import { Routes } from '@angular/router';

export const catalogRoutes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./views/product-list').then((m) => m.ProductList),
    data: { titleKey: 'catalog.productList.title', context: 'catalog', stories: ["US08"], mockups: ["M27"] },
  },
  {
    path: 'products/new',
    loadComponent: () => import('./views/product-new').then((m) => m.ProductNew),
    data: { titleKey: 'catalog.productNew.title', context: 'catalog', stories: ["US13"], mockups: ["M29", "M30"] },
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./views/product-details').then((m) => m.ProductDetails),
    data: { titleKey: 'catalog.productDetails.title', context: 'catalog', stories: ["US07"], mockups: ["M28"] },
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./views/product-edit').then((m) => m.ProductEdit),
    data: { titleKey: 'catalog.productEdit.title', context: 'catalog', stories: ["US14"], mockups: ["M19"] },
  },
];
