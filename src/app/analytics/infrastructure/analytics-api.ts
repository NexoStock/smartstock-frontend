import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DateRange, toQuery } from '../../shared/domain/model/date-range';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DashboardSummary } from '../domain/model/dashboard-summary.entity';
import { Report } from '../domain/model/report.entity';
import { AnalyticsAssembler } from './analytics.assembler';
import { DashboardResource, ReportResource } from './analytics.resource';

// US15 dashboard, US25 reports of purchases and stock movements
@Injectable({ providedIn: 'root' })
export class AnalyticsApi extends BaseApi {
  private readonly assembler = new AnalyticsAssembler();

  dashboard(): Observable<DashboardSummary> {
    return this.http
      .get<DashboardResource>(`this.baseUrl{environment.endpoints.dashboard}`)
      .pipe(map((r) => this.assembler.toDashboard(r)));
  }

  report(range: DateRange): Observable<Report> {
    const params = new HttpParams({ fromObject: toQuery(range) });
    return this.http
      .get<ReportResource>(`this.baseUrl{environment.endpoints.reports}`, { params })
      .pipe(map((r) => this.assembler.toReport(r)));
  }
}
