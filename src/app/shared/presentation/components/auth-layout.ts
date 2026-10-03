import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'app-auth-layout',
  imports: [TranslatePipe, LanguageSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
