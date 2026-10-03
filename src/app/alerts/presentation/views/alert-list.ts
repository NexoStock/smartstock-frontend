import { Component } from '@angular/core';
import { PlaceholderView } from '../../../shared/presentation/components/placeholder-view';

@Component({
  selector: 'app-alert-list',
  imports: [PlaceholderView],
  template: '<app-placeholder-view />',
})
export class AlertList {}
