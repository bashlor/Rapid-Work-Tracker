import { test } from "@japa/runner";

import { DomainBuilder, SubDomainBuilder, UpdateSubDomainFeature, UpdateSubDomainParams } from "../../../core";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";


test.group("UpdateSubDomainFeature", () => {
  test("should update an existing subdomain name", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockDomainCollection = new MockDomainCollection();

    // Create a domain first
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Web Development")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    // Create a subdomain directly in the mock collection
    const subDomain = new SubDomainBuilder()
      .withDomainId(insertedDomain.id.value)
      .withName("Authentication")
      .build();
    const originalSubDomain = await mockSubDomainCollection.insert(domain.userId, subDomain);

    const updateSubDomainFeature = new UpdateSubDomainFeature(mockSubDomainCollection);

    const params: UpdateSubDomainParams = {
      name: "User Management",
      subDomainId: originalSubDomain.id.value,
      userId: TEST_UUIDS.USER_1
    };

    // Act
    const result = await updateSubDomainFeature.execute(params);

    // Assert
    assert.isDefined(result);
    assert.equal(result.id.value, originalSubDomain.id.value);
    assert.equal(result.name.value, "User Management");

    // Verify the subdomain was updated in the collection
    const updatedSubDomain = await mockSubDomainCollection.getById(insertedDomain.userId, originalSubDomain.id);
    assert.isDefined(updatedSubDomain);
    assert.equal(updatedSubDomain!.name.value, "User Management");
  });

  test("should throw error when subdomain does not exist", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const updateSubDomainFeature = new UpdateSubDomainFeature(mockSubDomainCollection);

    const params: UpdateSubDomainParams = {
      name: "Updated Name",
      subDomainId: TEST_UUIDS.NON_EXISTENT_SUBDOMAIN,
      userId: TEST_UUIDS.USER_1
    };

    // Act & Assert
    await assert.rejects(
        () => updateSubDomainFeature.execute(params)
      );
  });
});