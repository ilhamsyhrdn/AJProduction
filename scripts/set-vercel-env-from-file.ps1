<##
  set-vercel-env-from-file.ps1

  Usage (local machine):
    1) Create a JSON file on your machine (example: C:\temp\ajprod-secrets.json)
    2) Fill it with your secrets (see README in script header)
    3) Run after logging into Vercel and linking the project:
       powershell -ExecutionPolicy Bypass -File .\scripts\set-vercel-env-from-file.ps1 -SecretsFile 'C:\temp\ajprod-secrets.json'

  Security notes:
    - This script DOES NOT commit or upload your secrets to the repository.
    - Keep the JSON file local and delete it after use.
    - Do not paste secrets into chat or commit them into git.
##>

param(
  [string]$SecretsFile = "$PSScriptRoot\..\..\..\temp\ajprod-secrets.json"
)

if (-not (Test-Path $SecretsFile)) {
  Write-Error "Secrets file not found: $SecretsFile"
  exit 2
}

try {
  $json = Get-Content -Raw -Path $SecretsFile | ConvertFrom-Json
} catch {
  Write-Error "Failed to read/parse secrets JSON: $_"
  exit 3
}

function Add-Env($name, $value) {
  if (-not $value) {
    Write-Host "Skipping $name (no value)" -ForegroundColor Yellow
    return
  }

  Write-Host "Adding $name to Vercel (production)..." -ForegroundColor Cyan
  try {
    # Pipe the value so vercel CLI receives it non-interactively
    $value | vercel env add $name production
    if ($LASTEXITCODE -ne 0) {
      Write-Host "vercel env add returned exit code $LASTEXITCODE for $name. Try interactive or dashboard UI." -ForegroundColor Red
    } else {
      Write-Host "$name added." -ForegroundColor Green
    }
  } catch {
    Write-Host "Exception while adding $name: $_" -ForegroundColor Red
  }
}

# Order matters slightly: DB first, auth secrets, then public URLs
Add-Env 'MONGODB_URI' $json.MONGODB_URI
Add-Env 'NEXTAUTH_SECRET' $json.NEXTAUTH_SECRET
Add-Env 'AUTH_TRUST_HOST' $json.AUTH_TRUST_HOST
Add-Env 'GOOGLE_CLIENT_ID' $json.GOOGLE_CLIENT_ID
Add-Env 'GOOGLE_CLIENT_SECRET' $json.GOOGLE_CLIENT_SECRET
Add-Env 'NEXTAUTH_URL' $json.NEXTAUTH_URL
Add-Env 'NEXT_PUBLIC_API_URL' $json.NEXT_PUBLIC_API_URL

Write-Host "`nDone. Verify with: vercel env ls" -ForegroundColor Cyan

Write-Host "Reminder: delete the secrets file if you no longer need it:" -ForegroundColor Yellow
Write-Host "  Remove-Item '$SecretsFile' -Force" -ForegroundColor Yellow
