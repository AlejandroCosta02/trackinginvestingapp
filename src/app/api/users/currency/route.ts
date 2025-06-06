import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ preferredCurrency: "USD" }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    return NextResponse.json({ 
      preferredCurrency: user?.preferredCurrency || "USD" 
    }, { 
      status: 200 
    });
  } catch (error) {
    console.error("Error fetching currency:", error);
    return NextResponse.json({ 
      preferredCurrency: "USD",
      error: "Failed to fetch currency preference" 
    }, { 
      status: 200 
    });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currency } = body;

    if (!currency || !SUPPORTED_CURRENCIES.some(c => c.code === currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { preferredCurrency: currency }
    });

    return NextResponse.json({ 
      preferredCurrency: user.preferredCurrency 
    }, { 
      status: 200 
    });
  } catch (error) {
    console.error("Error updating currency:", error);
    return NextResponse.json({ 
      error: "Failed to update currency preference" 
    }, { 
      status: 500 
    });
  }
} 