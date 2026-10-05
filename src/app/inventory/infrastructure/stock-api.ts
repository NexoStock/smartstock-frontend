import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Comparison } from '../domain/model/comparison.entity';
import { ProductSensorDetail } from '../domain/model/sensor-reading.entity';
import { StockAssembler } from './stock.assembler';
import { ComparisonResource, ProductDetailResource } from './stock.resource';

// TS02 stock query, TS06 inventory comparison
@Injectable({ providedIn: 'root' })
export class StockApi extends BaseApi {
  private readonly assembler = new StockAssembler();

  comparison(): Observable<Comparison> {
    return this.http
      .get<ComparisonResource>(`this.baseUrl{environment.endpoints.comparison}`)
      .pipe(map((r) => this.assembler.toComparison(r)));
  }

  productSensorDetail(productId: number | string): Observable<ProductSensorDetail> {
    return this.http
      .get<ProductDetailResource>(
        `this.baseUrl{environment.endpoints.products}/${productId}/detalle`,
      )
      .pipe(map((r) => this.assembler.toProductSensorDetail(r)));
  }
}
