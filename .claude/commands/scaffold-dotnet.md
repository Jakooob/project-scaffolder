# Quick .NET API Project Scaffold

Quickly scaffold a new .NET Web API project with Claude Code configuration.

## Arguments

$ARGUMENTS should contain: `<project-name> [target-directory]`

## Process

### 1. Create Solution and Projects

```powershell
New-Item -ItemType Directory -Name $PROJECT_NAME
Set-Location $PROJECT_NAME

# Create solution
dotnet new sln -n $PROJECT_NAME

# Create projects
dotnet new webapi -n "$PROJECT_NAME.Api" -o "src/$PROJECT_NAME.Api"
dotnet new classlib -n "$PROJECT_NAME.Core" -o "src/$PROJECT_NAME.Core"
dotnet new classlib -n "$PROJECT_NAME.Infrastructure" -o "src/$PROJECT_NAME.Infrastructure"
dotnet new classlib -n "$PROJECT_NAME.Shared" -o "src/$PROJECT_NAME.Shared"

# Create test projects
dotnet new xunit -n "$PROJECT_NAME.Api.Tests" -o "tests/$PROJECT_NAME.Api.Tests"
dotnet new xunit -n "$PROJECT_NAME.Core.Tests" -o "tests/$PROJECT_NAME.Core.Tests"

# Add projects to solution
dotnet sln add "src/$PROJECT_NAME.Api"
dotnet sln add "src/$PROJECT_NAME.Core"
dotnet sln add "src/$PROJECT_NAME.Infrastructure"
dotnet sln add "src/$PROJECT_NAME.Shared"
dotnet sln add "tests/$PROJECT_NAME.Api.Tests"
dotnet sln add "tests/$PROJECT_NAME.Core.Tests"

# Add project references
dotnet add "src/$PROJECT_NAME.Api" reference "src/$PROJECT_NAME.Core"
dotnet add "src/$PROJECT_NAME.Api" reference "src/$PROJECT_NAME.Infrastructure"
dotnet add "src/$PROJECT_NAME.Api" reference "src/$PROJECT_NAME.Shared"
dotnet add "src/$PROJECT_NAME.Core" reference "src/$PROJECT_NAME.Shared"
dotnet add "src/$PROJECT_NAME.Infrastructure" reference "src/$PROJECT_NAME.Core"
dotnet add "tests/$PROJECT_NAME.Api.Tests" reference "src/$PROJECT_NAME.Api"
dotnet add "tests/$PROJECT_NAME.Core.Tests" reference "src/$PROJECT_NAME.Core"
```

### 2. Add Common NuGet Packages

```powershell
# Core packages
dotnet add "src/$PROJECT_NAME.Infrastructure" package Microsoft.EntityFrameworkCore.SqlServer
dotnet add "src/$PROJECT_NAME.Infrastructure" package Microsoft.EntityFrameworkCore.Design

# Testing packages
dotnet add "tests/$PROJECT_NAME.Api.Tests" package FluentAssertions
dotnet add "tests/$PROJECT_NAME.Api.Tests" package Moq
dotnet add "tests/$PROJECT_NAME.Core.Tests" package FluentAssertions
dotnet add "tests/$PROJECT_NAME.Core.Tests" package Moq
```

### 3. Create Basic Project Structure

**src/$PROJECT_NAME.Core/Entities/** - Domain entities
**src/$PROJECT_NAME.Core/Interfaces/** - Service and repository interfaces
**src/$PROJECT_NAME.Core/Services/** - Business logic implementations
**src/$PROJECT_NAME.Infrastructure/Data/** - DbContext and configurations
**src/$PROJECT_NAME.Infrastructure/Repositories/** - Repository implementations
**src/$PROJECT_NAME.Shared/DTOs/** - Data transfer objects

### 4. Create DbContext

**src/$PROJECT_NAME.Infrastructure/Data/ApplicationDbContext.cs**:
```csharp
using Microsoft.EntityFrameworkCore;

namespace $PROJECT_NAME.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

### 5. Configure Program.cs

Update **src/$PROJECT_NAME.Api/Program.cs** to include:
- DbContext registration
- Swagger configuration
- Service registrations

### 6. Generate CLAUDE.md

Use the `dotnet-api.md` template from `/templates/claude-md/`. Customize for:
- Actual project name
- Database provider (SQL Server/PostgreSQL)
- Additional configurations

### 7. Create Slash Commands

Create `.claude/commands/` with:
- **add-endpoint.md** - Add a new API endpoint
- **add-entity.md** - Add a new EF Core entity
- **add-migration.md** - Create a new EF migration
- **test.md** - Run tests with coverage

### 8. Verify

1. Run `dotnet build`
2. Run `dotnet test`
3. Start server: `dotnet run --project src/$PROJECT_NAME.Api`
4. Check https://localhost:5001/swagger

### Output

Summarize what was created and provide next steps.
