import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET");
}

// Initialize providers array
const providers = [];

// Add Google provider only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  );
}

// Always add Credentials provider as fallback
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials");
      }

      try {
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            image: true
          }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      } catch (error) {
        console.error("Auth error:", error);
        throw new Error("Authentication failed");
      }
    }
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("Sign in callback:", { 
          user: { id: user.id, email: user.email },
          provider: account?.provider,
          profile: profile?.email
        });

        if (!user?.email) return false;

        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true
          }
        });

        if (!existingUser && account?.provider === "google") {
          const newUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              image: user.image,
            }
          });
          user.id = newUser.id;
        } else if (existingUser) {
          user.id = existingUser.id;
        }

        return true;
      } catch (error) {
        console.error("Error in sign in callback:", error);
        return false;
      }
    },
    async session({ session, user }) {
      try {
        if (session.user) {
          session.user.id = user.id;
          session.user.email = user.email;
          session.user.name = user.name;
          session.user.image = user.image;
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error: (code, ...message) => {
      console.error(code, ...message)
    },
    warn: (code, ...message) => {
      console.warn(code, ...message)
    },
    debug: (code, ...message) => {
      console.debug(code, ...message)
    }
  }
}; 