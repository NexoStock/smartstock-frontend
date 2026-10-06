import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { LinkableProduct, Sensor } from '../domain/model/sensor.entity';
import { LinkableProductResource, SensorResource } from './sensor.resource';

export class SensorAssembler extends BaseAssembler<Sensor, SensorResource> {
  toEntityFromResource(r: SensorResource): Sensor {
    return new Sensor(r.id, r.codigo, r.productoId, r.productoNombre, r.estado, r.ultimaLecturaAt, r.pesoKg, r.unidades);
  }
  toResourceFromEntity(e: Sensor): SensorResource {
    return {
      id: Number(e.id), codigo: e.code, productoId: e.productId, productoNombre: e.productName, estado: e.status,
      ultimaLecturaAt: e.lastReadingAt, pesoKg: e.weightKg, unidades: e.units,
    };
  }
  toLinkable(r: LinkableProductResource): LinkableProduct {
    return new LinkableProduct(r.id, r.nombre, r.pesoUnitario, r.sensorId !== null);
  }
}
