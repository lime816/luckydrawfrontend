# Verify WhatsApp Configuration
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "WhatsApp Configuration Verification" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Read .env file
$envContent = Get-Content .env -Raw

# Extract values
$accessToken = if ($envContent -match 'REACT_APP_WHATSAPP_ACCESS_TOKEN=([^\r\n]+)') { $matches[1].Trim() } else { $null }
$phoneNumberId = if ($envContent -match 'REACT_APP_WHATSAPP_PHONE_NUMBER_ID=([^\r\n]+)') { $matches[1].Trim() } else { $null }
$businessAccountId = if ($envContent -match 'REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=([^\r\n]+)') { $matches[1].Trim() } else { $null }
$businessNumber = if ($envContent -match 'REACT_APP_WHATSAPP_BUSINESS_NUMBER=([^\r\n]+)') { $matches[1].Trim() } else { $null }

Write-Host "Current Configuration:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host ""

# Check Access Token
if ($accessToken) {
    Write-Host "✓ Access Token: Found" -ForegroundColor Green
    Write-Host "  Length: $($accessToken.Length) characters" -ForegroundColor Gray
    Write-Host "  Preview: $($accessToken.Substring(0, [Math]::Min(50, $accessToken.Length)))..." -ForegroundColor Gray
    
    if ($accessToken.Length -lt 100) {
        Write-Host "  ⚠️  WARNING: Token seems too short!" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Access Token: NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Check Phone Number ID
if ($phoneNumberId) {
    Write-Host "✓ Phone Number ID: $phoneNumberId" -ForegroundColor Green
    Write-Host "  Length: $($phoneNumberId.Length) digits" -ForegroundColor Gray
    
    if ($phoneNumberId.Length -lt 14) {
        Write-Host "  ⚠️  WARNING: Phone Number ID is too short!" -ForegroundColor Yellow
        Write-Host "  ⚠️  This might be the phone number, not the Phone Number ID!" -ForegroundColor Yellow
        Write-Host "  ⚠️  Phone Number ID should be 15 digits, not 11!" -ForegroundColor Yellow
    } elseif ($phoneNumberId -eq $businessNumber) {
        Write-Host "  ❌ ERROR: Phone Number ID matches Business Number!" -ForegroundColor Red
        Write-Host "  ❌ These should be DIFFERENT values!" -ForegroundColor Red
    } else {
        Write-Host "  ✓ Looks good!" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Phone Number ID: NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Check Business Account ID
if ($businessAccountId) {
    Write-Host "✓ Business Account ID: $businessAccountId" -ForegroundColor Green
} else {
    Write-Host "✗ Business Account ID: NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Check Business Number
if ($businessNumber) {
    Write-Host "✓ Business Number: $businessNumber" -ForegroundColor Green
} else {
    Write-Host "✗ Business Number: NOT FOUND" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Issues Found:" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$hasIssues = $false

if ($phoneNumberId -and $phoneNumberId.Length -lt 14) {
    Write-Host "❌ CRITICAL: Phone Number ID is incorrect!" -ForegroundColor Red
    Write-Host "   Current value: $phoneNumberId" -ForegroundColor Yellow
    Write-Host "   This looks like a phone number, not a Phone Number ID" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   How to fix:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://developers.facebook.com/apps" -ForegroundColor White
    Write-Host "   2. Select your app - WhatsApp - API Setup" -ForegroundColor White
    Write-Host "   3. Look for 'Phone number ID' (NOT the phone number)" -ForegroundColor White
    Write-Host "   4. Copy the 15-digit ID" -ForegroundColor White
    Write-Host "   5. Update REACT_APP_WHATSAPP_PHONE_NUMBER_ID in .env" -ForegroundColor White
    Write-Host ""
    $hasIssues = $true
}

if ($accessToken -and $accessToken.Length -lt 100) {
    Write-Host "⚠️  WARNING: Access Token might be invalid or expired" -ForegroundColor Yellow
    Write-Host "   Generate a new token from Meta Developer Console" -ForegroundColor White
    Write-Host ""
    $hasIssues = $true
}

if (-not $hasIssues) {
    Write-Host "✓ No obvious issues found!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If you're still getting errors:" -ForegroundColor Yellow
    Write-Host "1. The access token might be expired (they expire after 24 hours)" -ForegroundColor White
    Write-Host "2. Your app might not have WhatsApp permissions" -ForegroundColor White
    Write-Host "3. The Phone Number ID might still be wrong" -ForegroundColor White
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "1. Read: FIX_WHATSAPP_PHONE_ID.md" -ForegroundColor White
Write-Host "2. Verify all IDs in Meta Developer Console" -ForegroundColor White
Write-Host "3. Update .env with correct values" -ForegroundColor White
Write-Host "4. Restart dev server: npm start" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
