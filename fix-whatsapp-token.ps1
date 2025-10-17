# Fix WhatsApp Access Token in .env file
Write-Host "Fixing WhatsApp Access Token..." -ForegroundColor Cyan

# Read .env file
$envContent = Get-Content .env -Raw

# Check if token is split across lines
if ($envContent -match 'REACT_APP_WHATSAPP_ACCESS_TOKEN=([^\r\n]+)[\r\n]+([^\r\n=]+)') {
    Write-Host "⚠️  Token is split across multiple lines - fixing..." -ForegroundColor Yellow
    
    # Extract the token parts
    $part1 = $matches[1]
    $part2 = $matches[2]
    $fullToken = $part1 + $part2
    
    Write-Host "Token length: $($fullToken.Length) characters" -ForegroundColor Cyan
    
    # Replace in content
    $envContent = $envContent -replace "REACT_APP_WHATSAPP_ACCESS_TOKEN=[^\r\n]+[\r\n]+[^\r\n=]+", "REACT_APP_WHATSAPP_ACCESS_TOKEN=$fullToken"
    
    # Write back
    Set-Content -Path .env -Value $envContent -NoNewline
    
    Write-Host "✅ Token fixed and saved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New token (first 50 chars): $($fullToken.Substring(0, [Math]::Min(50, $fullToken.Length)))..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please restart your dev server:" -ForegroundColor Yellow
    Write-Host "  npm start" -ForegroundColor Cyan
} else {
    Write-Host "✅ Token appears to be on a single line already" -ForegroundColor Green
    
    # Check if token exists
    if ($envContent -match 'REACT_APP_WHATSAPP_ACCESS_TOKEN=([^\r\n]+)') {
        $token = $matches[1].Trim()
        Write-Host "Token length: $($token.Length) characters" -ForegroundColor Cyan
        
        if ($token.Length -lt 100) {
            Write-Host "⚠️  Warning: Token seems too short (${token.Length} chars)" -ForegroundColor Yellow
            Write-Host "A valid WhatsApp access token is usually 200+ characters" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ No WhatsApp access token found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Note: WhatsApp access tokens expire. If the error persists:" -ForegroundColor Yellow
Write-Host "1. Go to Meta Developer Console" -ForegroundColor White
Write-Host "2. Navigate to WhatsApp > API Setup" -ForegroundColor White
Write-Host "3. Generate a new temporary access token" -ForegroundColor White
Write-Host "4. Update REACT_APP_WHATSAPP_ACCESS_TOKEN in .env" -ForegroundColor White
