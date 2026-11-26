import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../components/language-switcher';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [RouterLink, TranslatePipe, LanguageSwitcher],
  template: `
    <main class="terms">
      <header>
        <a routerLink="/">{{ 'shared.menu.home' | translate }}</a>
        <app-language-switcher />
      </header>

      <h1>{{ 'shared.termsAndConditions' | translate }}</h1>
      <p>{{ 'shared.termsPage.updated' | translate }}</p>
      <p>{{ 'shared.termsPage.intro' | translate }}</p>

      @for (section of sections; track section) {
        <h2>{{ ('shared.termsPage.' + section + '.title') | translate }}</h2>
        <p>{{ ('shared.termsPage.' + section + '.text') | translate }}</p>
      }
    </main>
  `,
  styles: `
    .terms {
      max-width: 760px;
      margin: 0 auto;
      padding: 24px;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    p {
      line-height: 1.6;
    }
  `,
})
export class TermsAndConditions {
  protected readonly sections = [
    'service',
    'accounts',
    'data',
    'notifications',
    'plans',
    'accessibility',
    'ethics',
    'contact',
  ];
}