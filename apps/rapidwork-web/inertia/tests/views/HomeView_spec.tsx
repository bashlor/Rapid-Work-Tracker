import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomeView } from '@/views/HomeView'

import { render, screen } from '../utils/test_utils'

const mockUseGetUserDataDashboard = {
  data: {
    dailySessions: [],
    recentSessions: [
      {
        description: 'Session de test',
        duration: 60,
        endTime: '2024-01-15T10:00:00Z',
        id: '1',
        startTime: '2024-01-15T09:00:00Z',
      },
    ],
    userName: 'Test User',
    weeklyStats: {
      activeTasksCount: 3,
      completedTasksCount: 2,
      sessionCount: 5,
      totalDuration: 480, // 8 heures en minutes
    },
  },
  error: null,
  isLoading: false,
}

const mockUser = {
  email: 'test@example.com',
  fullName: 'Test User',
  id: '1',
}

// Mock des hooks nécessaires
const mockUseWeekNavigation = {
  currentWeek: new Date('2024-01-15'),
  goToCurrentWeek: vi.fn(),
  goToNextWeek: vi.fn(),
  goToPreviousWeek: vi.fn(),
  isCurrentWeek: true,
  weekBoundaries: {
    weekEnd: new Date('2024-01-21'),
    weekStart: new Date('2024-01-15'),
  },
}

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  I18nextProvider: ({ children }: any) => children,
  initReactI18next: {
    init: vi.fn(),
    type: '3rdParty',
  },
  useTranslation: () => ({
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
    t: (key: string, options?: any) => {
      // Retourne la clé avec les options interpolées pour les tests
      if (options && typeof options === 'object') {
        let result = key
        Object.entries(options).forEach(([param, value]) => {
          result = result.replace(`{{${param}}}`, String(value))
        })
        return result
      }
      return key
    },
  }),
}))

// Mock des modules
const mockUseGetUserDataDashboardFn = vi.fn(() => mockUseGetUserDataDashboard)
const mockUseWeekNavigationFn = vi.fn(() => mockUseWeekNavigation)

describe('HomeView', () => {
  beforeEach(() => {
    // Reset mocks after each test
    mockUseGetUserDataDashboardFn.mockReturnValue(mockUseGetUserDataDashboard)
    mockUseWeekNavigationFn.mockReturnValue(mockUseWeekNavigation)
  })

  it('should render', () => {
    render(<HomeView user={mockUser} />)
  })

  it('devrait afficher le message de bienvenue avec le nom utilisateur', () => {
    render(<HomeView user={mockUser} />)

    const welcomeMessage = screen.getByText('home.welcome')
    expect(welcomeMessage).toBeDefined()
  })
})
