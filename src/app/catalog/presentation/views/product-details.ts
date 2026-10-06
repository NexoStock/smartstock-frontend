import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { StockStore } from '../../../inventory/application/stock.store';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { Money } from '../../../shared/presentation/components/money';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { StatusTag } from '../../../shared/presentation/components/status-tag';
import { StockLevelBadge } from '../../../shared/presentation/components/stock-level-badge';
import { CatalogStore } from '../../application/catalog.store';

// US06 / US07 / US08 · M28 product details with the sensor reading and the recent readings
@Component({
  selector: 'app-product-details',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    Money,
    PageHeader,
    StatusTag,
    StockLevelBadge,
  ],
  template: `
    <section aria-labelledby="product-title">
      <app-page-header [title]="'catalog.productDetails.title' | translate">
        <a mat-stroked-button routerLink="/products">{{
          'catalog.productDetails.back' | translate
        }}</a>
        @if (catalog.current(); as p) {
          <a mat-flat-button [routerLink]="['/products', p.id, 'edit']">{{
            'catalog.productDetails.edit' | translate
          }}</a>
        }
      </app-page-header>

      @if (catalog.error() || stock.error()) {
        <app-alert-banner tone="error"
          >{{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="load()">
            {{ 'shared.retry' | translate }}
          </button>
        </app-alert-banner>
      }
      @if (catalog.loading() || stock.loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (catalog.current(); as p) {
        <div class="ss-card">
          <div class="title">
            <h2 id="product-title" class="h2">{{ p.name }}</h2>
            <span class="ss-muted">{{ p.sku }}</span>
            <app-stock-level-badge [level]="p.stockLevel" />
          </div>
          <dl class="facts">
            <div>
              <dt>{{ 'catalog.field.category' | translate }}</dt>
              <dd>{{ p.category }}</dd>
            </div>
            <div>
              <dt>{{ 'catalog.field.unitWeight' | translate }}</dt>
              <dd>{{ p.unitWeight.toFixed(2) }} kg</dd>
            </div>
            <div>
              <dt>{{ 'catalog.productDetails.maxCapacity' | translate }}</dt>
              <dd>{{ p.maxCapacity }} {{ 'shared.units' | translate }}</dd>
            </div>
            <div>
              <dt>{{ 'catalog.field.salePrice' | translate }}</dt>
              <dd>
                @if (p.salePrice) {
                  <app-money [amount]="p.salePrice" />
                } @else {
                  {{ 'catalog.productDetails.notSet' | translate }}
                }
              </dd>
            </div>
            <div>
              <dt>{{ 'catalog.field.purchaseCost' | translate }}</dt>
              <dd><app-money [amount]="p.purchaseCost" /></dd>
            </div>
            <div>
              <dt>{{ 'catalog.field.minThreshold' | translate }}</dt>
              <dd>{{ p.minThreshold }} {{ 'shared.units' | translate }}</dd>
            </div>
            <div>
              <dt>{{ 'catalog.field.usualSupplier' | translate }}</dt>
              <dd>{{ p.usualSupplier || '—' }}</dd>
            </div>
            <div>
              <dt>{{ 'catalog.field.registeredStock' | translate }}</dt>
              <dd>{{ p.registeredStock }} {{ 'shared.units' | translate }}</dd>
            </div>
          </dl>
        </div>

        <div class="ss-card">
          <h2 class="h2">{{ 'catalog.productDetails.sensorReading' | translate }}</h2>
          @if (stock.sensorDetail(); as d) {
            @if (d.sensor; as s) {
              <p>
                <app-status-tag [status]="s.status" /> <strong>{{ s.code }}</strong>
              </p>
              <p class="big">{{ s.weightKg.toFixed(2) }} kg</p>
              <p>
                ≈ {{ s.units }} {{ 'shared.units' | translate }}
                {{
                  'catalog.productDetails.perUnit' | translate: { weight: p.unitWeight.toFixed(2) }
                }}
              </p>
              @if (s.minutesSinceReading !== null) {
                <p class="ss-muted">
                  {{ 'catalog.productDetails.lastReading' | translate }}
                  {{ 'shared.minutesAgo' | translate: { count: s.minutesSinceReading } }}
                </p>
              }
              <p class="ss-muted">
                {{ 'catalog.productDetails.alertReference' | translate }}
                {{
                  (s.status === 'online'
                    ? 'catalog.productDetails.referenceSensor'
                    : 'catalog.productDetails.referenceRegistered'
                  ) | translate
                }}
              </p>
              <div class="row">
                <a mat-stroked-button [routerLink]="['/sensors', s.sensorId, 'threshold']">{{
                  'catalog.productDetails.configure' | translate
                }}</a>
                <a mat-stroked-button routerLink="/sensors">{{
                  'catalog.productDetails.viewSensor' | translate
                }}</a>
              </div>
            } @else {
              <p class="ss-muted">{{ 'catalog.productDetails.noSensor' | translate }}</p>
              <a mat-stroked-button routerLink="/sensors/link">{{
                'catalog.productDetails.linkSensor' | translate
              }}</a>
            }
          }
        </div>

        @if (stock.sensorDetail()?.readings?.length) {
          <div class="ss-card">
            <h2 class="h2">{{ 'catalog.productDetails.recent' | translate }}</h2>
            @for (r of stock.sensorDetail()!.readings; track r.id) {
              <div class="reading">
                <span>{{ r.date | date: 'MMM d, HH:mm' }}</span
                ><span>{{ r.weightKg.toFixed(2) }} kg</span
                ><span>{{ r.units }} {{ 'shared.units' | translate }}</span>
              </div>
            }
          </div>
        }
      }
    </section>
  `,
  styles: `
    .title {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .h2 {
      font-size: 1.1rem;
      margin: 0 0 0.75rem;
    }
    .title .h2 {
      margin: 0;
    }
    .facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin: 0;
    }
    dt {
      color: var(--ss-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    dd {
      margin: 0;
      font-weight: 600;
    }
    .big {
      font-size: 1.6rem;
      font-weight: 600;
      margin: 0.25rem 0;
    }
    p {
      margin: 0.25rem 0;
    }
    .row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }
    .reading {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      padding: 0.4rem 0;
      border-bottom: 1px solid var(--ss-border);
    }
  `,
})
export class ProductDetails implements OnInit {
  protected readonly catalog = inject(CatalogStore);
  protected readonly stock = inject(StockStore);
  readonly id = input.required<string>(); // route param :id

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.catalog.fetchProduct(this.id());
    this.stock.fetchSensorDetail(this.id());
  }
}
