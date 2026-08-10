import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { ResourceMutationService } from "./resource-mutation.service";
import {
  Resource,
  ResourceCategory,
  ResourceType,
} from "./entities/resource.entity";
import { ResourceNotFoundError } from "./resource.errors";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [Resource];

describe("ResourceMutationService", () => {
  let module: TestingModule;
  let resourceMutationService: ResourceMutationService;
  let resourceRepository: Repository<Resource>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  async function saveTestResource(
    overrides?: Partial<Resource>,
  ): Promise<Resource> {
    return resourceRepository.save(
      resourceRepository.create({
        title: "test resource",
        type: ResourceType.ARTICLE,
        category: ResourceCategory.DEPRESSION,
        url: "https://example.com",
        ...overrides,
      }),
    );
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        ResourceMutationService,
        {
          provide: getRepositoryToken(Resource),
          useValue: dataSource.getRepository(Resource),
        },
      ],
    }).compile();

    resourceMutationService = module.get(ResourceMutationService);
    resourceRepository = dataSource.getRepository(Resource);
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("createResource", () => {
    it("success: 콘텐츠 생성", async () => {
      // When: 콘텐츠 생성 시도
      const resource = await resourceMutationService.createResource({
        title: "test resource",
        type: ResourceType.ARTICLE,
        category: ResourceCategory.DEPRESSION,
        url: "https://example.com",
      });

      // Then: 콘텐츠 생성
      const saved = await resourceRepository.findOneBy({ id: resource.id });
      expect(saved).toMatchObject({
        title: "test resource",
        type: ResourceType.ARTICLE,
        category: ResourceCategory.DEPRESSION,
        url: "https://example.com",
      });
    });
  });

  describe("updateResource", () => {
    it("success: 콘텐츠 업데이트", async () => {
      // Given: 콘텐츠가 존재하는 경우
      const resource = await saveTestResource();

      // When: 콘텐츠 업데이트 시도
      await resourceMutationService.updateResource({
        resourceId: resource.id,
        title: "updated title",
        type: ResourceType.VIDEO,
        category: ResourceCategory.ANXIETY,
        url: "https://updated.com",
      });

      // Then: 글 업데이트
      const updated = await resourceRepository.findOneBy({ id: resource.id });
      expect(updated).toMatchObject({
        title: "updated title",
        type: ResourceType.VIDEO,
        category: ResourceCategory.ANXIETY,
        url: "https://updated.com",
      });
    });

    it("존재하지 않는 콘텐츠 처리", async () => {
      // Given: 콘텐츠가 존재하지 않는 경우
      const nonExistentResourceId = 0;

      // When: 콘텐츠 업데이트 시도
      const result = resourceMutationService.updateResource({
        resourceId: nonExistentResourceId,
        title: "title",
        type: ResourceType.ARTICLE,
        category: ResourceCategory.DEPRESSION,
        url: "https://example.com",
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(ResourceNotFoundError);
    });
  });

  describe("deleteResource", () => {
    it("success: 콘텐츠 삭제", async () => {
      // Given: 콘텐츠가 존재하는 경우
      const resource = await saveTestResource();

      // When: 콘텐츠 삭제 시도
      await resourceMutationService.deleteResource(resource.id);

      // Then: 콘텐츠 삭제됨
      expect(
        await resourceRepository.findOneBy({ id: resource.id }),
      ).toBeNull();
    });

    it("존재하지 않는 콘텐츠 처리", async () => {
      // Given: 콘텐츠가 존재하지 않는 경우
      const nonExistentResourceId = 0;

      // When: 콘텐츠 삭제 시도
      const result = resourceMutationService.deleteResource(
        nonExistentResourceId,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(ResourceNotFoundError);
    });
  });
});
