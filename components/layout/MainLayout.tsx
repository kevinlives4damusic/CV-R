"use client";

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
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
      <Footer />
    </div>
  );
};

export default MainLayout; 