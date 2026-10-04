import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// status: pending | received | cancelled | completed | online | disconnected | available | notLinked | lowStock | healthy | noData | discrepancy | match | registeredOnly | active | resolved | inProgress
const TONE: Record<string, 'success' | 'danger' | 'warn' | 'neutral'> = {
  pending: 'warn', received: 'success', cancelled: 'neutral', completed: 'success',
  online: 'success', disconnected: 'danger', available: 'neutral',
  lowStock: 'danger', healthy: 'success', noData: 'neutral', discrepancy: 'warn',
  notLinked: 'neutral', match: 'success', registeredOnly: 'neutral', active: 'danger', resolved: 'success', inProgress: 'warn',
};

@Component({
  selector: 'app-status-tag',
  imports: [TranslatePipe],
  template: '<span class="tag" [class]="tone()">{{ ("shared.status." + status()) | translate }}</span>',
  styles: `
    .tag { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: 600; }
    .success { background: #e9f9f0; color: var(--ss-success); }
    .danger { background: #fdeeee; color: var(--ss-danger); }
    .warn { background: #fff4e0; color: var(--ss-warn); }
    .neutral { background: #eef2f7; color: var(--ss-muted); }
  `,
})
export class StatusTag {
  readonly status = input.required<string>();
  protected readonly tone = computed(() => TONE[this.status()] ?? 'neutral');
}
