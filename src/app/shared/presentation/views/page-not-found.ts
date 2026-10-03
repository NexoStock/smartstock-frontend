import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="nf">
      <h1>{{ 'shared.notFound.title' | translate }}</h1>
      <p>{{ 'shared.notFound.text' | translate }}</p>
      <a routerLink="/dashboard">{{ 'shared.notFound.back' | translate }}</a>
    </main>
  `,
  styles: `.nf { min-height: 100vh; display: grid; place-content: center; gap: 0.5rem; text-align: center; padding: 2rem; }`,
})
export class PageNotFound {}
