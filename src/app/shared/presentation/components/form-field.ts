import { Component, input } from '@angular/core';

// Label + control + error message. Put the control in the content and give it the same id.
// The control should have [attr.aria-invalid]="!!error" and [attr.aria-describedby]="error ? id + '-error' : null"
@Component({
  selector: 'app-form-field',
  template: `
    <div class="field">
      <label [for]="id()">{{ label() }}</label>
      <ng-content />
      @if (error()) { <small [id]="id() + '-error'" role="alert" class="error">{{ error() }}</small> }
    </div>
  `,
  styles: `
    .field { display: grid; gap: 0.35rem; margin-bottom: 1rem; }
    label { font-weight: 600; font-size: 0.85rem; }
    .error { color: var(--ss-danger); font-weight: 600; }
  `,
})
export class FormField {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly error = input('');
}
