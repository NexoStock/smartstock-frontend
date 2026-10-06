import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../iam/application/iam.store';
import { formatPen } from '../../../shared/domain/model/money';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { Money } from '../../../shared/presentation/components/money';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { StockLevelBadge } from '../../../shared/presentation/components/stock-level-badge';
import { SummaryCard } from '../../../shared/presentation/components/summary-card';
import { AnalyticsStore } from '../../application/analytics.store';

// US15 · M17 Dashboard (minimarket) / Home (bodega): sales and purchases of the day, low stock, recent activity
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatButtonModule, MatProgressBarModule, TranslatePipe, AlertBanner, EmptyState, Money, PageHeader, StockLevelBadge, SummaryCard],
  template: `
    <section aria-labelledby="dashboard-title">
      <app-page-header [title]="titleKey() | translate" />

      @if (store.error()) {
        <app-alert-banner tone="error">{{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="store.fetchDashboard()">{{ 'shared.retry' | translate }}</button>
        </app-alert-banner>
      }
      @if (store.loading() && !store.dashboard()) { <mat-progress-bar mode="indeterminate" /> }

      @if (store.dashboard(); as d) {
        <div class="ss-grid">
          <a class="card-link" routerLink="/sales">
            <app-summary-card [label]="'analytics.dashboard.salesToday' | translate" [value]="pen(d.salesToday.total)"
              [hint]="(d.salesToday.count === 1 ? 'analytics.dashboard.saleOne' : 'analytics.dashboard.saleMany') | translate: { count: d.salesToday.count }" />
          </a>
          <a class="card-link" routerLink="/purchases">
            <app-summary-card [label]="'analytics.dashboard.purchasesToday' | translate" [value]="pen(d.purchasesToday.total)"
              [hint]="(d.purchasesToday.count === 1 ? 'analytics.dashboard.purchaseOne' : 'analytics.dashboard.purchaseMany') | translate: { count: d.purchasesToday.count }" />
          </a>
          <a class="card-link" routerLink="/alerts">
            <app-summary-card [label]="'analytics.dashboard.lowStockAlerts' | translate" [value]="'' + d.lowStockAlerts"
              [hint]="'analytics.dashboard.needsAttention' | translate" />
          </a>
        </div>

        <div class="two">
          <div class="ss-card">
            <h2 class="h2">{{ 'analytics.dashboard.recent' | translate }}</h2>
            @for (a of d.recentActivity; track a.id) {
              <a class="line" [routerLink]="a.link">
                <span>{{ (a.type === 'SALE' ? 'analytics.dashboard.sale' : 'analytics.dashboard.purchase') | translate }} {{ a.id }}</span>
                <strong><app-money [amount]="a.total" /></strong>
              </a>
            } @empty {
              <app-empty-state [message]="'analytics.dashboard.noActivity' | translate" />
            }
          </div>

          <div class="ss-card">
            <h2 class="h2">{{ 'analytics.dashboard.stockOverview' | translate }}</h2>
            @for (s of d.stockOverview; track s.productId) {
              <a class="line" [routerLink]="['/products', s.productId]">
                <span>{{ s.name }} · {{ s.units }} {{ 'shared.units' | translate }}</span>
                <app-stock-level-badge [level]="s.level" />
              </a>
            } @empty {
              <app-empty-state [message]="'analytics.dashboard.noProducts' | translate" />
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .card-link { text-decoration: none; color: inherit; display: block; }
    .two { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .h2 { font-size: 1.05rem; margin: 0 0 0.75rem; }
    .line { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--ss-border); color: inherit; text-decoration: none; }
    .line:last-child { border-bottom: 0; }
  `,
})
export class Dashboard implements OnInit {
  protected readonly store = inject(AnalyticsStore);
  private readonly iam = inject(IamStore);
  protected readonly pen = formatPen;
  // In bodega the same screen is called Home
  protected readonly titleKey = computed(() => (this.iam.businessType() === 'bodega' ? 'shared.menu.home' : 'analytics.dashboard.title'));

  ngOnInit(): void {
    this.store.fetchDashboard();
  }
}
