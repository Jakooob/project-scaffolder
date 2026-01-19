---
name: project-setup
description: Set up new Claude Code projects with CLAUDE.md, slash commands, and proper structure
---

# Project Setup Skill

## When to Use This Skill

Activate this skill when:
- User asks to "set up a new project"
- User asks to "create a CLAUDE.md"
- User asks to "initialize Claude Code" for a project
- User asks to "scaffold" a project
- User wants to add Claude Code support to existing code

Do NOT use for:
- General coding questions
- Editing existing CLAUDE.md (see optimize-claude-md skill)
- Running or testing projects

## Prerequisites

- Write access to target directory
- For existing projects: ability to read config files (package.json, *.csproj, *.sln, etc.)

## Instructions

### Step 1: Determine Project Type

Analyze the target directory:

```powershell
# Check for .NET/C#
if (Test-Path *.sln, *.csproj) { Write-Host ".NET project" }

# Check for Node.js/TypeScript
if (Test-Path package.json) { Write-Host "Node.js project" }

# Check for Go
if (Test-Path go.mod) { Write-Host "Go project" }

# Check for Rust
if (Test-Path Cargo.toml) { Write-Host "Rust project" }
```

If no config files exist, ask the user what type of project they want to create.

### Step 2: Gather Project Information

For **new projects**, ask:
1. Project name
2. Project description
3. Primary language/framework
4. Any special requirements

For **existing projects**, extract from:
- README.md (description)
- Package config (dependencies, scripts)
- Existing folder structure

### Step 3: Generate CLAUDE.md

Use the appropriate template:
- React/TypeScript → `/templates/claude-md/react-typescript.md`
- .NET API → `/templates/claude-md/dotnet-api.md`
- Full Stack → `/templates/claude-md/fullstack.md`
- Other → `/templates/claude-md/minimal.md`

Fill in all `{{PLACEHOLDER}}` values with actual project information.

### Step 4: Create Slash Commands

Set up `.claude/commands/` with useful commands:

**Essential commands:**
- `review.md` - Code review
- `test-and-commit.md` - Quality check and commit

Copy from `/templates/commands/` and customize.

### Step 5: Verify Setup

1. Ensure CLAUDE.md is valid markdown
2. Check that referenced commands/paths exist
3. Test that any scripts are executable

### Step 6: Provide Next Steps

Tell the user:
1. How to use the generated configuration
2. How to customize further
3. Recommended MCP servers for their stack

## Examples

### Example 1: New React Project

**User says:** "Set up a new React TypeScript project called my-app"

**Actions:**
1. Create `my-app/` directory
2. Run `npm create vite@latest . -- --template react-ts`
3. Generate CLAUDE.md from react-typescript template
4. Create `.claude/commands/` with review.md and test-and-commit.md

**Result:**
```
my-app/
├── CLAUDE.md
├── .claude/
│   └── commands/
│       ├── review.md
│       └── test-and-commit.md
├── src/
├── package.json
└── ...
```

### Example 2: Existing .NET Project

**User says:** "Add Claude Code support to my ASP.NET Core project"

**Actions:**
1. Read existing *.csproj and *.sln files
2. Analyze project structure
3. Generate CLAUDE.md tailored to ASP.NET Core
4. Add relevant slash commands

## Verification

After setup is complete:

1. **Read CLAUDE.md** - Ensure it's coherent and accurate
2. **Check commands** - Verify slash commands are recognized
3. **Test a command** - Try `/project:review` or similar
4. **Run verification** - Execute any verification commands listed

## Reference Files

- Templates: `/templates/claude-md/`
- Command templates: `/templates/commands/`
- Best practices: `/docs/best-practices.md`
