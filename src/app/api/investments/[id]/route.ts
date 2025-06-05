import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export async function PATCH(
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

    const data = await request.json();
    const investmentId = parseInt(params.id);

    // Verify ownership and get current investment data
    const investment = await db.investment.findUnique({
      where: { id: investmentId },
      include: {
        monthlyInterests: true
      }
    });

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Investment not found or unauthorized" },
        { status: 404 }
      );
    }

    // If updating interest rate, ensure we don't modify past confirmed interests
    if ('interestRate' in data) {
      // Validate the new interest rate
      const newRate = parseFloat(data.interestRate);
      if (isNaN(newRate) || newRate < 0 || (investment.rateType === 'ANNUAL' ? newRate > 100 : newRate > 20)) {
        return NextResponse.json(
          { error: `Interest rate must be between 0 and ${investment.rateType === 'ANNUAL' ? '100' : '20'}%` },
          { status: 400 }
        );
      }
    }

    const updatedInvestment = await db.investment.update({
      where: { id: investmentId },
      data,
      include: {
        monthlyInterests: true
      }
    });

    return NextResponse.json(updatedInvestment);
  } catch (error) {
    console.error("Error updating investment:", error);
    return NextResponse.json(
      { error: "Failed to update investment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const idNumber = Number(params.id);

    if (isNaN(idNumber)) {
      return NextResponse.json(
        { error: "Invalid investment ID" },
        { status: 400 }
      );
    }

    // Verify ownership
    const investment = await db.investment.findUnique({
      where: {
        // Using type assertion here since we've already validated it's a number
        id: idNumber as unknown as number
      }
    });

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Investment not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the investment (monthly interests will be deleted automatically due to onDelete: Cascade)
    await db.investment.delete({
      where: {
        // Using type assertion here since we've already validated it's a number
        id: idNumber as unknown as number
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return NextResponse.json(
      { error: "Failed to delete investment" },
      { status: 500 }
    );
  }
} 