# Validate WhatsApp Access Token
Write-Host "Validating WhatsApp Access Token..." -ForegroundColor Cyan
Write-Host ""

# Read token from .env
$envContent = Get-Content .env -Raw
if ($envContent -match 'REACT_APP_WHATSAPP_ACCESS_TOKEN=([^\r\n]+)') {
    $token = $matches[1].Trim()
    
    Write-Host "Token found!" -ForegroundColor Green
    Write-Host "Length: $($token.Length) characters" -ForegroundColor Cyan
    Write-Host "First 50 chars: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
    Write-Host ""
    
    # Validate token format
    $issues = @()
    
    # Check length
    if ($token.Length -lt 100) {
        $issues += "⚠️  Token is too short ($($token.Length) chars). Valid tokens are usually 200+ characters."
    }
    
    # Check for spaces
    if ($token -match '\s') {
        $issues += "❌ Token contains spaces or whitespace - this will cause errors!"
    }
    
    # Check for line breaks
    if ($token -match '[\r\n]') {
        $issues += "❌ Token contains line breaks - this will cause errors!"
    }
    
    # Check if it starts correctly (Meta tokens usually start with EA)
    if ($token -notmatch '^EA[A-Za-z0-9]') {
        $issues += "⚠️  Token doesn't start with 'EA' - might be invalid format"
    }
    
    # Check for invalid characters
    if ($token -match '[^A-Za-z0-9_-]') {
        $issues += "⚠️  Token contains unusual characters"
    }
    
    Write-Host "Validation Results:" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    
    if ($issues.Count -eq 0) {
        Write-Host "✅ Token format looks valid!" -ForegroundColor Green
        Write-Host ""
        Write-Host "If you're still getting errors, the token might be:" -ForegroundColor Yellow
        Write-Host "  1. Expired (temporary tokens expire after 24 hours)" -ForegroundColor White
        Write-Host "  2. Invalid for your app" -ForegroundColor White
        Write-Host "  3. Missing required permissions" -ForegroundColor White
        Write-Host ""
        Write-Host "Solution: Generate a new token from Meta Developer Console" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Token has issues:" -ForegroundColor Red
        Write-Host ""
        foreach ($issue in $issues) {
            Write-Host "  $issue" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "Fix Required:" -ForegroundColor Yellow
        Write-Host "1. Go to Meta Developer Console" -ForegroundColor White
        Write-Host "2. Navigate to: WhatsApp > API Setup" -ForegroundColor White
        Write-Host "3. Click 'Generate Access Token'" -ForegroundColor White
        Write-Host "4. Copy the ENTIRE token (no spaces, no line breaks)" -ForegroundColor White
        Write-Host "5. Replace REACT_APP_WHATSAPP_ACCESS_TOKEN in .env" -ForegroundColor White
        Write-Host "6. Make sure it's all on ONE line" -ForegroundColor White
    }
    
} else {
    Write-Host "❌ No WhatsApp access token found in .env!" -ForegroundColor Red
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "How to Get a Fresh Token:" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "1. Visit: https://developers.facebook.com/" -ForegroundColor White
Write-Host "2. Select your app" -ForegroundColor White
Write-Host "3. Go to: WhatsApp > API Setup" -ForegroundColor White
Write-Host "4. Under 'Temporary access token', click 'Generate'" -ForegroundColor White
Write-Host "5. Copy the token (it will be ~200-300 characters)" -ForegroundColor White
Write-Host "6. Paste it in .env on a SINGLE line" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Cyan
