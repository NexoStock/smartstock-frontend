import { Component, OnInit, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { FormField } from '../../../shared/presentation/components/form-field';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { CatalogStore } from '../../../catalog/application/catalog.store';

// US05 · M34 minimum threshold, M35 threshold above the maximum capacity (R7)
@Component({
  selector: 'app-sensor-threshold',
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
    <section aria-labelledby="threshold-title">
      <app-page-header [title]="'catalog.sensorThreshold.title' | translate" />

      @if (store.loading() && !store.target()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (store.error()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}
        </app-alert-banner>
      }

      @if (store.target(); as t) {
        <div class="ss-card ss-form">
          @if (message()) {
            <app-alert-banner tone="error">
              {{ 'catalog.sensorThreshold.bannerExceeds' | translate }}
            </app-alert-banner>
          }

          <dl class="meta">
            <div>
              <dt>
                {{ 'catalog.sensorThreshold.product' | translate }}
              </dt>
              <dd>
                {{ t.name }}
              </dd>
            </div>

            <div>
              <dt>
                {{ 'catalog.sensorThreshold.maxCapacity' | translate }}
              </dt>
              <dd>
                {{ t.maxCapacity }}
                {{ 'shared.units' | translate }}
              </dd>
            </div>
          </dl>

          <app-form-field
            [id]="'threshold'"
            [label]="'catalog.sensorThreshold.field' | translate"
            [error]="message()"
          >
            <input
              id="threshold"
              class="ss-input"
              type="number"
              min="1"
              step="1"
              [formControl]="threshold"
              [attr.aria-invalid]="!!message()"
              [attr.aria-describedby]="message() ? 'threshold-error' : 'threshold-help'"
            />
          </app-form-field>

          <p id="threshold-help" class="ss-note">
            {{ 'catalog.sensorThreshold.help' | translate: { max: t.maxCapacity } }}
          </p>

          <div class="ss-actions">
            <a mat-button routerLink="/sensors">
              {{ 'shared.cancel' | translate }}
            </a>

            <button
              mat-flat-button
              type="button"
              [disabled]="store.loading()"
              (click)="save(t.maxCapacity)"
            >
              {{ 'catalog.sensorThreshold.save' | translate }}
            </button>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .meta {
      display: grid;
      gap: 0.75rem;
      margin: 0 0 1rem;
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
  `,
})
export class SensorThreshold implements OnInit {
  protected readonly store = inject(CatalogStore);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly id = input.required<string>();

  protected readonly message = signal('');

  protected readonly threshold = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1)],
  });

  constructor() {
    effect(() => {
      const target = this.store.target();

      if (target) {
        untracked(() => this.threshold.setValue(target.minThreshold));
      }
    });
  }

  ngOnInit(): void {
    this.store.fetchThresholdTarget(Number(this.id()));
  }

  protected save(maxCapacity: number): void {
    const value = Number(this.threshold.value);

    this.message.set('');

    if (!(value > 0) || value > maxCapacity) {
      return this.message.set(
        this.translate.instant('catalog.sensorThreshold.exceeds', { max: maxCapacity }),
      );
    }

    this.store.saveThreshold(Number(this.id()), value).subscribe((result) => {
      if (result.ok) {
        return void this.router.navigateByUrl('/sensors');
      }

      this.message.set(
        this.translate.instant('catalog.sensorThreshold.exceeds', {
          max: result.error['maxCapacity'] ?? maxCapacity,
        }),
      );
    });
  }
}
