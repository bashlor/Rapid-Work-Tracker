import { test } from "@japa/runner";

import {
  CreateSessionFeature,
} from "../../../core/rapid-work/features/session/CreateSessionFeature";
import {
  GetSessionsByDateFeature,
  GetSessionsByDateInput,
} from "../../../core/rapid-work/features/session/GetSessionsByDateFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockSessionCollection } from "../../mocks/MockSessionCollection";

test.group("GetSessionsByDateFeature", () => {
  test("should return sessions for specific date", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const getSessionsByDateFeature = new GetSessionsByDateFeature(mockSessionCollection);

    // Create sessions on different dates
    await createSessionFeature.execute({
      description: "Session on 2023-01-01",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    });

    await createSessionFeature.execute({
      description: "Another session on 2023-01-01",
      endTime: "2023-01-01T15:00:00Z",
      startTime: "2023-01-01T14:00:00Z",
      taskId: TEST_UUIDS.TASK_2,
      userId: TEST_UUIDS.USER_1,
    });

    await createSessionFeature.execute({
      description: "Session on 2023-01-02",
      endTime: "2023-01-02T11:00:00Z",
      startTime: "2023-01-02T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    });

    const input: GetSessionsByDateInput = {
      date: "2023-01-01",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await getSessionsByDateFeature.execute(input);

    // Assert
    assert.lengthOf(result, 2);
    result.forEach((session) => {
      assert.equal(session.getUserId().value, TEST_UUIDS.USER_1);
      // Verify all sessions are from the requested date
      const sessionDate = session.getStartTime().toString().split('T')[0];
      assert.equal(sessionDate, "2023-01-01");
    });
  });

  test("should return empty array for date with no sessions", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const getSessionsByDateFeature = new GetSessionsByDateFeature(mockSessionCollection);

    // Create a session on a different date
    await createSessionFeature.execute({
      description: "Session on 2023-01-01",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    });

    const input: GetSessionsByDateInput = {
      date: "2023-01-02", // Different date
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await getSessionsByDateFeature.execute(input);

    // Assert
    assert.lengthOf(result, 0);
  });

  test("should only return sessions for specified user", async ({ assert }) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(mockSessionCollection);
    const getSessionsByDateFeature = new GetSessionsByDateFeature(mockSessionCollection);

    // Create sessions for different users on the same date
    await createSessionFeature.execute({
      description: "User 1 session",
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    });

    await createSessionFeature.execute({
      description: "User 2 session",
      endTime: "2023-01-01T15:00:00Z",
      startTime: "2023-01-01T14:00:00Z",
      taskId: TEST_UUIDS.TASK_2,
      userId: TEST_UUIDS.USER_2,
    });

    const input: GetSessionsByDateInput = {
      date: "2023-01-01",
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await getSessionsByDateFeature.execute(input);

    // Assert
    assert.lengthOf(result, 1);
    assert.equal(result[0].getUserId().value, TEST_UUIDS.USER_1);
  });
});
