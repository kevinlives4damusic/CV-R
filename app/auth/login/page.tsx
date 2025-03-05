'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/layout/AuthLayout'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/dashboard');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
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

  // Handle countdown for redirect to signup page
  useEffect(() => {
    if (shouldRedirect && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (shouldRedirect && redirectCountdown === 0) {
      router.push(`/auth/signup${redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`);
    }
  }, [shouldRedirect, redirectCountdown, router, redirectTo]);

  const handleSignInWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShouldRedirect(false);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (err: any) {
      console.error("Sign-in error:", err.code, err.message);
      
      // Handle Firebase auth error codes
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Incorrect email or password. Please try again.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid credentials. Please check your email and password.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address format.");
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
      
      // Check if this could be a user trying to log in to an account that doesn't exist
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. You'll be redirected to the signup page in " + redirectCountdown + " seconds.");
        setShouldRedirect(true);
      }
      
      setIsLoading(false);
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push(redirectTo);
    } catch (err: any) {
      console.error("Google sign-in error:", err.code, err.message);
      
      if (err.code === 'auth/operation-not-allowed') {
        setError("Sign-in with Google is currently unavailable. Please try signing up with email instead.");
      } else {
        setError(err.message || "An error occurred during Google sign in");
      }
      
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
              <p className="text-gray-600 mt-2">
                Access your CV history and optimization results
              </p>
            </div>

            {error && (
              <div className={`mb-6 ${shouldRedirect ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-red-50 border-red-200 text-red-700'} px-4 py-3 rounded-lg flex items-start border`}>
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span>{error}</span>
                  {shouldRedirect && (
                    <div className="mt-2">
                      <Link 
                        href={`/auth/signup${redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Create an account now <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSignInWithEmail}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <Link href="/auth/reset-password" className="text-sm text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isLoading || shouldRedirect}
                  variant="accent"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in with Email'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSignInWithGoogle}
                  disabled={isLoading || shouldRedirect}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
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
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href={`/auth/signup${redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
} 