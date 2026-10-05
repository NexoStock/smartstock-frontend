import { Component, OnInit, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { FormField } from '../../../shared/presentation/components/form-field';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { CatalogStore } from '../../application/catalog.store';
import { Product } from '../../domain/model/product.entity';

// US14 · M19 edit product.
// The registered stock is shown but never edited (R17).
@Component({
  selector: 'app-product-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatProgressBarModule,
    TranslatePipe,
    AlertBanner,
    FormField,
    PageHeader,
  ],
  template: `
    <section aria-labelledby="product-edit-title">
      <app-page-header [title]="'catalog.productEdit.title' | translate" />

      @if (store.loading() && !store.current()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}
        </app-alert-banner>
      }

      @if (failed()) {
        <app-alert-banner tone="error">
          {{ 'catalog.productEdit.failed' | translate }}
        </app-alert-banner>
      }

      @if (store.current()) {
        <form class="ss-card ss-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <app-form-field
            [id]="'name'"
            [label]="'catalog.field.name' | translate"
            [error]="err('name')"
          >
            <input
              id="name"
              class="ss-input"
              formControlName="name"
              [attr.aria-invalid]="!!err('name')"
              [attr.aria-describedby]="err('name') ? 'name-error' : null"
            />
          </app-form-field>

          <div class="ss-form-grid">
            <app-form-field [id]="'sku'" [label]="'catalog.field.sku' | translate">
              <input id="sku" class="ss-input" formControlName="sku" />
            </app-form-field>

            <app-form-field [id]="'salePrice'" [label]="'catalog.field.salePrice' | translate">
              <input
                id="salePrice"
                class="ss-input"
                type="number"
                step="0.01"
                min="0"
                formControlName="salePrice"
              />
            </app-form-field>

            <app-form-field
              [id]="'purchaseCost'"
              [label]="'catalog.field.purchaseCost' | translate"
            >
              <input
                id="purchaseCost"
                class="ss-input"
                type="number"
                step="0.01"
                min="0"
                formControlName="purchaseCost"
              />
            </app-form-field>

            <app-form-field
              [id]="'usualSupplier'"
              [label]="'catalog.field.usualSupplier' | translate"
            >
              <input id="usualSupplier" class="ss-input" formControlName="usualSupplier" />
            </app-form-field>

            <app-form-field
              [id]="'registeredStock'"
              [label]="'catalog.field.registeredStock' | translate"
            >
              <input
                id="registeredStock"
                class="ss-input"
                type="number"
                formControlName="registeredStock"
                aria-describedby="stock-help"
              />
            </app-form-field>

            <app-form-field
              [id]="'minThreshold'"
              [label]="'catalog.field.minThreshold' | translate"
              [error]="err('minThreshold')"
            >
              <input
                id="minThreshold"
                class="ss-input"
                type="number"
                step="1"
                min="1"
                formControlName="minThreshold"
                [attr.aria-invalid]="!!err('minThreshold')"
                [attr.aria-describedby]="err('minThreshold') ? 'minThreshold-error' : null"
              />
            </app-form-field>
          </div>

          <p id="stock-help" class="ss-note">
            {{ 'catalog.productEdit.stockHelp' | translate }}
          </p>

          <p class="ss-note">
            {{ 'catalog.productEdit.note' | translate }}
          </p>

          <div class="ss-actions">
            <a mat-button routerLink="/products">
              {{ 'shared.cancel' | translate }}
            </a>

            <button mat-flat-button type="submit" [disabled]="store.loading()">
              {{ 'catalog.productNew.save' | translate }}
            </button>
          </div>
        </form>
      }
    </section>
  `,
})
export class ProductEdit implements OnInit {
  protected readonly store = inject(CatalogStore);

  private readonly router = inject(Router);

  private readonly translate = inject(TranslateService);

  readonly id = input.required<string>();

  protected readonly failed = signal(false);

  private readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    sku: new FormControl('', {
      nonNullable: true,
    }),

    salePrice: new FormControl<number | null>(null),

    purchaseCost: new FormControl<number | null>(null),

    usualSupplier: new FormControl('', {
      nonNullable: true,
    }),

    registeredStock: new FormControl(
      {
        value: 0,
        disabled: true,
      },
      {
        nonNullable: true,
      },
    ),

    minThreshold: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  constructor() {
    effect(() => {
      const product = this.store.current();

      if (!product) {
        return;
      }

      untracked(() => {
        this.form.setValue({
          name: product.name,

          sku: product.sku,

          salePrice: product.salePrice,

          purchaseCost: product.purchaseCost,

          usualSupplier: product.usualSupplier,

          registeredStock: product.registeredStock,

          minThreshold: product.minThreshold,
        });
      });
    });
  }

  ngOnInit(): void {
    this.store.fetchProduct(this.id());
  }

  protected err(field: 'name' | 'minThreshold'): string {
    return this.submitted() && this.form.controls[field].invalid
      ? this.translate.instant(`catalog.error.${field}`)
      : '';
  }

  protected submit(): void {
    this.submitted.set(true);
    this.failed.set(false);

    const current = this.store.current();

    if (this.form.invalid || !current) {
      return;
    }

    const value = this.form.getRawValue();

    const updated = new Product(
      current.id,

      value.name.trim(),

      value.sku.trim(),

      current.category,

      current.unitWeight,

      value.salePrice === null ? null : Number(value.salePrice),

      Number(value.purchaseCost ?? 0),

      value.usualSupplier.trim(),

      current.registeredStock,

      Number(value.minThreshold),

      current.maxCapacity,

      current.sensorId,
    );

    this.store.update(this.id(), updated).subscribe((result) => {
      if (result.ok) {
        this.router.navigateByUrl('/products');
      } else {
        this.failed.set(true);
      }
    });
  }
}
