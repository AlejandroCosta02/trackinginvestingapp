import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAfter, isBefore, startOfMonth, addMonths, format } from "date-fns";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Properly handle params
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Investment ID is required" },
        { status: 400 }
      );
    }

    const { month, amount } = await request.json();
    
    if (!month || !amount) {
      return NextResponse.json(
        { error: "Month and amount are required" },
        { status: 400 }
      );
    }

    // Get the investment to check dates
    const investment = await prisma.investment.findUnique({
      where: { id }
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 }
      );
    }

    // Ensure we're working with UTC dates
    const confirmationDate = new Date(month);
    confirmationDate.setUTCHours(0, 0, 0, 0);
    
    const investmentStartDate = new Date(investment.startDate);
    investmentStartDate.setUTCHours(0, 0, 0, 0);

    // Set both dates to the start of their respective months
    const confirmationMonth = startOfMonth(confirmationDate);
    const startMonth = startOfMonth(investmentStartDate);
    const firstInterestMonth = startOfMonth(addMonths(startMonth, 1));
    const maxFutureDate = startOfMonth(addMonths(new Date(), 12)); // Allow up to 12 months in the future

    console.log('Debug dates:', {
      confirmationMonth: confirmationMonth.toISOString(),
      startMonth: startMonth.toISOString(),
      firstInterestMonth: firstInterestMonth.toISOString(),
      maxFutureDate: maxFutureDate.toISOString(),
      originalConfirmationDate: month,
      originalStartDate: investment.startDate,
      comparison: {
        isBeforeFirstInterest: isBefore(confirmationMonth, firstInterestMonth),
        isAfterMax: isAfter(confirmationMonth, maxFutureDate)
      }
    });

    // Validate the confirmation date
    if (isBefore(confirmationMonth, firstInterestMonth)) {
      return NextResponse.json(
        { error: `Cannot confirm interest for ${format(confirmationMonth, 'MMMM yyyy')} as interest starts from ${format(firstInterestMonth, 'MMMM yyyy')}` },
        { status: 400 }
      );
    }

    if (isAfter(confirmationMonth, maxFutureDate)) {
      return NextResponse.json(
        { error: `Cannot confirm interest for dates more than 12 months in the future (max: ${format(maxFutureDate, 'MMMM yyyy')})` },
        { status: 400 }
      );
    }

    try {
      // Create or update monthly interest
      const monthlyInterest = await prisma.monthlyInterest.upsert({
        where: {
          investmentId_month: {
            investmentId: id,
            month: confirmationMonth
          }
        },
        create: {
          id: `${id}-${format(confirmationMonth, "yyyy-MM")}`,
          investmentId: id,
          month: confirmationMonth,
          amount,
          confirmed: true,
          confirmedAt: new Date(),
          reinvested: true,
        },
        update: {
          confirmed: true,
          confirmedAt: new Date(),
          reinvested: true,
          amount,
        },
      });

      // Update investment's current capital
      const updatedInvestment = await prisma.investment.update({
        where: { id },
        data: {
          currentCapital: {
            increment: amount,
          },
          updatedAt: new Date(),
        },
        include: {
          monthlyInterests: true,
        },
      });

      return NextResponse.json(updatedInvestment);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to update database. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to confirm interest:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
} 