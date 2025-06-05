import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const investmentId = parseInt(params.id);
    const { month, amount, reinvestedAmount } = await request.json();

    // Verify investment ownership
    const investment = await db.investment.findFirst({
      where: {
        id: investmentId,
        userId: session.user.id,
      },
      include: {
        monthlyInterests: true,
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    // Create the monthly interest record
    const monthlyInterest = await db.monthlyInterest.create({
      data: {
        amount,
        month: new Date(month),
        confirmed: true,
        confirmedAt: new Date(),
        reinvested: reinvestedAmount > 0,
        reinvestedAmount,
        expensesAmount: amount - reinvestedAmount,
        interestRate: investment.interestRate,
        investmentId,
      },
    });

    // Update the investment totals
    const updatedInvestment = await db.investment.update({
      where: { id: investmentId },
      data: {
        currentCapital: investment.currentCapital + reinvestedAmount,
        totalInterestEarned: investment.totalInterestEarned + amount,
        totalReinvested: investment.totalReinvested + reinvestedAmount,
        totalExpenses: investment.totalExpenses + (amount - reinvestedAmount),
      },
      include: {
        monthlyInterests: true,
      },
    });

    return NextResponse.json(updatedInvestment);
  } catch (error) {
    console.error("Error confirming interest:", error);
    return NextResponse.json(
      { error: "Failed to confirm interest" },
      { status: 500 }
    );
  }
} 