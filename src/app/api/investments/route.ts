import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('API: Attempting to connect to database...');
    console.log('API: Using database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
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
    console.error("API: Failed to fetch investments:", error);
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error("API: Prisma initialization error:", {
        clientVersion: error.clientVersion,
        message: error.message,
        logs: error.errorCode
      });
      return NextResponse.json(
        { error: "Database connection failed. Please check your connection settings.", details: error.message },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("API: Prisma known request error:", {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return NextResponse.json(
        { error: "Database error. Please try again.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later.", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
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
    console.error("API: Failed to create investment:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error. Please try again.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create investment. Please try again later.", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 