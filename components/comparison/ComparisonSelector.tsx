'use client';

import { useState, useEffect } from 'react';
import { useComparisonStore } from '@/store';
import { useAnalysisStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { AnalysisResponse } from '@/types';

// Simple Card components
const Card = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-gray-800">
    {children}
  </h2>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6">
    {children}
  </div>
);

// Simple Badge component
const Badge = ({ 
  variant = 'default', 
  children 
}: { 
  variant?: 'default' | 'success' | 'warning' | 'destructive', 
  children: React.ReactNode 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

// Simple Checkbox component
const Checkbox = ({ 
  id, 
  checked, 
  onCheckedChange 
}: { 
  id: string, 
  checked: boolean, 
  onCheckedChange: (checked: boolean) => void 
}) => (
  <div className="flex items-center h-5">
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  </div>
);

// Format date function
const formatDate = (timestamp: any) => {
  if (!timestamp) return 'N/A';
  
  try {
    // If it's a Firestore timestamp
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    
    // If it's a Date object or timestamp number
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  } catch (error) {
    return 'Invalid date';
  }
};

// Define a type for our analyses that includes the fields we need
interface AnalysisWithScore {
  id: string;
  created_at: any;
  status: 'processing' | 'completed' | 'failed';
  job_title?: string;
  overallScore?: number;
}

export default function ComparisonSelector() {
  const { 
    analyses, 
    isLoading: analysesLoading, 
    error: analysesError 
  } = useAnalysisStore();
  
  const { 
    selectedAnalysisIds, 
    selectAnalysis, 
    deselectAnalysis, 
    clearSelection,
    compareSelected,
    isComparing
  } = useComparisonStore();

  // Filter for completed analyses only
  const completedAnalyses = analyses.filter(analysis => analysis.status === 'completed') as AnalysisWithScore[];

  // Handle checkbox change
  const handleCheckboxChange = (analysisId: string, checked: boolean) => {
    if (checked) {
      selectAnalysis(analysisId);
    } else {
      deselectAnalysis(analysisId);
    }
  };

  // Start comparison
  const handleCompare = () => {
    if (selectedAnalysisIds.length >= 2) {
      compareSelected();
    }
  };

  if (analysesLoading) {
    return <div className="flex justify-center p-8">Loading analyses...</div>;
  }

  if (analysesError) {
    return <div className="text-red-500 p-8">Error loading analyses: {analysesError}</div>;
  }

  if (completedAnalyses.length < 2) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resume Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You need at least 2 completed analyses to use the comparison feature.
          </p>
          <Button variant="outline" disabled>Compare Resumes</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resume Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Select 2 or more resumes to compare their analyses and track your improvements.
        </p>
        
        <div className="grid gap-4 mb-4">
          {completedAnalyses.map((analysis) => (
            <div 
              key={analysis.id} 
              className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  id={`analysis-${analysis.id}`}
                  checked={selectedAnalysisIds.includes(analysis.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(analysis.id, checked)}
                />
                <div>
                  <div className="font-medium">
                    {analysis.job_title || 'General Analysis'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(analysis.created_at)}
                  </div>
                </div>
              </div>
              
              <Badge variant={(analysis.overallScore || 0) >= 80 ? "success" : (analysis.overallScore || 0) >= 60 ? "warning" : "destructive"}>
                {analysis.overallScore || 0}%
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleCompare} 
            disabled={selectedAnalysisIds.length < 2 || isComparing}
          >
            {isComparing ? 'Comparing...' : 'Compare Selected'}
          </Button>
          
          {selectedAnalysisIds.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearSelection}
              disabled={isComparing}
            >
              Clear Selection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 