import { Injectable } from '@angular/core';
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
}
