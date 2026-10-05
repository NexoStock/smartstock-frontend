import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiErrorBody, apiError } from '../../shared/infrastructure/api-error';
import { Product } from '../domain/model/product.entity';
import { CatalogApi } from '../infrastructure/catalog-api';

export type SaveProductResult = { ok: true; product: Product } | { ok: false; error: ApiErrorBody };

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(CatalogApi);

  readonly products = signal<Product[]>([]);
  readonly current = signal<Product | null>(null);
  readonly target = signal<Product | null>(null);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  readonly categories = computed(() => [
    ...new Set([
      'Grocery',
      'Dairy',
      'Beverages',
      'Cleaning',
      ...this.products().map((p) => p.category),
    ]),
  ]);

  fetchProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.products.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  fetchProduct(id: number | string): void {
    this.loading.set(true);
    this.error.set(null);
    this.current.set(null);

    this.api.products.getById(id).subscribe({
      next: (product) => {
        this.current.set(product);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  create(product: Product): Observable<SaveProductResult> {
    return this.save(this.api.products.create(product));
  }

  update(id: number | string, product: Product): Observable<SaveProductResult> {
    return this.save(this.api.products.update(id, product));
  }

  fetchThresholdTarget(sensorId: number | string): void {
    this.loading.set(true);
    this.error.set(null);
    this.target.set(null);

    this.api.thresholdTarget(sensorId).subscribe({
      next: (product) => {
        this.target.set(product);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  saveThreshold(sensorId: number | string, minThreshold: number): Observable<SaveProductResult> {
    return this.save(this.api.setThreshold(sensorId, minThreshold));
  }

  private save(request: Observable<Product>): Observable<SaveProductResult> {
    this.loading.set(true);

    return request.pipe(
      map((product): SaveProductResult => {
        this.loading.set(false);
        return { ok: true, product };
      }),
      catchError((e) => {
        this.loading.set(false);

        return of<SaveProductResult>({
          ok: false,
          error: apiError(e),
        });
      }),
    );
  }
}
