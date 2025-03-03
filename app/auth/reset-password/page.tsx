'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err.code, err.message);
      
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please try again later.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
              <p className="text-gray-600 mt-2">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            {success ? (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Password reset email sent!</p>
                  <p className="text-sm mt-1">Please check your email for instructions to reset your password.</p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleResetPassword}>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4"
                      disabled={isLoading}
                      variant="accent"
                    >
                      {isLoading ? 'Sending...' : 'Send reset link'}
                    </Button>
                  </div>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 