# 🏗️ Architecture

Rapid Work Tracker is built using a modern, scalable architecture with clear separation of concerns.

## 🏗️ Project Structure

```
rapid-work-tracker-monorepo/
├── apps/
│   └── rapidwork-web/          # Main AdonisJS application
│       ├── app/                # Backend logic (controllers, models, etc.)
│       ├── inertia/            # React frontend components
│       ├── database/           # Migrations and seeders  
│       └── config/             # Application configuration
├── packages/
│   └── domain-rapid-work/      # Core domain logic
├── docs/                       # Documentation and guides
├── docker-compose.prod.yml     # Production deployment
└── .gitlab-ci.yml             # CI/CD pipeline
```

## Apps and Packages

- `rapidwork-web`: Main [AdonisJS](https://adonisjs.com/) application with [Inertia.js](https://inertiajs.com/) and React frontend
- `domain-rapid-work`: Core domain logic and business rules package
- `docs`: Documentation and guides for the project

## Core Technologies

- **Backend**: [AdonisJS 6](https://adonisjs.com/) with TypeScript
- **Frontend**: [React](https://reactjs.org/) with [Inertia.js](https://inertiajs.com/)
- **Database**: PostgreSQL with Lucid ORM
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Authentication**: Session-based with middleware
- **Deployment**: Docker containers with automatic versioning

## Domain-Driven Design

The project follows Domain-Driven Design principles with:

- **Core Domain Logic**: Isolated in the `domain-rapid-work` package
- **Application Layer**: Controllers and services in the AdonisJS app
- **Infrastructure Layer**: Database repositories and external services
- **Presentation Layer**: React components with Inertia.js

## Key Architectural Decisions

1. **Monorepo Structure**: Enables code sharing and consistent tooling across packages
2. **Domain Package**: Core business logic is framework-agnostic and reusable
3. **Inertia.js**: Provides SPA-like experience without API complexity
4. **TypeScript**: Full type safety across the entire stack
5. **Docker**: Consistent deployment and development environments
