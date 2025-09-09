import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import { SubDomainBuilder } from "../../../core/rapid-work/entities/subdomain/SubDomainBuilder";
import { TaskBuilder } from "../../../core/rapid-work/entities/task/TaskBuilder";
import {
  DeleteSubDomainFeature,
} from "../../../core/rapid-work/features/subdomain/DeleteSubDomainFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";
import { MockTaskCollection } from "../../mocks/MockTaskCollection";

test.group("DeleteSubDomainFeature", () => {
  test("should delete a subdomain with no tasks", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockTaskCollection = new MockTaskCollection();

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
    const insertedSubDomain = await mockSubDomainCollection.insert(domain.userId, subDomain);

    const deleteSubDomainFeature = new DeleteSubDomainFeature(
      mockSubDomainCollection,
      mockTaskCollection
    );

    // Act
    const result = await deleteSubDomainFeature.execute({ 
      subDomainId: insertedSubDomain.id.value,
      userId: TEST_UUIDS.USER_1
    });

    // Assert
    assert.isDefined(result);
    assert.equal(result.id.value, insertedSubDomain.id.value);

    // Verify it was deleted from the collection
    const found = await mockSubDomainCollection.getById(domain.userId, insertedSubDomain.id);
    assert.isNull(found);
  });

  test("should throw if subdomain does not exist", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockTaskCollection = new MockTaskCollection();
    const deleteSubDomainFeature = new DeleteSubDomainFeature(
      mockSubDomainCollection,
      mockTaskCollection
    );

    // Act & Assert
    await assert.rejects(
      () => deleteSubDomainFeature.execute({ subDomainId: TEST_UUIDS.NON_EXISTENT_SUBDOMAIN, userId: TEST_UUIDS.USER_1 })
    );
  });

  test("should throw if subdomain has tasks", async ({assert}) => {
    // Arrange
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockTaskCollection = new MockTaskCollection();

    // Create a domain first
    const domain = new DomainBuilder()
      .withUserId("0198dca5-0762-712a-8b4f-cce4c821b4f2")
      .withName("Web Development")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    // Create a subdomain directly in the mock collection
    const subDomain = new SubDomainBuilder()
      .withDomainId(insertedDomain.id.value)
      .withName("Authentication")
      .build();
    const insertedSubDomain = await mockSubDomainCollection.insert(domain.userId, subDomain);

    // Create a task linked to this subdomain
    const task = new TaskBuilder()
      .withId("0198dca5-1d94-7eee-a75b-74708d28cc2d")
      .withUserId("0198dca5-36ed-7243-adc2-a4aecc36807a")
      .withTitle("Task")
      .withDescription("Test task description")
      .withSubDomainId(insertedSubDomain.id.value)
      .build();
    mockTaskCollection.addMockTask(task);

    const deleteSubDomainFeature = new DeleteSubDomainFeature(
      mockSubDomainCollection,
      mockTaskCollection
    );

    // Act & Assert
    await assert.rejects(
      () => deleteSubDomainFeature.execute({ subDomainId: insertedSubDomain.id.value, userId: TEST_UUIDS.USER_1 })
    );
  });
});
