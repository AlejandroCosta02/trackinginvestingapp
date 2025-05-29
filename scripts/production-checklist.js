const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Import fetch properly for Node.js environment
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test query
    const count = await prisma.investment.count();
    console.log(`✅ Database query successful (${count} investments found)`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  const requiredVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'NEXT_PUBLIC_APP_URL',
    'VERCEL_URL'
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
  }
  console.log('✅ All required environment variables are set');
}

async function checkAPI() {
  console.log('🔍 Checking API endpoints...');
  
  const endpoints = [
    'http://localhost:3000/api/investments',
    process.env.NEXT_PUBLIC_APP_URL + '/api/investments'
  ];

  let hasError = false;
  
  for (const url of endpoints) {
    try {
      console.log(`Testing endpoint: ${url}`);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Production-Check/1.0'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.ok) {
        console.error(`❌ API endpoint ${url} returned status: ${response.status}`);
        const text = await response.text();
        console.error('Response:', text);
        hasError = true;
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ API endpoint ${url} is responding with data:`, 
        Array.isArray(data) ? `${data.length} investments found` : 'Invalid response format');
      
    } catch (error) {
      console.error(`❌ Failed to connect to ${url}:`, error.message);
      hasError = true;
    }
  }
  
  if (hasError) {
    console.error('❌ Some API endpoints failed checks');
    process.exit(1);
  }
}

async function checkBuildOutput() {
  console.log('🔍 Checking build output...');
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run next build first.');
    process.exit(1);
  }
  console.log('✅ Build output exists');
}

async function main() {
  console.log('🚀 Starting production readiness check...\n');
  
  await checkEnvironmentVariables();
  await checkDatabase();
  await checkBuildOutput();
  await checkAPI();
  
  console.log('\n✨ All checks passed! Ready for production.');
}

main().catch(console.error); 