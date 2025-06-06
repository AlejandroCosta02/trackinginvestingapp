import { NextResponse } from 'next/server';

export async function GET() {
  const providers = [];
  
  // Check if Google OAuth is configured
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push('google');
  }

  return NextResponse.json(providers);
} 