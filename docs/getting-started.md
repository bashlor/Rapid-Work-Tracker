# 🚀 Getting Started

This guide will help you set up and run Rapid Work Tracker in your development environment.

## Prerequisites

- Node.js 24+ and pnpm
- PostgreSQL database
- Docker (for deployment)

## Development Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd rapid-work-tracker-monorepo
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment setup
```bash
# Copy environment file
cp apps/rapidwork-web/.env.example apps/rapidwork-web/.env

# Configure your database and other settings
```

### 4. Database migration
```bash
cd apps/rapidwork-web
node ace migration:run
```

### 5. Start development server
```bash
# From root directory
pnpm dev
```

The application will be available at `http://localhost:3333`

## ⚠️ Workaround Required: Tuyau Type Generation

**Important**: Due to the custom project structure (controllers in `app/core/*/controllers/` instead of standard `app/controllers/`), you need to apply a workaround for Tuyau type generation to work correctly.

### Problem

Tuyau expects controllers in the standard AdonisJS location, but this architecture uses:
- `app/core/auth/controllers/`
- `app/core/main/controllers/app/`
- `app/core/main/controllers/landing/`

### Required Workaround

After each `pnpm install`, you must apply the Tuyau workaround:

1. **Locate the Tuyau file**:
   ```bash
   # Find the exact path (version may vary)
   find node_modules -name "generate.js" -path "*/tuyau/core/build/commands/*"
   ```

2. **Apply the workaround**: Follow the detailed instructions in [`workarounds/tuyau/README.md`](../workarounds/tuyau/README.md)

3. **Verify it works**:
   ```bash
   cd apps/rapidwork-web
   node ace tuyau:generate
   ```

   You should see success messages without any "Unable to find controller file" warnings.

### Future Improvement

Consider creating an automated script to apply this workaround automatically after `pnpm install`.

## Next Steps

- [📚 Architecture Overview](./architecture.md)
- [🛠️ Development Guide](./development.md)
- [🚀 Deployment Guide](./deployment-guide.md)
- [🧪 Testing Guide](./testing.md)
