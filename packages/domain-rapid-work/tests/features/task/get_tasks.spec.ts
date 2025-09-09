/**
import { test } from "@japa/runner";
import { GetTasksFeature } from "../../../core/rapid-work/features/task/GetTasksFeature";
import { MockTaskCollection } from "../../mocks/MockTaskCollection";
import { MockDomainCollection } from "../../mocks/MockDomainCollection";
import { MockSubDomainCollection } from "../../mocks/MockSubDomainCollection";
import {
  CreateTaskFeature,
  CreateTaskParams,
} from "../../../core/rapid-work/features/task/CreateTaskFeature";
import { DomainBuilder } from "../../../core/rapid-work/entities/domain/DomainBuilder";
import { TaskStatus, TaskStatusEnumValues } from "../../../core/rapid-work/entities/task/TaskStatus";

test.group("GetTasksFeature", () => {
  test("should return all tasks", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const mockDomainCollection = new MockDomainCollection();
    const mockSubDomainCollection = new MockSubDomainCollection();

    // Create domain and tasks
    const domain = new DomainBuilder()
      .withUserId("0198dc97-ace6-75ef-8489-19036840f44e")
      .withName("Web Development")
      .build();
    const insertedDomain = await mockDomainCollection.insert(domain);

    const createTaskFeature = new CreateTaskFeature(
      mockTaskCollection,
      mockDomainCollection,
      mockSubDomainCollection,
    );

    // Create multiple tasks
    await createTaskFeature.execute({
      userId: "0198dc97-ace6-75ef-8489-19036840f44e",
      title: "Task 1",
      description: "First task description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create(TaskStatusEnumValues.Pending),
    });
    await createTaskFeature.execute({
      userId: "0198dca4-def8-728e-86f1-6be758c5b663",
      title: "Task 2",
      description: "Second task description",
      domainId: insertedDomain.id.value,
      status: TaskStatus.create(TaskStatusEnumValues.Pending),
    });

    const getTasksFeature = new GetTasksFeature(mockTaskCollection);

    // Act
    const result = await getTasksFeature.execute();

    // Assert
    assert.lengthOf(result, 2);
    assert.equal(result[0].title.value, "Task 1");
    assert.equal(result[1].title.value, "Task 2");
  });

  test("should return empty array when no tasks exist", async ({assert}) => {
    // Arrange
    const mockTaskCollection = new MockTaskCollection();
    const getTasksFeature = new GetTasksFeature(mockTaskCollection);

    // Act
    const result = await getTasksFeature.execute();

    // Assert
    assert.lengthOf(result, 0);
  });
});
**/