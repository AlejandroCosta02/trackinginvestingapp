import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await db.$connect();
    console.log('Database connection successful');
    
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
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: "Database connection failed. Please check your connection settings." },
        { status: 500 }
      );
    }
    
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
    console.log('Database connection successful for POST');

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

    console.log('Creating investment with data:', data);

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

    console.log('Successfully created investment:', investment);
    return NextResponse.json(investment);
  } catch (error) {
    console.error("Failed to create investment:", error);
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json(
        { error: "Database connection failed. Please check your connection settings." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Database error occurred while creating investment" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
} 