# Fix GitHub Issue

Analyze and fix a GitHub issue end-to-end.

## Arguments

$ARGUMENTS should contain: `<issue-number>`

## Process

### Step 1: Fetch Issue Details

```powershell
gh issue view $ISSUE_NUMBER
```

Read and understand:
- Issue title and description
- Labels and priority
- Any linked PRs or related issues
- Comments and discussion

### Step 2: Analyze the Problem

1. Identify the core problem being reported
2. Determine if it's a bug, feature, or enhancement
3. Assess complexity and scope
4. Identify files likely to be affected

### Step 3: Search the Codebase

Find relevant code:
```powershell
# Search for related files
Select-String -Path "src\*" -Pattern "relevant_keyword" -Recurse
# Find related tests
Get-ChildItem -Recurse -Filter "*test*" | Where-Object { $_.FullName -match "relevant" }
```

### Step 4: Create a Plan

Before coding, think through:
1. Root cause (for bugs) or implementation approach (for features)
2. Files that need modification
3. Tests that need to be written or updated
4. Potential side effects

Share the plan and wait for confirmation before proceeding.

### Step 5: Implement the Fix

1. Make changes incrementally
2. Run tests after each significant change
3. Verify the fix addresses the issue

### Step 6: Write/Update Tests

1. Add tests that would have caught this issue
2. Ensure existing tests still pass
3. Add edge case tests if applicable

### Step 7: Verify Everything

Run the full verification suite:
```powershell
# For JavaScript/TypeScript
npm run lint
npm run typecheck
npm test

# For .NET/C#
dotnet build
dotnet test
dotnet format --verify-no-changes
```

### Step 8: Create Commit

Create a commit with a message referencing the issue:
```
fix: <brief description>

Fixes #<issue-number>

<optional detailed explanation>
```

### Step 9: Create Pull Request

```powershell
git push -u origin "fix/issue-$ISSUE_NUMBER"
gh pr create --title "Fix #$ISSUE_NUMBER`: <title>" --body "Fixes #$ISSUE_NUMBER

## Changes
- <list of changes>

## Testing
- <how it was tested>
"
```

### Output

Provide a summary:
- What was the issue
- What was the root cause
- What changes were made
- Link to the PR
