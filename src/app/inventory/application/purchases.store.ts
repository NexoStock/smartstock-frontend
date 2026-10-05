import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { DateRange } from '../../shared/domain/model/date-range';
import { ApiErrorBody, apiError } from '../../shared/infrastructure/api-error';
import { Purchase, PurchaseProductOption, Supplier } from '../domain/model/purchase.entity';
import { PurchasesApi } from '../infrastructure/purchases-api';

export type PurchaseActionResult<T = void> =
  { ok: true; value: T } | { ok: false; error: ApiErrorBody };

@Injectable({ providedIn: 'root' })
export class PurchasesStore {
  private readonly api = inject(PurchasesApi);

  readonly purchases = signal<Purchase[]>([]);
  readonly total = signal(0);
  readonly current = signal<Purchase | null>(null);
  readonly suppliers = signal<Supplier[]>([]);
  readonly options = signal<PurchaseProductOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  fetchPurchases(range: DateRange): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list(range).subscribe({
      next: ({ purchases, total }) => {
        this.purchases.set(purchases);
        this.total.set(total);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  fetchPurchase(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.get(id).subscribe({
      next: (purchase) => {
        this.current.set(purchase);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  fetchSuppliers(): void {
    this.api.suppliers.getAll().subscribe({
      next: (s) => this.suppliers.set(s),
      error: (e) => this.error.set(e),
    });
  }

  fetchOptions(): void {
    this.api.productOptions().subscribe({
      next: (o) => this.options.set(o),
      error: (e) => this.error.set(e),
    });
  }

  register(
    supplierId: number,
    date: string,
    needId: number | null,
    items: {
      productId: number;
      quantity: number;
      unitCost: number;
    }[],
  ): Observable<PurchaseActionResult<string>> {
    const request = {
      proveedorId: supplierId,
      fecha: date,
      restockingNeedId: needId,
      items: items.map((i) => ({
        productoId: i.productId,
        cantidad: i.quantity,
        costoUnitario: i.unitCost,
      })),
    };

    return this.run(this.api.register(request).pipe(map((r) => r.id)));
  }

  receive(id: string): Observable<PurchaseActionResult<void>> {
    return this.run(this.api.receive(id).pipe(map(() => undefined)));
  }

  createSupplier(
    name: string,
    email: string,
    phone: string,
  ): Observable<PurchaseActionResult<Supplier>> {
    return this.run(this.api.suppliers.create(new Supplier(null, name, email, phone)));
  }

  private run<T>(request: Observable<T>): Observable<PurchaseActionResult<T>> {
    this.loading.set(true);

    return request.pipe(
      map((value): PurchaseActionResult<T> => {
        this.loading.set(false);
        return {
          ok: true,
          value,
        };
      }),
      catchError((e) => {
        this.loading.set(false);

        return of<PurchaseActionResult<T>>({
          ok: false,
          error: apiError(e),
        });
      }),
    );
  }
}
