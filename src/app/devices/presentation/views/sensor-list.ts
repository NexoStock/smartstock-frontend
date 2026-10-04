import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { EmptyState } from '../../../shared/presentation/components/empty-state';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { StatusTag } from '../../../shared/presentation/components/status-tag';
import { SummaryCard } from '../../../shared/presentation/components/summary-card';
import { DevicesStore } from '../../application/devices.store';

// US06 · M31 sensors: status, last reading and current weight
@Component({
  selector: 'app-sensor-list',
  imports: [RouterLink, MatButtonModule, MatProgressBarModule, TranslatePipe, AlertBanner, EmptyState, PageHeader, StatusTag, SummaryCard],
  template: `
    <section aria-labelledby="sensors-title">
      <app-page-header [title]="'devices.sensorList.title' | translate">
        <a mat-flat-button routerLink="/sensors/link">{{ 'devices.sensorList.link' | translate }}</a>
      </app-page-header>

      <div class="ss-grid">
        <app-summary-card [label]="'shared.status.online' | translate" [value]="'' + store.online()" />
        <app-summary-card [label]="'shared.status.disconnected' | translate" [value]="'' + store.disconnected()" />
        <app-summary-card [label]="'devices.sensorList.availableToLink' | translate" [value]="'' + store.available()" />
      </div>

      @if (store.error()) {
        <app-alert-banner tone="error">{{ 'shared.error' | translate }}
          <button mat-button type="button" (click)="store.fetchSensors()">{{ 'shared.retry' | translate }}</button>
        </app-alert-banner>
      }
      @if (store.loading()) { <mat-progress-bar mode="indeterminate" /> }

      @if (store.sensors().length) {
        <table class="ss-table">
          <thead>
            <tr>
              <th>{{ 'devices.sensorList.sensor' | translate }}</th><th>{{ 'devices.sensorList.product' | translate }}</th>
              <th>{{ 'devices.sensorList.status' | translate }}</th><th>{{ 'devices.sensorList.lastReading' | translate }}</th>
              <th>{{ 'devices.sensorList.weight' | translate }}</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (s of store.sensors(); track s.id) {
              <tr>
                <td><strong>{{ s.code }}</strong></td>
                <td>{{ s.productName ?? ('shared.status.notLinked' | translate) }}</td>
                <td><app-status-tag [status]="s.status" /></td>
                <td>{{ s.minutesSinceReading === null ? '—' : ('shared.minutesAgo' | translate: { count: s.minutesSinceReading }) }}</td>
                <td>
                  @if (s.isAvailable) { — } @else { {{ s.weightKg.toFixed(2) }} kg ≈ {{ s.units }} {{ 'shared.units' | translate }} }
                </td>
                <td>
                  @if (s.isAvailable) {
                    <a mat-stroked-button routerLink="/sensors/link" [queryParams]="{ sensorId: s.id }">{{ 'devices.sensorList.linkRow' | translate }}</a>
                  } @else {
                    <a mat-stroked-button [routerLink]="['/sensors', s.id, 'threshold']">{{ 'devices.sensorList.configure' | translate }}</a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        <p class="ss-note">{{ 'devices.sensorList.note' | translate }}</p>
      } @else if (!store.loading()) {
        <app-empty-state [message]="'devices.sensorList.empty' | translate" />
      }
    </section>
  `,
})
export class SensorList implements OnInit {
  protected readonly store = inject(DevicesStore);

  ngOnInit(): void {
    this.store.fetchSensors();
  }
}
