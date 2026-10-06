export interface AlertResource {
  id: number;
  tipo: 'LOW_STOCK' | 'DISCREPANCY';
  productoId: number;
  productoNombre: string;
  stockReferencia: number;
  fuente: 'sensor' | 'registered';
  estado: 'ACTIVE' | 'RESOLVED';
  minutosDesdeLectura: number | null;
  necesidadId?: number | null;
  stockRegistrado?: number | null;
  stockFisico?: number | null;
  diferenciaPct?: number | null;
  stockActual: number | null;
  umbralMinimo: number | null;
  resueltaEn: string | null;
}

export interface NotificationChannelResource {
  id: number;
  canal: 'email' | 'whatsapp';
  destino: string;
  activo: boolean;
}