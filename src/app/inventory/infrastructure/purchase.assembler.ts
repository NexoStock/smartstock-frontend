import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import {
  Purchase,
  PurchaseItem,
  PurchaseProductOption,
  Supplier,
} from '../domain/model/purchase.entity';

import {
  PurchaseProductOptionResource,
  PurchaseResource,
  SupplierResource,
} from './purchase.resource';

import { StockMovementAssembler } from './stock-movement.assembler';

export class PurchaseAssembler extends BaseAssembler<Purchase, PurchaseResource> {
  private readonly movements = new StockMovementAssembler();

  toEntityFromResource(r: PurchaseResource): Purchase {
    return new Purchase(
      r.id,
      r.fecha,
      r.estado,
      r.total,
      r.proveedorId,
      r.proveedorNombre ?? '',
      r.items.map(
        (i) => new PurchaseItem(i.productoId, i.productoNombre ?? '', i.cantidad, i.costoUnitario),
      ),
      this.movements.toEntitiesFromResources(r.movimientos ?? []),
      r.restockingNeedId ?? null,
    );
  }

  toResourceFromEntity(e: Purchase): PurchaseResource {
    return {
      id: String(e.id),
      proveedorId: e.supplierId,
      fecha: e.date,
      estado: e.status,
      total: e.total,
      restockingNeedId: e.restockingNeedId,
      items: e.items.map((i) => ({
        productoId: i.productId,
        cantidad: i.quantity,
        costoUnitario: i.unitCost,
      })),
    };
  }

  toOption(r: PurchaseProductOptionResource): PurchaseProductOption {
    return new PurchaseProductOption(r.id, r.nombre, r.costoCompra, r.proveedorHabitual);
  }
}

export class SupplierAssembler extends BaseAssembler<Supplier, SupplierResource> {
  toEntityFromResource(r: SupplierResource): Supplier {
    return new Supplier(r.id, r.nombre, r.correo, r.telefono);
  }

  toResourceFromEntity(e: Supplier): SupplierResource {
    return {
      id: e.id === null ? null : Number(e.id),
      nombre: e.name,
      correo: e.email,
      telefono: e.phone,
    };
  }
}
