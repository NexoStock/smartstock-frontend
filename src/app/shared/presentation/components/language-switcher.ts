import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [TranslatePipe],
  template: `
    <div class="switcher" role="group" [attr.aria-label]="'shared.language' | translate">
      <button type="button" [attr.aria-pressed]="current() === 'en'" (click)="setLocale('en')">EN</button>
      <button type="button" [attr.aria-pressed]="current() === 'es'" (click)="setLocale('es')">ES</button>
    </div>
  `,
  styles: `
    .switcher { display: inline-flex; border: 1px solid var(--ss-border); border-radius: 0.6rem; overflow: hidden; background: var(--ss-card-bg); }
    button { border: 0; background: transparent; padding: 0.4rem 0.7rem; font-weight: 600; cursor: pointer; color: inherit; font: inherit; }
    button[aria-pressed='true'] { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
  `,
})
export class LanguageSwitcher {
  private readonly translate = inject(TranslateService);
  protected current = () => this.translate.currentLang();

  setLocale(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    localStorage.setItem('smartstock.locale', lang);
    document.documentElement.lang = lang === 'es' ? 'es-419' : 'en';
  }
}
