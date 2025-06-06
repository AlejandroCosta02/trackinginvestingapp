import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    console.log("Registration attempt:", { name, email });

    if (!name || !email || !password) {
      console.log("Missing required fields:", { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    }).catch(error => {
      console.error("Database error checking existing user:", error);
      throw new Error("Database connection error");
    });

    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    }).catch(error => {
      console.error("Database error creating user:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: "Email already exists" },
            { status: 400 }
          );
        }
      }
      throw new Error("Failed to create user");
    });

    if (!result || !(result as User)) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const user = result as User;
    console.log("User created successfully:", { id: user.id, email: user.email });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong during registration";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 