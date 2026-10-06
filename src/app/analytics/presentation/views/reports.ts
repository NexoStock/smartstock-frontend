import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { DateRange, currentMonth } from '../../../shared/domain/model/date-range';
import { formatPen } from '../../../shared/domain/model/money';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { DateRangeFilter } from '../../../shared/presentation/components/date-range-filter';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { SummaryCard } from '../../../shared/presentation/components/summary-card';
import { AnalyticsStore } from '../../application/analytics.store';

// US25 · M18 reports: sales, purchases and stock movements of the period (minimarket only)
@Component({
  selector: 'app-reports',
  imports: [
    DatePipe,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    DateRangeFilter,
    EmptyState,
    PageHeader,
    SummaryCard,
  ],
  template: `
    <section aria-labelledby="reports-title">
      <app-page-header [title]="'analytics.reports.title' | translate" />
      <app-date-range-filter [initial]="range" (search)="load($event)" />

      @if (store.error()) {
        <app-alert-banner tone="error"
          >{{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="load(range)">
            {{ 'shared.retry' | translate }}
          </button>
        </app-alert-banner>
      }
      @if (store.loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (store.report(); as r) {
        <div class="ss-grid cards">
          <app-summary-card
            [label]="'analytics.reports.sales' | translate"
            [value]="pen(r.salesTotal)"
          />
          <app-summary-card
            [label]="'analytics.reports.purchases' | translate"
            [value]="pen(r.purchasesTotal)"
          />
          <app-summary-card
            [label]="'analytics.reports.movements' | translate"
            [value]="'' + r.movements.length"
          />
        </div>

        <h2 class="h2">{{ 'analytics.reports.summary' | translate }}</h2>
        @if (r.movements.length) {
          <table class="ss-table">
            <thead>
              <tr>
                <th>{{ 'analytics.reports.type' | translate }}</th>
                <th>{{ 'analytics.reports.product' | translate }}</th>
                <th>{{ 'analytics.reports.quantity' | translate }}</th>
                <th>{{ 'analytics.reports.source' | translate }}</th>
                <th>{{ 'analytics.reports.date' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of r.movements; track m.id) {
                <tr>
                  <td>
                    <strong>{{ m.type }}</strong>
                  </td>
                  <td>{{ m.productName }}</td>
                  <td>{{ m.signedQuantity > 0 ? '+' : '' }}{{ m.signedQuantity }}</td>
                  <td>{{ m.sourceId }}</td>
                  <td>{{ m.date | date: 'mediumDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <app-empty-state [message]="'analytics.reports.empty' | translate" />
        }
        @for (id of r.pendingPurchases; track id) {
          <p class="ss-note">{{ 'analytics.reports.pending' | translate: { id: id } }}</p>
        }
      }
    </section>
  `,
  styles: `
    .h2 {
      font-size: 1.05rem;
      margin: 1rem 0 0.75rem;
    }
    .cards {
      margin-top: 1rem;
    }
  `,
})
export class Reports implements OnInit {
  protected readonly store = inject(AnalyticsStore);
  protected readonly range: DateRange = currentMonth();
  protected readonly pen = formatPen;

  ngOnInit(): void {
    this.load(this.range);
  }

  protected load(range: DateRange): void {
    this.range.start = range.start;
    this.range.end = range.end;
    this.store.fetchReport(range);
  }
}
