import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { month, amount, reinvestedAmount } = await request.json();
    const investmentId = parseInt(params.id);

    // Validate the input
    if (!month || amount === undefined || reinvestedAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the investment
    const investment = await db.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    // Create or update the monthly interest record
    const monthlyInterest = await db.monthlyInterest.upsert({
      where: {
        investmentId_month: {
          investmentId,
          month: new Date(month),
        },
      },
      update: {
        amount,
        confirmed: true,
        confirmedAt: new Date(),
        reinvested: reinvestedAmount > 0,
      },
      create: {
        investmentId,
        month: new Date(month),
        amount,
        confirmed: true,
        confirmedAt: new Date(),
        reinvested: reinvestedAmount > 0,
      },
    });

    // Update the investment's current capital with the reinvested amount
    await db.investment.update({
      where: { id: investmentId },
      data: {
        currentCapital: {
          increment: reinvestedAmount,
        },
      },
    });

    return NextResponse.json(monthlyInterest);
  } catch (error) {
    console.error("Error confirming interest:", error);
    return NextResponse.json(
      { error: "Failed to confirm interest" },
      { status: 500 }
    );
  }
} 