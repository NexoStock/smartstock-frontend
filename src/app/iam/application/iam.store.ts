import { Injectable, computed, signal } from '@angular/core';
import { BusinessType } from '../../shared/config/menu';

const STORAGE_KEY = 'smartstock.session';

interface Session { token: string; email: string; businessType: BusinessType; }

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly saved = this.load();
  readonly token = signal<string | null>(this.saved?.token ?? null);
  readonly email = signal<string>(this.saved?.email ?? '');
  readonly businessType = signal<BusinessType>(this.saved?.businessType ?? 'minimarket');
  readonly isSignedIn = computed(() => !!this.token());

  startSession(session: Session): void {
    this.token.set(session.token);
    this.email.set(session.email);
    this.businessType.set(session.businessType);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  signOut(): void {
    this.token.set(null);
    this.email.set('');
    localStorage.removeItem(STORAGE_KEY);
  }

  private load(): Session | null {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
  }
}
