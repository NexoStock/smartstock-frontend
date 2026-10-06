import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Alert, NotificationChannel } from '../domain/model/alert.entity';
import {
  AlertResource,
  NotificationChannelResource,
} from './alert.resource';

export class AlertAssembler extends BaseAssembler<Alert, AlertResource> {
  toEntityFromResource(r: AlertResource): Alert {
    return new Alert(
      r.id,
      r.tipo,
      r.productoId,
      r.productoNombre,
      r.stockReferencia,
      r.fuente,
      r.estado,
      r.minutosDesdeLectura,
      r.necesidadId ?? null,
      r.stockRegistrado ?? null,
      r.stockFisico ?? null,
      r.diferenciaPct ?? null,
      r.stockActual,
      r.umbralMinimo,
      r.resueltaEn,
    );
  }

  toResourceFromEntity(e: Alert): AlertResource {
    return {
      id: Number(e.id),
      tipo: e.type,
      productoId: e.productId,
      productoNombre: e.productName,
      stockReferencia: e.referenceStock,
      fuente: e.source,
      estado: e.status,
      minutosDesdeLectura: e.minutesSinceReading,
      necesidadId: e.restockingNeedId,
      stockRegistrado: e.registeredStock,
      stockFisico: e.physicalStock,
      diferenciaPct: e.differencePct,
      stockActual: e.currentStock,
      umbralMinimo: e.minThreshold,
      resueltaEn: e.resolvedAt,
    };
  }
}

export class NotificationChannelAssembler extends BaseAssembler<
  NotificationChannel,
  NotificationChannelResource
> {
  toEntityFromResource(r: NotificationChannelResource): NotificationChannel {
    return new NotificationChannel(r.id, r.canal, r.destino, r.activo);
  }

  toResourceFromEntity(e: NotificationChannel): NotificationChannelResource {
    return {
      id: Number(e.id),
      canal: e.channel,
      destino: e.destination,
      activo: e.active,
    };
  }
}