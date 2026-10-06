import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DateRange, toQuery } from '../../shared/domain/model/date-range';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Sale, SaleProductOption } from '../domain/model/sale.entity';
import { RegisterSaleRequest, SaleListResource, SaleProductOptionResource, SaleResource } from './sale.resource';
import { SaleAssembler } from './sale.assembler';

// TS07 register sale, TS08 sales history and detail
@Injectable({ providedIn: 'root' })
export class SalesApi extends BaseApi {
  private readonly url = `${this.baseUrl}${environment.endpoints.sales}`;
  private readonly assembler = new SaleAssembler();

  list(range: DateRange): Observable<{ sales: Sale[]; total: number }> {
    const params = new HttpParams({ fromObject: toQuery(range) });
    return this.http.get<SaleListResource>(this.url, { params }).pipe(
      map((r) => ({ sales: this.assembler.toEntitiesFromResources(r.ventas), total: r.total })),
    );
  }

  get(id: string): Observable<Sale> {
    return this.http.get<SaleResource>(`${this.url}/${id}`).pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }

  register(request: RegisterSaleRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.url, request);
  }

  productOptions(): Observable<SaleProductOption[]> {
    return this.http.get<SaleProductOptionResource[]>(`${this.baseUrl}${environment.endpoints.products}`).pipe(
      map((list) => list.map((r) => this.assembler.toOption(r))),
    );
  }
}