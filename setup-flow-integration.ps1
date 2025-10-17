# Setup Flow Builder Database Integration
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Flow Builder Database Integration Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with DATABASE_URL first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Read DATABASE_URL from .env
$envContent = Get-Content .env -Raw
if ($envContent -match 'DIRECT_URL=([^\r\n]+)') {
    $databaseUrl = $matches[1]
    Write-Host "✅ Database URL found" -ForegroundColor Green
} else {
    Write-Host "❌ Error: DIRECT_URL not found in .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Run database migration (add flow integration columns)" -ForegroundColor White
Write-Host "2. Create flow_analytics view" -ForegroundColor White
Write-Host "3. Add necessary indexes" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Do you want to continue? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running database migration..." -ForegroundColor Cyan

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "⚠️  psql not found in PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run the migration manually:" -ForegroundColor Yellow
    Write-Host "1. Connect to your Supabase database" -ForegroundColor White
    Write-Host "2. Run: \i database-migrations/add-flow-integration.sql" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use Supabase SQL Editor:" -ForegroundColor Yellow
    Write-Host "1. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
    Write-Host "2. Copy contents of database-migrations/add-flow-integration.sql" -ForegroundColor White
    Write-Host "3. Paste and run" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ psql found, attempting migration..." -ForegroundColor Green
    
    try {
        # Run migration
        psql $databaseUrl -f "database-migrations/add-flow-integration.sql"
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Migration failed: $_" -ForegroundColor Red
        Write-Host "Please run migration manually using Supabase SQL Editor" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify migration in Supabase Dashboard" -ForegroundColor White
Write-Host "   - Check forms table has flow_id and contest_id columns" -ForegroundColor Gray
Write-Host "   - Check form_responses has flow_response_id column" -ForegroundColor Gray
Write-Host "   - Check messages has message_library_id column" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart your dev server:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test Flow Builder integration:" -ForegroundColor White
Write-Host "   - Create a new flow" -ForegroundColor Gray
Write-Host "   - Link it to a contest" -ForegroundColor Gray
Write-Host "   - Check database for new form entry" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Read documentation:" -ForegroundColor White
Write-Host "   FLOW_BUILDER_DATABASE_INTEGRATION.md" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
