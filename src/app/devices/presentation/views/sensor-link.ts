import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { FormField } from '../../../shared/presentation/components/form-field';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { DevicesStore } from '../../application/devices.store';

type LinkError = { kind: 'inUse'; productName: string } | { kind: 'productHasSensor' } | { kind: 'missing' } | { kind: 'generic' };

// US04 · M32 link sensor, M33 sensor already in use
@Component({
  selector: 'app-sensor-link',
  imports: [RouterLink, MatButtonModule, TranslatePipe, AlertBanner, FormField, PageHeader],
  template: `
    <section aria-labelledby="link-title">
      <app-page-header [title]="'devices.sensorLink.title' | translate" />

      <div class="ss-card ss-form">
        @if (error()?.kind === 'inUse') {
          <app-alert-banner tone="error">{{ 'devices.sensorLink.inUse' | translate }}</app-alert-banner>
        }
        @if (error()?.kind === 'generic') { <app-alert-banner tone="error">{{ 'shared.error' | translate }}</app-alert-banner> }

        <app-form-field [id]="'sensor'" [label]="'devices.sensorLink.sensor' | translate" [error]="sensorError()">
          <select id="sensor" class="ss-input" [attr.aria-invalid]="!!sensorError()" (change)="sensorId.set(toNumber($any($event.target).value)); error.set(null)">
            <option value="" [selected]="sensorId() === null">{{ 'devices.sensorLink.chooseSensor' | translate }}</option>
            @for (s of store.sensors(); track s.id) {
              <option [value]="s.id" [selected]="s.id === sensorId()">
                {{ s.code }} · {{ s.isAvailable ? ('shared.status.available' | translate) : ('devices.sensorLink.linkedTo' | translate: { name: s.productName }) }}
              </option>
            }
          </select>
        </app-form-field>

        <app-form-field [id]="'product'" [label]="'devices.sensorLink.product' | translate" [error]="productError()">
          <select id="product" class="ss-input" [attr.aria-invalid]="!!productError()" (change)="productId.set(toNumber($any($event.target).value)); error.set(null)">
            <option value="" [selected]="productId() === null">{{ 'devices.sensorLink.chooseProduct' | translate }}</option>
            @for (p of store.products(); track p.id) {
              <option [value]="p.id" [disabled]="p.hasSensor" [selected]="p.id === productId()">
                {{ p.name }}{{ p.hasSensor ? ' · ' + ('devices.sensorLink.hasSensor' | translate) : '' }}
              </option>
            }
          </select>
        </app-form-field>

        <div class="reading">
          <strong>{{ 'devices.sensorLink.initialReading' | translate }}</strong>
          @if (initial(); as r) {
            <span class="big">{{ r.kg.toFixed(2) }} kg</span>
            <span>≈ {{ r.units ?? '—' }} {{ 'shared.units' | translate }}</span>
            <small class="ss-note">{{ 'devices.sensorLink.referenceNote' | translate }}</small>
          } @else {
            <span class="big">—</span>
            <small class="ss-note">{{ 'devices.sensorLink.chooseToRead' | translate }}</small>
          }
        </div>

        <div class="ss-actions">
          <a mat-button routerLink="/sensors">{{ 'shared.cancel' | translate }}</a>
          <button mat-flat-button type="button" [disabled]="store.loading()" (click)="submit()">{{ 'devices.sensorLink.submit' | translate }}</button>
        </div>
      </div>
    </section>
  `,
  styles: `.reading { display: grid; gap: 0.25rem; background: #f5f9fd; border-radius: 0.7rem; padding: 0.75rem 1rem; } .big { font-size: 1.4rem; font-weight: 600; }`,
})
export class SensorLink implements OnInit {
  protected readonly store = inject(DevicesStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  // ?sensorId=4 preselects the sensor (the "Link" button of M31)
  readonly sensorIdParam = input<string | undefined>(undefined, { alias: 'sensorId' });
  protected readonly sensorId = signal<number | null>(null);
  protected readonly productId = signal<number | null>(null);
  protected readonly error = signal<LinkError | null>(null);

  private readonly sensor = computed(() => this.store.sensors().find((s) => s.id === this.sensorId()));
  private readonly product = computed(() => this.store.products().find((p) => p.id === this.productId()));

  // The initial reading is only read from an available sensor (M32); an used sensor shows "—" (M33)
  protected readonly initial = computed(() => {
    const s = this.sensor();
    if (!s || !s.isAvailable) return null;
    const p = this.product();
    return { kg: s.weightKg, units: p && p.unitWeight > 0 ? Math.round(s.weightKg / p.unitWeight) : null };
  });

  protected readonly sensorError = computed(() => {
    const e = this.error();
    return e?.kind === 'inUse' ? this.tr('devices.sensorLink.inUseField', { name: e.productName }) : e?.kind === 'missing' && !this.sensorId() ? this.tr('devices.sensorLink.required') : '';
  });
  protected readonly productError = computed(() => {
    const e = this.error();
    return e?.kind === 'productHasSensor' ? this.tr('devices.sensorLink.productHasSensor') : e?.kind === 'missing' && !this.productId() ? this.tr('devices.sensorLink.required') : '';
  });

  ngOnInit(): void {
    this.store.fetchSensors();
    this.store.fetchLinkProducts();
    const preset = Number(this.sensorIdParam());
    if (preset) this.sensorId.set(preset);
  }

  protected toNumber(value: string): number | null {
    return value ? Number(value) : null;
  }

  private tr(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }

  protected submit(): void {
    if (!this.sensorId() || !this.productId()) return this.error.set({ kind: 'missing' });
    this.store.link(this.sensorId()!, this.productId()!).subscribe((result) => {
      if (result.ok) return void this.router.navigateByUrl('/sensors'); // M31 updated
      const code = result.error.code;
      if (code === 'SENSOR_IN_USE') this.error.set({ kind: 'inUse', productName: String(result.error['productoNombre'] ?? '') }); // R9
      else if (code === 'PRODUCT_HAS_SENSOR') this.error.set({ kind: 'productHasSensor' });
      else this.error.set({ kind: 'generic' });
    });
  }
}
