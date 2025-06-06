import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's preferred currency
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { preferredCurrency: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({ preferredCurrency: user.preferredCurrency });
  } catch (error) {
    console.error("Error fetching currency:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currency } = body;

    // Validate currency
    if (!SUPPORTED_CURRENCIES.some(c => c.code === currency)) {
      return new NextResponse("Invalid currency", { status: 400 });
    }

    // Update user's preferred currency
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { preferredCurrency: currency },
    });

    return NextResponse.json({ preferredCurrency: updatedUser.preferredCurrency });
  } catch (error) {
    console.error("Error updating currency:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 