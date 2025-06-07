"use client";

import { useState, useEffect } from "react";
import { signIn, useSession, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  useEffect(() => {
    // Clear any existing auth-related cookies on component mount
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === 'authenticated' && session) {
        console.log('Session detected, redirecting to dashboard');
        router.replace('/dashboard');
      }
    };
    checkAuth();
  }, [session, status, router]);

  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        const response = await fetch('/api/auth/providers');
        const providers = await response.json();
        setIsGoogleAvailable(providers.includes('google'));
      } catch (error) {
        console.error('Failed to check auth providers:', error);
        setIsGoogleAvailable(false);
      }
    };
    
    checkGoogleAuth();
  }, []);

  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      toast.success("Registration successful! Please sign in.");
    }

    const error = searchParams.get("error");
    if (error) {
      console.error("Auth error:", error);
      toast.error(error === "OAuthSignin" ? "Could not sign in with Google" : error);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting sign in with credentials...");
      
      // First, try to sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        console.error("Sign in error:", result.error);
        setError("Invalid email or password");
        toast.error("Invalid email or password");
        return;
      }

      if (result?.ok) {
        toast.success("Welcome back!");
        
        try {
          // Try to get the session
          const session = await getSession();
          console.log("Session after login:", session);
          
          if (session) {
            // If we have a session, use router
            router.push('/dashboard');
          } else {
            // If no session but login was successful, use direct navigation
            console.log("No session but login successful, using direct navigation");
            window.location.href = '/dashboard';
          }
        } catch (sessionError) {
          console.error("Session error:", sessionError);
          // On any session error, use direct navigation
          console.log("Session error, falling back to direct navigation");
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      // Check if it's a storage access error
      if (error instanceof Error && error.message.includes("storage")) {
        console.log("Storage access error detected, using alternative navigation");
        // Try direct navigation as a fallback
        window.location.href = '/dashboard';
      } else {
        setError("An error occurred. Please try again.");
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      console.log("Initiating Google sign-in...");
      
      // Use window.location.origin to ensure we&apos;re using the correct base URL
      const callbackUrl = `${window.location.origin}/dashboard`;
      await signIn("google", {
        callbackUrl,
        redirect: true
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Could not sign in with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-xl shadow-lg border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-gray-500 text-foreground rounded-t-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm bg-background"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-gray-500 text-foreground rounded-b-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm bg-background"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-gold hover:bg-brand-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {isGoogleAvailable && (
          <>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.405,3.404-4.545,3.404c-2.627,0-4.545-2.127-4.545-4.545s2.127-4.545,4.545-4.545c1.127,0,2.163,0.386,2.981,1.031l2.828-2.828C17.545,5.172,15.372,4,12.545,4C8.018,4,4,8.018,4,12.545s4.018,8.545,8.545,8.545c4.527,0,8.545-4.018,8.545-8.545c0-0.582-0.067-1.149-0.182-1.697h-8.363V12.151z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </>
        )}

        <div className="text-center">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-brand-gold hover:text-brand-gold-dark"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 