import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Product } from '../domain/model/product.entity';
import { ProductResource } from './product.resource';

export class ProductAssembler extends BaseAssembler<Product, ProductResource> {
  toEntityFromResource(r: ProductResource): Product {
    return new Product(r.id, r.nombre, r.sku, r.categoria, r.pesoUnitario, r.precioVenta, r.costoCompra,
      r.proveedorHabitual, r.stockRegistrado, r.umbralMinimo, r.capacidadMaxima, r.sensorId);
  }
  toResourceFromEntity(e: Product): ProductResource {
    return {
      id: e.id, nombre: e.name, sku: e.sku, categoria: e.category, pesoUnitario: e.unitWeight,
      precioVenta: e.salePrice, costoCompra: e.purchaseCost, proveedorHabitual: e.usualSupplier,
      stockRegistrado: e.registeredStock, umbralMinimo: e.minThreshold, capacidadMaxima: e.maxCapacity, sensorId: e.sensorId,
    };
  }
}
