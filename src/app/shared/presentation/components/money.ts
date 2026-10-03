import { Component, computed, input } from '@angular/core';
import { formatPen } from '../../domain/model/money';

@Component({ selector: 'app-money', template: '<span class="money">{{ text() }}</span>' })
export class Money {
  readonly amount = input.required<number>();
  protected readonly text = computed(() => formatPen(this.amount()));
}
