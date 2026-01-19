# {{PROJECT_NAME}}

> {{PROJECT_DESCRIPTION}}

## Tech Stack

- **Framework**: ASP.NET Core 8+ Web API
- **Language**: C# 12+
- **Database**: SQL Server / PostgreSQL
- **ORM**: Entity Framework Core
- **Testing**: xUnit + FluentAssertions + Moq
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
{{PROJECT_NAME}}/
├── src/
│   ├── {{PROJECT_NAME}}.Api/           # Web API layer
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   └── Program.cs
│   ├── {{PROJECT_NAME}}.Core/          # Domain/Business logic
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   └── Exceptions/
│   ├── {{PROJECT_NAME}}.Infrastructure/ # Data access & external services
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Configurations/
│   │   ├── Repositories/
│   │   └── Migrations/
│   └── {{PROJECT_NAME}}.Shared/        # Shared DTOs/contracts
│       └── DTOs/
├── tests/
│   ├── {{PROJECT_NAME}}.Api.Tests/
│   ├── {{PROJECT_NAME}}.Core.Tests/
│   └── {{PROJECT_NAME}}.Integration.Tests/
├── {{PROJECT_NAME}}.sln
└── README.md
```

## Commands

```powershell
# Development
dotnet run --project src/{{PROJECT_NAME}}.Api           # Start API server
dotnet watch --project src/{{PROJECT_NAME}}.Api         # Start with hot reload

# Build
dotnet build                                             # Build entire solution
dotnet publish -c Release                                # Publish for production

# Testing
dotnet test                                              # Run all tests
dotnet test --filter "FullyQualifiedName~UnitTests"     # Run unit tests only
dotnet test --collect:"XPlat Code Coverage"             # Run with coverage

# Database (Entity Framework)
dotnet ef migrations add MigrationName --project src/{{PROJECT_NAME}}.Infrastructure --startup-project src/{{PROJECT_NAME}}.Api
dotnet ef database update --project src/{{PROJECT_NAME}}.Infrastructure --startup-project src/{{PROJECT_NAME}}.Api
dotnet ef migrations script --project src/{{PROJECT_NAME}}.Infrastructure  # Generate SQL script

# Code Quality
dotnet format                                            # Format code
dotnet format --verify-no-changes                        # Check formatting
```

## Code Patterns

### API Endpoints
- Use `[ApiController]` attribute on controllers
- Return `ActionResult<T>` for type-safe responses
- Use proper HTTP status codes (200, 201, 400, 404, 500)
- Include XML documentation for Swagger

### Dependency Injection
- Register services in `Program.cs` using extension methods
- Use constructor injection
- Prefer interfaces over concrete implementations
- Use scoped lifetime for DbContext

### Entity Framework
- Use Fluent API for entity configuration
- Implement Repository pattern for data access
- Use async/await for all database operations
- Include cancellation tokens in async methods

### Error Handling
- Use global exception handling middleware
- Create custom exception types for business errors
- Return ProblemDetails for API errors
- Log exceptions with structured logging

### Validation
- Use FluentValidation or DataAnnotations
- Validate at API boundary
- Return 400 Bad Request with validation errors

## Verification Checklist

Before committing:
1. `dotnet build` succeeds with no warnings
2. `dotnet test` passes all tests
3. `dotnet format --verify-no-changes` passes
4. Swagger documentation is updated

## File Boundaries

- **API safe**: `/src/{{PROJECT_NAME}}.Api/`
- **Core safe**: `/src/{{PROJECT_NAME}}.Core/`
- **Infrastructure safe**: `/src/{{PROJECT_NAME}}.Infrastructure/`
- **Tests safe**: `/tests/`
- **Never touch**: `*/bin/`, `*/obj/`, `/.git/`, `/.vs/`

## Common Tasks

### Adding a New Endpoint
1. Create/update DTO in `Shared/DTOs/`
2. Create service interface in `Core/Interfaces/`
3. Implement service in `Core/Services/`
4. Create controller action in `Api/Controllers/`
5. Add tests in `tests/`

### Adding a Database Entity
1. Create entity class in `Core/Entities/`
2. Add DbSet to `ApplicationDbContext`
3. Create entity configuration in `Infrastructure/Data/Configurations/`
4. Create migration: `dotnet ef migrations add AddEntityName`
5. Update database: `dotnet ef database update`

### Adding a Background Service
1. Create service class inheriting `BackgroundService`
2. Register in `Program.cs` with `AddHostedService<T>()`
3. Implement `ExecuteAsync` method
4. Add appropriate logging and error handling

## Git Policy

**NEVER run these commands:**
- `git commit` - User handles all commits manually
- `git push` - User handles all pushes manually

Claude Code should stage files with `git add` if needed, but leave committing and pushing to the user.
