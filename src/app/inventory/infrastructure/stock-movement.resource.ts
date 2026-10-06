export interface StockMovementResource {
  id: number | string;
  productoId: number;
  productoNombre: string;
  tipo: 'IN' | 'OUT';
  origen: 'SALE' | 'PURCHASE' | 'ADJUSTMENT';
  origenId: string;
  cantidad: number;
  fecha: string;
}
