# {{PROJECT_NAME}}

> {{PROJECT_DESCRIPTION}}

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Database     │
│  (React/Blazor) │     │  (.NET Web API) │     │  (SQL Server)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: React / Blazor WebAssembly / Blazor Server
- **Language**: TypeScript / C#
- **Styling**: Tailwind CSS
- **State**: React Query + Zustand / Blazor State Management

### Backend
- **Framework**: ASP.NET Core Web API
- **Language**: C#
- **Database**: SQL Server / PostgreSQL
- **ORM**: Entity Framework Core

## Project Structure

```
{{PROJECT_NAME}}/
├── src/
│   ├── {{PROJECT_NAME}}.Web/        # Frontend (Blazor or React)
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Services/
│   │   └── wwwroot/
│   ├── {{PROJECT_NAME}}.Api/        # Backend API
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Models/
│   │   └── Program.cs
│   ├── {{PROJECT_NAME}}.Core/       # Domain/Business logic
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── Services/
│   ├── {{PROJECT_NAME}}.Infrastructure/  # Data access, external services
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Migrations/
│   └── {{PROJECT_NAME}}.Shared/     # Shared DTOs/contracts
│       └── DTOs/
├── tests/
│   ├── {{PROJECT_NAME}}.Api.Tests/
│   └── {{PROJECT_NAME}}.Core.Tests/
├── {{PROJECT_NAME}}.sln
├── docker-compose.yml
└── README.md
```

## Commands

### Frontend (if React)
```powershell
Set-Location src/{{PROJECT_NAME}}.Web
npm run dev       # Start dev server (port 3000)
npm run build     # Build for production
npm run test      # Run tests
npm run typecheck # Check TypeScript
```

### Backend (.NET)
```powershell
# Development
dotnet run --project src/{{PROJECT_NAME}}.Api    # Start API server (port 5000)
dotnet watch --project src/{{PROJECT_NAME}}.Api  # Start with hot reload

# Build & Test
dotnet build                                      # Build solution
dotnet test                                       # Run all tests

# Database (Entity Framework)
dotnet ef migrations add MigrationName --project src/{{PROJECT_NAME}}.Infrastructure
dotnet ef database update --project src/{{PROJECT_NAME}}.Infrastructure
```

### Full Stack (via Docker)
```powershell
docker-compose up        # Start all services
docker-compose up -d     # Start in background
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## Development Workflow

### When Working on Frontend
1. Start backend: `dotnet watch --project src/{{PROJECT_NAME}}.Api`
2. Start frontend: `Set-Location src/{{PROJECT_NAME}}.Web; npm run dev` (if React)
3. Access app at http://localhost:3000 (React) or http://localhost:5000 (Blazor)
4. API available at http://localhost:5000

### When Working on Backend
1. Start database: `docker-compose up db`
2. Start backend: `dotnet watch --project src/{{PROJECT_NAME}}.Api`
3. Use Swagger UI at http://localhost:5000/swagger

## Verification Checklist

### Frontend Changes (React)
1. `npm run typecheck` passes
2. `npm run lint` passes
3. `npm test` passes
4. Manual browser testing

### Backend Changes (.NET)
1. `dotnet build` succeeds with no warnings
2. `dotnet test` passes all tests
3. Swagger documentation updated
4. No compiler warnings or errors

### Full Stack Changes
1. All frontend checks pass
2. All backend checks pass
3. Integration tests pass
4. `docker-compose up` works

## API Contract

API endpoints are documented at `http://localhost:5000/swagger` (Swagger UI).

When changing API contracts:
1. Update backend DTOs/models first
2. Update frontend API client types
3. Update frontend consuming components
4. Run integration tests

## File Boundaries

- **Frontend safe**: `/src/{{PROJECT_NAME}}.Web/`
- **Backend safe**: `/src/{{PROJECT_NAME}}.Api/`, `/src/{{PROJECT_NAME}}.Core/`
- **Infrastructure safe**: `/src/{{PROJECT_NAME}}.Infrastructure/`
- **Tests safe**: `/tests/`
- **Never touch**: `*/node_modules/`, `*/bin/`, `*/obj/`, `/.git/`

## Git Policy

**NEVER run these commands:**
- `git commit` - User handles all commits manually
- `git push` - User handles all pushes manually

Claude Code should stage files with `git add` if needed, but leave committing and pushing to the user.
