import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../iam/application/iam.store';

// Temporary body for screens that are not implemented yet. Replace it with the real view.
@Component({
  selector: 'app-placeholder-view',
  imports: [TranslatePipe],
  template: `
    <section class="ph" aria-labelledby="ph-title">
      <h1 id="ph-title">{{ titleKey() | translate }}</h1>
      <p class="muted">{{ 'shared.placeholder.pending' | translate }}</p>
      <dl>
        <dt>{{ 'shared.placeholder.context' | translate }}</dt><dd>{{ data['context'] }}</dd>
        <dt>{{ 'shared.placeholder.stories' | translate }}</dt><dd>{{ data['stories']?.join(', ') }}</dd>
        <dt>{{ 'shared.placeholder.mockups' | translate }}</dt><dd>{{ data['mockups']?.join(', ') }}</dd>
      </dl>
      <p class="muted">{{ 'shared.placeholder.hint' | translate }}</p>
    </section>
  `,
  styles: `
    .ph { max-width: 640px; background: var(--ss-card-bg); border: 1px dashed var(--ss-border); border-radius: 0.9rem; padding: 1.5rem; }
    .muted { color: var(--ss-muted); }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 1rem; }
    dt { font-weight: 600; } dd { margin: 0; }
  `,
})
export class PlaceholderView {
  private readonly iam = inject(IamStore);
  protected readonly data = inject(ActivatedRoute).snapshot.data;
  // In bodega the dashboard is called Home
  protected readonly titleKey = computed(() =>
    this.data['titleKey'] === 'analytics.dashboard.title' && this.iam.businessType() === 'bodega' ? 'shared.menu.home' : this.data['titleKey']);
}
