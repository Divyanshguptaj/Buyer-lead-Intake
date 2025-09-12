# This script will help prepare your project for GitHub upload without requiring git in PATH

# Define the project path
$projectPath = "D:/11new09/buyer-lead-intake"

Write-Host "Preparing your project for GitHub upload..." -ForegroundColor Yellow

# Instructions for manual steps after PowerShell restart
Write-Host "`nSince Git was just installed, you need to restart PowerShell." -ForegroundColor Cyan
Write-Host "After restarting, follow these steps:" -ForegroundColor Cyan
Write-Host "`n1. Open a new PowerShell window" -ForegroundColor White
Write-Host "2. Navigate to your project:" -ForegroundColor White
Write-Host "   cd $projectPath" -ForegroundColor Green
Write-Host "`n3. Initialize the Git repository:" -ForegroundColor White
Write-Host "   git init" -ForegroundColor Green
Write-Host "   git add ." -ForegroundColor Green
Write-Host "   git config --global user.email ""your.email@example.com""" -ForegroundColor Green
Write-Host "   git config --global user.name ""Your Name""" -ForegroundColor Green
Write-Host "   git commit -m ""Initial commit: Buyer Lead Intake application""" -ForegroundColor Green
Write-Host "`n4. Create a new repository on GitHub:" -ForegroundColor White
Write-Host "   Visit: https://github.com/new" -ForegroundColor Green
Write-Host "   Repository name: buyer-lead-intake" -ForegroundColor Green
Write-Host "   Description: A Next.js application for managing buyer leads with filtering and CSV import/export" -ForegroundColor Green
Write-Host "   Choose Public or Private" -ForegroundColor Green
Write-Host "   Do NOT initialize with README, .gitignore, or license (we already have these files)" -ForegroundColor Green
Write-Host "`n5. Connect and push to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/buyer-lead-intake.git" -ForegroundColor Green
Write-Host "   git branch -M main" -ForegroundColor Green
Write-Host "   git push -u origin main" -ForegroundColor Green

Write-Host "`nNote: Replace YOUR-USERNAME with your actual GitHub username." -ForegroundColor Yellow
Write-Host "If you prefer to use SSH instead of HTTPS, use the SSH URL provided by GitHub." -ForegroundColor Yellow

Write-Host "`nInstallation Note: You'll need to restart PowerShell to use Git commands." -ForegroundColor Magenta