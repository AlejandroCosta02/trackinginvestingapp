import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const investments = await db.investment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        monthlyInterests: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'initialCapital', 'interestRate', 'startDate', 'rateType', 'profitLockPeriod'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (typeof data.initialCapital !== 'number' || data.initialCapital < 0) {
      return NextResponse.json(
        { error: "Initial capital must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof data.interestRate !== 'number' || data.interestRate < 0) {
      return NextResponse.json(
        { error: "Interest rate must be a positive number" },
        { status: 400 }
      );
    }

    // Validate profit lock period
    if (typeof data.profitLockPeriod !== 'number' || data.profitLockPeriod < 1 || data.profitLockPeriod > 60) {
      return NextResponse.json(
        { error: "Profit lock period must be between 1 and 60 months" },
        { status: 400 }
      );
    }

    const investment = await db.investment.create({
      data: {
        name: data.name,
        initialCapital: data.initialCapital,
        currentCapital: data.initialCapital,
        interestRate: data.interestRate,
        startDate: new Date(data.startDate),
        type: data.type || 'standard',
        rateType: data.rateType,
        reinvestmentType: data.reinvestmentType || 'COMPOUND',
        profitLockPeriod: data.profitLockPeriod,
        userId: session.user.id,
        totalInterestEarned: 0,
        totalReinvested: 0,
        totalExpenses: 0
      }
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error("Error creating investment:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create investment";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 