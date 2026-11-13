import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
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

  // The threshold belongs to the product linked to the sensor.
  private linkedProductId(sensorId: number | string): Observable<number | null> {
    return this.http
      .get<{ productoId: number | null }>(`${this.baseUrl}${environment.endpoints.sensors}/${sensorId}`)
      .pipe(map((s) => s.productoId ?? null));
  }

  thresholdTarget(sensorId: number | string): Observable<Product | null> {
    return this.linkedProductId(sensorId).pipe(
      switchMap((productId) => (productId === null ? of(null) : this.products.getById(productId))),
    );
  }

  setThreshold(sensorId: number | string, minThreshold: number): Observable<Product> {
    return this.linkedProductId(sensorId).pipe(
      switchMap((productId) =>
        this.http.put<ProductResource>(`${this.baseUrl}${environment.endpoints.products}/${productId}/umbral`, {
          umbralMinimo: minThreshold,
        }),
      ),
      map((r) => new ProductAssembler().toEntityFromResource(r)),
    );
  }
}
