# Investment Tracking Application

A modern web application for tracking your investments and their returns over time. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Portfolio Overview Dashboard**
  - Total capital invested
  - Total earnings
  - Average return rate
  - Visual growth charts

- **Investment Management**
  - Add and track multiple investments
  - Monitor individual investment performance
  - Track monthly interest earnings
  - Support for different investment types and risk levels

- **Performance Tracking**
  - Monthly interest calculations
  - Compound interest tracking
  - Visual performance charts
  - Historical data visualization

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Tremor (UI components and charts)
- SQLite (via Prisma)
- date-fns (date manipulation)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd investment-tracking
```

2. Install dependencies:
```bash
yarn install
```

3. Set up the database:
```bash
# Create a .env file with the following content:
DATABASE_URL="file:./dev.db"

# Push the database schema
npx prisma db push
```

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Dashboard page
│   └── investments/    # Investments management
├── components/         # React components
├── lib/               # Utility functions
└── prisma/            # Database schema and migrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
