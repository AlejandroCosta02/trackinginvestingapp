import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('API: Attempting database connection...');
    
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
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Database operation failed", details: error instanceof Error ? error.message : "Unknown error" },
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
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create investment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 