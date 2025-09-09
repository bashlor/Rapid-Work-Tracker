import { test } from "@japa/runner";
import { TestContext } from "@japa/runner/core";

import {
  CreateSessionFeature,
  CreateSessionInput,
} from "../../../core/rapid-work/features/session/CreateSessionFeature";
import { TEST_UUIDS } from "../../helpers/uuid-helper";
import { MockSessionCollection } from "../../mocks/MockSessionCollection";

test.group("CreateSessionFeature", () => {
  test("should create a new session", async (ctx: TestContext) => {
    // Arrange
    const mockSessionCollection = new MockSessionCollection();
    const createSessionFeature = new CreateSessionFeature(
      mockSessionCollection,
    );
    const input: CreateSessionInput = {
      description: '',
      endTime: "2023-01-01T11:00:00Z",
      startTime: "2023-01-01T10:00:00Z",
      taskId: TEST_UUIDS.TASK_1,
      userId: TEST_UUIDS.USER_1,
    };

    // Act
    const result = await createSessionFeature.execute(input);

    // Assert
    ctx.assert.isDefined(result);
    ctx.assert.isDefined(result.getId().value);
    ctx.assert.isDefined(result.getStartTime().toISOString());
    ctx.assert.isDefined(result.getEndTime().toISOString());
    ctx.assert.isDefined(result.getDuration().getMinutes());
    
    // Check that the times are approximately correct (ignoring milliseconds format differences)
    ctx.assert.isTrue(result.getStartTime().toISOString().startsWith("2023-01-01T10:00:00"));
    ctx.assert.isTrue(result.getEndTime().toISOString().startsWith("2023-01-01T11:00:00"));

    // Verify it was saved in the collection
    const savedSessions = mockSessionCollection.getAll();
    ctx.assert.lengthOf(savedSessions, 1);
    ctx.assert.equal(savedSessions[0].getId().value, result.getId().value);
  });
});
