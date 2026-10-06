import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { UserSession } from '../domain/model/user-session.entity';
import { AuthAssembler } from './auth.assembler';
import { ForgotPasswordResponse, RegisterRequest, SessionResource } from './auth.resource';

// TS04 authentication endpoints
@Injectable({ providedIn: 'root' })
export class IamApi extends BaseApi {
  private readonly url = `${this.baseUrl}${environment.endpoints.auth}`;
  private readonly assembler = new AuthAssembler();

  login(email: string, password: string): Observable<UserSession> {
    return this.http.post<SessionResource>(`${this.url}/login`, { email, password }).pipe(map((r) => this.assembler.toSessionFromResource(r)));
  }

  register(request: RegisterRequest): Observable<UserSession> {
    return this.http.post<SessionResource>(`${this.url}/register`, request).pipe(map((r) => this.assembler.toSessionFromResource(r)));
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.url}/forgot-password`, { email });
  }
}