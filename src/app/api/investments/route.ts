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
    const body = await request.json();
    const {
      name,
      initialCapital,
      currentCapital,
      interestRate,
      startDate,
      type,
      rateType,
      reinvestmentType,
      totalInterestEarned,
      totalReinvested,
      totalExpenses,
    } = body;

    const investment = await db.investment.create({
      data: {
        name,
        initialCapital,
        currentCapital,
        interestRate,
        startDate: new Date(startDate),
        type,
        rateType,
        reinvestmentType,
        totalInterestEarned,
        totalReinvested,
        totalExpenses,
      },
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error("Error creating investment:", error);
    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
} 