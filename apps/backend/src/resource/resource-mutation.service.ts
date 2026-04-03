import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Resource,
  ResourceCategory,
  ResourceType,
} from "./entities/resource.entity";
import { ResourceNotFoundError } from "./resource.errors";

export type CreateResourceOptions = {
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
};

export type UpdateResourceOptions = {
  resourceId: number;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
};

/**
 * AdminResourceController에서 사용하기 위한 resource의 mutation을 담당한다.
 */
@Injectable()
export class ResourceMutationService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  /**
   * options를 기반으로 새 resource를 생성한다.
   * @returns 생성된 resource
   */
  async createResource(options: CreateResourceOptions): Promise<Resource> {
    return this.resourceRepository.save(
      this.resourceRepository.create(options),
    );
  }

  /**
   * options.resourceId가 가리키는 resource를 수정한다.
   */
  async updateResource({
    resourceId,
    ...fields
  }: UpdateResourceOptions): Promise<void> {
    const resource = await this.resourceRepository.findOneBy({
      id: resourceId,
    });
    if (!resource) {
      throw new ResourceNotFoundError();
    }

    await this.resourceRepository.save({ ...resource, ...fields });
  }

  /**
   * resourceId가 가리키는 resource를 삭제한다.
   */
  async deleteResource(resourceId: number): Promise<void> {
    const resource = await this.resourceRepository.findOneBy({
      id: resourceId,
    });
    if (!resource) {
      throw new ResourceNotFoundError();
    }

    await this.resourceRepository.delete(resourceId);
  }
}
