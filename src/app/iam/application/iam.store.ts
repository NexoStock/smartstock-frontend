import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { BusinessType } from '../../shared/config/menu';
import { apiCode } from '../../shared/infrastructure/api-error';
import { UserSession } from '../domain/model/user-session.entity';
import { IamApi } from '../infrastructure/iam-api';
import { RegisterRequest } from '../infrastructure/auth.resource';

const STORAGE_KEY = 'smartstock.session';

// OK, or the error code the view translates (R1 unique email, R3 generic credentials error)
export type AuthResult = 'OK' | 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'ERROR';

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly api = inject(IamApi);
  private readonly saved = this.load();
  readonly token = signal<string | null>(this.saved?.token ?? null);
  readonly email = signal<string>(this.saved?.email ?? '');
  readonly businessName = signal<string>(this.saved?.businessName ?? '');
  readonly businessType = signal<BusinessType>(this.saved?.businessType ?? 'minimarket');
  readonly isSignedIn = computed(() => !!this.token());
  readonly loading = signal(false);

  signIn(email: string, password: string): Observable<AuthResult> {
    return this.run(this.api.login(email, password));
  }

  signUp(request: RegisterRequest): Observable<AuthResult> {
    return this.run(this.api.register(request));
  }

  // true when the reset link was sent (it expires in 24 hours, R4)
  requestPasswordReset(email: string): Observable<boolean> {
    this.loading.set(true);
    return this.api.forgotPassword(email).pipe(
      map((r) => r.sent),
      catchError(() => of(false)),
      tap(() => this.loading.set(false)),
    );
  }

  startSession(session: UserSession): void {
    this.token.set(session.token);
    this.email.set(session.email);
    this.businessName.set(session.businessName);
    this.businessType.set(session.businessType);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  signOut(): void {
    this.token.set(null);
    this.email.set('');
    this.businessName.set('');
    localStorage.removeItem(STORAGE_KEY);
  }

  private run(request: Observable<UserSession>): Observable<AuthResult> {
    this.loading.set(true);
    return request.pipe(
      tap((session) => this.startSession(session)),
      map((): AuthResult => 'OK'),
      catchError((e) => of<AuthResult>(apiCode(e) === 'INVALID_CREDENTIALS' || apiCode(e) === 'EMAIL_TAKEN' ? (apiCode(e) as AuthResult) : 'ERROR')),
      tap(() => this.loading.set(false)),
    );
  }

  private load(): UserSession | null {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
  }
}