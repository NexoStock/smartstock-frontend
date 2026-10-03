import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// The base URL lives only in src/environments/*
export abstract class BaseApi {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiBaseUrl;
}
