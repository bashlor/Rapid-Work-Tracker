import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import {
  EditDomainFeature,
  EditDomainParams,
} from "../../../core/rapid-work/features/domain/EditDomainFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";

test.group("EditDomainFeature", () => {
  test("should update an existing domain name", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const editDomainFeature = new EditDomainFeature(mockDomainCollection, mockSubDomainCollection);

    // Create a domain directly in the mock collection
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Web Development")
      .build();
    const originalDomain = await mockDomainCollection.insert(domain);

    const params: EditDomainParams = {
      domainId: originalDomain.id.value,
      name: "Full Stack Development",
      subDomains: [],
      userId: originalDomain.userId.value,
    };

    // Act
    const result = await editDomainFeature.execute(params);

    // Assert
    assert.isDefined(result);
    assert.equal(result.id.value, originalDomain.id.value);
    assert.equal(result.userId.value, TEST_UUIDS.USER_1);
    assert.equal(result.name.value, "Full Stack Development");
    assert.equal(result.createdAt.toISOString(), originalDomain.createdAt.toISOString());

    // Verify the domain was updated in the collection
    const updatedDomain = await mockDomainCollection.getById(originalDomain.userId, originalDomain.id);
    assert.isDefined(updatedDomain);
    assert.equal(updatedDomain!.name.value, "Full Stack Development");
  });

  test("should throw error when domain does not exist", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const editDomainFeature = new EditDomainFeature(mockDomainCollection, mockSubDomainCollection);

    const params: EditDomainParams = {
      domainId: TEST_UUIDS.NON_EXISTENT_DOMAIN,
      name: "Updated Name",
      subDomains: [],
      userId: TEST_UUIDS.USER_1
    };

    // Act & Assert
    await assert.rejects(
      () => editDomainFeature.execute(params),
    );
  });

  test("should preserve all other domain properties when updating name", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const editDomainFeature = new EditDomainFeature(mockDomainCollection, mockSubDomainCollection);

    // Create a domain directly in the mock collection
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Data Analysis")
      .build();
    const originalDomain = await mockDomainCollection.insert(domain);

    // Store original values for comparison
    const originalId = originalDomain.id.value;
    const originalUserId = originalDomain.userId.value;
    const originalCreatedAt = originalDomain.createdAt.toISOString();

    const params: EditDomainParams = {
      domainId: originalId,
      name: "Advanced Data Analytics",
      subDomains: [],
      userId: originalUserId,
    };

    // Act
    const result = await editDomainFeature.execute(params);

    // Assert
    assert.equal(result.id.value, originalId);
    assert.equal(result.userId.value, originalUserId);
    assert.equal(result.createdAt.toISOString(), originalCreatedAt);
    assert.equal(result.name.value, "Advanced Data Analytics");
  });

  test("should handle updating domain name to same value", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const editDomainFeature = new EditDomainFeature(mockDomainCollection, mockSubDomainCollection);

    // Create a domain directly in the mock collection
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Machine Learning")
      .build();
    const originalDomain = await mockDomainCollection.insert(domain);

    const params: EditDomainParams = {
      domainId: originalDomain.id.value,
      name: "Machine Learning", // Same name
      subDomains: [],
      userId: originalDomain.userId.value,
    };

    // Act
    const result = await editDomainFeature.execute(params);

    // Assert
    assert.equal(result.name.value, "Machine Learning");
    assert.equal(result.id.value, originalDomain.id.value);
    assert.equal(result.userId.value, originalDomain.userId.value);
    assert.equal(result.createdAt.getTime(), originalDomain.createdAt.getTime());
  });

  test("should throw error when trying to set empty name", async ({assert}) => {
    // Arrange
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const editDomainFeature = new EditDomainFeature(mockDomainCollection, mockSubDomainCollection);

    // Create a domain directly in the mock collection
    const originalDomain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Original Name")
      .build();
    const insertedDomain = await mockDomainCollection.insert(originalDomain);

    const params: EditDomainParams = {
      domainId: insertedDomain.id.value,
      name: "",
      subDomains: [],
      userId: insertedDomain.userId.value,
    };

    // Act & Assert
    await assert.rejects(
      () => editDomainFeature.execute(params),
      "Label cannot be empty"
    );
  });
});
