import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await db.$connect();
    
    const investments = await db.investment.findMany({
      include: {
        monthlyInterests: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(investments);
  } catch (error) {
    console.error("Failed to fetch investments:", error);
    
    return NextResponse.json(
      { error: "Database error occurred while fetching investments" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    // Test database connection
    await db.$connect();

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
    
    return NextResponse.json(
      { error: "Database error occurred while creating investment" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
} 