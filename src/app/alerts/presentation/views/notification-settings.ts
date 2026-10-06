import {
  Component,
  OnInit,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertBanner } from '../../../shared/presentation/components/alert-banner';
import { PageHeader } from '../../../shared/presentation/components/page-header';
import { AlertsStore } from '../../application/alerts.store';

@Component({
  selector: 'app-notification-settings',
  imports: [
    MatButtonModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    TranslatePipe,
    AlertBanner,
    PageHeader,
  ],
  template: `
    <section>
      <app-page-header
        [title]="'alerts.notificationSettings.title' | translate"
      />

      @if (saved()) {
        <app-alert-banner tone="success">
          {{ 'alerts.notificationSettings.saved' | translate }}
        </app-alert-banner>
      }

      @if (noChannel()) {
        <app-alert-banner tone="error">
          {{ 'alerts.notificationSettings.atLeastOne' | translate }}
        </app-alert-banner>
      }

      @if (store.error() || failed()) {
        <app-alert-banner tone="error">
          {{ 'shared.error' | translate }}
        </app-alert-banner>
      }

      @if (store.loading() && !store.channels().length) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (store.channels().length) {
        <div class="ss-card ss-form">
          <h2 class="h2">
            {{ 'alerts.notificationSettings.heading' | translate }}
          </h2>

          <p class="ss-muted">
            {{ 'alerts.notificationSettings.text' | translate }}
          </p>

          @for (c of store.channels(); track c.id) {
            <div class="channel">
              <div>
                <strong>
                  {{
                    ('alerts.notificationSettings.' + c.channel)
                      | translate
                  }}
                </strong>
                <div class="ss-muted">{{ c.destination }}</div>
              </div>

              <mat-slide-toggle
                [checked]="draft()[+c.id!]"
                (change)="toggle(+c.id!, $event.checked)"
                [attr.aria-label]="
                  ('alerts.notificationSettings.' + c.channel)
                    | translate
                "
              />
            </div>
          }

          <p class="ss-note">
            {{ 'alerts.notificationSettings.hint' | translate }}
          </p>

          <div class="ss-actions">
            <button mat-button type="button" (click)="reset()">
              {{ 'shared.cancel' | translate }}
            </button>

            <button
              mat-flat-button
              type="button"
              [disabled]="store.loading()"
              (click)="save()"
            >
              {{ 'alerts.notificationSettings.save' | translate }}
            </button>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .h2 {
      font-size: 1.05rem;
      margin: 0 0 0.25rem;
    }

    .channel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-top: 1px solid var(--ss-border);
    }
  `,
})
export class NotificationSettings implements OnInit {
  protected readonly store = inject(AlertsStore);
  protected readonly draft = signal<Record<number, boolean>>({});
  protected readonly saved = signal(false);
  protected readonly noChannel = signal(false);
  protected readonly failed = signal(false);

  constructor() {
    effect(() => {
      const channels = this.store.channels();

      untracked(() =>
        this.draft.set(
          Object.fromEntries(
            channels.map((channel) => [
              channel.id as number,
              channel.active,
            ]),
          ),
        ),
      );
    });
  }

  ngOnInit(): void {
    this.store.fetchChannels();
  }

  protected toggle(id: number, active: boolean): void {
    this.draft.update((draft) => ({ ...draft, [id]: active }));
    this.saved.set(false);
    this.noChannel.set(false);
  }

  protected reset(): void {
    this.draft.set(
      Object.fromEntries(
        this.store.channels().map((channel) => [
          channel.id as number,
          channel.active,
        ]),
      ),
    );
    this.noChannel.set(false);
  }

  protected save(): void {
    this.saved.set(false);
    this.failed.set(false);

    const changes = Object.entries(this.draft()).map(
      ([id, active]) => ({ id: Number(id), active }),
    );

    if (!changes.some((channel) => channel.active)) {
      this.noChannel.set(true);
      return;
    }

    this.store.saveChannels(changes).subscribe((result) => {
      if (result.ok) {
        this.saved.set(true);
      } else if (result.error.code === 'AT_LEAST_ONE_CHANNEL') {
        this.noChannel.set(true);
      } else {
        this.failed.set(true);
      }
    });
  }
}