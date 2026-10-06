import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { LinkableProduct, Sensor } from '../domain/model/sensor.entity';
import { SensorAssembler } from './sensor.assembler';
import { LinkableProductResource, SensorResource } from './sensor.resource';

// TS01 readings (sent by the device), TS05 sensor status, US04 link, US06 sensor list
@Injectable({ providedIn: 'root' })
export class DevicesApi extends BaseApi {
  private readonly assembler = new SensorAssembler();
  private readonly sensorsUrl = `${this.baseUrl}${environment.endpoints.sensors}`;
  readonly sensors = new BaseApiEndpoint<Sensor, SensorResource>(this.http, this.sensorsUrl, this.assembler);

  link(sensorId: number, productId: number): Observable<Sensor> {
    return this.http.post<SensorResource>(`${this.sensorsUrl}/vincular`, { sensorId, productoId: productId }).pipe(
      map((r) => this.assembler.toEntityFromResource(r)),
    );
  }

  linkableProducts(): Observable<LinkableProduct[]> {
    return this.http.get<LinkableProductResource[]>(`${this.baseUrl}${environment.endpoints.products}`).pipe(
      map((list) => list.map((r) => this.assembler.toLinkable(r))),
    );
  }
}
