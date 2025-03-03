'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { FileText, Clock, CheckCircle, XCircle, ExternalLink, Loader2, BarChart, Calendar, User, FileSearch, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

type Analysis = {
  id: string;
  created_at: any; // Firestore timestamp
  status: 'processing' | 'completed' | 'failed';
  job_title: string | null;
  overall_score: number | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchAnalyses(user.uid);
    } else if (user === null) {
      // Only redirect if we've confirmed user is not authenticated
      router.push('/auth/login?redirectTo=/dashboard');
    }
  }, [user, router]);

  const fetchAnalyses = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const db = getFirestore();
      const analysesRef = collection(db, 'resume_analyses');
      const q = query(
        analysesRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const analysesData: Analysis[] = [];
      
      querySnapshot.forEach((doc) => {
        analysesData.push({
          id: doc.id,
          ...doc.data(),
        } as Analysis);
      });
      
      setAnalyses(analysesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load your analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === 'all') return true;
    if (filter === 'completed') return analysis.status === 'completed';
    if (filter === 'processing') return analysis.status === 'processing';
    if (filter === 'failed') return analysis.status === 'failed';
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your resume analyses
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Button 
                onClick={() => router.push('/upload')}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/comparison')}
                className="flex items-center"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Compare Resumes
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading your analyses...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 py-8 text-center">
              <p>Error loading analyses: {error}</p>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No analyses found</h3>
              <p className="text-gray-600 mb-6">
                {filter !== 'all' 
                  ? `You don't have any ${filter} analyses. Try changing the filter or upload a new resume.`
                  : 'Upload your resume to get personalized feedback and improve your chances of landing interviews.'}
              </p>
              <Button variant="accent">
                <Link href="/upload" className="flex items-center">
                  <FileSearch className="mr-2 h-5 w-5" />
                  Upload Your Resume
                </Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAnalyses.map((analysis) => (
                      <tr key={analysis.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(analysis.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {analysis.job_title || 'General Analysis'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(analysis.status)}
                            <span className="ml-2 text-sm text-gray-900">
                              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {analysis.overall_score ? (
                            <span className={`${getScoreColor(analysis.overall_score)} font-semibold`}>
                              {analysis.overall_score}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {analysis.status === 'completed' && (
                            <Link 
                              href={`/results/${analysis.id}`}
                              className="text-primary-600 hover:text-primary-800 flex items-center"
                            >
                              View Results
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 