import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { formatPen } from '../../../shared/domain/model/money';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { SalesStore } from '../../application/sales.store';
import { SaleProductOption } from '../../domain/model/sale.entity';

interface Row { productId: number | null; quantity: number; }
type SaleError =
  | { kind: 'empty' }
  | { kind: 'quantity' }
  | { kind: 'stock'; name: string; available: number }
  | { kind: 'price'; name: string }
  | { kind: 'generic' };

// US26 · M11 new sale, M12 insufficient stock, M13 product without sale price
@Component({
  selector: 'app-sale-new',
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslatePipe, AlertBanner, PageHeader],
  template: `
    <section aria-labelledby="sale-new-title">
      <app-page-header [title]="'inventory.saleNew.title' | translate" />

      <div class="ss-card">
        <h2 class="h2">{{ 'inventory.saleNew.items' | translate }}</h2>

        @switch (error()?.kind) {
          @case ('empty') { <app-alert-banner tone="error">{{ 'inventory.saleNew.errorEmpty' | translate }}</app-alert-banner> }
          @case ('quantity') { <app-alert-banner tone="error">{{ 'inventory.saleNew.errorQuantity' | translate }}</app-alert-banner> }
          @case ('generic') { <app-alert-banner tone="error">{{ 'shared.error' | translate }}</app-alert-banner> }
        }
        @if (stockError(); as e) {
          <app-alert-banner tone="error">{{ 'inventory.saleNew.errorStock' | translate: { name: e.name, available: e.available } }}</app-alert-banner>
        }
        @if (priceError(); as e) {
          <app-alert-banner tone="error">
            <strong>{{ 'inventory.saleNew.errorPrice' | translate: { name: e.name } }}</strong>
            <span>{{ 'inventory.saleNew.errorPriceHelp' | translate }}</span>
            <a mat-stroked-button routerLink="/products">{{ 'inventory.saleNew.openCatalog' | translate }}</a>
          </app-alert-banner>
        }

        @for (row of rows(); track $index; let i = $index) {
          <div class="row">
            <div class="cell">
              <label class="sr-only" [for]="'product-' + i">{{ 'inventory.saleNew.product' | translate }}</label>
              <select class="ss-input" [id]="'product-' + i" (change)="setProduct(i, $any($event.target).value)">
                <option value="" [selected]="row.productId === null">{{ 'inventory.saleNew.choose' | translate }}</option>
                @for (o of store.options(); track o.id) {
                  <option [value]="o.id" [selected]="o.id === row.productId">{{ o.name }}</option>
                }
              </select>
            </div>
            <div class="cell qty">
              <label class="sr-only" [for]="'qty-' + i">{{ 'inventory.saleNew.qty' | translate }}</label>
              <input class="ss-input" [id]="'qty-' + i" type="number" min="1" step="1" [value]="row.quantity" (input)="setQuantity(i, $any($event.target).value)" />
            </div>
            @if (optionOf(row); as o) {
              <span class="info">
                @if (o.salePrice) { {{ 'inventory.saleNew.price' | translate }} {{ pen(o.salePrice) }} } @else { {{ 'inventory.saleNew.priceNotSet' | translate }} }
              </span>
              <span class="info">{{ 'inventory.saleNew.stock' | translate: { count: o.stock } }}</span>
              <strong class="sub">{{ o.salePrice ? pen(o.salePrice * row.quantity) : '—' }}</strong>
            } @else {
              <span class="info"></span><span class="info"></span><strong class="sub">—</strong>
            }
            <button mat-icon-button type="button" [attr.aria-label]="'inventory.saleNew.remove' | translate" (click)="remove(i)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }

        <button mat-stroked-button type="button" (click)="add()">{{ 'inventory.saleNew.add' | translate }}</button>

        <div class="total"><span>{{ 'inventory.saleNew.total' | translate }}</span><strong>{{ total() === null ? '—' : pen(total()!) }}</strong></div>
      </div>

      <div class="ss-actions">
        <a mat-button routerLink="/sales">{{ 'shared.cancel' | translate }}</a>
        <button mat-flat-button type="button" [disabled]="store.loading()" (click)="register()">{{ 'inventory.saleNew.register' | translate }}</button>
      </div>
    </section>
  `,
  styles: `
    .h2 { font-size: 1rem; margin: 0 0 1rem; }
    .row { display: grid; grid-template-columns: minmax(160px, 2fr) 90px 1fr 1fr 90px 48px; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem; }
    .info { color: var(--ss-muted); font-size: 0.85rem; }
    .sub { text-align: right; }
    .total { display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--ss-border); font-size: 1.1rem; }
    @media (max-width: 768px) { .row { grid-template-columns: 1fr 90px; } }
  `,
})
export class SaleNew implements OnInit {
  protected readonly store = inject(SalesStore);
  private readonly router = inject(Router);
  protected readonly pen = formatPen;

  protected readonly rows = signal<Row[]>([{ productId: null, quantity: 1 }]);
  protected readonly error = signal<SaleError | null>(null);
  protected readonly stockError = computed(() => { const e = this.error(); return e?.kind === 'stock' ? e : null; });
  protected readonly priceError = computed(() => { const e = this.error(); return e?.kind === 'price' ? e : null; });

  // The total is "—" while some product has no price (M13)
  protected readonly total = computed(() => {
    const lines = this.rows().map((r) => ({ o: this.optionOf(r), q: r.quantity })).filter((l) => l.o);
    if (lines.some((l) => !l.o!.salePrice)) return null;
    return lines.reduce((sum, l) => sum + l.o!.salePrice! * l.q, 0);
  });

  ngOnInit(): void {
    this.store.fetchOptions();
  }

  protected optionOf(row: Row): SaleProductOption | undefined {
    return this.store.options().find((o) => o.id === row.productId);
  }

  protected add(): void { this.rows.update((r) => [...r, { productId: null, quantity: 1 }]); }
  protected remove(i: number): void { this.rows.update((r) => (r.length > 1 ? r.filter((_, k) => k !== i) : r)); }
  protected setProduct(i: number, value: string): void {
    this.rows.update((r) => r.map((row, k) => (k === i ? { ...row, productId: value ? Number(value) : null } : row)));
  }
  protected setQuantity(i: number, value: string): void {
    this.rows.update((r) => r.map((row, k) => (k === i ? { ...row, quantity: Number(value) } : row)));
  }

  protected register(): void {
    this.error.set(null);
    const chosen = this.rows().filter((r) => r.productId !== null);
    if (!chosen.length) return this.error.set({ kind: 'empty' });
    if (chosen.some((r) => !Number.isInteger(r.quantity) || r.quantity < 1)) return this.error.set({ kind: 'quantity' });

    // Same checks the backend does, so the user sees M12 / M13 without waiting (the backend still validates, R13 / R14)
    const noPrice = chosen.map((r) => this.optionOf(r)!).find((o) => !o.salePrice);
    if (noPrice) return this.error.set({ kind: 'price', name: noPrice.name });
    const totals = new Map<number, number>();
    for (const r of chosen) totals.set(r.productId!, (totals.get(r.productId!) ?? 0) + r.quantity);
    for (const [id, qty] of totals) {
      const o = this.store.options().find((x) => x.id === id)!;
      if (qty > o.stock) return this.error.set({ kind: 'stock', name: o.name, available: o.stock });
    }

    this.store.register(chosen.map((r) => ({ productId: r.productId!, quantity: r.quantity, unitPrice: this.optionOf(r)!.salePrice! }))).subscribe((result) => {
      if (result.ok) return void this.router.navigate(['/sales', result.id]); // M14
      const e = result.error;
      if (e.code === 'INSUFFICIENT_STOCK') this.error.set({ kind: 'stock', name: String(e['productoNombre']), available: Number(e['available']) });
      else if (e.code === 'NO_SALE_PRICE') this.error.set({ kind: 'price', name: String(e['productoNombre']) });
      else this.error.set({ kind: 'generic' });
      this.store.fetchOptions(); // the stock may have changed
    });
  }
}