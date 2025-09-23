import { Link, usePage } from '@inertiajs/react'
import { CalendarIcon, Clock, Pause, Play, Save, Square, Undo2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTimer } from '@/contexts/TimerContext'
import { useWorkSession } from '@/contexts/WorkSessionContext'
import { getRouteByPath, getTitleByPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { format } from '@/utils/datetime'

type AppHeaderProps = {
  children?: React.ReactNode
}

const AppHeader = ({ children }: AppHeaderProps) => {
  const { formatElapsedTime, pauseTimer, resumeTimer, state, stopTimer } = useTimer()
  const isTimerActive = state.status === 'running' || state.status === 'paused'
  const page = usePage()
  const currentPath = page.url.split('?')[0] // Garde le path complet

  // État local pour forcer le re-rendu du titre
  const [, forceUpdate] = useState({})

  // Utilise les fonctions centralisées
  const currentRoute = getRouteByPath(currentPath)
  const viewTitle = getTitleByPath(currentPath)

  // Détection de la page sessions
  const isSessionsPage = currentPath.includes('/sessions')

  // Force le re-rendu quand le path change
  useEffect(() => {
    forceUpdate({})
  }, [currentPath])

  // Hook pour les sessions de travail - toujours appelé mais seulement utilisé si nécessaire
  let workSessionContext = null
  let hasWorkSessionProvider = false
  
  try {
    workSessionContext = useWorkSession()
    hasWorkSessionProvider = true
  } catch (error) {
    // Le contexte n'est pas disponible, on continue sans
    hasWorkSessionProvider = false
  }

  return (
    <div className="border-b border-border h-16 p-4 bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {currentRoute?.icon && <currentRoute.icon className="text-primary" size={24} />}
          <h1 className="text-xl font-semibold">{viewTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Bouton "Nouvelle saisie" - redirige vers les sessions si timer inactif */}
          {!isSessionsPage && (
            <Link
              className={cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isTimerActive
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500 hover:bg-gray-300'
                  : 'cursor-pointer hover:no-underline bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              href={isTimerActive ? '#' : '/app/sessions'}
              onClick={isTimerActive ? (e) => e.preventDefault() : undefined}
              title={
                isTimerActive ? 'Arrêtez le chronomètre pour créer une nouvelle saisie' : undefined
              }
            >
              <CalendarIcon size={16} />
              Nouvelle saisie
            </Link>
          )}

          {/* Bouton "Ajouter session" pour la page sessions */}
          {isSessionsPage && workSessionContext && (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isTimerActive}
              onClick={() => {
                const newSession = workSessionContext.createEmptySession()
                workSessionContext.setSessions(prev => [...prev, newSession])
                workSessionContext.setHasUnsavedChanges(true)
              }}
              size="sm"
              title={isTimerActive ? 'Arrêtez le chronomètre pour ajouter une session' : undefined}
            >
              <CalendarIcon className="mr-2" size={16} />
              Nouvelle session
            </Button>
          )}

          {/* Contrôles spéciaux pour la page des sessions de travail */}
          {isSessionsPage && workSessionContext && (
            <div className="flex items-center gap-3">
              {/* Sélecteur de date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      'justify-start text-left font-normal min-w-[140px] hover:bg-blue-50 hover:border-blue-300',
                      !workSessionContext.selectedDate && 'text-muted-foreground'
                    )}
                    size="sm"
                    variant="outline"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                    {workSessionContext.selectedDate ? (
                      format(workSessionContext.selectedDate, 'dd/MM/yyyy')
                    ) : (
                      <span>Date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto p-0 bg-white shadow-xl border border-gray-200 rounded-lg"
                  side="bottom"
                  sideOffset={8}
                  style={{ zIndex: 9999 }}
                >
                  <Calendar
                    className="rounded-lg"
                    disabled={(date) => {
                      return date > new Date() || date < new Date('2020-01-01')
                    }}
                    mode="single"
                    onSelect={(date) => {
                      if (date) {
                        workSessionContext.handleDateChange(date)
                      }
                      console.groupEnd()
                    }}
                    selected={workSessionContext.selectedDate}
                  />
                </PopoverContent>
              </Popover>

              {/* Bouton de sauvegarde globale */}
              <Button
                className={cn(
                  'bg-green-600 hover:bg-green-700 text-white',
                  !workSessionContext.hasUnsavedChanges &&
                    'bg-gray-300 hover:bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
                disabled={!workSessionContext.hasUnsavedChanges}
                onClick={workSessionContext.handleGlobalSave}
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder tout
                {workSessionContext.hasUnsavedChanges && (
                  <span className="ml-2 h-2 w-2 bg-orange-400 rounded-full animate-pulse" />
                )}
              </Button>

              {/* Bouton d'annulation globale */}
              <Button
                className={cn(
                  'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400',
                  !workSessionContext.hasUnsavedChanges &&
                    'border-gray-300 text-gray-400 hover:bg-gray-50 hover:border-gray-300 cursor-not-allowed'
                )}
                disabled={!workSessionContext.hasUnsavedChanges}
                onClick={workSessionContext.handleCancelAll}
                size="sm"
                variant="outline"
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Annuler tout
              </Button>
            </div>
          )}

          {/* Affichage du chronomètre si actif */}
          {isTimerActive && (
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
                  state.status === 'running'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <Clock size={16} />
                <span className="font-medium">{state.currentTaskName}</span>
                <span className="text-sm text-muted-foreground">
                  ({state.currentDomain} / {state.currentSubdomain})
                </span>
                <span className="font-mono">{formatElapsedTime(state.elapsed)}</span>
                <span className="text-xs ml-1">
                  {state.status === 'paused' ? '(en pause)' : ''}
                </span>
              </div>

              {/* Contrôles du timer */}
              <div className="flex items-center gap-1">
                {state.status === 'running' && (
                  <Button
                    className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                    onClick={pauseTimer}
                    size="sm"
                    title="Mettre en pause"
                    variant="outline"
                  >
                    <Pause size={14} />
                  </Button>
                )}

                {state.status === 'paused' && (
                  <Button
                    className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white border-green-500"
                    onClick={resumeTimer}
                    size="sm"
                    title="Reprendre"
                    variant="outline"
                  >
                    <Play size={14} />
                  </Button>
                )}

                <Button
                  className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                  onClick={stopTimer}
                  size="sm"
                  title="Arrêter"
                  variant="outline"
                >
                  <Square size={14} />
                </Button>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AppHeader
