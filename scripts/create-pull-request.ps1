# Creates a fork (if needed), pushes feature branch, opens PR to greenblat17/dvig.
# Requires: gh auth login (once)

$ErrorActionPreference = "Stop"
$gh = if (Get-Command gh -ErrorAction SilentlyContinue) { "gh" } else { "$env:TEMP\gh-cli\bin\gh.exe" }

if (-not (Test-Path $gh) -and $gh -ne "gh") {
  Write-Host "Install GitHub CLI: winget install GitHub.cli"
  exit 1
}

Set-Location (Split-Path $PSScriptRoot -Parent)

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: gh auth login"
  exit 1
}

$upstream = "greenblat17/dvig"
$branch = "feature/dark-purple-theme"

Write-Host "Forking $upstream (if needed)..."
& $gh repo fork $upstream --clone=false --remote=false 2>&1 | Out-Null

$login = (& $gh api user -q .login).Trim()
$fork = "$login/dvig"

git remote remove fork 2>$null
git remote add fork "https://github.com/$fork.git"

Write-Host "Pushing $branch to $fork..."
git push -u fork $branch

Write-Host "Creating pull request..."
& $gh pr create `
  --repo $upstream `
  --head "$login`:$branch" `
  --base main `
  --title "Dark purple theme (marketing deck palette)" `
  --body @"
## Summary
- Apply dark purple/black UI inspired by the marketing presentation (#000000, #8064A2, #DDBAFF).
- Epic-style glass panels, gradients, and Raleway typography on landing and app screens.

## Test plan
- [ ] Open https://dvig-sigma.vercel.app after merge (or preview deploy)
- [ ] Check landing page and /app on mobile width
- [ ] Verify category filters and event cards readability
"@

Write-Host "Done."
