import { Comparison, ComparisonRow } from '../domain/model/comparison.entity';
import {
  ProductSensorDetail,
  ProductSensorInfo,
  SensorReading,
} from '../domain/model/sensor-reading.entity';
import { ComparisonResource, ProductDetailResource } from './stock.resource';

export class StockAssembler {
  toComparison(r: ComparisonResource): Comparison {
    return new Comparison(
      r.items.map(
        (i) =>
          new ComparisonRow(
            i.productoId,
            i.productoNombre,
            i.stockRegistrado,
            i.pesoKg,
            i.unidadesFisicas,
            i.diferenciaPct,
            i.resultado,
          ),
      ),
      r.discrepancias,
      r.alertaId,
    );
  }

  toProductSensorDetail(r: ProductDetailResource): ProductSensorDetail {
    return new ProductSensorDetail(
      r.sensor
        ? new ProductSensorInfo(
            r.sensor.id,
            r.sensor.codigo,
            r.sensor.estado,
            r.sensor.pesoKg,
            r.sensor.unidades,
            r.sensor.ultimaLecturaAt,
          )
        : null,
      r.lecturas.map((l) => new SensorReading(l.id, l.fecha, l.pesoKg, l.unidades)),
    );
  }
}
