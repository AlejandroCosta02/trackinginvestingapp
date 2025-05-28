# Investment Tracking App

A Next.js application for tracking investments and calculating returns.

## Features

- Track multiple investments
- Calculate monthly and annual interest rates
- View investment history
- Modern UI with Tailwind CSS
- Real-time updates

## Tech Stack

- Next.js 15.3
- TypeScript
- Tailwind CSS
- Prisma (SQLite)
- Tremor UI Components
- Heroicons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="file:./prisma/dev.db"
```

## Contributing

Feel free to submit issues and enhancement requests.
