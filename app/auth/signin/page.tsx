'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/lib/AuthContext'

export default function SignIn() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const { signIn, signInWithGoogle } = useAuth();

  // Get redirectTo from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirectTo');
      if (redirect) {
        setRedirectTo(redirect);
      }
    }
  }, []);

  const handleSignInWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    console.log("Attempting to sign in with email:", email);
    
    // Set a timeout to detect if the sign-in process is hanging
    const timeoutId = setTimeout(() => {
      setDebugInfo("Sign-in request is taking longer than expected. This might indicate an issue with the Firebase connection or authentication settings.");
    }, 5000);
    
    try {
      await signIn(email, password);
      clearTimeout(timeoutId);
      console.log("Sign-in successful, redirecting to:", redirectTo);
      router.push(redirectTo);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Sign-in error:", err);
      
      // Handle Firebase auth error codes
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else {
        setError(err.message || "An error occurred during sign in. Please try again.");
      }
      
      setDebugInfo(`Error code: ${err.code || 'unknown'}`);
      setIsLoading(false);
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push(redirectTo);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "An error occurred during Google sign in");
      setDebugInfo(`Error code: ${err.code || 'unknown'}`);
    }
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link href={`/auth/signup${redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="font-medium text-primary-400 hover:text-primary-300">
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-800 text-red-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
              {debugInfo && (
                <div className="mt-2 text-xs border-t border-red-800 pt-2">
                  <p>Debug info: {debugInfo}</p>
                </div>
              )}
            </div>
          )}

          {!error && debugInfo && (
            <div className="bg-yellow-900 border border-yellow-800 text-yellow-200 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{debugInfo}</span>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSignInWithGoogle}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSignInWithEmail}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 bg-gray-900 text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 bg-gray-900 text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isLoading ? 'Signing in...' : 'Sign in with Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
} 