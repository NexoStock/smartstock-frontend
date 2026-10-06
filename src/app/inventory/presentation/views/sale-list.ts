import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange, currentMonth } from '../../../shared/domain/model/date-range';
import { formatPen } from '../../../shared/domain/model/money';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { DateRangeFilter } from '../../../shared/presentation/components/date-range-filter';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { Money } from '../../../shared/presentation/components/money';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { SummaryCard } from '../../../shared/presentation/components/summary-card';
import { SalesStore } from '../../application/sales.store';

// US27 · M9 sales history, M10 no sales in the period
@Component({
  selector: 'app-sale-list',
  imports: [DatePipe, RouterLink, MatButtonModule, MatProgressBarModule, TranslatePipe, AlertBanner, DateRangeFilter, EmptyState, Money, PageHeader, SummaryCard],
  template: `
    <section aria-labelledby="sales-title">
      <app-page-header [title]="'inventory.saleList.title' | translate">
        <a mat-flat-button routerLink="/sales/new">{{ 'inventory.saleList.new' | translate }}</a>
      </app-page-header>

      <div class="ss-grid">
        <app-summary-card [label]="'inventory.saleList.period' | translate" [value]="pen(store.total())" />
      </div>
      <app-date-range-filter [initial]="range" (search)="load($event)" />

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="load(range)">{{ 'shared.retry' | translate }}</button>
        </app-alert-banner>
      }
      @if (store.loading()) { <mat-progress-bar mode="indeterminate" /> }

      @if (!store.loading() && !store.error()) {
        @if (store.sales().length) {
          <table class="ss-table">
            <thead>
              <tr>
                <th>{{ 'inventory.saleList.receipt' | translate }}</th><th>{{ 'inventory.saleList.date' | translate }}</th>
                <th>{{ 'inventory.saleList.items' | translate }}</th><th>{{ 'inventory.saleList.total' | translate }}</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (sale of store.sales(); track sale.id) {
                <tr>
                  <td><strong>{{ sale.id }}</strong></td>
                  <td>{{ sale.date | date: 'mediumDate' }}</td>
                  <td>{{ sale.items.length }}</td>
                  <td><app-money [amount]="sale.total" /></td>
                  <td><a mat-stroked-button [routerLink]="['/sales', sale.id]">{{ 'inventory.saleList.receipt' | translate }}</a></td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <app-empty-state [message]="('inventory.saleList.emptyTitle' | translate) + ' ' + ('inventory.saleList.emptyText' | translate)" />
          <div class="center"><a mat-flat-button routerLink="/sales/new">{{ 'inventory.saleList.new' | translate }}</a></div>
        }
      }
    </section>
  `,
  styles: `.center { display: flex; justify-content: center; }`,
})
export class SaleList implements OnInit {
  protected readonly store = inject(SalesStore);
  protected readonly range: DateRange = currentMonth();
  protected readonly pen = formatPen;

  ngOnInit(): void {
    this.load(this.range);
  }

  protected load(range: DateRange): void {
    this.range.start = range.start;
    this.range.end = range.end;
    this.store.fetchSales(range);
  }
}