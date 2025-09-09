import { DateTime } from '../../../../kernel/datetime.js'
import { Id } from '../../../../kernel/id.js'
import { DomainCollection } from '../../collections/DomainCollection.js'
import { SessionCollection } from '../../collections/SessionCollection.js'
import { SubDomainCollection } from '../../collections/SubDomainCollection.js'
import { TaskCollection } from '../../collections/TaskCollection.js'
import { UserCollection } from '../../collections/UserCollection.js'
import { Domain } from '../../entities/domain/Domain.js'
import { Session } from '../../entities/session/Session.js'
import { SubDomain } from '../../entities/subdomain/SubDomain.js'
import { Task } from '../../entities/task/Task.js'
import { DailySessionData, TaskWithDetails, UserDataDashboardWeekReport, WeeklyStats } from '../../value-objects/UserDataDashboardWeekReport.js'
import { Feature } from '../Feature.js'

export interface GetUserDataDashboardInput {
  currentDate: string // ISO date string
  userId: string
}

export class GetUserDataDashboardFeature implements Feature<GetUserDataDashboardInput, UserDataDashboardWeekReport> {
  constructor(
    private readonly sessionCollection: SessionCollection,
    private readonly taskCollection: TaskCollection,
    private readonly domainCollection: DomainCollection,
    private readonly subDomainCollection: SubDomainCollection,
    private readonly userCollection: UserCollection
  ) {}

  async execute(input: GetUserDataDashboardInput): Promise<UserDataDashboardWeekReport> {
    const userId = new Id(input.userId)
    const currentDate = new DateTime(input.currentDate)
    
    // Get user information
    const user = await this.userCollection.findById(userId)
    if (!user) {
      throw new Error(`User with id ${input.userId} not found`)
    }
    const userName = user.fullName.value
    
    // Calculate week boundaries (Monday to Sunday) using DateTime for consistency
    const { weekEnd, weekStart } = this.getWeekBoundaries(currentDate)
    
    // Get all sessions for the week
    const weekSessions = await this.sessionCollection.getAllBetweenDates(
      userId,
      weekStart,
      weekEnd
    )
    
    // Get all tasks for the user
    const userTasks = await this.taskCollection.getAllByUserId(userId)
    
    // Get domains and subdomains
    const domains = await this.domainCollection.getAllByUserId(userId)
    
    // Get all subdomains for all user's domains
    const subDomains: SubDomain[] = []
    for (const domain of domains) {
      const domainSubDomains = await this.subDomainCollection.getAllByDomainId(userId, domain.id)
      subDomains.push(...domainSubDomains)
    }
    
    // Calculate weekly stats
    const weeklyStats = this.calculateWeeklyStats(weekSessions, userTasks)
    
    // Group sessions by day
    const dailySessions = this.groupSessionsByDay(weekSessions, weekStart)
    
    // Get active tasks with details
    const activeTasks = await this.getActiveTasksWithDetails(
      userTasks.filter(t => t.status && t.status.value !== 'completed'),
      weekSessions,
      domains,
      subDomains
    )
    
    // Get recent sessions (last 5) - Fixed: use getTime() which is available in DateTime
    const recentSessions = weekSessions
      .sort((a, b) => b.getStartTime().getTime() - a.getStartTime().getTime())
      .slice(0, 5)
    
    return new UserDataDashboardWeekReport(
      input.userId,
      userName,
      weekStart.getValue(), // Convert DateTime to Date
      weekEnd.getValue(),   // Convert DateTime to Date
      weeklyStats,
      dailySessions,
      activeTasks,
      recentSessions,
      userTasks,  // Pass tasks for relation enrichment
      domains,    // Pass domains for relation enrichment
      subDomains  // Pass subdomains for relation enrichment
    )
  }
  
  private calculateWeeklyStats(sessions: Session[], tasks: Task[]): WeeklyStats {
    const totalDuration = sessions.reduce((sum, s) => sum + s.getDuration().getMinutes(), 0)
    const sessionCount = sessions.length
    const completedTasksCount = tasks.filter(t => t.status && t.status.value === 'completed').length
    const activeTasksCount = tasks.filter(t => t.status && t.status.value === 'in_progress').length
    const averageSessionDuration = sessionCount > 0 ? totalDuration / sessionCount : 0
    
    return {
      activeTasksCount,
      averageSessionDuration: Math.round(averageSessionDuration), // Already in minutes
      completedTasksCount,
      sessionCount,
      totalDuration: Math.round(totalDuration) // Already in minutes
    }
  }
  
  private async getActiveTasksWithDetails(
    tasks: Task[],
    sessions: Session[],
    domains: Domain[],
    subDomains: SubDomain[]
  ): Promise<TaskWithDetails[]> {
    return tasks.map(task => {
      const taskSessions = sessions.filter(s => s.getTaskId().value === task.id.value)
      const totalDuration = taskSessions.reduce((sum, s) => sum + s.getDuration().getMinutes(), 0)
      
      const domain = task.domainId 
        ? domains.find(d => d.id.value === task.domainId?.value)
        : undefined
        
      const subDomain = task.subDomainId
        ? subDomains.find(sd => sd.id.value === task.subDomainId?.value)
        : undefined
      
      return {
        domain,
        sessionsCount: taskSessions.length,
        subDomain,
        task,
        totalDuration: Math.round(totalDuration) // Already in minutes, no need to divide by 60000
      }
    })
  }
  
  private getWeekBoundaries(date: DateTime): { weekEnd: DateTime; weekStart: DateTime; } {
    // Get the start of the week (Monday)
    const currentDayOfWeek = date.getValue().getDay() // 0 = Sunday, 1 = Monday, ...
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1 // Adjust Sunday to be 6 days from Monday
    
    const weekStart = date.startOfDay().addDays(-daysFromMonday)
    const weekEnd = weekStart.addDays(6).endOfDay()
    
    return { weekEnd, weekStart }
  }
  
  private groupSessionsByDay(sessions: Session[], weekStart: DateTime): DailySessionData[] {
    const dailyData: DailySessionData[] = []
    
    for (let i = 0; i < 7; i++) {
      const currentDay = weekStart.addDays(i)
      const dayString = currentDay.toString().split('T')[0] // Get YYYY-MM-DD format
      
      const daySessions = sessions.filter(s => {
        return s.getStartTime().isSameDay(currentDay)
      })
      
      const totalDuration = daySessions.reduce((sum, s) => sum + s.getDuration().getMinutes(), 0)
      
      dailyData.push({
        date: dayString,
        sessions: daySessions,
        totalDuration: Math.round(totalDuration) // Already in minutes, no need to divide by 60000
      })
    }
    
    return dailyData
  }
}
