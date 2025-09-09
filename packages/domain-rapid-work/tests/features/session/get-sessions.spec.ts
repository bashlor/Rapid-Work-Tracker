import { test } from "@japa/runner";
import { TestContext } from "@japa/runner/core";

import {
  CreateSessionFeature,
} from "../../../core/rapid-work/features/session/CreateSessionFeature";
import { GetSessionsFeature } from "../../../core/rapid-work/features/session/GetSessionsFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockSessionCollection } from "../../mocks/MockSessionCollection";

test.group("GetSessionsFeature", () => {
  test("should return sessions for a user", async (ctx: TestContext) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(
      mockSessionCollection,
    );

    const startDate = "2023-01-01T00:00:00Z"
    const endDate = "2023-01-31T23:59:59Z";

    // Create multiple sessions
    await createSessionFeature.execute({
      description: '',
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: "0198dcbe-9e3c-7d82-9816-f2a1e7ddc5f8",
      userId: TEST_UUIDS.USER_1,
    });
    await createSessionFeature.execute({
      description: '',
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: "0198dcbe-da92-7c2f-a403-ef720220a133",
      userId: TEST_UUIDS.USER_2,
    });
    await createSessionFeature.execute({
      description: '',
      endTime: "2023-01-01T15:00:00Z",
      startTime: "2023-01-01T14:00:00Z",
      taskId: "0198dcbe-f449-7f73-84f7-90e763e04213",
      userId: TEST_UUIDS.USER_1,
    });

    const getSessionsFeature = new GetSessionsFeature(mockSessionCollection);

    // Act
    const result = await getSessionsFeature.execute({ endDate , startDate, userId: TEST_UUIDS.USER_1 });

    // Assert
    ctx.assert.lengthOf(result, 2);
    result.forEach((session) => {
      ctx.assert.equal(session.getUserId().value, TEST_UUIDS.USER_1);
    });
  });

  test("should return empty array for user with no sessions", async (ctx: TestContext) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const getSessionsFeature = new GetSessionsFeature(mockSessionCollection);

    const startDate = "2023-01-01T00:00:00Z"
    const endDate = "2023-01-31T23:59:59Z";

    // Act
    const result = await getSessionsFeature.execute({
      endDate,
      startDate,
      userId: TEST_UUIDS.USER_2
    });

    // Assert
    ctx.assert.lengthOf(result, 0);
  });
});
