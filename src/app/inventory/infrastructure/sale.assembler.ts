import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Sale, SaleItem, SaleProductOption } from '../domain/model/sale.entity';
import { SaleProductOptionResource, SaleResource } from './sale.resource';
import { StockMovementAssembler } from './stock-movement.assembler';

export class SaleAssembler extends BaseAssembler<Sale, SaleResource> {
  private readonly movements = new StockMovementAssembler();

  toEntityFromResource(r: SaleResource): Sale {
    return new Sale(
      r.id, r.fecha, r.estado, r.total,
      r.items.map((i) => new SaleItem(i.productoId, i.productoNombre ?? '', i.cantidad, i.precioUnitario)),
      this.movements.toEntitiesFromResources(r.movimientos ?? []),
    );
  }

  toResourceFromEntity(e: Sale): SaleResource {
    return {
      id: String(e.id), fecha: e.date, estado: e.status, total: e.total,
      items: e.items.map((i) => ({ productoId: i.productId, cantidad: i.quantity, precioUnitario: i.unitPrice })),
    };
  }

  toOption(r: SaleProductOptionResource): SaleProductOption {
    return new SaleProductOption(r.id, r.nombre, r.precioVenta, r.stockRegistrado);
  }
}