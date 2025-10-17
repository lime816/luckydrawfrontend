# Complete .env file fix - merge all split lines
Write-Host "Fixing .env file completely..." -ForegroundColor Cyan

$lines = Get-Content .env
$fixedLines = @()
$i = 0

while ($i -lt $lines.Count) {
    $line = $lines[$i]
    
    # If line starts with a variable name (uppercase with underscores)
    if ($line -match '^[A-Z_]+=') {
        $currentLine = $line
        
        # Check next lines for continuations (lines that don't start with # or variable)
        $j = $i + 1
        while ($j -lt $lines.Count -and 
               $lines[$j] -notmatch '^[A-Z_]+=' -and 
               $lines[$j] -notmatch '^#' -and 
               $lines[$j].Trim() -ne '') {
            # This is a continuation - append it
            $currentLine += $lines[$j].Trim()
            $j++
        }
        
        $fixedLines += $currentLine
        $i = $j
    }
    else {
        # Comment or empty line - keep as is
        $fixedLines += $line
        $i++
    }
}

# Write fixed content
$fixedLines | Set-Content .env

Write-Host "✅ .env file fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying WhatsApp token..." -ForegroundColor Cyan

$token = ($fixedLines | Select-String "REACT_APP_WHATSAPP_ACCESS_TOKEN").ToString().Split('=', 2)[1]
Write-Host "Token length: $($token.Length) characters" -ForegroundColor Green
Write-Host "First 50 chars: $($token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

if ($token.Length -gt 200) {
    Write-Host "✅ Token looks good!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Token might be incomplete or expired" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Please restart your dev server:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor Cyan
