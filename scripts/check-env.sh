#!/bin/bash

# Export environment variables
export DATABASE_URL="postgresql://postgres:ArenaGlowSteam@db.rejwztoyuhmdsmiuiogh.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
export DIRECT_URL="postgresql://postgres:ArenaGlowSteam@db.rejwztoyuhmdsmiuiogh.supabase.co:5432/postgres"
export NEXT_PUBLIC_APP_URL="https://trackinginvestingapp.vercel.app"
export VERCEL_URL="trackinginvestingapp.vercel.app"

# Run the production checks
node scripts/production-checklist.js 