// Test script to verify contest creation
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rnihpvwaugrekmkbvhlk.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWhwdndhdWdyZWtta2J2aGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjgzMjksImV4cCI6MjA3NDgwNDMyOX0.V9sxGFGKKaQ1Di_i8lxmoSEls8Vg6A_b0j3Jt8IW-VI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContestCreation() {
  console.log('Testing contest creation...\n');

  const testContest = {
    name: 'Test Contest ' + Date.now(),
    theme: 'Test Theme',
    description: 'This is a test contest',
    start_date: '2025-10-10',
    end_date: '2025-10-20',
    entry_rules: { type: 'one entry' },
    status: 'DRAFT'
  };

  console.log('Test data:', JSON.stringify(testContest, null, 2));

  try {
    const { data, error } = await supabase
      .from('contests')
      .insert(testContest)
      .select()
      .single();

    if (error) {
      console.error('\n❌ Error creating contest:');
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('Code:', error.code);
      process.exit(1);
    }

    console.log('\n✅ Contest created successfully!');
    console.log('Result:', JSON.stringify(data, null, 2));
    
    // Clean up - delete the test contest
    const { error: deleteError } = await supabase
      .from('contests')
      .delete()
      .eq('contest_id', data.contest_id);

    if (deleteError) {
      console.warn('\n⚠️  Could not delete test contest:', deleteError.message);
    } else {
      console.log('\n🧹 Test contest cleaned up');
    }

  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
  }
}

testContestCreation();
