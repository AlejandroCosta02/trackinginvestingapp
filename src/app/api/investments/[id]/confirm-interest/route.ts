import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateMonthlyInterest } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { month, amount } = await request.json();
    const investmentId = parseInt(params.id);

    // Validate input
    if (!month || !amount) {
      return NextResponse.json(
        { error: "Month and amount are required" },
        { status: 400 }
      );
    }

    // Get the investment
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
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

    // Calculate expected interest
    const expectedInterest = calculateMonthlyInterest(investment);

    // Validate amount
    if (Math.abs(amount - expectedInterest) > 0.01) {
      return NextResponse.json(
        { error: "Invalid interest amount" },
        { status: 400 }
      );
    }

    // Create the monthly interest record
    await prisma.monthlyInterest.create({
      data: {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        month: new Date(month),
        confirmed: true,
        confirmedAt: new Date(),
        investmentId: investment.id,
      },
    });

    // Update investment's current capital
    await prisma.investment.update({
      where: { id: investment.id },
      data: {
        currentCapital: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming interest:", error);
    return NextResponse.json(
      { error: "Failed to confirm interest" },
      { status: 500 }
    );
  }
} 