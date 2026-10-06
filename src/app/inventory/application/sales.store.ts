import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { DateRange } from '../../shared/domain/model/date-range';
import { ApiErrorBody, apiError } from '../../shared/infrastructure/api-error';
import { Sale, SaleProductOption } from '../domain/model/sale.entity';
import { SalesApi } from '../infrastructure/sales-api';

export type RegisterSaleResult = { ok: true; id: string } | { ok: false; error: ApiErrorBody };

// Views never call the API: they talk to this store.
@Injectable({ providedIn: 'root' })
export class SalesStore {
  private readonly api = inject(SalesApi);
  readonly sales = signal<Sale[]>([]);
  readonly total = signal(0);
  readonly current = signal<Sale | null>(null);
  readonly options = signal<SaleProductOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  fetchSales(range: DateRange): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(range).subscribe({
      next: ({ sales, total }) => { this.sales.set(sales); this.total.set(total); this.loading.set(false); },
      error: (e) => { this.error.set(e); this.loading.set(false); },
    });
  }

  fetchSale(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.current.set(null);
    this.api.get(id).subscribe({
      next: (sale) => { this.current.set(sale); this.loading.set(false); },
      error: (e) => { this.error.set(e); this.loading.set(false); },
    });
  }

  fetchOptions(): void {
    this.api.productOptions().subscribe({ next: (o) => this.options.set(o), error: (e) => this.error.set(e) });
  }

  // Server errors (INSUFFICIENT_STOCK, NO_SALE_PRICE...) come back inside the result so the view can show M12 / M13
  register(items: { productId: number; quantity: number; unitPrice: number }[]): Observable<RegisterSaleResult> {
    this.loading.set(true);
    const request = { items: items.map((i) => ({ productoId: i.productId, cantidad: i.quantity, precioUnitario: i.unitPrice })) };
    return this.api.register(request).pipe(
      map((r): RegisterSaleResult => { this.loading.set(false); return { ok: true, id: r.id }; }),
      catchError((e) => { this.loading.set(false); return of<RegisterSaleResult>({ ok: false, error: apiError(e) }); }),
    );
  }
}