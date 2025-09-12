Write-Host "Checking for Git installation..." -ForegroundColor Yellow

$gitInstalled = $null
try {
    $gitInstalled = Get-Command git -ErrorAction SilentlyContinue
} catch {
    $gitInstalled = $null
}

if ($null -eq $gitInstalled) {
    Write-Host "Git is not installed. Installing Git using winget..." -ForegroundColor Yellow
    try {
        winget install --id Git.Git -e --source winget
        Write-Host "Git has been installed. Please restart PowerShell and try again." -ForegroundColor Green
        Write-Host "After restarting, run: cd D:/11new09/buyer-lead-intake; git init" -ForegroundColor Cyan
    } catch {
        Write-Host "Failed to install Git using winget. Please install Git manually from https://git-scm.com/download/win" -ForegroundColor Red
    }
} else {
    Write-Host "Git is already installed at: $($gitInstalled.Source)" -ForegroundColor Green
    
    # Initialize git repository
    cd D:/11new09/buyer-lead-intake
    git init
    git add .
    git config --global user.email "user@example.com"
    git config --global user.name "Your Name"
    git commit -m "Initial commit: Buyer Lead Intake application"
    
    Write-Host "`nGit repository initialized successfully!" -ForegroundColor Green
    Write-Host "`nTo push to GitHub, create a new repository at https://github.com/new" -ForegroundColor Yellow
    Write-Host "Then run the following commands:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/yourusername/buyer-lead-intake.git" -ForegroundColor Cyan
    Write-Host "git branch -M main" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor Cyan
}