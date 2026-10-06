import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Alert, NotificationChannel } from '../domain/model/alert.entity';
import {
  AlertAssembler,
  NotificationChannelAssembler,
} from './alert.assembler';
import {
  AlertResource,
  NotificationChannelResource,
} from './alert.resource';

@Injectable({ providedIn: 'root' })
export class AlertsApi extends BaseApi {
  private readonly channelAssembler = new NotificationChannelAssembler();

  readonly alerts = new BaseApiEndpoint<Alert, AlertResource>(
    this.http,
    `${this.baseUrl}${environment.endpoints.alerts}`,
    new AlertAssembler(),
  );

  readonly channels = new BaseApiEndpoint<
    NotificationChannel,
    NotificationChannelResource
  >(
    this.http,
    `${this.baseUrl}${environment.endpoints.notificationChannels}`,
    this.channelAssembler,
  );

  saveChannels(
    channels: { id: number; active: boolean }[],
  ): Observable<NotificationChannel[]> {
    return this.http
      .put<NotificationChannelResource[]>(
        `${this.baseUrl}${environment.endpoints.notificationChannels}`,
        channels.map((channel) => ({
          id: channel.id,
          activo: channel.active,
        })),
      )
      .pipe(
        map((list) => this.channelAssembler.toEntitiesFromResources(list)),
      );
  }
}