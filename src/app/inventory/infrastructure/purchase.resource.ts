import { StockMovementResource } from './stock-movement.resource';

export interface PurchaseItemResource {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  costoUnitario: number;
  subtotal?: number;
}

export interface PurchaseResource {
  id: string;
  proveedorId: number;
  proveedorNombre?: string;
  fecha: string;
  estado: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  total: number;
  restockingNeedId: number | null;
  items: PurchaseItemResource[];
  movimientos?: StockMovementResource[];
}

export interface PurchaseListResource {
  compras: PurchaseResource[];
  total: number;
}

export interface RegisterPurchaseRequest {
  proveedorId: number;
  fecha: string;
  restockingNeedId: number | null;
  items: {
    productoId: number;
    cantidad: number;
    costoUnitario: number;
  }[];
}

export interface SupplierResource {
  id: number | null;
  nombre: string;
  correo: string;
  telefono: string;
}

export interface PurchaseProductOptionResource {
  id: number;
  nombre: string;
  costoCompra: number;
  proveedorHabitual: string;
}
