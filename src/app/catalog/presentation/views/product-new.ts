import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { FormField } from '../../../shared/presentation/components/form-field';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { CatalogStore } from '../../application/catalog.store';
import { Product } from '../../domain/model/product.entity';

type Field = 'name' | 'category' | 'unitWeight' | 'minThreshold';

// US13 · M29 new product, M30 missing name or unit weight
@Component({
  selector: 'app-product-new',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    TranslatePipe,
    AlertBanner,
    FormField,
    PageHeader,
  ],
  template: `
    <section aria-labelledby="product-new-title">
      <app-page-header [title]="'catalog.productNew.title' | translate" />

      <form class="ss-card ss-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (invalid()) {
          <app-alert-banner tone="error">
            {{ 'catalog.productNew.review' | translate }}
          </app-alert-banner>
        }

        @if (serverFailed()) {
          <app-alert-banner tone="error">
            {{ 'shared.error' | translate }}
          </app-alert-banner>
        }

        <app-form-field
          [id]="'name'"
          [label]="'catalog.field.name' | translate"
          [error]="err('name')"
        >
          <input
            id="name"
            class="ss-input"
            formControlName="name"
            [placeholder]="'catalog.field.namePlaceholder' | translate"
            [attr.aria-invalid]="!!err('name')"
            [attr.aria-describedby]="err('name') ? 'name-error' : null"
          />
        </app-form-field>

        <div class="ss-form-grid">
          <app-form-field [id]="'sku'" [label]="'catalog.field.sku' | translate">
            <input id="sku" class="ss-input" formControlName="sku" placeholder="RICE-1KG" />
          </app-form-field>

          <app-form-field
            [id]="'category'"
            [label]="'catalog.field.category' | translate"
            [error]="err('category')"
          >
            <input
              id="category"
              class="ss-input"
              formControlName="category"
              list="categories"
              [attr.aria-invalid]="!!err('category')"
              [attr.aria-describedby]="err('category') ? 'category-error' : null"
            />

            <datalist id="categories">
              @for (c of store.categories(); track c) {
                <option [value]="c"></option>
              }
            </datalist>
          </app-form-field>

          <app-form-field
            [id]="'unitWeight'"
            [label]="'catalog.field.unitWeight' | translate"
            [error]="err('unitWeight')"
          >
            <input
              id="unitWeight"
              class="ss-input"
              type="number"
              step="0.01"
              min="0"
              formControlName="unitWeight"
              [attr.aria-invalid]="!!err('unitWeight')"
              [attr.aria-describedby]="err('unitWeight') ? 'unitWeight-error' : null"
            />
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

          <app-form-field [id]="'purchaseCost'" [label]="'catalog.field.purchaseCost' | translate">
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

          <app-form-field [id]="'initialStock'" [label]="'catalog.field.initialStock' | translate">
            <input
              id="initialStock"
              class="ss-input"
              type="number"
              step="1"
              min="0"
              formControlName="initialStock"
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

        <p class="ss-note">
          {{ 'catalog.productNew.note' | translate }}
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
    </section>
  `,
})
export class ProductNew implements OnInit {
  protected readonly store = inject(CatalogStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private readonly submitted = signal(false);

  protected readonly serverFields = signal<Partial<Record<Field, boolean>>>({});

  protected readonly serverFailed = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    sku: new FormControl('', {
      nonNullable: true,
    }),

    category: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    unitWeight: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.001)],
    }),

    salePrice: new FormControl<number | null>(null),

    purchaseCost: new FormControl<number | null>(null),

    usualSupplier: new FormControl('', {
      nonNullable: true,
    }),

    initialStock: new FormControl<number | null>(0, {
      validators: [Validators.min(0)],
    }),

    minThreshold: new FormControl<number | null>(5, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  protected readonly invalid = computed(
    () => this.submitted() && (this.form.invalid || Object.keys(this.serverFields()).length > 0),
  );

  ngOnInit(): void {
    this.store.fetchProducts();
  }

  protected err(field: Field): string {
    if (!this.submitted()) return '';

    if (this.form.controls[field].invalid || this.serverFields()[field]) {
      return this.translate.instant(`catalog.error.${field}`);
    }

    return '';
  }

  protected submit(): void {
    this.submitted.set(true);
    this.serverFields.set({});
    this.serverFailed.set(false);

    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    const product = new Product(
      null,
      v.name.trim(),
      v.sku.trim(),
      v.category.trim(),
      Number(v.unitWeight),
      v.salePrice === null ? null : Number(v.salePrice),
      Number(v.purchaseCost ?? 0),
      v.usualSupplier.trim(),
      Number(v.initialStock ?? 0),
      Number(v.minThreshold),
      100,
      null,
    );

    this.store.create(product).subscribe((result) => {
      if (result.ok) {
        return void this.router.navigate(['/products', result.product.id]);
      }

      const fields = (result.error['errors'] ?? {}) as Record<string, string>;

      const map: Record<string, Field> = {
        nombre: 'name',
        categoria: 'category',
        pesoUnitario: 'unitWeight',
        umbralMinimo: 'minThreshold',
      };

      const marked = Object.keys(fields)
        .map((k) => map[k])
        .filter((f): f is Field => !!f);

      if (result.error.code === 'INVALID_PRODUCT' && marked.length) {
        this.serverFields.set(Object.fromEntries(marked.map((f) => [f, true])));
      } else {
        this.serverFailed.set(true);
      }
    });
  }
}
