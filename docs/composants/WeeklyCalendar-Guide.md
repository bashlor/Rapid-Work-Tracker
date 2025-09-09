# Guide d'utilisation - Composant WeeklyCalendar

## Vue d'ensemble

Le composant `WeeklyCalendarView` affiche un calendrier hebdomadaire des sessions de travail réalisées. Il permet de visualiser les sessions par jour avec des couleurs par domaine et des détails sur clic.

## Utilisation de base

```tsx
import WeeklyCalendarView from '../components/time-tracking/WeeklyCalendarView'

// Utilisation simple (avec données mockées)
<WeeklyCalendarView />

// Avec des sessions personnalisées
<WeeklyCalendarView weeklyTasks={mesSessions} />
```

## Format des données

### Structure TimerEntry (données d'entrée)
```typescript
interface TimerEntry {
  id: string
  taskId: string
  userId: string
  date: string          // Format: "2025-08-18"
  startTime: string     // Format: "2025-08-18T09:00:00Z"
  endTime: string       // Format: "2025-08-18T11:30:00Z"
  description: string
  domain: string        // Ex: "Logiciel", "Gestion", "Formation"
  subdomain: string     // Ex: "Frontend", "Client", "Cours"
}
```

### Structure WeeklyTask (affichage calendrier)
```typescript
interface WeeklyTask {
  id: string
  title: string         // Nom affiché de la session
  description: string
  domain: string
  subdomain: string
  startTime: string     // Format: "09:00"
  endTime: string       // Format: "11:30"
  day: number          // 1=Lundi, 2=Mardi, ..., 5=Vendredi
  status: 'completed' | 'in-progress' | 'planned' | 'cancelled'
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
  sessions?: TaskSession[]
}
```

## Fonctionnalités

### Navigation
- **Semaine précédente/suivante** : Boutons de navigation
- **Retour à aujourd'hui** : Bouton "Aujourd'hui"
- **Affichage** : Lundi à Vendredi seulement

### Affichage des sessions
- **Couleurs par domaine** :
  - 🔵 Logiciel (bleu)
  - 🟣 Gestion (magenta)
  - 🟠 Formation (orange)
  - 🟢 Support (vert)
- **Positionnement temporel** : Les sessions apparaissent aux bonnes heures
- **Chevauchements** : Gestion automatique des sessions simultanées

### Interactions
- **Clic sur session** : Ouvre un panneau de détails
- **Clic sur cellule vide** : Peut être utilisé pour créer une nouvelle session
- **Survol** : Effet visuel sur les sessions

## Transformation des données

Utilisez la fonction utilitaire pour convertir vos sessions :

```tsx
import { transformTimerEntriesToWeeklyTasks } from '@/lib/mock_data'

const mesSessions: TimerEntry[] = [
  {
    id: 'session-1',
    taskId: 'task-dev',
    userId: 'user-1',
    date: '2025-08-18',
    startTime: '2025-08-18T09:00:00Z',
    endTime: '2025-08-18T11:30:00Z',
    description: 'Développement composants',
    domain: 'Logiciel',
    subdomain: 'Frontend'
  }
]

const weeklyTasks = transformTimerEntriesToWeeklyTasks(mesSessions)
```

## Personnalisation

### Couleurs des domaines
Modifiez dans `utils/calendar_utils.ts` :

```typescript
const DOMAIN_COLORS = {
  'Mon Domaine': { light: '#e0f7fa', main: '#00bcd4' }
}
```

### Heures d'affichage
Par défaut : 8h-18h. Modifiez `HOURS` dans `calendar_utils.ts`

### Format des heures
Utilise le format français (24h) automatiquement

## Exemples d'intégration

### Page d'accueil
```tsx
export default function Home() {
  const sessions = getCurrentWeekSessions()
  const weeklyTasks = transformTimerEntriesToWeeklyTasks(sessions)
  
  return (
    <div>
      <h2>Mes sessions de la semaine</h2>
      <WeeklyCalendarView weeklyTasks={weeklyTasks} />
    </div>
  )
}
```

### Page dédiée
```tsx
export default function CalendarPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const sessions = getSessionsForWeek(selectedWeek)
  
  return (
    <WeeklyCalendarView weeklyTasks={transformTimerEntriesToWeeklyTasks(sessions)} />
  )
}
```

## Bonnes pratiques

1. **Performance** : Les données sont mises en cache automatiquement
2. **Accessibilité** : Support du clavier et lecteurs d'écran
3. **Responsive** : S'adapte aux écrans mobiles
4. **Erreurs** : Gestion gracieuse des données manquantes

## Dépannage

### Sessions non affichées
- Vérifiez que les dates sont dans la semaine courante
- Assurez-vous que le format des heures est correct
- Contrôlez que `day` est entre 1 (lundi) et 5 (vendredi)

### Problèmes de positionnement
- Les heures doivent être au format "HH:mm"
- Les sessions en dehors de 8h-18h ne s'affichent pas

### Données manquantes
- Le composant a des données de fallback si aucune donnée n'est fournie
- Utilisez les logs de debug pour diagnostiquer
