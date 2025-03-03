'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Download, Share2, BarChart, Target, Award, FileCheck, ChevronUp, ChevronDown, FileSearch } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import ProgressCircle from '@/components/resume/ProgressCircle';
import ScoreCard from '@/components/resume/ScoreCard';
import { useAuth } from '@/lib/AuthContext';

interface Section {
  name: string;
  score: number;
  feedback: string[];
  improvements: string[];
  quotes?: string[];
}

interface KeywordMatch {
  keyword: string;
  found: boolean;
}

interface AnalysisResult {
  overallScore: number;
  jobMatch?: number;
  sections: Section[];
  keywordMatches?: KeywordMatch[];
}

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);

  // Function to extract relevant quotes from resume text based on section name and improvements
  const extractRelevantQuotes = (sectionName: string, improvements: string[], resumeText: string): string[] => {
    if (!resumeText) return [];
    
    const quotes: string[] = [];
    const lines = resumeText.split('\n').filter(line => line.trim().length > 0);
    
    // Create a mapping of section names to potential keywords
    const sectionKeywords: Record<string, string[]> = {
      'Contact Information': ['phone', 'email', 'linkedin', 'address', 'website'],
      'Summary': ['summary', 'objective', 'profile', 'about'],
      'Experience': ['experience', 'work', 'job', 'position', 'employment'],
      'Education': ['education', 'degree', 'university', 'college', 'school', 'gpa'],
      'Skills': ['skills', 'technologies', 'tools', 'languages', 'frameworks'],
      'Projects': ['project', 'portfolio', 'github'],
      'Certifications': ['certification', 'certificate', 'license'],
      'Awards': ['award', 'honor', 'recognition'],
    };
    
    // Default keywords for any section
    const defaultKeywords = ['experience', 'skill', 'education', 'project'];
    
    // Get keywords for this section
    const keywords = sectionKeywords[sectionName] || defaultKeywords;
    
    // Extract potential quotes based on section keywords
    const potentialQuotes = lines.filter(line => {
      return keywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase())
      );
    });
    
    // Extract quotes based on improvement suggestions
    improvements.forEach(improvement => {
      // Extract key terms from the improvement suggestion
      const terms = improvement
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(' ')
        .filter(word => word.length > 4); // Only consider words longer than 4 characters
      
      // Find lines that might be related to this improvement
      const relatedLines = lines.filter(line => {
        return terms.some(term => line.toLowerCase().includes(term));
      });
      
      // Add up to 2 related lines as quotes
      if (relatedLines.length > 0) {
        quotes.push(...relatedLines.slice(0, 2));
      }
    });
    
    // Add some quotes from potential quotes if we don't have enough
    if (quotes.length < 2 && potentialQuotes.length > 0) {
      quotes.push(...potentialQuotes.slice(0, 2 - quotes.length));
    }
    
    // Deduplicate quotes and limit to 3
    return Array.from(new Set(quotes)).slice(0, 3).map(quote => quote.trim());
  };

  useEffect(() => {
    try {
      // Get analysis result from session storage
      const storedResult = sessionStorage.getItem('analysisResult');
      const storedResumeText = sessionStorage.getItem('resumeText');
      
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult);
        console.log('Retrieved analysis result from session storage:', parsedResult);
        
        // If we have resume text, add quotes to each section
        if (storedResumeText) {
          setResumeText(storedResumeText);
          
          // Add quotes to each section
          parsedResult.sections = parsedResult.sections.map((section: Section) => ({
            ...section,
            quotes: extractRelevantQuotes(section.name, section.improvements, storedResumeText)
          }));
        }
        
        setAnalysisResult(parsedResult);
      } else {
        setError('No analysis result found. Please upload a resume first.');
        console.error('No analysis result found in session storage');
      }
    } catch (err) {
      console.error('Error retrieving analysis result:', err);
      setError('Error retrieving analysis result. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Function to get background color based on score
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Original Text Section
  const OriginalTextSection = ({ resumeText }: { resumeText: string }) => {
    // Check if the text is from a PDF document
    const isPdfDocument = resumeText.includes('[PDF DOCUMENT:');
    
    // Format PDF content for better readability
    const formatPdfContent = () => {
      if (!isPdfDocument) return resumeText;
      
      // Extract the number of pages from the header
      const pagesMatch = resumeText.match(/\[PDF DOCUMENT: .+ - (\d+) pages\]/);
      const numPages = pagesMatch ? pagesMatch[1] : 'multiple';
      
      // Split the text by page markers
      const pages = resumeText.split('--- Page ').filter(page => page.trim().length > 0);
      
      if (pages.length <= 1) return resumeText;
      
      return (
        <div className="pdf-content">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
            <p className="text-indigo-700 font-medium">PDF Document with {numPages} pages</p>
            <p className="text-gray-700 mt-2">
              Your resume was successfully extracted from the PDF document. Below is the text content from each page.
            </p>
          </div>
          
          <div className="space-y-4">
            {pages.map((page, index) => {
              // For the first page, remove the header
              const pageContent = index === 0 
                ? page.substring(page.indexOf('\n\n') + 2) 
                : page;
                
              const pageNumber = index === 0 ? 1 : parseInt(pageContent.split('\n')[0]);
              const content = index === 0 ? pageContent : pageContent.substring(pageContent.indexOf('\n') + 1);
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700">
                    Page {pageNumber}
                  </div>
                  <div className="p-4 bg-white text-gray-700 text-sm whitespace-pre-wrap">
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <FileText className="h-5 w-5 text-indigo-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">Original Resume Text</h2>
        </div>
        
        {isPdfDocument ? (
          <div className="mb-4">
            {formatPdfContent()}
          </div>
        ) : resumeText.includes('[Image Analysis:') ? (
          <div className="mb-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <p className="text-indigo-700 font-medium">Image-Based Resume</p>
              <p className="text-gray-700 mt-2">
                Your resume was uploaded as an image. Below is the text we extracted using OCR technology.
              </p>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap">
              {resumeText}
            </pre>
          </div>
        ) : (
          <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap">
            {resumeText || 'No resume text available.'}
          </pre>
        )}
        
        <div className="mt-4 text-gray-600 text-sm">
          <p>This is the raw text that was extracted from your resume and used for analysis.</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container-custom py-12 px-4 sm:px-6 bg-gradient-to-br from-white to-indigo-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <div className="animate-pulse flex-1">
                  <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              {/* Loading animation for sections */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container-custom py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="flex items-center text-red-600 mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Error</h2>
              </div>
              <p className="text-gray-600">{error}</p>
              <div className="mt-6">
                <Link href="/upload" className="text-indigo-600 hover:text-indigo-700 flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Upload
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12 px-4 sm:px-6 bg-gradient-to-br from-white to-indigo-50">
        <div className="max-w-4xl mx-auto">
          {/* Overall Score Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex flex-col items-center text-center">
              <ProgressCircle 
                score={analysisResult?.overallScore || 0} 
                size={160} 
                strokeWidth={12}
              />
              <h2 className="text-2xl font-bold mt-4 mb-2">Overall Resume Score</h2>
              <p className="text-gray-600 mb-6">Based on industry standards and best practices</p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                {!user && (
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                      Sign in to Save Results
                    </Button>
                  </Link>
                )}
                <Link href="/upload" className="flex-1">
                  <Button variant="accent" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    Analyze Another Resume
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Sections */}
          <div className="space-y-6">
            {analysisResult?.sections.map((section, index) => (
              <ScoreCard
                key={index}
                score={section.score}
                section={section.name}
                feedback={section.feedback}
                improvements={section.improvements}
                quotes={section.quotes}
                className="transition-all duration-300 transform hover:scale-[1.02]"
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 