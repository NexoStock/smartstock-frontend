export type BusinessType = 'minimarket' | 'bodega';

export interface MenuItem {
  key: string;
  path: string;
  icon: string; // Material icon name
  businessTypes: BusinessType[];
}

// One menu configuration for both business types.
export const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    businessTypes: [
      'minimarket'
    ]
  },
  {
    key: 'home',
    path: '/dashboard',
    icon: 'home',
    businessTypes: [
      'bodega'
    ]
  },
  {
    key: 'products',
    path: '/products',
    icon: 'inventory_2',
    businessTypes: [
      'minimarket',
      'bodega'
    ]
  },
  {
    key: 'sales',
    path: '/sales',
    icon: 'payments',
    businessTypes: [
      'minimarket',
      'bodega'
    ]
  },
  {
    key: 'purchases',
    path: '/purchases',
    icon: 'shopping_bag',
    businessTypes: [
      'minimarket',
      'bodega'
    ]
  },
  {
    key: 'sensors',
    path: '/sensors',
    icon: 'sensors',
    businessTypes: [
      'minimarket',
      'bodega'
    ]
  },
  {
    key: 'alerts',
    path: '/alerts',
    icon: 'notifications',
    businessTypes: [
      'minimarket',
      'bodega'
    ]
  },
  {
    key: 'comparison',
    path: '/comparison',
    icon: 'compare_arrows',
    businessTypes: [
      'minimarket'
    ]
  },
  {
    key: 'reports',
    path: '/reports',
    icon: 'description',
    businessTypes: [
      'minimarket'
    ]
  }
];

export const menuFor = (businessType: BusinessType): MenuItem[] =>
  menuItems.filter((item) => item.businessTypes.includes(businessType));
