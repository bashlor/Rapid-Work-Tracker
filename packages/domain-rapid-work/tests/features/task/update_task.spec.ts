import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import { SubDomainBuilder } from "../../../core/rapid-work/entities/subdomain/SubDomainBuilder";
import { TaskStatus } from "../../../core/rapid-work/entities/task/TaskStatus";
import {
  CreateTaskFeature,
  CreateTaskParams,
} from "../../../core/rapid-work/features/task/CreateTaskFeature";
import {
  UpdateTaskFeature,
  UpdateTaskParams,
} from "../../../core/rapid-work/features/task/UpdateTaskFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";
import { MockTaskCollection } from "../../mocks/MockTaskCollection";

test.group("UpdateTaskFeature", () => {
  test("should update task title and description", async ({ assert }) => {
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
    const updateTaskFeature = new UpdateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    // Create a task first
    const createParams: CreateTaskParams = {
      description: "Original description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Original title",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    const updateParams: UpdateTaskParams = {
      description: "Updated description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("in_progress"),
      taskId: createdTask.id.value,
      title: "Updated title",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await updateTaskFeature.execute(updateParams);

    // Assert
    assert.isDefined(result);
    assert.equal(result.title.value, "Updated title");
    assert.equal(result.description.value, "Updated description");
    assert.equal(result.status.value, "in_progress");
    assert.equal(result.id.value, createdTask.id.value);
  });

  test("should update task status", async ({ assert }) => {
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
    const updateTaskFeature = new UpdateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    // Create a task first
    const createParams: CreateTaskParams = {
      description: "Test description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Test task",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    const updateParams: UpdateTaskParams = {
      description: "Test description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("completed"),
      taskId: createdTask.id.value,
      title: "Test task",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await updateTaskFeature.execute(updateParams);

    // Assert
    assert.equal(result.status.value, "completed");
    assert.equal(result.id.value, createdTask.id.value);
  });

  test("should move task from domain to subdomain", async ({ assert }) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    // Create domain and subdomain
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
    const updateTaskFeature = new UpdateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    // Create a task with domain
    const createParams: CreateTaskParams = {
      description: "Test description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Test task",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    // Update to use subdomain instead
    const updateParams: UpdateTaskParams = {
      description: "Test description",
      status: TaskStatus.create("pending"),
      subDomainId: insertedSubDomain.id.value, // Only subdomain provided
      taskId: createdTask.id.value,
      title: "Test task",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await updateTaskFeature.execute(updateParams);

    // Assert
    assert.equal(result.domainId?.value, insertedDomain.id.value); // Auto-set from subdomain
    assert.equal(result.subDomainId?.value, insertedSubDomain.id.value);
  });

  test("should throw error when task not found", async ({ assert }) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    const updateTaskFeature = new UpdateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    const updateParams: UpdateTaskParams = {
      description: "Updated description",
      status: TaskStatus.create("pending"),
      taskId: TEST_UUIDS.NON_EXISTENT_TASK,
      title: "Updated title",
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(() => updateTaskFeature.execute(updateParams));
  });

  test("should throw error when neither domain nor subdomain provided", async ({ assert }) => {
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
    const updateTaskFeature = new UpdateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    // Create a task first
    const createParams: CreateTaskParams = {
      description: "Test description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Test task",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    const updateParams: UpdateTaskParams = {
      description: "Updated description",
      // Neither domainId nor subDomainId provided
      status: TaskStatus.create("pending"),
      taskId: createdTask.id.value,
      title: "Updated title",
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(() => updateTaskFeature.execute(updateParams));
  });

  test("should handle both domain and subdomain provided by using subdomain's domain", async ({ assert }) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    // Create domain and subdomain
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
    const updateTaskFeature = new UpdateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    // Create a task first
    const createParams: CreateTaskParams = {
      description: "Test description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Test task",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    const updateParams: UpdateTaskParams = {
      description: "Updated description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      subDomainId: insertedSubDomain.id.value, // Both provided - should use subdomain's domain
      taskId: createdTask.id.value,
      title: "Updated title",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await updateTaskFeature.execute(updateParams);

    // Assert - Should use subdomain and its associated domain
    assert.equal(result.domainId?.value, insertedDomain.id.value);
    assert.equal(result.subDomainId?.value, insertedSubDomain.id.value);
  });
});
