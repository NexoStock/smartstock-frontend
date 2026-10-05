import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { toIsoDate } from '../../../shared/domain/model/date-range';
import { formatPen } from '../../../shared/domain/model/money';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { FormField } from '../../../shared/presentation/components/form-field';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { PurchasesStore } from '../../application/purchases.store';

interface Row {
  productId: number | null;
  quantity: number;
  unitCost: number;
}

type PurchaseError = 'empty' | 'supplier' | 'quantity' | 'generic';

@Component({
  selector: 'app-purchase-new',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    AlertBanner,
    FormField,
    PageHeader,
  ],
  template: `
    <section aria-labelledby="purchase-new-title">
      <app-page-header [title]="'inventory.purchaseNew.title' | translate" />

      <div class="ss-card">
        @if (needId()) {
          <app-alert-banner tone="warn">
            {{ 'inventory.purchaseNew.fromAlert' | translate }}
          </app-alert-banner>
        }

        @switch (error()) {
          @case ('empty') {
            <app-alert-banner tone="error">
              {{ 'inventory.purchaseNew.errorEmpty' | translate }}
            </app-alert-banner>
          }

          @case ('quantity') {
            <app-alert-banner tone="error">
              {{ 'inventory.purchaseNew.errorQuantity' | translate }}
            </app-alert-banner>
          }

          @case ('generic') {
            <app-alert-banner tone="error">
              {{ 'shared.error' | translate }}
            </app-alert-banner>
          }
        }

        <div class="ss-form-grid">
          <app-form-field
            [id]="'supplier'"
            [label]="'inventory.purchaseNew.supplier' | translate"
            [error]="
              error() === 'supplier' ? ('inventory.purchaseNew.errorSupplier' | translate) : ''
            "
          >
            <select
              id="supplier"
              class="ss-input"
              [attr.aria-invalid]="error() === 'supplier'"
              (change)="supplierId.set(toNumber($any($event.target).value)); error.set(null)"
            >
              <option value="" [selected]="supplierId() === null">
                {{ 'inventory.purchaseNew.chooseSupplier' | translate }}
              </option>

              @for (s of store.suppliers(); track s.id) {
                <option [value]="s.id" [selected]="s.id === supplierId()">
                  {{ s.name }}
                </option>
              }
            </select>
          </app-form-field>

          <app-form-field [id]="'date'" [label]="'inventory.purchaseNew.date' | translate">
            <input
              id="date"
              class="ss-input"
              type="date"
              [value]="date()"
              (input)="date.set($any($event.target).value)"
            />
          </app-form-field>
        </div>

        <a routerLink="/purchases/suppliers" class="ss-note">
          {{ 'inventory.purchaseNew.newSupplier' | translate }}
        </a>

        <h2 class="h2">
          {{ 'inventory.purchaseNew.products' | translate }}
        </h2>

        @for (row of rows(); track $index; let i = $index) {
          <div class="row">
            <div>
              <label class="sr-only" [for]="'product-' + i">
                {{ 'inventory.purchaseNew.product' | translate }}
              </label>

              <select
                class="ss-input"
                [id]="'product-' + i"
                (change)="setProduct(i, $any($event.target).value)"
              >
                <option value="" [selected]="row.productId === null">
                  {{ 'inventory.purchaseNew.chooseProduct' | translate }}
                </option>

                @for (o of store.options(); track o.id) {
                  <option [value]="o.id" [selected]="o.id === row.productId">
                    {{ o.name }}
                  </option>
                }
              </select>
            </div>

            <div>
              <label class="sr-only" [for]="'qty-' + i">
                {{ 'inventory.purchaseNew.qty' | translate }}
              </label>

              <input
                class="ss-input"
                [id]="'qty-' + i"
                type="number"
                min="1"
                step="1"
                [value]="row.quantity"
                (input)="setQuantity(i, $any($event.target).value)"
              />
            </div>

            <div>
              <label class="sr-only" [for]="'cost-' + i">
                {{ 'inventory.purchaseNew.unitCost' | translate }}
              </label>

              <input
                class="ss-input"
                [id]="'cost-' + i"
                type="number"
                min="0"
                step="0.01"
                [value]="row.unitCost"
                (input)="setCost(i, $any($event.target).value)"
              />
            </div>

            <strong class="sub">
              {{ pen(row.quantity * row.unitCost) }}
            </strong>

            <button
              mat-icon-button
              type="button"
              [attr.aria-label]="'inventory.purchaseNew.remove' | translate"
              (click)="remove(i)"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        } @empty {
          <p class="ss-muted">
            {{ 'inventory.purchaseNew.noProducts' | translate }}
          </p>
        }

        <button mat-stroked-button type="button" (click)="add()">
          {{ 'inventory.purchaseNew.add' | translate }}
        </button>

        <div class="total">
          <span>
            {{ 'inventory.purchaseNew.total' | translate }}
          </span>

          <strong>
            {{ pen(total()) }}
          </strong>
        </div>
      </div>

      <div class="ss-actions">
        <a mat-button [routerLink]="needId() ? '/alerts' : '/purchases'">
          {{ 'shared.cancel' | translate }}
        </a>

        <button mat-flat-button type="button" [disabled]="store.loading()" (click)="register()">
          {{ 'inventory.purchaseNew.register' | translate }}
        </button>
      </div>
    </section>
  `,
  styles: `
    .h2 {
      font-size: 1rem;
      margin: 1.25rem 0 0.75rem;
    }

    .row {
      display: grid;
      grid-template-columns:
        minmax(160px, 2fr)
        90px
        120px
        110px
        48px;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .sub {
      text-align: right;
    }

    .total {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--ss-border);
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .row {
        grid-template-columns: 1fr 90px;
      }
    }
  `,
})
export class PurchaseNew implements OnInit {
  protected readonly store = inject(PurchasesStore);
  private readonly router = inject(Router);
  protected readonly pen = formatPen;

  readonly productId = input<string | undefined>(undefined);

  readonly quantity = input<string | undefined>(undefined);

  readonly needId = input<string | undefined>(undefined);

  protected readonly supplierId = signal<number | null>(null);

  protected readonly date = signal(toIsoDate(new Date()));

  protected readonly rows = signal<Row[]>([]);

  protected readonly error = signal<PurchaseError | null>(null);

  protected readonly total = computed(() =>
    this.rows().reduce((sum, r) => sum + r.quantity * r.unitCost, 0),
  );

  private prefilled = false;

  constructor() {
    effect(() => {
      const options = this.store.options();

      const suppliers = this.store.suppliers();

      const productId = Number(this.productId());

      if (this.prefilled || !productId || !options.length || !suppliers.length) {
        return;
      }

      const option = options.find((o) => o.id === productId);

      if (!option) return;

      this.prefilled = true;

      untracked(() => {
        this.rows.set([
          {
            productId: option.id,
            quantity: Number(this.quantity()) || 1,
            unitCost: option.purchaseCost,
          },
        ]);

        const usual = suppliers.find((s) => s.name === option.usualSupplier);

        if (usual) {
          this.supplierId.set(usual.id as number);
        }
      });
    });
  }

  ngOnInit(): void {
    this.store.fetchSuppliers();
    this.store.fetchOptions();
  }

  protected toNumber(value: string): number | null {
    return value ? Number(value) : null;
  }

  protected add(): void {
    this.rows.update((r) => [
      ...r,
      {
        productId: null,
        quantity: 1,
        unitCost: 0,
      },
    ]);

    this.error.set(null);
  }

  protected remove(i: number): void {
    this.rows.update((r) => r.filter((_, k) => k !== i));
  }

  protected setProduct(i: number, value: string): void {
    const option = this.store.options().find((o) => o.id === Number(value));

    this.rows.update((r) =>
      r.map((row, k) =>
        k === i
          ? {
              ...row,
              productId: option ? option.id : null,
              unitCost: option ? option.purchaseCost : row.unitCost,
            }
          : row,
      ),
    );
  }

  protected setQuantity(i: number, value: string): void {
    this.rows.update((r) =>
      r.map((row, k) =>
        k === i
          ? {
              ...row,
              quantity: Number(value),
            }
          : row,
      ),
    );
  }

  protected setCost(i: number, value: string): void {
    this.rows.update((r) =>
      r.map((row, k) =>
        k === i
          ? {
              ...row,
              unitCost: Number(value),
            }
          : row,
      ),
    );
  }

  protected register(): void {
    this.error.set(null);

    const chosen = this.rows().filter((r) => r.productId !== null);

    if (!chosen.length) {
      return this.error.set('empty');
    }

    if (!this.supplierId()) {
      return this.error.set('supplier');
    }

    if (chosen.some((r) => !Number.isInteger(r.quantity) || r.quantity < 1)) {
      return this.error.set('quantity');
    }

    const items = chosen.map((r) => ({
      productId: r.productId!,
      quantity: r.quantity,
      unitCost: r.unitCost,
    }));

    this.store
      .register(
        this.supplierId()!,
        this.date(),
        this.needId() ? Number(this.needId()) : null,
        items,
      )
      .subscribe((result) => {
        if (result.ok) {
          this.router.navigate(['/purchases', result.value]);
        } else {
          this.error.set('generic');
        }
      });
  }
}
