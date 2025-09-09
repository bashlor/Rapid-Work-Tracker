import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import {
  CreateSubDomainFeature,
  CreateSubDomainParams,
} from "../../../core/rapid-work/features/subdomain/CreateSubDomainFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";

test.group("CreateSubDomainFeature", () => {
  test("should create a new subdomain", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockDomainCollection = new MockDomainCollection();

    // Create a domain first
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Web Development")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    const createSubDomainFeature = new CreateSubDomainFeature(
      mockSubDomainCollection,
      mockDomainCollection,
    );

    const params: CreateSubDomainParams = {
      domainId: insertedDomain.id.value,
      name: "Authentication",
      userId: insertedDomain.userId.value,
    };

    // Act
    const result = await createSubDomainFeature.execute(params);

    // Assert
    assert.isDefined(result);
    assert.equal(result.domainId.value, insertedDomain.id.value);
    assert.equal(result.name.value, "Authentication");
    assert.isDefined(result.id);
    assert.isDefined(result.createdAt);

    // Verify it was saved in the collection
    const savedSubDomains = mockSubDomainCollection.getAll();
    assert.lengthOf(savedSubDomains, 1);
    assert.equal(savedSubDomains[0].id.value, result.id.value);
  });

  test("should throw error for non-existent domain", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockDomainCollection = new MockDomainCollection();

    const createSubDomainFeature = new CreateSubDomainFeature(
      mockSubDomainCollection,
      mockDomainCollection,
    );

    const params: CreateSubDomainParams = {
      domainId: TEST_UUIDS.NON_EXISTENT_DOMAIN,
      name: "Authentication",
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(
      () => createSubDomainFeature.execute(params)
    );
  });
});