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
          where: { email: credentials.email }
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in callback:", { 
        user: { id: user.id, email: user.email },
        provider: account?.provider,
        profile: profile?.email
      });

      // For Google authentication
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user if doesn't exist
            await db.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
              }
            });
          }
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      console.log("JWT callback:", { 
        tokenSub: token.sub,
        userId: user?.id,
        provider: account?.provider
      });

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", {
        userId: token.id,
        userEmail: token.email
      });

      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      
      // Always redirect to dashboard after sign in
      if (url.startsWith("/auth/signin") || url.includes("/api/auth/callback")) {
        return `${baseUrl}/dashboard`;
      }

      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow URLs from the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === "development",
}; 