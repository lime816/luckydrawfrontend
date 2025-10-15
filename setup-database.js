// Database Setup Script for Lucky Draw Project
// Run this with: node setup-database.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in .env file');
  console.log('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('contests')
      .select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('⚠️  Tables not found - you need to run the SQL schema first');
      return false;
    } else if (error) {
      console.error('❌ Connection error:', error.message);
      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

async function createSampleData() {
  console.log('📝 Creating sample data...');
  
  try {
    // Create a sample contest
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .insert({
        name: 'Sample Contest',
        description: 'This is a sample contest created by the setup script',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'UPCOMING'
      })
      .select()
      .single();

    if (contestError) {
      console.error('❌ Error creating contest:', contestError.message);
      return;
    }

    console.log('✅ Sample contest created:', contest.name);

    // Create sample prizes
    const { data: prize, error: prizeError } = await supabase
      .from('prizes')
      .insert({
        contest_id: contest.contest_id,
        prize_name: 'First Prize',
        value: 1000,
        quantity: 1,
        description: 'Amazing first prize'
      })
      .select()
      .single();

    if (prizeError) {
      console.error('❌ Error creating prize:', prizeError.message);
      return;
    }

    console.log('✅ Sample prize created:', prize.prize_name);

    // Create sample participants
    const participants = [
      {
        contest_id: contest.contest_id,
        name: 'John Doe',
        contact: 'john@example.com',
        validated: true,
        unique_token: 'token_john_' + Date.now()
      },
      {
        contest_id: contest.contest_id,
        name: 'Jane Smith',
        contact: 'jane@example.com',
        validated: true,
        unique_token: 'token_jane_' + Date.now()
      }
    ];

    const { data: createdParticipants, error: participantError } = await supabase
      .from('participants')
      .insert(participants)
      .select();

    if (participantError) {
      console.error('❌ Error creating participants:', participantError.message);
      return;
    }

    console.log(`✅ ${createdParticipants.length} sample participants created`);
    console.log('🎉 Sample data setup complete!');
    
  } catch (err) {
    console.error('❌ Error creating sample data:', err.message);
  }
}

async function main() {
  console.log('🚀 Lucky Draw Database Setup');
  console.log('============================');
  
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n📋 Next Steps:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL schema from supabase-schema.sql');
    console.log('4. Run this script again');
    return;
  }

  // Check if we already have data
  const { data: existingContests } = await supabase
    .from('contests')
    .select('count', { count: 'exact', head: true });

  if (existingContests && existingContests.length > 0) {
    console.log('📊 Database already has data');
  } else {
    await createSampleData();
  }

  console.log('\n✅ Setup complete! Your database is ready to use.');
  console.log('\n🔧 You can now use the DatabaseService in your React components:');
  console.log('import { DatabaseService } from "./services/database";');
  console.log('const contests = await DatabaseService.getAllContests();');
}

main().catch(console.error);
