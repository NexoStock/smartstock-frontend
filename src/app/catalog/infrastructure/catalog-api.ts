import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Product } from '../domain/model/product.entity';
import { ProductAssembler } from './product.assembler';
import { ProductResource } from './product.resource';

@Injectable({ providedIn: 'root' })
export class CatalogApi extends BaseApi {
  readonly products = new BaseApiEndpoint<Product, ProductResource>(
    this.http,
    `${this.baseUrl}${environment.endpoints.products}`,
    new ProductAssembler(),
  );

  thresholdTarget(sensorId: number | string): Observable<Product | null> {
    return this.http
      .get<ProductResource[]>(`${this.baseUrl}${environment.endpoints.products}`, {
        params: { sensorId: String(sensorId) },
      })
      .pipe(
        map((list) => (list.length ? new ProductAssembler().toEntityFromResource(list[0]) : null)),
      );
  }

  setThreshold(sensorId: number | string, minThreshold: number): Observable<Product> {
    return this.http
      .put<ProductResource>(`${this.baseUrl}${environment.endpoints.sensors}/${sensorId}/umbral`, {
        umbralMinimo: minThreshold,
      })
      .pipe(map((r) => new ProductAssembler().toEntityFromResource(r)));
  }
}
