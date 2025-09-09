import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import { SubDomainBuilder } from "../../../core/rapid-work/entities/subdomain/SubDomainBuilder";
import { TaskBuilder } from "../../../core/rapid-work/entities/task/TaskBuilder";
import {
  DeleteDomainFeature,
} from "../../../core/rapid-work/features/domain/DeleteDomainFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";
import { MockTaskCollection } from "../../mocks/MockTaskCollection";

test.group("DeleteDomainFeature", () => {
  test("should delete a domain with no subdomains or tasks", async ({ assert }) => {
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockTaskCollection = new MockTaskCollection();
    const deleteDomainFeature = new DeleteDomainFeature(
      mockDomainCollection,
      mockSubDomainCollection,
      mockTaskCollection
    );

    // Create a domain directly in the mock collection
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Test Domain")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    await deleteDomainFeature.execute({ domainId: insertedDomain.id.value, userId: insertedDomain.userId.value });

    const found = await mockDomainCollection.getById(domain.userId, insertedDomain.id);
    assert.isNull(found);
  })

  test("should throw if domain does not exist", async ({ assert }) => {
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockTaskCollection = new MockTaskCollection();
    const deleteDomainFeature = new DeleteDomainFeature(
      mockDomainCollection,
      mockSubDomainCollection,
      mockTaskCollection
    );

    await assert.rejects(
      () => deleteDomainFeature.execute({ domainId: "0198dc97-ace6-75ef-8489-19036840f44e", userId: "0198dc97-ace6-75ef-8489-19036840f44e" })
    );
  });

  test("should throw if domain has subdomains", async ({ assert }) => {
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockTaskCollection = new MockTaskCollection();
    const deleteDomainFeature = new DeleteDomainFeature(
      mockDomainCollection,
      mockSubDomainCollection,
      mockTaskCollection
    );

    // Create a domain directly in the mock collection
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Test Domain")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    // Crée un SubDomain lié à ce domain
    const subDomain = new SubDomainBuilder()
      .withId(TEST_UUIDS.SUBDOMAIN_1)
      .withDomainId(insertedDomain.id.value)
      .withName("Subdomain")
      .build();
    mockSubDomainCollection.addMockSubDomain(domain.userId, subDomain);

    await assert.rejects(
      () => deleteDomainFeature.execute({ domainId: insertedDomain.id.value, userId: insertedDomain.userId.value }),
    );
  });

  test("should throw if domain has tasks", async ({ assert }) => {
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();
    const mockTaskCollection = new MockTaskCollection();
    const deleteDomainFeature = new DeleteDomainFeature(
      mockDomainCollection,
      mockSubDomainCollection,
      mockTaskCollection
    );

    // Create a domain directly in the mock collection
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Test Domain")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    // Crée un Task lié à ce domain
    const task = new TaskBuilder()
      .withId(TEST_UUIDS.TASK_1)
      .withUserId(TEST_UUIDS.USER_1)
      .withTitle("Task")
      .withDescription("Test task description")
      .withDomainId(insertedDomain.id.value)
      .build();
    mockTaskCollection.addMockTask(task);

    await assert.rejects(
      () => deleteDomainFeature.execute({ domainId: insertedDomain.id.value, userId: insertedDomain.userId.value }),
    );
  });
});
