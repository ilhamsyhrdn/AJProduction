<#
Interactive helper to add production environment variables to Vercel.

Run this script locally from the project folder after you have logged in with
`vercel login` and linked the project with `vercel link`.

This script will call `vercel env add <NAME> production` for each required
variable. When CLI prompts for the value, paste the secret value from your
password manager. The script DOES NOT store secrets in the repository.

Usage:
  Open PowerShell in the project folder and run:
    .\scripts\add-vercel-env.ps1
#>

Write-Host "This script will add production env vars to your linked Vercel project." -ForegroundColor Cyan
Write-Host "Make sure you ran: vercel login  AND  vercel link" -ForegroundColor Yellow
Write-Host "When prompted by the CLI for a value, paste the secret (it won't be saved to disk)." -ForegroundColor Yellow

function Add-EnvInteractive($name) {
    Write-Host "\nAdding environment variable: $name (production)" -ForegroundColor Green
    Write-Host "When the Vercel CLI asks for \"Value:\" paste the secret and press Enter." -ForegroundColor DarkYellow
    & vercel env add $name production
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to add $name. Please run the command manually: vercel env add $name production" -ForegroundColor Red
    }
}

# Recommended list (edit if you want to skip some)
$vars = @(
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'AUTH_TRUST_HOST',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_API_URL'
)

foreach ($v in $vars) { Add-EnvInteractive $v }

Write-Host "\nDone. Verify with: vercel env ls" -ForegroundColor Cyan
