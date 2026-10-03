import { BaseEntity } from '../domain/model/base-entity';

// The domain entity does not know the API format: the assembler converts both ways.
export abstract class BaseAssembler<TEntity extends BaseEntity, TResource> {
  abstract toEntityFromResource(resource: TResource): TEntity;
  abstract toResourceFromEntity(entity: TEntity): TResource;
  toEntitiesFromResources(resources: TResource[]): TEntity[] {
    return resources.map((resource) => this.toEntityFromResource(resource));
  }
}
