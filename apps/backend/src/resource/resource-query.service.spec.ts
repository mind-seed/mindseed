import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { ResourceQueryService } from "./resource-query.service";
import {
  Resource,
  ResourceCategory,
  ResourceType,
} from "./entities/resource.entity";
import { InvalidCursorError } from "src/common/errors/pagination.errors";
import { initializePgMem } from "src/test/pg-mem.helper";

const entities = [Resource];

describe("ResourceQueryService", () => {
  let module: TestingModule;
  let resourceQueryService: ResourceQueryService;
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
        category: ResourceCategory.DUMMY1,
        url: "https://example.com",
        ...overrides,
      }),
    );
  }

  async function saveTestResources(
    overridesList: Partial<Resource>[],
  ): Promise<number[]> {
    const ids: number[] = [];
    for (const overrides of overridesList) {
      ids.push((await saveTestResource(overrides)).id);
    }
    return ids;
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

    module = await Test.createTestingModule({
      providers: [
        ResourceQueryService,
        {
          provide: getRepositoryToken(Resource),
          useValue: dataSource.getRepository(Resource),
        },
      ],
    }).compile();

    resourceQueryService = module.get(ResourceQueryService);
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

  describe("listResourcesWithOffset", () => {
    it("success: 각 parameter 처리", async () => {
      // Given: resources
      const ids = await saveTestResources([
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY2 },
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY1 },
      ]);

      // When: 첫 페이지 조회
      const result = await resourceQueryService.listResourcesWithOffset({
        offset: 0,
        limit: 2,
        category: ResourceCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result.items.map((r) => r.id)).toEqual([ids[0], ids[2]]);
      expect(result.hasNext).toBe(true);

      // When: 다음 페이지 조회
      const result2 = await resourceQueryService.listResourcesWithOffset({
        offset: 2,
        limit: 2,
        category: ResourceCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.items.map((r) => r.id)).toEqual([ids[3], ids[4]]);
      expect(result2.hasNext).toBe(false);
    });
  });

  describe("listResourcesWithCursor", () => {
    it("success: 각 parameter 처리", async () => {
      // Given: resources
      const ids = await saveTestResources([
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY2 },
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY1 },
      ]);

      const result1 = await resourceQueryService.listResourcesWithCursor({
        limit: 2,
        category: ResourceCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result1.items.map((r) => r.id)).toEqual([ids[0], ids[2]]);
      expect(result1.nextCursor).toBeDefined();

      // When: cursor 적용하여 조회
      const result2 = await resourceQueryService.listResourcesWithCursor({
        cursor: result1.nextCursor,
        limit: 2,
        category: ResourceCategory.DUMMY1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 올바른 결과 반환
      expect(result2.items.map((r) => r.id)).toEqual([ids[3], ids[4]]);
      expect(result2.nextCursor).toBeUndefined();
    });

    it("success: cursor에 해당하는 resource가 삭제된 경우 올바르게 처리", async () => {
      // Given: cursor에 해당하는 resource가 삭제된 경우
      const ids = await saveTestResources([{}, {}, {}]);

      const firstPage = await resourceQueryService.listResourcesWithCursor({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
      });
      await resourceRepository.delete(ids[0]);

      // When: 조회 시도
      const result = await resourceQueryService.listResourcesWithCursor({
        cursor: firstPage.nextCursor,
        limit: 2,
        orderBy: "createdAt",
        orderDirection: "asc",
      });

      // Then: 삭제된 resource 다음부터 올바르게 반환
      expect(result.items.map((r) => r.id)).toEqual([ids[1], ids[2]]);
    });

    it("category 및 orderBy와 벗어난 cursor 처리", async () => {
      // Given: cursor가 category 및 orderBy를 다르게 하여 조회했을 때의
      // 결과물인 경우
      await saveTestResources([
        { category: ResourceCategory.DUMMY1 },
        { category: ResourceCategory.DUMMY1 },
      ]);
      const firstPage = await resourceQueryService.listResourcesWithCursor({
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
        category: ResourceCategory.DUMMY1,
      });

      // When: 조회 시도
      const result = resourceQueryService.listResourcesWithCursor({
        cursor: firstPage.nextCursor,
        limit: 1,
        orderBy: "createdAt",
        orderDirection: "asc",
        category: ResourceCategory.DUMMY2,
      });

      // Then: throws handled error
      await expect(result).rejects.toThrow(InvalidCursorError);
    });
  });
});
