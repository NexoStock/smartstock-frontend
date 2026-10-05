export interface ProductResource {
  id: number | string | null;
  nombre: string;
  sku: string;
  categoria: string;
  pesoUnitario: number;
  precioVenta: number | null;
  costoCompra: number;
  proveedorHabitual: string;
  stockRegistrado: number;
  umbralMinimo: number;
  capacidadMaxima: number;
  sensorId: number | null;
  estadoSensor?: 'online' | 'disconnected' | 'none';
  unidadesSensor?: number | null;
}
