// Run Flow Builder Database Migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('==================================================');
  console.log('Flow Builder Database Integration Migration');
  console.log('==================================================\n');

  try {
    // Read migration file
    const migrationSQL = fs.readFileSync(
      'database-migrations/add-flow-integration.sql',
      'utf8'
    );

    console.log('📄 Migration file loaded');
    console.log('🔄 Running migration...\n');

    // Split by semicolon and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.includes('COMMENT ON')) {
        // Skip comments for now
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query
          const { error: error2 } = await supabase.from('_').select('*').limit(0);
          
          if (statement.includes('ALTER TABLE')) {
            console.log('⚠️  Skipping (may already exist):', statement.substring(0, 50) + '...');
          } else {
            console.log('❌ Error:', statement.substring(0, 50) + '...');
            console.log('   ', error?.message || 'Unknown error');
            errorCount++;
          }
        } else {
          console.log('✅', statement.substring(0, 60) + '...');
          successCount++;
        }
      } catch (err) {
        console.log('⚠️  Skipped:', statement.substring(0, 50) + '...');
      }
    }

    console.log('\n==================================================');
    console.log('Migration Summary:');
    console.log('==================================================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Errors/Skipped: ${errorCount}`);
    console.log('\n⚠️  Note: Some errors are expected if columns already exist');
    console.log('\nPlease verify the migration in Supabase Dashboard:');
    console.log('1. Go to Table Editor');
    console.log('2. Check forms table has: flow_id, contest_id columns');
    console.log('3. Check form_responses has: flow_response_id, participant_id');
    console.log('4. Check messages has: message_library_id, flow_id');
    console.log('\nAlternatively, run the SQL manually in Supabase SQL Editor:');
    console.log('Copy contents of: database-migrations/add-flow-integration.sql');
    console.log('==================================================\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Manual Migration Required:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste contents of: database-migrations/add-flow-integration.sql');
    console.log('3. Click "Run" to execute');
    process.exit(1);
  }
}

runMigration();
