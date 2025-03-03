'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/lib/AuthContext'
import { AlertCircle, Check, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function SignUp() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState('/dashboard');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { signUp } = useAuth();

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(email, password);
      router.push('/auth/verify');
    } catch (err: any) {
      console.error("Sign-up error:", err.code, err.message);
      
      // Handle Firebase auth error codes
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already in use. Please try signing in instead.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address. Please check and try again.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("We're experiencing issues with our registration system. Please try again later or contact support if the problem persists.");
      } else {
        setError(err.message || "An error occurred during sign up. Please try again.");
      }
      
      setIsLoading(false);
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors({...formErrors, email: ''});
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors({...formErrors, password: ''});
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (formErrors.confirmPassword) {
      setFormErrors({...formErrors, confirmPassword: ''});
    }
  };

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

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-600 mt-2">
                Join Resume.AI to optimize your CV and land more interviews
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSignUp}>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      formErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                    placeholder="you@example.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.email}
                  </p>
                )}
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      formErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.password}
                  </p>
                )}
                {password && password.length >= 6 && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Password meets minimum requirements
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      formErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm`}
                    placeholder="••••••••"
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.confirmPassword}
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isLoading}
                  variant="accent"
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href={`/auth/login${redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} 
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 