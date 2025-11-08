# Print exact callback URIs for this project (PowerShell)
# Usage: run from repo root: .\scripts\print-callbacks.ps1

$repoRoot = Get-Location
Write-Output "Repo root: $repoRoot"

# Read NEXTAUTH_URL from .env.local if exists
$envLocal = Join-Path $repoRoot '.env.local'
if (Test-Path $envLocal) {
    Write-Output "Found .env.local"
    $lines = Get-Content $envLocal | Where-Object { $_ -match "^\s*NEXTAUTH_URL\s*=\s*" }
    if ($lines) {
        foreach ($l in $lines) {
            $val = $l -replace "^\s*NEXTAUTH_URL\s*=\s*", ''
            Write-Output "NEXTAUTH_URL (from .env.local): $val"
            Write-Output "Local callback URI: $val/api/auth/callback/google"
        }
    } else {
        Write-Output "No NEXTAUTH_URL in .env.local"
    }
} else {
    Write-Output ".env.local not found"
}

Write-Output "\n-- Suggested redirect URIs to add in Google Cloud Console --"
Write-Output "Local (if testing locally): http://localhost:3001/api/auth/callback/google"
Write-Output "Production (replace with your Vercel URL): https://<your-vercel-url>.vercel.app/api/auth/callback/google"
Write-Output "Preview (optional): https://<your-preview-url>.vercel.app/api/auth/callback/google"

Write-Output "\nNotes:"
Write-Output " - Make sure the redirect URI you add matches exactly (protocol, domain, path, port)."
Write-Output " - After updating Google Console, update Vercel env NEXTAUTH_URL and redeploy."
