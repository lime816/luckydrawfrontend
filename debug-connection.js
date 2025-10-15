// Debug Prisma Connection Issue
const { PrismaClient } = require('./src/generated/prisma');
require('dotenv').config();

async function debugConnection() {
  console.log('🔍 Debugging Prisma Connection...');
  console.log('==================================');
  
  console.log('Environment Variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('URL Preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
  });

  try {
    console.log('\n🔌 Attempting connection...');
    
    // Try the most basic connection test
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    
  } catch (error) {
    console.log('❌ Connection failed');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n🔍 P1001 Analysis:');
      console.log('This is a "Can\'t reach database server" error');
      console.log('Possible causes:');
      console.log('1. Network connectivity issue');
      console.log('2. Firewall blocking the connection');
      console.log('3. DNS resolution problem');
      console.log('4. Supabase project paused/inactive');
      console.log('5. Incorrect hostname or port');
    }
    
    // Try to parse the connection string
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log('\n📋 Connection String Analysis:');
      console.log('Protocol:', url.protocol);
      console.log('Username:', url.username);
      console.log('Hostname:', url.hostname);
      console.log('Port:', url.port);
      console.log('Database:', url.pathname.substring(1));
      console.log('Search Params:', url.searchParams.toString());
    } catch (urlError) {
      console.log('❌ Invalid URL format:', urlError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugConnection().catch(console.error);
