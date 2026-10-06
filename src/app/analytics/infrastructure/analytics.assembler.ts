import { StockMovementAssembler } from '../../inventory/infrastructure/stock-movement.assembler';
import {
  DashboardSummary,
  ActivityItem,
  StockOverviewItem,
} from '../domain/model/dashboard-summary.entity';
import { Report } from '../domain/model/report.entity';
import { DashboardResource, ReportResource } from './analytics.resource';

export class AnalyticsAssembler {
  private readonly movements = new StockMovementAssembler();

  toDashboard(r: DashboardResource): DashboardSummary {
    return new DashboardSummary(
      { total: r.ventasHoy.total, count: r.ventasHoy.cantidad },
      { total: r.comprasHoy.total, count: r.comprasHoy.cantidad },
      r.alertasStockBajo,
      r.actividadReciente.map((a) => new ActivityItem(a.tipo, a.id, a.total)),
      r.resumenStock.map(
        (s) => new StockOverviewItem(s.productoId, s.nombre, s.unidades, s.nivel, s.sensor),
      ),
    );
  }

  toReport(r: ReportResource): Report {
    return new Report(
      r.ventasTotal,
      r.comprasTotal,
      this.movements.toEntitiesFromResources(r.movimientos),
      r.comprasPendientes,
    );
  }
}
