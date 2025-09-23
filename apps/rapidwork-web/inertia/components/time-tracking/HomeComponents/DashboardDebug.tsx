import React from 'react'

import { format } from '@/utils/datetime'

interface DashboardDebugProps {
  dashboardData: any
}

export default function DashboardDebug({ dashboardData }: DashboardDebugProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Debug - Données du dashboard</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Utilisateur:</strong> {dashboardData.userName} (ID: {dashboardData.userId})
        </div>
        <div>
          <strong>Période:</strong>{' '}
          {format(new Date(dashboardData.weekStartDate), 'dd/MM/yyyy')} -{' '}
          {format(new Date(dashboardData.weekEndDate), 'dd/MM/yyyy')}
        </div>
        <div>
          <strong>Stats semaine:</strong>{' '}
          {JSON.stringify(dashboardData.weeklyStats || {})}
        </div>
        <div>
          <strong>Sessions par jour:</strong>{' '}
          {dashboardData.dailySessions
            .map((d: any) => `${d.date}: ${d.sessions.length} sessions`)
            .join(', ')}
        </div>
      </div>
    </div>
  )
}
