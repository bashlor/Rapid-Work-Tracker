import { DateTime } from "../../../../kernel/datetime";
import { Id } from "../../../../kernel/id";
import { DomainCollection } from "../../collections/DomainCollection";
import { SessionCollection } from "../../collections/SessionCollection";
import { SubDomainCollection } from "../../collections/SubDomainCollection";
import { TaskCollection } from "../../collections/TaskCollection";
import { Session } from "../../entities/session/Session";
import { Feature } from "../Feature";

export interface DomainSummary {
  domainId: string;
  domainName: string;
  sessionCount: number;
  totalDuration: number;
}

export interface GetSessionsReportParams {
  endDate: Date;
  startDate: Date;
  userId: string;
}

export interface SessionReport {
  domainSummary: DomainSummary[];
  sessions: Session[];
  subDomainSummary: SubDomainSummary[];
  taskSummary: TaskSummary[];
  totalDuration: number;
}

export interface SubDomainSummary {
  domainId: string;
  domainName: string;
  sessionCount: number;
  subDomainId: string;
  subDomainName: string;
  totalDuration: number;
}

export interface TaskSummary {
  sessionCount: number;
  taskId: string;
  taskTitle: string;
  totalDuration: number;
}

export class GetSessionsReportFeature
  implements Feature<GetSessionsReportParams, SessionReport>
{
  private domainCollection: DomainCollection;
  private sessionCollection: SessionCollection;
  private subDomainCollection: SubDomainCollection;
  private taskCollection: TaskCollection;

  constructor(
    sessionCollection: SessionCollection,
    taskCollection: TaskCollection,
    domainCollection: DomainCollection,
    subDomainCollection: SubDomainCollection,
  ) {
    this.sessionCollection = sessionCollection;
    this.taskCollection = taskCollection;
    this.domainCollection = domainCollection;
    this.subDomainCollection = subDomainCollection;
  }

  async execute(params: GetSessionsReportParams): Promise<SessionReport> {
    const { endDate, startDate, userId } = params;
    const userIdVO = new Id(userId);
    const startVO = new DateTime(startDate);
    const endVO = new DateTime(endDate);

    // Get all the user's sessions
    const allSessions = await this.sessionCollection.getAllByUserId(
      userIdVO
    );

    // Filter sessions by date range (utilisation correcte des DateTime)
    const filteredSessions = allSessions.filter((session) => {
      const sessionStart = session.getStartTime();
      const sessionEnd = session.getEndTime();
      
      return (
        (sessionStart.isAfter(startVO) || sessionStart.equals(startVO)) &&
        (sessionEnd.isBefore(endVO) || sessionEnd.equals(endVO))
      );
    });

    // Calculate total duration across all sessions
    const totalDuration = filteredSessions.reduce((total, session) => {
      return total + session.getDuration().getMinutes();
    }, 0);

    // Create task summary
    const taskMap = new Map<string, TaskSummary>();
    for (const session of filteredSessions) {
      const task = await this.taskCollection.getById(userIdVO, session.getTaskId());
      if (!task) continue;

      const taskIdStr = session.getTaskId().value;
      if (!taskMap.has(taskIdStr)) {
        taskMap.set(taskIdStr, {
          sessionCount: 0,
          taskId: taskIdStr,
          taskTitle: task.title.value,
          totalDuration: 0,
        });
      }
      const summary = taskMap.get(taskIdStr)!;
      summary.totalDuration += session.getDuration().getMinutes();
      summary.sessionCount += 1;
    }

    // Create domain summary
    const domainMap = new Map<string, DomainSummary>();
    const subDomainMap = new Map<string, SubDomainSummary>();

    for (const session of filteredSessions) {
      const task = await this.taskCollection.getById(userIdVO, session.getTaskId());
      if (!task) continue;

      // Handle domain-level tasks
      if (task.domainId) {
        const domain = await this.domainCollection.getById(
          userIdVO,
          task.domainId,
        );
        if (!domain) continue;
        const domainIdStr = domain.id.value;
        if (!domainMap.has(domainIdStr)) {
          domainMap.set(domainIdStr, {
            domainId: domainIdStr,
            domainName: domain.name.value,
            sessionCount: 0,
            totalDuration: 0,
          });
        }
        const summary = domainMap.get(domainIdStr)!;
        summary.totalDuration += session.getDuration().getMinutes();
        summary.sessionCount += 1;
      }

      // Handle subdomain-level tasks
      if (task.subDomainId) {
        const subDomain = await this.subDomainCollection.getById(
          userIdVO,
          task.subDomainId,
        );
        if (!subDomain) continue;
        const domain = await this.domainCollection.getById(
          userIdVO,
          subDomain.domainId,
        );
        if (!domain) continue;
        const subDomainIdStr = subDomain.id.value;
        if (!subDomainMap.has(subDomainIdStr)) {
          subDomainMap.set(subDomainIdStr, {
            domainId: domain.id.value,
            domainName: domain.name.value,
            sessionCount: 0,
            subDomainId: subDomainIdStr,
            subDomainName: subDomain.name.value,
            totalDuration: 0,
          });
        }
        const summary = subDomainMap.get(subDomainIdStr)!;
        summary.totalDuration += session.getDuration().getMinutes();
        summary.sessionCount += 1;
      }
    }

    return {
      domainSummary: Array.from(domainMap.values()),
      sessions: filteredSessions,
      subDomainSummary: Array.from(subDomainMap.values()),
      taskSummary: Array.from(taskMap.values()),
      totalDuration,
    };
  }
}
