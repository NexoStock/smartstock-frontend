import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../iam/application/iam.store';
import { menuFor } from '../../config/menu';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, TranslatePipe, LanguageSwitcher],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly iam = inject(IamStore);
  private readonly router = inject(Router);
  protected readonly open = signal(false);
  protected readonly items = computed(() => menuFor(this.iam.businessType()));

  signOut(): void {
    this.iam.signOut();
    this.router.navigateByUrl('/sign-in');
  }
}
