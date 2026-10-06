export interface ComparisonRowResource {
  productoId: number;
  productoNombre: string;
  stockRegistrado: number;
  pesoKg: number | null;
  unidadesFisicas: number | null;
  diferenciaPct: number | null;
  resultado: 'MATCH' | 'DISCREPANCY' | 'REGISTERED_ONLY';
}

export interface ComparisonResource {
  items: ComparisonRowResource[];
  discrepancias: number;
  alertaId: number | null;
}

export interface ProductDetailResource {
  sensor: {
    id: number;
    codigo: string;
    estado: 'online' | 'disconnected';
    pesoKg: number;
    unidades: number;
    ultimaLecturaAt: string | null;
  } | null;
  lecturas: { id: number; fecha: string; pesoKg: number; unidades: number }[];
}
