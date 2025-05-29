import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('Attempting to connect to database...');
    
    const investments = await db.investment.findMany({
      include: {
        monthlyInterests: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Successfully fetched ${investments.length} investments`);
    return NextResponse.json(investments);
  } catch (error) {
    console.error("Failed to fetch investments:", error);
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error("Prisma initialization error:", {
        clientVersion: error.clientVersion,
        message: error.message
      });
      return NextResponse.json(
        { error: "Database connection failed. Please check your connection settings." },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma known request error:", {
        code: error.code,
        message: error.message
      });
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
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
    console.error("Failed to create investment:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create investment. Please try again later." },
      { status: 500 }
    );
  }
} 