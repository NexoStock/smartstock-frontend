import { StockMovementResource } from './stock-movement.resource';

export interface PurchaseItemResource {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PurchaseResource {
  id: number;
  proveedorId: number;
  proveedorNombre?: string;
  fecha?: string;
  estado: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  total: number;
  restockingNeedId?: number | null;
  productos: PurchaseItemResource[];
  movimientos?: StockMovementResource[];
}

export interface RegisterPurchaseRequest {
  proveedorId: number;
  productos: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
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
