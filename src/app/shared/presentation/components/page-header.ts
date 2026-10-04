import { Component, input } from '@angular/core';

// Page title on the left and the main actions (projected content) on the right
@Component({
  selector: 'app-page-header',
  template: `
    <header class="head">
      <div>
        <h1>{{ title() }}</h1>
        @if (subtitle()) { <p class="subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="actions"><ng-content /></div>
    </header>
  `,
  styles: `
    .head { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
    .subtitle { margin: 0; color: var(--ss-muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
