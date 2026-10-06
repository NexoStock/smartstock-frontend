import { Injectable, inject, signal } from '@angular/core';
import { DateRange } from '../../shared/domain/model/date-range';
import { DashboardSummary } from '../domain/model/dashboard-summary.entity';
import { Report } from '../domain/model/report.entity';
import { AnalyticsApi } from '../infrastructure/analytics-api';

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly api = inject(AnalyticsApi);
  readonly dashboard = signal<DashboardSummary | null>(null);
  readonly report = signal<Report | null>(null);
  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  fetchDashboard(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.dashboard().subscribe({
      next: (d) => {
        this.dashboard.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }

  fetchReport(range: DateRange): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.report(range).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e);
        this.loading.set(false);
      },
    });
  }
}
