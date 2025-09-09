import { test } from "@japa/runner";

import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import { TaskStatus } from "../../../core/rapid-work/entities/task/TaskStatus";
import {
  CreateTaskFeature,
  CreateTaskParams,
} from "../../../core/rapid-work/features/task/CreateTaskFeature";
import {
  DeleteTaskFeature,
  DeleteTaskParams,
} from "../../../core/rapid-work/features/task/DeleteTaskFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";
import { MockTaskCollection } from "../../mocks/MockTaskCollection";

test.group("DeleteTaskFeature", () => {
  test("should delete existing task", async ({ assert }) => {
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
    const deleteTaskFeature = new DeleteTaskFeature(mockTaskCollection);

    // Create a task first
    const createParams: CreateTaskParams = {
      description: "This task will be deleted",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "Task to delete",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    // Verify task exists
    const initialTasks = mockTaskCollection.getAll();
    assert.lengthOf(initialTasks, 1);

    const deleteParams: DeleteTaskParams = {
      taskId: createdTask.id.value,
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await deleteTaskFeature.execute(deleteParams);

    // Assert
    assert.isTrue(result);
    
    // Verify task is deleted
    const remainingTasks = mockTaskCollection.getAll();
    assert.lengthOf(remainingTasks, 0);
  });

  test("should throw error when task does not exist", async ({ assert }) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const deleteTaskFeature = new DeleteTaskFeature(mockTaskCollection);

    const deleteParams: DeleteTaskParams = {
      taskId: TEST_UUIDS.NON_EXISTENT_TASK,
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(() => deleteTaskFeature.execute(deleteParams));
  });

  test("should throw error when trying to delete task belonging to different user", async ({ assert }) => {
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
    const deleteTaskFeature = new DeleteTaskFeature(mockTaskCollection);

    // Create a task for USER_1
    const createParams: CreateTaskParams = {
      description: "This belongs to user 1",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create("pending"),
      title: "User 1 task",
      userId: TEST_UUIDS.USER_1,
    };
    const createdTask = await createTaskFeature.execute(createParams);

    // Try to delete with USER_2
    const deleteParams: DeleteTaskParams = {
      taskId: createdTask.id.value,
      userId: TEST_UUIDS.USER_2, // Different user
    };

    // Act & Assert - Should throw error because task not found for USER_2
    await assert.rejects(() => deleteTaskFeature.execute(deleteParams));
    
    // Verify task still exists
    const remainingTasks = mockTaskCollection.getAll();
    assert.lengthOf(remainingTasks, 1);
  });
});
