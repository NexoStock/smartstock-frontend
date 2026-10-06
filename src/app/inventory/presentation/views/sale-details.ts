import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { Money } from '../../../shared/presentation/components/money';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { SalesStore } from '../../application/sales.store';

// US28 · M14 sale details with its stock movements
@Component({
  selector: 'app-sale-details',
  imports: [DatePipe, RouterLink, MatButtonModule, MatProgressBarModule, TranslatePipe, AlertBanner, Money, PageHeader],
  template: `
    <section aria-labelledby="sale-title">
      <app-page-header [title]="'inventory.saleDetails.title' | translate">
        <a mat-stroked-button routerLink="/sales">{{ 'inventory.saleDetails.back' | translate }}</a>
      </app-page-header>

      @if (store.error()) {
        <app-alert-banner tone="error">{{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="store.fetchSale(id())">{{ 'shared.retry' | translate }}</button>
        </app-alert-banner>
      }
      @if (store.loading()) { <mat-progress-bar mode="indeterminate" /> }

      @if (store.current(); as sale) {
        <div class="ss-card">
          <h2 id="sale-title" class="h2">{{ 'inventory.saleDetails.sale' | translate }} {{ sale.id }}</h2>
          <dl class="meta">
            <div><dt>{{ 'inventory.saleList.date' | translate }}</dt><dd>{{ sale.date | date: 'mediumDate' }}</dd></div>
            <div><dt>{{ 'inventory.saleList.total' | translate }}</dt><dd><app-money [amount]="sale.total" /></dd></div>
          </dl>
        </div>

        <div class="ss-card">
          <h2 class="h2">{{ 'inventory.saleDetails.products' | translate }}</h2>
          @for (item of sale.items; track item.productId) {
            <div class="line">
              <span>{{ item.productName }}</span>
              <span class="ss-muted">{{ item.quantity }} × <app-money [amount]="item.unitPrice" /></span>
              <strong><app-money [amount]="item.subtotal" /></strong>
            </div>
          }
        </div>

        <div class="ss-card">
          <h2 class="h2">{{ 'inventory.saleDetails.movements' | translate }}</h2>
          @for (m of sale.movements; track m.id) {
            <div class="line">
              <strong class="tag">{{ m.type }}</strong>
              <span>{{ m.productName }}</span>
              <span>{{ m.signedQuantity > 0 ? '+' : '' }}{{ m.signedQuantity }} {{ 'shared.units' | translate }}</span>
            </div>
          } @empty {
            <p class="ss-muted">{{ 'inventory.saleDetails.noMovements' | translate }}</p>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .h2 { font-size: 1.05rem; margin: 0 0 0.75rem; }
    .meta { display: flex; gap: 2rem; margin: 0; }
    dt { color: var(--ss-muted); font-size: 0.8rem; text-transform: uppercase; }
    dd { margin: 0; font-weight: 600; }
    .line { display: grid; grid-template-columns: 1fr 1fr 120px; gap: 0.5rem; padding: 0.4rem 0; }
    .line strong:last-child { text-align: right; }
    .tag { background: #eef2f7; border-radius: 0.4rem; padding: 0 0.5rem; width: max-content; }
  `,
})
export class SaleDetails implements OnInit {
  protected readonly store = inject(SalesStore);
  readonly id = input.required<string>(); // route param :id (withComponentInputBinding)

  ngOnInit(): void {
    this.store.fetchSale(this.id());
  }
}