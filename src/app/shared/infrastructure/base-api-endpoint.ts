import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseEntity } from '../domain/model/base-entity';
import { BaseAssembler } from './base-assembler';

// Generic CRUD over one resource path (taken from the environment file)
export class BaseApiEndpoint<TEntity extends BaseEntity, TResource> {
  constructor(
    private readonly http: HttpClient,
    private readonly endpointUrl: string,
    private readonly assembler: BaseAssembler<TEntity, TResource>,
  ) {}

  getAll(): Observable<TEntity[]> {
    return this.http.get<TResource[]>(this.endpointUrl).pipe(map((r) => this.assembler.toEntitiesFromResources(r)));
  }
  getById(id: number | string): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  create(entity: TEntity): Observable<TEntity> {
    return this.http.post<TResource>(this.endpointUrl, this.assembler.toResourceFromEntity(entity)).pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  update(id: number | string, entity: TEntity): Observable<TEntity> {
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, this.assembler.toResourceFromEntity(entity)).pipe(map((r) => this.assembler.toEntityFromResource(r)));
  }
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`);
  }
}
