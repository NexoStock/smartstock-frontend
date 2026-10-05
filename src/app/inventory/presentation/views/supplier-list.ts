import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { FormField } from '../../../shared/presentation/components/form-field';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { PurchasesStore } from '../../application/purchases.store';

@Component({
  selector: 'app-supplier-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    TranslatePipe,
    AlertBanner,
    EmptyState,
    FormField,
    PageHeader,
  ],
  template: `
    <section aria-labelledby="suppliers-title">
      <app-page-header [title]="'inventory.supplierList.title' | translate">
        <a mat-stroked-button routerLink="/purchases">
          {{ 'inventory.supplierList.back' | translate }}
        </a>

        <button mat-flat-button type="button" (click)="openForm()">
          {{ 'inventory.supplierList.new' | translate }}
        </button>
      </app-page-header>

      @if (savedName(); as name) {
        <app-alert-banner tone="success">
          {{ 'inventory.supplierList.saved' | translate: { name: name } }}
        </app-alert-banner>
      }

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}
        </app-alert-banner>
      }

      @if (formOpen()) {
        <form class="ss-card ss-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
          <h2 class="h2">
            {{ 'inventory.supplierList.formTitle' | translate }}
          </h2>

          @if (duplicate()) {
            <app-alert-banner tone="error">
              {{ 'inventory.supplierList.duplicate' | translate }}
            </app-alert-banner>
          }

          @if (failed()) {
            <app-alert-banner tone="error">
              {{ 'shared.error' | translate }}
            </app-alert-banner>
          }

          <app-form-field
            [id]="'supplier-name'"
            [label]="'inventory.supplierList.name' | translate"
            [error]="err('name')"
          >
            <input
              id="supplier-name"
              class="ss-input"
              formControlName="name"
              [attr.aria-invalid]="!!err('name')"
              [attr.aria-describedby]="err('name') ? 'supplier-name-error' : null"
            />
          </app-form-field>

          <app-form-field
            [id]="'supplier-email'"
            [label]="'inventory.supplierList.email' | translate"
            [error]="err('email')"
          >
            <input
              id="supplier-email"
              class="ss-input"
              type="email"
              formControlName="email"
              [attr.aria-invalid]="!!err('email')"
              [attr.aria-describedby]="err('email') ? 'supplier-email-error' : null"
            />
          </app-form-field>

          <app-form-field
            [id]="'supplier-phone'"
            [label]="'inventory.supplierList.phone' | translate"
            [error]="err('phone')"
          >
            <input
              id="supplier-phone"
              class="ss-input"
              type="tel"
              formControlName="phone"
              [attr.aria-invalid]="!!err('phone')"
              [attr.aria-describedby]="err('phone') ? 'supplier-phone-error' : null"
            />
          </app-form-field>

          <div class="ss-actions">
            <button mat-button type="button" (click)="closeForm()">
              {{ 'shared.cancel' | translate }}
            </button>

            <button mat-flat-button type="submit" [disabled]="store.loading()">
              {{ 'inventory.supplierList.save' | translate }}
            </button>
          </div>
        </form>
      }

      @if (store.suppliers().length) {
        <table class="ss-table">
          <thead>
            <tr>
              <th>{{ 'inventory.supplierList.supplier' | translate }}</th>
              <th>{{ 'inventory.supplierList.contact' | translate }}</th>
              <th>{{ 'inventory.supplierList.phone' | translate }}</th>
            </tr>
          </thead>

          <tbody>
            @for (s of store.suppliers(); track s.id) {
              <tr>
                <td>
                  <strong>{{ s.name }}</strong>
                </td>
                <td>{{ s.email }}</td>
                <td>{{ s.phone }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <app-empty-state [message]="'inventory.supplierList.empty' | translate" />
      }
    </section>
  `,
  styles: `
    .h2 {
      font-size: 1.05rem;
      margin: 0 0 1rem;
    }
  `,
})
export class SupplierList implements OnInit {
  protected readonly store = inject(PurchasesStore);
  private readonly translate = inject(TranslateService);

  protected readonly formOpen = signal(false);
  protected readonly duplicate = signal(false);
  protected readonly failed = signal(false);
  protected readonly savedName = signal('');

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),

    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[+\d][\d\s-]{6,}$/)],
    }),
  });

  ngOnInit(): void {
    this.store.fetchSuppliers();
  }

  protected err(field: 'name' | 'email' | 'phone'): string {
    const control = this.form.controls[field];

    return control.invalid && (control.touched || control.dirty)
      ? this.translate.instant(`inventory.supplierList.error.${field}`)
      : '';
  }

  protected openForm(): void {
    this.formOpen.set(true);
    this.savedName.set('');
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.duplicate.set(false);
    this.form.reset();
  }

  protected save(): void {
    this.duplicate.set(false);
    this.failed.set(false);

    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const { name, email, phone } = this.form.getRawValue();

    this.store.createSupplier(name.trim(), email.trim(), phone.trim()).subscribe((result) => {
      if (result.ok) {
        this.savedName.set(result.value.name);

        this.closeForm();
        this.store.fetchSuppliers();
      } else if (result.error.code === 'DUPLICATE_SUPPLIER') {
        this.duplicate.set(true);
      } else {
        this.failed.set(true);
      }
    });
  }
}
