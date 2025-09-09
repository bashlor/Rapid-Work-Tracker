import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import { SubDomainBuilder } from "../../../core/rapid-work/entities/subdomain/SubDomainBuilder";
import { TaskStatus } from "../../../core/rapid-work/entities/task/TaskStatus";
import {
  CreateTaskFeature,
  CreateTaskParams,
} from "../../../core/rapid-work/features/task/CreateTaskFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";
import { MockTaskCollection } from "../../mocks/MockTaskCollection";

test.group("CreateTaskFeature", () => {
  test("should create a task with domain", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    // Create a domain first
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Web Development")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    const createTaskFeature = new CreateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    const params: CreateTaskParams = {
      description: "Implement user authentication",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Build login feature",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await createTaskFeature.execute(params);

    // Assert
    assert.isDefined(result);
    assert.equal(result.userId.value, TEST_UUIDS.USER_1);
    assert.equal(result.title.value, "Build login feature");
    assert.equal(
      result.description.value,
      "Implement user authentication",
    );
    assert.equal(result.domainId?.value, insertedDomain.id.value);
    assert.isNull(result.subDomainId);
    assert.isDefined(result.id);
    assert.isDefined(result.createdAt);

    // Verify it was saved in the collection
    const savedTasks = mockTaskCollection.getAll();
    assert.lengthOf(savedTasks, 1);
    assert.equal(savedTasks[0].id.value, result.id.value);
  });

  test("should create a task with subdomain", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    // Create a domain and subdomain first
    const domain = new DomainBuilder()
      .withUserId(TEST_UUIDS.USER_1)
      .withName("Web Development")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    const subDomain = new SubDomainBuilder()
      .withDomainId(insertedDomain.id.value)
      .withName("Authentication")
      .build();
    const insertedSubDomain = await mockSubDomainCollection.insert(domain.userId, subDomain);

    const createTaskFeature = new CreateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    const params: CreateTaskParams = {
      description: "Create the login UI",
      status: TaskStatus.create("pending"),
      subDomainId: insertedSubDomain.id.value,
      title: "Build login form",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await createTaskFeature.execute(params);

    // Assert
    assert.isDefined(result);
    assert.equal(result.userId.value, TEST_UUIDS.USER_1);
    assert.equal(result.title.value, "Build login form");
    assert.equal(result.description.value, "Create the login UI");
    assert.equal(result.domainId?.value, insertedDomain.id.value); // Auto-set from subdomain
    assert.equal(
      result.subDomainId?.value,
      insertedSubDomain.id.value,
    );
  });

  test("should throw error when both domain and subdomain are provided", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    const createTaskFeature = new CreateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    const params: CreateTaskParams = {
      description: "Implement user authentication",
      domainId: TEST_UUIDS.DOMAIN_1,
      status: TaskStatus.create("pending"),
      subDomainId: TEST_UUIDS.SUBDOMAIN_1,
      title: "Build login feature",
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(
      () => createTaskFeature.execute(params)
    );
  });

  test("should throw error when neither domain nor subdomain are provided", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    const createTaskFeature = new CreateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    const params: CreateTaskParams = {
      description: "Implement user authentication",
      status: TaskStatus.create("pending"),
      title: "Build login feature",
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(
      () => createTaskFeature.execute(params)
    );
  });

  test("should throw error for non-existent domain", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    const createTaskFeature = new CreateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    const params: CreateTaskParams = {
      domainId: TEST_UUIDS.NON_EXISTENT_DOMAIN,
      status: TaskStatus.create("pending"),
      title: "Build login feature",
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(
      () => createTaskFeature.execute(params)
    );
  });
})