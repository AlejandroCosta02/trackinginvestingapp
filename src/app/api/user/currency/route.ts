import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ currency: "USD" }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { preferredCurrency: true }
    });

    return NextResponse.json({ currency: user?.preferredCurrency || "USD" }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user currency:", error);
    return NextResponse.json({ error: "Failed to fetch currency preference" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency } = await request.json();
    
    if (!currency) {
      return NextResponse.json({ error: "Currency is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { preferredCurrency: currency },
      select: { preferredCurrency: true }
    });

    return NextResponse.json({ currency: user.preferredCurrency }, { status: 200 });
  } catch (error) {
    console.error("Error updating user currency:", error);
    return NextResponse.json({ error: "Failed to update currency preference" }, { status: 500 });
  }
} 