import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule, TranslatePipe],
  template: `
    <div class="empty" role="status">
      <mat-icon aria-hidden="true">inbox</mat-icon>
      <p>{{ message() || ('shared.empty' | translate) }}</p>
    </div>
  `,
  styles: `.empty { display: grid; justify-items: center; gap: 0.5rem; padding: 2rem 1rem; color: var(--ss-muted); }`,
})
export class EmptyState {
  readonly message = input('');
}
