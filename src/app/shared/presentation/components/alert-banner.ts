import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// Message strip: error (red), success (green) or warning (orange). The icon and the text never rely on color alone.
@Component({
  selector: 'app-alert-banner',
  imports: [MatIconModule],
  template: `
    <div class="banner" [class]="tone()" [attr.role]="tone() === 'error' ? 'alert' : 'status'">
      <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
      <div class="body"><ng-content /></div>
    </div>
  `,
  styles: `
    .banner { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.75rem 1rem; border-radius: 0.7rem; margin-bottom: 1rem; border: 1px solid; }
    .body { flex: 1; display: grid; gap: 0.35rem; justify-items: start; }
    .error { background: #fdeeee; color: var(--ss-danger); border-color: #f3c6c2; }
    .success { background: #e9f9f0; color: var(--ss-success); border-color: #b9e6cd; }
    .warn { background: #fff4e0; color: var(--ss-warn); border-color: #f4d9a6; }
  `,
})
export class AlertBanner {
  readonly tone = input<'error' | 'success' | 'warn'>('error');
  protected icon = () => (this.tone() === 'success' ? 'check_circle' : this.tone() === 'warn' ? 'warning' : 'error');
}
