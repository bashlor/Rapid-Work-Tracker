import { test } from "@japa/runner";

import {
  CreateSessionFeature,
  CreateSessionInput,
} from "../../../core/rapid-work/features/session/CreateSessionFeature";
import {
  UpdateSessionFeature,
  UpdateSessionInput,
} from "../../../core/rapid-work/features/session/UpdateSessionFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockSessionCollection } from "../../mocks/MockSessionCollection";

test.group("UpdateSessionFeature", () => {
  test("should update session description", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const updateSessionFeature = new UpdateSessionFeature(mockSessionCollection);

    // Create a session first
    const createInput: CreateSessionInput = {
      description: "Initial description",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    };
    const createdSession = await createSessionFeature.execute(createInput);

    const updateInput: UpdateSessionInput = {
      description: "Updated description",
      id: createdSession.getId().value,
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await updateSessionFeature.execute(updateInput);

    // Assert
    assert.isDefined(result);
    assert.equal(result.getDescription().value, "Updated description");
    assert.equal(result.getId().value, createdSession.getId().value);
  });

  test("should update session end time", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const updateSessionFeature = new UpdateSessionFeature(mockSessionCollection);

    // Create a session first
    const createInput: CreateSessionInput = {
      description: "Test session",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    };
    const createdSession = await createSessionFeature.execute(createInput);

    const updateInput: UpdateSessionInput = {
      endTime: "2023-01-01T12:00:00Z", // Extend by 1 hour
      id: createdSession.getId().value,
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await updateSessionFeature.execute(updateInput);

    // Assert
    assert.isDefined(result);
    assert.equal(result.getId().value, createdSession.getId().value);
    assert.equal(result.getDuration().getMinutes(), 120); // 2 hours = 120 minutes
  });

  test("should throw error when session not found", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const updateSessionFeature = new UpdateSessionFeature(mockSessionCollection);

    const updateInput: UpdateSessionInput = {
      description: "Updated description",
      id: TEST_UUIDS.NON_EXISTENT_SESSION,
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(
      () => updateSessionFeature.execute(updateInput),
      "Session not found"
    );
  });

  test("should throw error when updating with invalid end time", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const updateSessionFeature = new UpdateSessionFeature(mockSessionCollection);

    // Create a session first
    const createInput: CreateSessionInput = {
      description: "Test session",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    };
    const createdSession = await createSessionFeature.execute(createInput);

    const updateInput: UpdateSessionInput = {
      endTime: "2023-01-01T09:30:00Z", // Before start time
      id: createdSession.getId().value,
      userId: TEST_UUIDS.USER_1,
    };

    // Act & Assert
    await assert.rejects(() => updateSessionFeature.execute(updateInput));
  });
});
