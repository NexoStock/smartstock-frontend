import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { Money } from '../../../shared/presentation/components/money';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { StatusTag } from '../../../shared/presentation/components/status-tag';
import { PurchasesStore } from '../../application/purchases.store';

@Component({
  selector: 'app-purchase-details',
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
  ],
  template: `
    <section aria-labelledby="purchase-title">
      <app-page-header [title]="'inventory.purchaseDetails.title' | translate">
        <a mat-stroked-button routerLink="/purchases">
          {{ 'inventory.purchaseDetails.back' | translate }}
        </a>
      </app-page-header>

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}

          <button mat-button type="button" (click)="store.fetchPurchase(id())">
            {{ 'shared.retry' | translate }}
          </button>
        </app-alert-banner>
      }

      @if (failed()) {
        <app-alert-banner tone="error">
          {{ 'inventory.purchaseDetails.receiveFailed' | translate }}
        </app-alert-banner>
      }

      @if (store.loading() && !store.current()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (store.current(); as p) {
        <div class="ss-card">
          <div class="top">
            <h2 id="purchase-title" class="h2">
              {{ 'inventory.purchaseDetails.purchase' | translate }}
              {{ p.id }}
            </h2>

            <app-status-tag
              [status]="
                p.status === 'RECEIVED'
                  ? 'received'
                  : p.status === 'CANCELLED'
                    ? 'cancelled'
                    : 'pending'
              "
            />

            @if (p.isPending) {
              <button
                mat-flat-button
                type="button"
                class="push"
                [disabled]="store.loading()"
                (click)="receive()"
              >
                {{ 'inventory.purchaseDetails.markReceived' | translate }}
              </button>
            }
          </div>

          <dl class="meta">
            <div>
              <dt>
                {{ 'inventory.purchaseDetails.supplier' | translate }}
              </dt>

              <dd>
                {{ p.supplierName }}
              </dd>
            </div>

            <div>
              <dt>
                {{ 'inventory.purchaseList.date' | translate }}
              </dt>

              <dd>
                {{ p.date | date: 'mediumDate' }}
              </dd>
            </div>

            <div>
              <dt>
                {{ 'inventory.purchaseList.total' | translate }}
              </dt>

              <dd>
                <app-money [amount]="p.total" />
              </dd>
            </div>
          </dl>
        </div>

        <div class="ss-card">
          <h2 class="h2">
            {{ 'inventory.purchaseNew.products' | translate }}
          </h2>

          @for (item of p.items; track item.productId) {
            <div class="line">
              <span>
                {{ item.productName }}
              </span>

              <span class="ss-muted">
                {{ item.quantity }}
                ×
                <app-money [amount]="item.unitCost" />
              </span>

              <strong>
                <app-money [amount]="item.subtotal" />
              </strong>
            </div>
          }
        </div>

        <div class="ss-card">
          <h2 class="h2">
            {{ 'inventory.purchaseDetails.movements' | translate }}
          </h2>

          @for (m of p.movements; track m.id) {
            <div class="line">
              <strong class="tag">
                {{ m.type }}
              </strong>

              <span>
                {{ m.productName }}
              </span>

              <span>
                +{{ m.quantity }}
                {{ 'shared.units' | translate }}
              </span>
            </div>
          } @empty {
            <strong>
              {{ 'inventory.purchaseDetails.noMovements' | translate }}
            </strong>

            <p class="ss-muted">
              {{ 'inventory.purchaseDetails.noMovementsHelp' | translate }}
            </p>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .top {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .push {
      margin-left: auto;
    }

    .h2 {
      font-size: 1.05rem;
      margin: 0 0 0.75rem;
    }

    .top .h2 {
      margin: 0;
    }

    .meta {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      margin: 1rem 0 0;
    }

    dt {
      color: var(--ss-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    dd {
      margin: 0;
      font-weight: 600;
    }

    .line {
      display: grid;
      grid-template-columns: 1fr 1fr 120px;
      gap: 0.5rem;
      padding: 0.4rem 0;
    }

    .tag {
      background: #eef2f7;
      border-radius: 0.4rem;
      padding: 0 0.5rem;
      width: max-content;
    }
  `,
})
export class PurchaseDetails implements OnInit {
  protected readonly store = inject(PurchasesStore);

  readonly id = input.required<string>();

  protected readonly failed = signal(false);

  ngOnInit(): void {
    this.store.fetchPurchase(this.id());
  }

  protected receive(): void {
    this.failed.set(false);

    this.store.receive(this.id()).subscribe((result) => {
      if (result.ok) {
        this.store.fetchPurchase(this.id());
      } else {
        this.failed.set(true);
      }
    });
  }
}
