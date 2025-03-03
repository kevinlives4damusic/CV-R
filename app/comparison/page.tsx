'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store';
import ComparisonSelector from '@/components/comparison/ComparisonSelector';
import ComparisonResults from '@/components/comparison/ComparisonResults';
import MainLayout from '@/components/layout/MainLayout';

export default function ComparisonPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Short timeout to allow hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user) {
        router.push('/auth/login');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resume Comparison</h1>
          <p className="text-muted-foreground">
            Compare multiple resume analyses to track your improvements over time.
          </p>
        </div>

        <div className="grid gap-6">
          <ComparisonSelector />
          <ComparisonResults />
        </div>
      </div>
    </MainLayout>
  );
} 