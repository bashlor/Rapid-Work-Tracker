import { test } from "@japa/runner";

import {
  CreateSessionFeature,
  CreateSessionInput,
} from "../../../core/rapid-work/features/session/CreateSessionFeature";
import {
  DeleteSessionFeature,
  DeleteSessionInput,
} from "../../../core/rapid-work/features/session/DeleteSessionFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockSessionCollection } from "../../mocks/MockSessionCollection";

test.group("DeleteSessionFeature", () => {
  test("should delete existing session", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const deleteSessionFeature = new DeleteSessionFeature(mockSessionCollection);

    // Create a session first
    const createInput: CreateSessionInput = {
      description: "Session to delete",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    };
    const createdSession = await createSessionFeature.execute(createInput);

    // Verify session exists
    const initialSessions = mockSessionCollection.getAll();
    assert.lengthOf(initialSessions, 1);

    const deleteInput: DeleteSessionInput = {
      id: createdSession.getId().value,
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await deleteSessionFeature.execute(deleteInput);

    // Assert
    assert.isTrue(result);
    
    // Verify session is deleted
    const remainingSessions = mockSessionCollection.getAll();
    assert.lengthOf(remainingSessions, 0);
  });

  test("should return false when session does not exist", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const deleteSessionFeature = new DeleteSessionFeature(mockSessionCollection);

    const deleteInput: DeleteSessionInput = {
      id: TEST_UUIDS.NON_EXISTENT_SESSION,
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await deleteSessionFeature.execute(deleteInput);

    // Assert
    assert.isFalse(result);
  });

  test("should not delete session belonging to different user", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const deleteSessionFeature = new DeleteSessionFeature(mockSessionCollection);

    // Create a session for USER_1
    const createInput: CreateSessionInput = {
      description: "User 1 session",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    };
    const createdSession = await createSessionFeature.execute(createInput);

    // Try to delete with USER_2
    const deleteInput: DeleteSessionInput = {
      id: createdSession.getId().value,
      userId: TEST_UUIDS.USER_2, // Different user
    };

    // Act
    const result = await deleteSessionFeature.execute(deleteInput);

    // Assert
    assert.isFalse(result);
    
    // Verify session still exists
    const remainingSessions = mockSessionCollection.getAll();
    assert.lengthOf(remainingSessions, 1);
  });
});
