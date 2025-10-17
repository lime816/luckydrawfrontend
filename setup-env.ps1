# Setup .env file for Lucky Draw project
Write-Host "Creating .env file from backup..." -ForegroundColor Green

# Copy from backup
Copy-Item -Path ".env.backup" -Destination ".env" -Force

# Add WhatsApp configuration
$whatsappConfig = @"

# WhatsApp Business API Configuration
REACT_APP_BACKEND_URL=https://whatsappbackend-production-8946.up.railway.app
REACT_APP_WHATSAPP_ACCESS_TOKEN=your-token-here
REACT_APP_WHATSAPP_API_VERSION=v22.0
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
REACT_APP_WHATSAPP_BUSINESS_NUMBER=15550617327
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=your-phone-id
"@

Add-Content -Path ".env" -Value $whatsappConfig

Write-Host ""
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host "File size: $((Get-Item .env).Length) bytes" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please edit .env and add your actual WhatsApp credentials." -ForegroundColor Yellow
Write-Host ""

# Display content
Write-Host "Current .env content:" -ForegroundColor Cyan
Get-Content .env
