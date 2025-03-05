'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default AuthLayout; 