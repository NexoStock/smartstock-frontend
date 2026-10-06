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
import { StatusTag } from '../../../shared/presentation/components/status-tag';
import { SummaryCard } from '../../../shared/presentation/components/summary-card';
import { PurchasesStore } from '../../application/purchases.store';

@Component({
  selector: 'app-purchase-list',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    DateRangeFilter,
    EmptyState,
    Money,
    PageHeader,
    StatusTag,
    SummaryCard,
  ],
  template: `
    <section aria-labelledby="purchases-title">
      <app-page-header [title]="'inventory.purchaseList.title' | translate">
        <a mat-stroked-button routerLink="/purchases/suppliers">
          {{ 'inventory.purchaseList.suppliers' | translate }}
        </a>

        <a mat-flat-button routerLink="/purchases/new">
          {{ 'inventory.purchaseList.new' | translate }}
        </a>
      </app-page-header>

      <div class="ss-grid">
        <app-summary-card
          [label]="'inventory.purchaseList.period' | translate"
          [value]="pen(store.total())"
        />
      </div>

      <app-date-range-filter [initial]="range" (search)="load($event)" />

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}

          <button mat-button type="button" (click)="load(range)">
            {{ 'shared.retry' | translate }}
          </button>
        </app-alert-banner>
      }

      @if (store.loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (!store.loading() && !store.error()) {
        @if (store.purchases().length) {
          <table class="ss-table">
            <thead>
              <tr>
                <th>
                  {{ 'inventory.purchaseList.date' | translate }}
                </th>

                <th>
                  {{ 'inventory.purchaseList.supplier' | translate }}
                </th>

                <th>
                  {{ 'inventory.purchaseList.status' | translate }}
                </th>

                <th>
                  {{ 'inventory.purchaseList.items' | translate }}
                </th>

                <th>
                  {{ 'inventory.purchaseList.total' | translate }}
                </th>

                <th>
                  {{ 'inventory.purchaseList.receipt' | translate }}
                </th>
              </tr>
            </thead>

            <tbody>
              @for (p of store.purchases(); track p.id) {
                <tr>
                  <td>
                    {{ p.date | date: 'mediumDate' }}
                  </td>

                  <td>
                    {{ p.supplierName }}
                  </td>

                  <td>
                    <app-status-tag
                      [status]="
                        p.status === 'RECEIVED'
                          ? 'received'
                          : p.status === 'CANCELLED'
                            ? 'cancelled'
                            : 'pending'
                      "
                    />
                  </td>

                  <td>
                    {{ p.items.length }}
                  </td>

                  <td>
                    <app-money [amount]="p.total" />
                  </td>

                  <td>
                    <a [routerLink]="['/purchases', p.id]">
                      <strong>{{ p.id }}</strong>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <p class="ss-note">
            {{
              'inventory.purchaseList.showing'
                | translate
                  : {
                      count: store.purchases().length,
                    }
            }}
          </p>
        } @else {
          <app-empty-state
            [message]="
              ('inventory.purchaseList.emptyTitle' | translate) +
              ' ' +
              ('inventory.purchaseList.emptyText' | translate)
            "
          />

          <div class="center">
            <a mat-flat-button routerLink="/purchases/new">
              {{ 'inventory.purchaseList.new' | translate }}
            </a>
          </div>
        }
      }
    </section>
  `,
  styles: `
    .center {
      display: flex;
      justify-content: center;
    }
  `,
})
export class PurchaseList implements OnInit {
  protected readonly store = inject(PurchasesStore);

  protected readonly range: DateRange = currentMonth();

  protected readonly pen = formatPen;

  ngOnInit(): void {
    this.load(this.range);
  }

  protected load(range: DateRange): void {
    this.range.start = range.start;
    this.range.end = range.end;

    this.store.fetchPurchases(range);
  }
}
