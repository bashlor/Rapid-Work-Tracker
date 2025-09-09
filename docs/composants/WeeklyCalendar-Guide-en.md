# WeeklyCalendar Component - Usage Guide

## Overview

The `WeeklyCalendarView` component displays a weekly calendar of completed work sessions. It allows visualizing sessions by day with colors by domain and details on click.

## Basic Usage

```tsx
import WeeklyCalendarView from '../components/time-tracking/WeeklyCalendarView'

// Simple usage (with mocked data)
<WeeklyCalendarView />

// With custom sessions
<WeeklyCalendarView weeklyTasks={mySessions} />
```

## Data Format

### TimerEntry Structure (input data)
```typescript
interface TimerEntry {
  id: string
  taskId: string
  userId: string
  date: string          // Format: "2025-08-18"
  startTime: string     // Format: "2025-08-18T09:00:00Z"
  endTime: string       // Format: "2025-08-18T11:30:00Z"
  description: string
  domain: string        // Ex: "Software", "Management", "Training"
  subdomain: string     // Ex: "Frontend", "Client", "Course"
}
```

### WeeklyTask Structure (calendar display)
```typescript
interface WeeklyTask {
  id: string
  title: string         // Displayed session name
  description: string
  domain: string
  subdomain: string
  startTime: string     // Format: "09:00"
  endTime: string       // Format: "11:30"
  day: number          // 1=Monday, 2=Tuesday, ..., 5=Friday
  status: 'completed' | 'in-progress' | 'planned' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  sessions?: TaskSession[]
}
```

## Features

### Navigation
- **Previous/Next week**: Navigation buttons
- **Back to today**: "Today" button
- **Display**: Monday to Friday only

### Session Display
- **Colors by domain**:
  - 🔵 Software (blue)
  - 🟣 Management (magenta)
  - 🟠 Training (orange)
  - 🟢 Support (green)
- **Time positioning**: Sessions appear at the correct times
- **Overlaps**: Automatic handling of simultaneous sessions

### Interactions
- **Click on session**: Opens a details panel
- **Click on empty cell**: Can be used to create a new session
- **Hover**: Visual effect on sessions

## Data Transformation

Use the utility function to convert your sessions:

```tsx
import { transformTimerEntriesToWeeklyTasks } from '@/lib/mock_data'

const mySessions: TimerEntry[] = [
  {
    id: 'session-1',
    taskId: 'task-dev',
    userId: 'user-1',
    date: '2025-08-18',
    startTime: '2025-08-18T09:00:00Z',
    endTime: '2025-08-18T11:30:00Z',
    description: 'Component development',
    domain: 'Software',
    subdomain: 'Frontend'
  }
]

const weeklyTasks = transformTimerEntriesToWeeklyTasks(mySessions)
```

## Customization

### Domain Colors
Modify in `utils/calendar_utils.ts`:

```typescript
const DOMAIN_COLORS = {
  'My Domain': { light: '#e0f7fa', main: '#00bcd4' }
}
```

### Display Hours
Default: 8am-6pm. Modify `HOURS` in `calendar_utils.ts`

### Time Format
Uses French format (24h) automatically

## Integration Examples

### Home Page
```tsx
export default function Home() {
  const sessions = getCurrentWeekSessions()
  const weeklyTasks = transformTimerEntriesToWeeklyTasks(sessions)
  
  return (
    <div>
      <h2>My sessions this week</h2>
      <WeeklyCalendarView weeklyTasks={weeklyTasks} />
    </div>
  )
}
```

### Dedicated Page
```tsx
export default function CalendarPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const sessions = getSessionsForWeek(selectedWeek)
  
  return (
    <WeeklyCalendarView weeklyTasks={transformTimerEntriesToWeeklyTasks(sessions)} />
  )
}
```

## Best Practices

1. **Performance**: Data is automatically cached
2. **Accessibility**: Keyboard support and screen readers
3. **Responsive**: Adapts to mobile screens
4. **Errors**: Graceful handling of missing data

## Troubleshooting

### Sessions not displayed
- Check that dates are in the current week
- Ensure time format is correct
- Verify that `day` is between 1 (Monday) and 5 (Friday)

### Positioning issues
- Times must be in "HH:mm" format
- Sessions outside 8am-6pm don't display

### Missing data
- Component has fallback data if no data is provided
- Use debug logs to diagnose
