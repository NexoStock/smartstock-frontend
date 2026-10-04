import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { StockMovement } from '../domain/model/stock-movement.entity';
import { StockMovementResource } from './stock-movement.resource';

export class StockMovementAssembler extends BaseAssembler<StockMovement, StockMovementResource> {
  toEntityFromResource(r: StockMovementResource): StockMovement {
    return new StockMovement(r.id, r.productoId, r.productoNombre, r.tipo, r.origen, r.origenId, r.cantidad, r.fecha);
  }
  toResourceFromEntity(e: StockMovement): StockMovementResource {
    return {
      id: e.id ?? 0, productoId: e.productId, productoNombre: e.productName, tipo: e.type,
      origen: e.source, origenId: e.sourceId, cantidad: e.quantity, fecha: e.date,
    };
  }
}
