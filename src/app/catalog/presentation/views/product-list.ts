import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { StockLevelBadge } from '../../../shared/presentation/components/stock-level-badge';
import { CatalogStore } from '../../application/catalog.store';

@Component({
  selector: 'app-product-list',
  imports: [MatTableModule, MatButtonModule, MatProgressBarModule, TranslatePipe, StockLevelBadge, EmptyState],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  protected readonly store = inject(CatalogStore);
  protected readonly columns = ['name', 'category', 'stock', 'level'];

  ngOnInit(): void {
    this.store.fetchProducts();
  }
}
