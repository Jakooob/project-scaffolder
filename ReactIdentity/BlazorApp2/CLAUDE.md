# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands

```bash
# Build the project
dotnet build BlazorApp2/BlazorApp2.csproj

# Run the application (with hot reload)
dotnet watch --project BlazorApp2/BlazorApp2.csproj

# Run without hot reload
dotnet run --project BlazorApp2/BlazorApp2.csproj

# Apply EF Core migrations
dotnet ef database update --project BlazorApp2/BlazorApp2.csproj
```

## Architecture Overview

This is a .NET 10 Blazor Server application with ASP.NET Core Identity for authentication.

### Rendering Model
- Uses Interactive Server rendering mode (`InteractiveServer`)
- The `App.razor` conditionally enables interactive routing based on `HttpContext.AcceptsInteractiveRouting()`
- Pages under `/Account` use static server-side rendering (SSR) for security

### Authentication Architecture
- **ApplicationUser** (`Data/ApplicationUser.cs`): Extends `IdentityUser` for custom user properties
- **ApplicationDbContext** (`Data/ApplicationDbContext.cs`): Identity-enabled DbContext using SQL Server (LocalDB)
- **IdentityRevalidatingAuthenticationStateProvider**: Revalidates user security stamp every 30 minutes on active circuits
- **IdentityRedirectManager**: Handles redirects for unauthenticated users to login
- Identity endpoints mapped via `MapAdditionalIdentityEndpoints()` in `IdentityComponentsEndpointRouteBuilderExtensions.cs`

### Key Directories
- `Components/Pages/`: Main application pages (Home, Counter, Weather, Auth, etc.)
- `Components/Account/Pages/`: Identity pages (Login, Register, password reset, etc.)
- `Components/Account/Pages/Manage/`: User profile management (2FA, passkeys, email, password)
- `Components/Account/Shared/`: Shared identity components (StatusMessage, ManageLayout)
- `Components/Layout/`: Application layout components (MainLayout, NavMenu)
- `Data/`: Entity Framework context and migrations

### Database
- Uses SQL Server LocalDB by default
- Connection string in `appsettings.json` under `DefaultConnection`
- Migrations auto-applied at startup via `db.Database.Migrate()` in `Program.cs`
