import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { StatusTag } from '../../../shared/presentation/components/status-tag';
import { StockLevelBadge } from '../../../shared/presentation/components/stock-level-badge';
import { CatalogStore } from '../../application/catalog.store';

// US08 · M27 products: registered stock, stock level (online sensor first) and sensor state
@Component({
  selector: 'app-product-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    EmptyState,
    PageHeader,
    StatusTag,
    StockLevelBadge,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  protected readonly store = inject(CatalogStore);
  protected readonly query = signal('');
  protected readonly level = signal<'all' | 'lowStock' | 'healthy'>('all');

  // Search by name or SKU + filter by stock level
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.store
      .products()
      .filter(
        (p) =>
          (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
          (this.level() === 'all' || p.stockLevel === this.level()),
      );
  });

  ngOnInit(): void {
    this.store.fetchProducts();
  }
}
