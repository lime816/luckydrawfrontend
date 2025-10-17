# Fix .env file - Remove line breaks in WhatsApp token
Write-Host "Fixing .env file..." -ForegroundColor Cyan

# Read file line by line
$lines = Get-Content .env
$newLines = @()
$i = 0

while ($i -lt $lines.Count) {
    $line = $lines[$i]
    
    # Check if this is the WhatsApp token line
    if ($line -match '^REACT_APP_WHATSAPP_ACCESS_TOKEN=') {
        # Start building the token
        $tokenLine = $line
        
        # Check if next lines are continuation (don't start with a variable name)
        $j = $i + 1
        while ($j -lt $lines.Count -and $lines[$j] -notmatch '^[A-Z_]+=') {
            # This is a continuation line
            $tokenLine += $lines[$j].Trim()
            $j++
        }
        
        $newLines += $tokenLine
        $i = $j
        
        Write-Host "✅ Fixed WhatsApp token (length: $($tokenLine.Length) chars)" -ForegroundColor Green
    }
    else {
        $newLines += $line
        $i++
    }
}

# Write back to file
$newLines | Set-Content .env

Write-Host "✅ .env file fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying..." -ForegroundColor Cyan
$token = (Get-Content .env | Select-String "REACT_APP_WHATSAPP_ACCESS_TOKEN").ToString()
Write-Host "Token line: $($token.Substring(0, [Math]::Min(80, $token.Length)))..." -ForegroundColor Gray
Write-Host ""
Write-Host "Please restart your dev server:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor Cyan
