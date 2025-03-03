'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState('/');
  const { user, loading } = useAuth();

  useEffect(() => {
    // Get the redirectTo parameter from the URL in client-side code
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo') || '/';
      setRedirectPath(redirectTo);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is signed in, redirect to the specified page
        router.push(redirectPath);
      } else {
        // User is not signed in, redirect to sign in page
        router.push(`/auth/signin/?redirectTo=${encodeURIComponent(redirectPath)}`);
      }
    }
  }, [user, loading, redirectPath, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Authenticating...</h2>
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}