import { Injectable, inject, signal } from '@angular/core';
import { Product } from '../domain/model/product.entity';
import { CatalogApi } from '../infrastructure/catalog-api';

// Views never call the API: they talk to this store.
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(CatalogApi);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  fetchProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.products.getAll().subscribe({
      next: (products) => { this.products.set(products); this.loading.set(false); },
      error: (e) => { this.error.set(e); this.loading.set(false); },
    });
  }
}
