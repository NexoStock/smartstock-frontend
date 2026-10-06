import { StockMovementResource } from './stock-movement.resource';

export interface SaleItemResource {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface SaleResource {
  id: string;
  fecha: string;
  estado: string;
  total: number;
  items: SaleItemResource[];
  movimientos?: StockMovementResource[];
}

export interface SaleListResource {
  ventas: SaleResource[];
  total: number;
}

export interface RegisterSaleRequest {
  items: { productoId: number; cantidad: number; precioUnitario: number }[];
}

export interface SaleProductOptionResource {
  id: number;
  nombre: string;
  precioVenta: number | null;
  stockRegistrado: number;
}