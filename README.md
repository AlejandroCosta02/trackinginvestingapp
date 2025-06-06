# Investment Tracking App

A Next.js application for tracking investments and calculating returns.

## Features

- Track multiple investments
- Calculate monthly and annual interest rates
- View investment history
- Modern UI with Tailwind CSS
- Real-time updates

## Tech Stack

- Next.js 14.1.0
- TypeScript
- Tailwind CSS
- Prisma with PostgreSQL (Supabase)
- Tremor UI Components
- Heroicons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://postgres:your-password@your-host:5432/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:your-password@your-host:5432/postgres"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   yarn dev
   ```

## Environment Variables

The following environment variables are required:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:your-password@your-host:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:your-password@your-host:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"  # Use your deployment URL in production

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Contributing

Feel free to submit issues and enhancement requests.
