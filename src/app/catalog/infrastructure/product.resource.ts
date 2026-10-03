// Shape of the API resource (Spanish names, as in db.json and the backend)
export interface ProductResource {
  id: number | string | null;
  nombre: string;
  sku: string;
  categoria: string;
  pesoUnitario: number;
  precioVenta: number;
  costoCompra: number;
  proveedorHabitual: string;
  stockRegistrado: number;
  umbralMinimo: number;
  capacidadMaxima: number;
  sensorId: number | null;
}
