import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '@ngx-translate/core';

// Search by date range only (US27, US31)
@Component({
  selector: 'app-date-range-filter',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDatepickerModule, MatButtonModule, TranslatePipe],
  template: `
    <form class="range" [formGroup]="range" (ngSubmit)="search.emit(range.getRawValue())">
      <mat-form-field>
        <mat-label>{{ 'shared.dateRange' | translate }}</mat-label>
        <mat-date-range-input [rangePicker]="picker">
          <input matStartDate formControlName="start" />
          <input matEndDate formControlName="end" />
        </mat-date-range-input>
        <mat-datepicker-toggle matIconSuffix [for]="picker" />
        <mat-date-range-picker #picker />
      </mat-form-field>
      <button mat-flat-button type="submit">{{ 'shared.search' | translate }}</button>
    </form>
  `,
  styles: `.range { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }`,
})
export class DateRangeFilter {
  readonly search = output<{ start: Date | null; end: Date | null }>();
  protected readonly range = new FormGroup({ start: new FormControl<Date | null>(null), end: new FormControl<Date | null>(null) });
}
