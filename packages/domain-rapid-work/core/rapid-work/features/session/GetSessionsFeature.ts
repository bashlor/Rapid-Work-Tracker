export interface GetSessionsInput {
  endDate: string;
  startDate: string;
  taskId?: string;
  userId: string;
}
import { DateTime } from "../../../../kernel/datetime";
import { Id } from "../../../../kernel/id";
import { SessionCollection } from "../../collections/SessionCollection";
import { Session } from "../../entities/session/Session";
import { Feature } from "../Feature";

export class GetSessionsFeature
  implements Feature<GetSessionsInput, Session[]>
{
  constructor(private readonly sessionCollection: SessionCollection) {}

  async execute(input: GetSessionsInput): Promise<Session[]> {
    const userIdObj = new Id(input.userId);
    if (input.taskId) {
      return this.sessionCollection.getAllByTaskId(userIdObj,new Id(input.taskId));
    }
    if (input.startDate && input.endDate) {
      const startDate = DateTime.fromISOString(input.startDate);
      const endDate = DateTime.fromISOString(input.endDate);
      return this.sessionCollection.getAllBetweenDates(userIdObj, startDate, endDate);
    }
    return this.sessionCollection.getAllByUserId(userIdObj);
  }
}