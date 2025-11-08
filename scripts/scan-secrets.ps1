<#
Quick repo secret scanner (PowerShell).

Usage: run this from the repository root. It will search all files except the .git
directory for common secret patterns: Google client secret prefix (GOCSPX),
MongoDB URI hints, NEXTAUTH_SECRET-like base64 strings, and any plain occurrences
of 'AJ1964' (your previously used admin password). Edit patterns as needed.

This script does not send anything externally; it prints matches locally so you
can decide what to rotate and remove.
#>

Write-Host "Running quick secret scan (local only)" -ForegroundColor Cyan

$exclude = @('.git','node_modules')

function Get-FilesRecursive {
    param($path)
    Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        foreach ($e in $exclude) { if ($_.FullName -like "*$e*") { return $false } }
        return $true
    }
}

$patterns = @{
    'Google client secret (GOCSPX...)' = 'GOCSPX[0-9A-Za-z_-]{10,}'
    'MongoDB URI hint' = 'mongodb(\+srv)?://[^\s]+'
    'Base64-like secret (NEXTAUTH_SECRET)' = '\b[A-Za-z0-9\+/]{20,}={0,2}\b'
    'Admin password literal (AJ1964)' = 'AJ1964'
}

$files = Get-FilesRecursive -path '.'

$found = $false
foreach ($kv in $patterns.GetEnumerator()) {
    $name = $kv.Key
    $pat = $kv.Value
    Write-Host "\nSearching for: $name -> pattern: $pat" -ForegroundColor Yellow
    $matches = Select-String -Pattern $pat -Path $files -AllMatches -Quiet:$false -ErrorAction SilentlyContinue
    if ($matches) {
        $found = $true
        Write-Host "Matches for $name:" -ForegroundColor Red
        $matches | ForEach-Object {
            Write-Host "  File: $($_.Path)  Line: $($_.LineNumber)" -ForegroundColor Magenta
            Write-Host "    => $($_.Line.Trim())" -ForegroundColor White
        }
    } else {
        Write-Host "  No matches found." -ForegroundColor Green
    }
}

if (-not $found) { Write-Host "\nNo likely secrets found by quick patterns." -ForegroundColor Green }
else { Write-Host "\nIf secrets found, rotate them immediately and consider removing from history." -ForegroundColor Red }
