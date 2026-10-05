import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { StatusTag } from '../../../shared/presentation/components/status-tag';
import { StockStore } from '../../application/stock.store';

// US11 / US12 · M39 comparison between the registered stock and the physical stock measured by the sensors
@Component({
  selector: 'app-comparison',
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    EmptyState,
    PageHeader,
    StatusTag,
  ],
  template: `
    <section aria-labelledby="comparison-title">
      <app-page-header [title]="'inventory.comparison.title' | translate" />

      @if (store.error()) {
        <app-alert-banner tone="error"
          >{{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="store.fetchComparison()">
            {{ 'shared.retry' | translate }}
          </button>
        </app-alert-banner>
      }
      @if (store.loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (store.comparison(); as c) {
        @if (c.discrepancies > 0) {
          <app-alert-banner tone="warn">
            {{
              (c.discrepancies === 1
                ? 'inventory.comparison.differsOne'
                : 'inventory.comparison.differsMany'
              ) | translate: { count: c.discrepancies }
            }}
            <a mat-stroked-button routerLink="/alerts">{{
              'inventory.comparison.viewAlert' | translate
            }}</a>
          </app-alert-banner>
        }

        @if (c.rows.length) {
          <table class="ss-table">
            <thead>
              <tr>
                <th>{{ 'inventory.comparison.product' | translate }}</th>
                <th>{{ 'inventory.comparison.registered' | translate }}</th>
                <th>{{ 'inventory.comparison.physical' | translate }}</th>
                <th>{{ 'inventory.comparison.difference' | translate }}</th>
                <th>{{ 'inventory.comparison.result' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of c.rows; track r.productId) {
                <tr>
                  <td>
                    <strong>{{ r.productName }}</strong>
                  </td>
                  <td>{{ r.registeredStock }} {{ 'shared.units' | translate }}</td>
                  <td>
                    @if (r.weightKg !== null) {
                      {{ r.weightKg.toFixed(2) }} kg ≈ {{ r.physicalUnits }}
                      {{ 'shared.units' | translate }}
                    } @else {
                      {{ 'inventory.comparison.noReading' | translate }}
                    }
                  </td>
                  <td>{{ r.differencePct === null ? '—' : r.differencePct.toFixed(1) + '%' }}</td>
                  <td><app-status-tag [status]="r.statusKey" /></td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <app-empty-state [message]="'inventory.comparison.empty' | translate" />
        }
        <p class="ss-note">{{ 'inventory.comparison.formula' | translate }}</p>
        <p class="ss-note">{{ 'inventory.comparison.registeredOnlyNote' | translate }}</p>
      }
    </section>
  `,
})
export class Comparison implements OnInit {
  protected readonly store = inject(StockStore);

  ngOnInit(): void {
    this.store.fetchComparison();
  }
}
