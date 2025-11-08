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

function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }

function Get-SecretValue($name) {
    # 1) If there's an environment variable already set locally, use it
    if ($env:$name) {
        return $env:$name
    }

    # 2) Provide sensible default for auth-trust-host
    if ($name -eq 'AUTH_TRUST_HOST') { return 'true' }

    # 3) Prompt the user securely
    Write-Warn "No local environment variable found for '$name'. You will be prompted to enter the value now (input hidden)."
    $secure = Read-Host -Prompt "Enter value for $name" -AsSecureString
    if (-not $secure) { return $null }
    # Convert SecureString to plain text for piping to vercel. We do this only in memory.
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringUni($ptr) } finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    return $plain
}

function Add-EnvSmart($name) {
    Write-Host "\nProcessing $name..." -ForegroundColor Cyan
    $value = Get-SecretValue $name
    if (-not $value) {
        Write-Host "Skipping $name (no value provided)." -ForegroundColor DarkYellow
        return
    }

    # Pipe the value to vercel env add so the CLI receives it non-interactively.
    try {
        $value | vercel env add $name production
        if ($LASTEXITCODE -ne 0) {
            Write-Host "vercel env add failed for $name (exit code $LASTEXITCODE). Try running: vercel env add $name production" -ForegroundColor Red
        } else {
            Write-Host "$name added successfully." -ForegroundColor Green
        }
    } catch {
        Write-Host "Exception while adding $name: $_" -ForegroundColor Red
    }
}

foreach ($v in $vars) { Add-EnvSmart $v }

Write-Host "\nDone. Verify with: vercel env ls" -ForegroundColor Cyan
