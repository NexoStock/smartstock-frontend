export interface SensorResource {
  id: number;
  codigo: string;
  productoId: number | null;
  productoNombre: string | null;
  estado: 'online' | 'disconnected' | 'available';
  ultimaLecturaAt: string | null;
  pesoKg: number;
  unidades: number | null;
}

export interface LinkableProductResource {
  id: number;
  nombre: string;
  pesoUnitario: number;
  sensorId: number | null;
}
