import { Component, input } from '@angular/core';
import { StatusTag } from './status-tag';

// level: lowStock | healthy | noData (the label always has text, not only color)
@Component({
  selector: 'app-stock-level-badge',
  imports: [StatusTag],
  template: '<app-status-tag [status]="level()" />',
})
export class StockLevelBadge {
  readonly level = input.required<string>();
}
