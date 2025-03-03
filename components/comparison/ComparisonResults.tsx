'use client';

import { useEffect } from 'react';
import { useComparisonStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { AnalysisResponse } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Define section scores interface for analyses
interface AnalysisWithSectionScores extends AnalysisResponse {
  section_scores?: Record<string, number>;
}

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

// Format date function
const formatDate = (date: Date | string | number) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

export default function ComparisonResults() {
  const { 
    selectedAnalysisIds, 
    comparisonResult, 
    isComparing, 
    error,
    clearSelection
  } = useComparisonStore();

  // If no comparison is in progress or completed, don't render
  if (selectedAnalysisIds.length < 2 && !comparisonResult) {
    return null;
  }

  // Show loading state
  if (isComparing) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comparison Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p>Comparing selected resumes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comparison Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 mb-4">
            {error}
          </div>
          <Button variant="outline" onClick={clearSelection}>
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If we have results, show them
  if (comparisonResult) {
    // Prepare data for charts
    const overallScoreData = comparisonResult.analyses.map(analysis => ({
      name: analysis.job_title || `Analysis ${analysis.id?.substring(0, 4) || 'Unknown'}`,
      score: analysis.overallScore
    }));

    // Prepare section scores data for the chart
    const sectionScoresData: Array<Record<string, any>> = [];
    
    // Get all unique section names across all analyses
    const allSectionNames = new Set<string>();
    comparisonResult.analyses.forEach(analysis => {
      const analysisWithSections = analysis as AnalysisWithSectionScores;
      if (analysisWithSections.section_scores) {
        Object.keys(analysisWithSections.section_scores).forEach(section => {
          allSectionNames.add(section);
        });
      } else if (analysis.sections) {
        analysis.sections.forEach(section => {
          allSectionNames.add(section.name);
        });
      }
    });
    
    // Create data for each section
    Array.from(allSectionNames).forEach(section => {
      const sectionData: Record<string, any> = {
        name: section,
      };
      
      comparisonResult.analyses.forEach(analysis => {
        const analysisWithSections = analysis as AnalysisWithSectionScores;
        const analysisName = analysis.job_title || `Analysis ${analysis.id?.substring(0, 4) || 'Unknown'}`;
        
        // Try to get score from section_scores first, then from sections array
        if (analysisWithSections.section_scores && analysisWithSections.section_scores[section]) {
          sectionData[analysisName] = analysisWithSections.section_scores[section];
        } else if (analysis.sections) {
          const sectionObj = analysis.sections.find(s => s.name === section);
          sectionData[analysisName] = sectionObj?.score || 0;
        } else {
          sectionData[analysisName] = 0;
        }
      });
      
      sectionScoresData.push(sectionData);
    });

    // Generate random colors for the bars
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    // Create bars for the section scores chart
    const sectionBars = comparisonResult.analyses.map((analysis) => {
      const analysisName = analysis.job_title || `Analysis ${analysis.id?.substring(0, 4) || 'Unknown'}`;
      return (
        <Bar 
          key={analysis.id || Math.random().toString()} 
          dataKey={analysisName} 
          fill={getRandomColor()} 
          name={analysisName}
        />
      );
    });

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comparison Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Overall Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={overallScoreData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Overall Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {sectionScoresData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Section Scores</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={sectionScoresData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {sectionBars}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Key Improvements</h3>
            {comparisonResult.improvements.map((improvement, index) => {
              // Handle both string improvements and object improvements
              const title = typeof improvement === 'string' 
                ? 'Improvement Suggestion' 
                : (improvement as any).title || 'Improvement Suggestion';
              
              const description = typeof improvement === 'string'
                ? improvement
                : (improvement as any).description || '';
                
              return (
                <div key={index} className="mb-4 p-4 border rounded-md">
                  <div className="font-medium mb-2">{title}</div>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              );
            })}
          </div>

          <Button variant="outline" onClick={clearSelection}>
            Clear Comparison
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}