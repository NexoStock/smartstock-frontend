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
      String(r.id),
      r.fecha ?? '',
      r.estado,
      r.total,
      r.proveedorId,
      r.proveedorNombre ?? '',
      (r.productos ?? []).map(
        (i) => new PurchaseItem(i.productoId, i.productoNombre ?? '', i.cantidad, i.precioUnitario),
      ),
      this.movements.toEntitiesFromResources(r.movimientos ?? []),
      r.restockingNeedId ?? null,
    );
  }

  toResourceFromEntity(e: Purchase): PurchaseResource {
    return {
      id: Number(e.id),
      proveedorId: e.supplierId,
      fecha: e.date,
      estado: e.status,
      total: e.total,
      restockingNeedId: e.restockingNeedId,
      productos: e.items.map((i) => ({
        productoId: i.productId,
        cantidad: i.quantity,
        precioUnitario: i.unitCost,
      })),
    };
  }

  toOption(r: PurchaseProductOptionResource): PurchaseProductOption {
    return new PurchaseProductOption(r.id, r.nombre, r.costoCompra, r.proveedorHabitual);
  }
}

export class SupplierAssembler extends BaseAssembler<Supplier, SupplierResource> {
  toEntityFromResource(r: SupplierResource): Supplier {
    return new Supplier(r.id, r.nombre, r.ruc ?? '', r.correo, r.telefono);
  }

  toResourceFromEntity(e: Supplier): SupplierResource {
    return {
      id: e.id === null ? null : Number(e.id),
      nombre: e.name,
      ruc: e.taxId,
      correo: e.email,
      telefono: e.phone,
    };
  }
}
