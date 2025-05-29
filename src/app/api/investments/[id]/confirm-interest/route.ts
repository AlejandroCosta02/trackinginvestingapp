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

    // Calculate expenses amount
    const expensesAmount = amount - reinvestedAmount;

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
        reinvestedAmount,
        expensesAmount,
      },
      create: {
        investmentId,
        month: new Date(month),
        amount,
        confirmed: true,
        confirmedAt: new Date(),
        reinvested: reinvestedAmount > 0,
        reinvestedAmount,
        expensesAmount,
      },
    });

    // Update the investment with new totals
    await db.investment.update({
      where: { id: investmentId },
      data: {
        currentCapital: {
          increment: reinvestedAmount,
        },
        totalInterestEarned: {
          increment: amount,
        },
        totalReinvested: {
          increment: reinvestedAmount,
        },
        totalExpenses: {
          increment: expensesAmount,
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