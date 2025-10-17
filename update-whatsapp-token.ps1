# Update WhatsApp Access Token in .env file
Write-Host "Updating WhatsApp Access Token..." -ForegroundColor Green

# Prompt for the new token
$newToken = Read-Host "Enter your new WhatsApp Access Token"

if ([string]::IsNullOrWhiteSpace($newToken)) {
    Write-Host "Error: Token cannot be empty!" -ForegroundColor Red
    exit 1
}

# Read current .env content
$envContent = Get-Content .env -Raw

# Replace the token
$envContent = $envContent -replace 'REACT_APP_WHATSAPP_ACCESS_TOKEN=.*', "REACT_APP_WHATSAPP_ACCESS_TOKEN=$newToken"

# Write back to .env
Set-Content -Path .env -Value $envContent -NoNewline

Write-Host ""
Write-Host "✅ WhatsApp Access Token updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Please restart your dev server for changes to take effect:" -ForegroundColor Yellow
Write-Host "   1. Stop the current server (Ctrl+C)" -ForegroundColor Cyan
Write-Host "   2. Run: npm start" -ForegroundColor Cyan
Write-Host ""
