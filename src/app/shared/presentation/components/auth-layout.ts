import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, TranslatePipe, LanguageSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}