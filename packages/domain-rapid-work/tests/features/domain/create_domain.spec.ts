import { test } from "@japa/runner";

import { Domain } from "../../../core/rapid-work/entities/domain/Domain";
import {
  CreateDomainFeature,
  CreateDomainParams,
} from "../../../core/rapid-work/features/domain/CreateDomainFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";

test.group("CreateDomainFeature", () => {
  test("should create a new domain", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const createDomainFeature = new CreateDomainFeature(mockDomainCollection, mockSubDomainCollection);
    const params: CreateDomainParams = {
      name: "Web Development",
      subDomains: [],
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await createDomainFeature.execute(params);

    // Assert
    assert.isDefined(result);
    assert.equal(result.userId.value, TEST_UUIDS.USER_1);
    assert.equal(result.name.value, "Web Development");
    assert.isDefined(result.id);
    assert.isDefined(result.createdAt);

    // Verify it was saved in the collection
    const savedDomains = mockDomainCollection.getAll();
    assert.lengthOf(savedDomains, 1);
    assert.equal(savedDomains[0].id.value, result.id.value);
  })

  test("should handle multiple domains with different names", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const createDomainFeature = new CreateDomainFeature(mockDomainCollection, mockSubDomainCollection);
    const domainNames = ["Frontend", "Backend", "DevOps", "Testing"];

    // Act
    const createdDomains: Domain[] = [];
    for (const name of domainNames) {
      const domain = await createDomainFeature.execute({
        name,
        subDomains: [],
        userId: TEST_UUIDS.USER_1,
      });
      createdDomains.push(domain);
    }

    // Assert
    assert.lengthOf(createdDomains, 4);

    // Verify each domain has unique ID and correct name
    const uniqueIds = new Set(createdDomains.map((d) => d.id.value));
    assert.lengthOf([...uniqueIds], 4);

    domainNames.forEach((name, index) => {
      assert.equal(createdDomains[index].name.value, name);
    });
  })
});
