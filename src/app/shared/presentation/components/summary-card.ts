import { Component, input } from '@angular/core';

// Card with a label, a big value and a small hint (dashboard, "this period" totals)
@Component({
  selector: 'app-summary-card',
  template: `
    <div class="card">
      <span class="label">{{ label() }}</span>
      <strong class="value">{{ value() }}</strong>
      @if (hint()) { <small class="hint">{{ hint() }}</small> }
    </div>
  `,
  styles: `
    .card { display: grid; gap: 0.2rem; background: var(--ss-card-bg); border: 1px solid var(--ss-border); border-radius: 0.9rem; padding: 1rem 1.25rem; }
    .label { color: var(--ss-muted); font-size: 0.85rem; }
    .value { font-size: 1.6rem; font-weight: 600; }
    .hint { color: var(--ss-muted); }
  `,
})
export class SummaryCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input('');
}
