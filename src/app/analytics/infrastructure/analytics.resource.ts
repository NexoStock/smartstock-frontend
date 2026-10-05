import { StockMovementResource } from '../../inventory/infrastructure/stock-movement.resource';

export interface DashboardResource {
  ventasHoy: { total: number; cantidad: number };
  comprasHoy: { total: number; cantidad: number };
  alertasStockBajo: number;
  actividadReciente: { tipo: 'SALE' | 'PURCHASE'; id: string; total: number; fecha: string }[];
  resumenStock: {
    productoId: number;
    nombre: string;
    unidades: number;
    nivel: 'lowStock' | 'healthy';
    sensor: string;
  }[];
}

export interface ReportResource {
  ventasTotal: number;
  comprasTotal: number;
  movimientos: StockMovementResource[];
  comprasPendientes: string[];
}
