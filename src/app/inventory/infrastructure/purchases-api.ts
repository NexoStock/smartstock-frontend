import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DateRange, toQuery } from '../../shared/domain/model/date-range';

import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';

import { Purchase, PurchaseProductOption, Supplier } from '../domain/model/purchase.entity';

import { PurchaseAssembler, SupplierAssembler } from './purchase.assembler';

import {
  PurchaseListResource,
  PurchaseProductOptionResource,
  PurchaseResource,
  RegisterPurchaseRequest,
  SupplierResource,
} from './purchase.resource';

@Injectable({ providedIn: 'root' })
export class PurchasesApi extends BaseApi {
  private readonly url = `${this.baseUrl}${environment.endpoints.purchases}`;

  private readonly assembler = new PurchaseAssembler();

  readonly suppliers = new BaseApiEndpoint<Supplier, SupplierResource>(
    this.http,
    `${this.baseUrl}${environment.endpoints.suppliers}`,
    new SupplierAssembler(),
  );

  list(range: DateRange): Observable<{
    purchases: Purchase[];
    total: number;
  }> {
    const params = new HttpParams({
      fromObject: toQuery(range),
    });

    return this.http.get<PurchaseListResource>(this.url, { params }).pipe(
      map((r) => ({
        purchases: this.assembler.toEntitiesFromResources(r.compras),
        total: r.total,
      })),
    );
  }

  get(id: string): Observable<Purchase> {
    return this.http
      .get<PurchaseResource>(`${this.url}/${id}`)
      .pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }

  register(request: RegisterPurchaseRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.url, request);
  }

  receive(id: string): Observable<unknown> {
    return this.http.patch(`${this.url}/${id}/recepcion`, {});
  }

  productOptions(): Observable<PurchaseProductOption[]> {
    return this.http
      .get<PurchaseProductOptionResource[]>(`${this.baseUrl}${environment.endpoints.products}`)
      .pipe(map((list) => list.map((r) => this.assembler.toOption(r))));
  }
}
