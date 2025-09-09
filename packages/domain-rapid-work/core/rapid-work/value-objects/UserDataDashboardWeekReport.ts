import { Domain } from "../entities/domain/Domain";
import { Session } from "../entities/session/Session";
import { SubDomain } from "../entities/subdomain/SubDomain";
import { Task } from "../entities/task/Task";

export interface DailySessionData {
  date: string;
  sessions: Session[];
  totalDuration: number; // in minutes
}

export interface SessionWithRelations {
  description: string;
  duration: number; // in minutes
  endTime: string;
  id: string;
  startTime: string;
  task?: {
    description: string;
    domain?: {
      id: string;
      name: string;
    };
    id: string;
    status: string;
    subdomain?: {
      id: string;
      name: string;
    };
    title: string;
  };
  taskId: string;
  userId: string;
}

export interface TaskWithDetails {
  domain?: Domain;
  sessionsCount: number;
  subDomain?: SubDomain;
  task: Task;
  totalDuration: number; // in minutes
}

export interface WeeklyStats {
  activeTasksCount: number;
  averageSessionDuration: number; // in minutes
  completedTasksCount: number;
  sessionCount: number;
  totalDuration: number; // in minutes
}

export class UserDataDashboardWeekReport {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly weekStartDate: Date,
    public readonly weekEndDate: Date,
    public readonly weeklyStats: WeeklyStats,
    public readonly dailySessions: DailySessionData[],
    public readonly activeTasks: TaskWithDetails[],
    public readonly recentSessions: Session[],
    private readonly tasks: Task[] = [],
    private readonly domains: Domain[] = [],
    private readonly subDomains: SubDomain[] = []
  ) {}

  public toJSON() {
    return {
      activeTasks: this.activeTasks.map(item => ({
        domain: item.domain ? {
          id: item.domain.id.value,
          name: item.domain.name.value
        } : undefined,
        sessionsCount: item.sessionsCount,
        subDomain: item.subDomain ? {
          id: item.subDomain.id.value,
          name: item.subDomain.name.value
        } : undefined,
        task: {
          createdAt: item.task.createdAt.toISOString(),
          description: item.task.description.value,
          domainId: item.task.domainId?.value || null,
          id: item.task.id.value,
          status: item.task.status.value,
          subDomainId: item.task.subDomainId?.value || null,
          title: item.task.title.value,
          userId: item.task.userId.value
        },
        totalDuration: item.totalDuration
      })),
      dailySessions: this.dailySessions.map(day => ({
        date: day.date,
        sessions: day.sessions.map(s => this.enrichSessionWithRelations(s)),
        totalDuration: day.totalDuration
      })),
      recentSessions: this.recentSessions.map(s => this.enrichSessionWithRelations(s)),
      userId: this.userId,
      userName: this.userName,
      weekEndDate: this.weekEndDate.toISOString(),
      weeklyStats: this.weeklyStats,
      weekStartDate: this.weekStartDate.toISOString()
    };
  }

  private enrichSessionWithRelations(session: Session): SessionWithRelations {
    const task = this.tasks.find(t => t.id.value === session.getTaskId().value);
    
    let taskData: SessionWithRelations['task'] | undefined;
    if (task) {
      const domain = task.domainId 
        ? this.domains.find(d => d.id.value === task.domainId?.value)
        : undefined;
        
      const subdomain = task.subDomainId
        ? this.subDomains.find(sd => sd.id.value === task.subDomainId?.value)
        : undefined;

      taskData = {
        description: task.description.value,
        domain: domain ? {
          id: domain.id.value,
          name: domain.name.value
        } : undefined,
        id: task.id.value,
        status: task.status.value,
        subdomain: subdomain ? {
          id: subdomain.id.value,
          name: subdomain.name.value
        } : undefined,
        title: task.title.value
      };
    }

    return {
      description: session.getDescription().value,
      duration: session.getDuration().getMinutes(), // Convert to minutes
      endTime: session.getEndTime().toISOString(),
      id: session.getId().value,
      startTime: session.getStartTime().toISOString(),
      task: taskData,
      taskId: session.getTaskId().value,
      userId: session.getUserId().value
    };
  }
}
