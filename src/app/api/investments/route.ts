import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Helper function to handle database errors
const handleDatabaseError = (error: unknown) => {
  console.error("API Error:", error);
  
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("Database initialization error:", {
      message: error.message,
      clientVersion: error.clientVersion,
      errorCode: error.errorCode,
    });
    return NextResponse.json(
      { error: "Database connection failed", details: error.message },
      { status: 500 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Known database error:", {
      code: error.code,
      meta: error.meta,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Database operation failed", details: error.message },
      { status: 500 }
    );
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error("Unknown database error:", error.message);
    return NextResponse.json(
      { error: "Unexpected database error", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
};

export async function GET() {
  try {
    console.log('API: Attempting database connection...');
    
    // Test the connection first
    await db.$connect();
    console.log('API: Database connection successful');
    
    const investments = await db.investment.findMany({
      include: {
        monthlyInterests: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`API: Successfully fetched ${investments.length} investments`);
    return NextResponse.json(investments);
  } catch (error) {
    return handleDatabaseError(error);
  } finally {
    try {
      await db.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the input data
    if (!data.name || !data.initialCapital || !data.interestRate || !data.startDate || !data.rateType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rate type
    if (data.rateType !== 'MONTHLY' && data.rateType !== 'ANNUAL') {
      return NextResponse.json(
        { error: "Rate type must be either 'MONTHLY' or 'ANNUAL'" },
        { status: 400 }
      );
    }

    // Test the connection first
    await db.$connect();

    const investment = await db.investment.create({
      data: {
        name: data.name,
        initialCapital: parseFloat(data.initialCapital),
        currentCapital: parseFloat(data.initialCapital),
        interestRate: parseFloat(data.interestRate),
        startDate: new Date(data.startDate),
        rateType: data.rateType,
        reinvestmentType: "COMPOUND",
      },
      include: {
        monthlyInterests: true,
      },
    });

    return NextResponse.json(investment);
  } catch (error) {
    return handleDatabaseError(error);
  } finally {
    try {
      await db.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
} 