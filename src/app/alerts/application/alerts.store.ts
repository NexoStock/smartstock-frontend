import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { IamStore } from '../../iam/application/iam.store';
import {
  ApiErrorBody,
  apiError,
} from '../../shared/infrastructure/api-error';
import { Alert, NotificationChannel } from '../domain/model/alert.entity';
import { AlertsApi } from '../infrastructure/alerts-api';

export type SaveChannelsResult =
  | { ok: true }
  | { ok: false; error: ApiErrorBody };

@Injectable({ providedIn: 'root' })
export class AlertsStore {
  private readonly api = inject(AlertsApi);
  private readonly iam = inject(IamStore);

  readonly alerts = signal<Alert[]>([]);
  readonly channels = signal<NotificationChannel[]>([]);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  private readonly dismissed = signal<number[]>([]);

  private readonly visible = computed(() =>
    this.iam.businessType() === 'bodega'
      ? this.alerts().filter((alert) => alert.isLowStock)
      : this.alerts(),
  );

  readonly active = computed(() =>
    this.visible().filter((alert) => alert.isActive),
  );

  readonly activeLowStock = computed(() =>
    this.active().filter((alert) => alert.isLowStock),
  );

  readonly resolved = computed(() =>
    this.visible().filter(
      (alert) =>
        !alert.isActive &&
        !this.dismissed().includes(alert.id as number),
    ),
  );

  fetchAlerts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.alerts.getAll().subscribe({
      next: (alerts) => {
        this.alerts.set(alerts);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });
  }

  dismiss(id: number): void {
    this.dismissed.update((list) => [...list, id]);
  }

  fetchChannels(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.channels.getAll().subscribe({
      next: (channels) => {
        this.channels.set(channels);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });
  }

  saveChannels(
    changes: { id: number; active: boolean }[],
  ): Observable<SaveChannelsResult> {
    this.loading.set(true);

    return this.api.saveChannels(changes).pipe(
      map((channels): SaveChannelsResult => {
        this.channels.set(channels);
        this.loading.set(false);
        return { ok: true };
      }),
      catchError((error) => {
        this.loading.set(false);
        return of<SaveChannelsResult>({
          ok: false,
          error: apiError(error),
        });
      }),
    );
  }
}