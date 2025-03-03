'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { sendEmailVerification } from 'firebase/auth'

export default function Verify() {
  const { user } = useAuth();
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    if (!user) return;
    
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);
    
    try {
      await sendEmailVerification(user);
      setResendSuccess(true);
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      setResendError(error.message || "Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
              <p className="text-gray-600 mt-2">
                We sent you a verification link. Please check your email to verify your account.
              </p>
            </div>
            
            {resendSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Verification email resent successfully!</span>
              </div>
            )}
            
            {resendError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{resendError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <Button 
                onClick={handleResendVerification}
                className="w-full flex justify-center items-center"
                disabled={isResending}
                variant="outline"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/auth/login" 
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Return to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 