import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../iam/application/iam.store';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { AlertsStore } from '../../application/alerts.store';
import { Alert } from '../../domain/model/alert.entity';

const SUGGESTED_QUANTITY = 10;

@Component({
  selector: 'app-alert-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    EmptyState,
    PageHeader,
  ],
  template: `
    <section>
      <app-page-header
        [title]="'alerts.alertList.title' | translate"
      />

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}
          <button
            mat-button
            type="button"
            (click)="store.fetchAlerts()"
          >
            {{ 'shared.retry' | translate }}
          </button>
        </app-alert-banner>
      }

      @if (store.loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @for (a of store.resolved(); track a.id) {
        <app-alert-banner tone="success">
          {{
            'alerts.alertList.resolved'
              | translate: {
                  name: a.productName,
                  stock: a.currentStock,
                  threshold: a.minThreshold
                }
          }}
          <button
            mat-button
            type="button"
            (click)="store.dismiss(+a.id!)"
          >
            {{ 'alerts.alertList.dismiss' | translate }}
          </button>
        </app-alert-banner>
      }

      <h2 class="h2">
        {{ 'alerts.alertList.active' | translate }}
        <span class="count">{{ store.active().length }}</span>
      </h2>

      @for (a of store.active(); track a.id) {
        <article
          class="ss-card alert"
          [attr.aria-label]="a.productName"
        >
          <div class="main">
            <strong class="type" [class.disc]="!a.isLowStock">
              {{ a.type }}
            </strong>

            <h3 class="name">{{ a.productName }}</h3>

            @if (a.isLowStock) {
              <p class="ss-muted">
                {{
                  'alerts.alertList.reference'
                    | translate: { count: a.referenceStock }
                }}
                ·
                @if (
                  a.source === 'sensor' &&
                  a.minutesSinceReading !== null
                ) {
                  {{
                    'alerts.alertList.sensorUpdated'
                      | translate: { count: a.minutesSinceReading }
                  }}
                } @else {
                  {{ 'alerts.alertList.registeredUsed' | translate }}
                }
              </p>
            } @else {
              <p class="ss-muted">
                {{
                  'alerts.alertList.discrepancy'
                    | translate: {
                        registered: a.registeredStock,
                        physical: a.physicalStock,
                        diff: a.differencePct
                      }
                }}
              </p>
            }
          </div>

          @if (a.isLowStock) {
            <button
              mat-flat-button
              type="button"
              (click)="registerPurchase(a)"
            >
              {{ 'alerts.alertList.registerPurchase' | translate }}
            </button>
          } @else if (iam.businessType() === 'minimarket') {
            <a mat-stroked-button routerLink="/comparison">
              {{ 'alerts.alertList.viewComparison' | translate }}
            </a>
          }
        </article>
      } @empty {
        @if (!store.loading()) {
          <app-empty-state
            [message]="'alerts.alertList.empty' | translate"
          />
        }
      }
    </section>
  `,
  styles: `
    .h2 {
      font-size: 1.05rem;
      margin: 1rem 0;
    }

    .count {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      border-radius: 1rem;
      padding: 0 0.6rem;
      margin-left: 0.4rem;
    }

    .alert {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .type {
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      background: #fdeeee;
      color: var(--ss-danger);
      border-radius: 0.4rem;
      padding: 0.1rem 0.5rem;
    }

    .type.disc {
      background: #fff4e0;
      color: var(--ss-warn);
    }

    .name {
      margin: 0.4rem 0 0.2rem;
      font-size: 1.05rem;
      font-weight: 600;
    }

    p {
      margin: 0;
    }
  `,
})
export class AlertList implements OnInit {
  protected readonly store = inject(AlertsStore);
  protected readonly iam = inject(IamStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.fetchAlerts();
  }

  protected registerPurchase(alert: Alert): void {
    this.router.navigate(['/purchases/new'], {
      queryParams: {
        productId: alert.productId,
        quantity: SUGGESTED_QUANTITY,
        needId: alert.restockingNeedId,
      },
    });
  }
}