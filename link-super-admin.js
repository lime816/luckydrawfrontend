/**
 * Link existing Supabase Auth user to admins table as Super Admin
 * 
 * Usage: node link-super-admin.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function linkSuperAdmin() {
  try {
    console.log('🔍 Looking for Supabase Auth user: admin@ecam.com');
    
    // Note: This requires service role key to list users
    // For now, we'll use the user ID from the screenshot
    const supabaseUserId = 'a6fec55f-c94f-4d08-962f-bda89fe3847c';
    const email = 'admin@ecam.com';
    const name = 'Super Admin';
    
    console.log('📝 Creating/updating Super Admin in admins table...');
    
    // Insert or update admin record
    const { data, error } = await supabase
      .from('admins')
      .upsert({
        supabase_user_id: supabaseUserId,
        email: email,
        name: name,
        password_hash: 'supabase_auth', // Placeholder since password is in Supabase Auth
        role: 'SUPERADMIN',
        is_super_admin: true,
        permissions: {
          dashboard: ['read', 'write', 'update'],
          contests: ['read', 'write', 'update'],
          participants: ['read', 'write', 'update'],
          draw: ['read', 'write', 'update'],
          winners: ['read', 'write', 'update'],
          communication: ['read', 'write', 'update'],
          analytics: ['read', 'write', 'update'],
          settings: ['read', 'write', 'update'],
          user_management: ['read', 'write', 'update'],
          admin_management: ['read', 'write', 'update'],
        },
        last_login: new Date().toISOString(),
      }, {
        onConflict: 'supabase_user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating Super Admin:', error);
      throw error;
    }

    console.log('✅ Super Admin linked successfully!');
    console.log('\nDetails:');
    console.log('  Admin ID:', data.admin_id);
    console.log('  Name:', data.name);
    console.log('  Email:', data.email);
    console.log('  Role:', data.role);
    console.log('  Is Super Admin:', data.is_super_admin);
    console.log('  Supabase User ID:', data.supabase_user_id);
    
    console.log('\n✅ Setup complete! You can now:');
    console.log('  1. Login with: admin@ecam.com');
    console.log('  2. Use your Supabase Auth password');
    console.log('  3. Access all admin features');
    console.log('  4. Create other admins from Admin Management page');
    
  } catch (error) {
    console.error('❌ Failed to link Super Admin:', error);
    process.exit(1);
  }
}

// Run the script
linkSuperAdmin();
