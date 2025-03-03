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
                <div className="animate-pulse">
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              
              <div className="animate-pulse mb-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
              <p className="text-gray-700 font-medium">Loading your analysis results...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container-custom py-24 px-4 sm:px-6 bg-gradient-to-br from-white to-indigo-50">
          <Link href="/upload" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Link>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start shadow-sm mb-8">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="mt-2">Please try uploading your resume again.</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                variant="accent"
                size="lg"
                onClick={() => router.push('/upload')}
                className="py-3 px-8 text-base font-medium shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                Upload Resume
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-24 px-4 sm:px-6 bg-gradient-to-br from-white to-indigo-50">
        <Link href="/upload" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Upload
        </Link>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700">Loading your analysis...</h2>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Results</h2>
              <p className="text-gray-600">{error}</p>
              <Link href="/upload" className="mt-6 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Try Again
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Your Resume Analysis</h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Here's a detailed analysis of your resume with personalized feedback.
                </p>
              </div>
              
              {/* New indicator for clicking cards */}
              <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4 mb-8 shadow-sm">
                <div className="flex items-center">
                  <div className="bg-indigo-600 p-2 rounded-full mr-3">
                    <ChevronDown className="h-5 w-5 text-white animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-800">Interactive Analysis</h3>
                    <p className="text-indigo-700 text-sm">Click on each section card below to expand and see detailed feedback with specific references from your resume.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Overall Score</h2>
                  <div className="flex justify-center">
                    <ProgressCircle 
                      score={analysisResult?.overallScore || 0} 
                      size={150} 
                      strokeWidth={12}
                    />
                  </div>
                </div>

                {analysisResult && (
                  <>
                    {/* Overall Score Card */}
                    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8 hover:shadow-lg transition-all">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                        <Award className="h-6 w-6 text-indigo-600 mr-2" />
                        Overall Assessment
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center justify-center">
                          <ProgressCircle score={analysisResult.overallScore} />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">Overall Resume Score</h3>
                        </div>
                        
                        {analysisResult.jobMatch !== undefined && (
                          <div className="flex flex-col items-center justify-center">
                            <ProgressCircle score={analysisResult.jobMatch} />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Job Match Score</h3>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <div className="flex items-start">
                          <FileCheck className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">What This Means</h4>
                            <p className="mt-1 text-gray-700">
                              {analysisResult.overallScore >= 80 ? 
                                "Your resume is excellent! It's well-structured and contains strong content that will impress recruiters." :
                                analysisResult.overallScore >= 60 ?
                                "Your resume is good but has room for improvement. Review our suggestions to make it even stronger." :
                                "Your resume needs significant improvements. Follow our suggestions to enhance your chances of getting interviews."
                              }
                            </p>
                            
                            {resumeText.includes('[Image Analysis:') && (
                              <div className="mt-3 flex items-center text-sm text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                <FileSearch className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>This analysis was performed on a resume image. The AI has analyzed the extracted text from your image.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Analysis */}
                    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8 hover:shadow-lg transition-all">
                      <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                        <BarChart className="h-6 w-6 text-indigo-600 mr-2" />
                        Section-by-Section Analysis
                      </h2>
                      
                      <div className="space-y-4">
                        {analysisResult.sections.map((section, index) => (
                          <ScoreCard 
                            key={index}
                            section={section.name}
                            score={section.score}
                            feedback={section.feedback}
                            improvements={section.improvements}
                            quotes={section.quotes}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Keyword Matches */}
                    {analysisResult.keywordMatches && analysisResult.keywordMatches.length > 0 && (
                      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8 hover:shadow-lg transition-all">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900 flex items-center">
                          <Target className="h-6 w-6 text-indigo-600 mr-2" />
                          Keyword Analysis
                        </h2>
                        
                        <p className="text-gray-700 mb-6">
                          Keywords are important for passing Applicant Tracking Systems (ATS). Here's how your resume matches up with key terms:
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {analysisResult.keywordMatches.map((match, index) => (
                            <div 
                              key={index} 
                              className={`p-3 rounded-lg border flex items-center ${
                                match.found ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              {match.found ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                              )}
                              <span className={`${match.found ? 'text-gray-900' : 'text-gray-500'} font-medium truncate`}>
                                {match.keyword}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-8">
                      <Button 
                        onClick={() => router.push('/upload')}
                        variant="outline"
                        className="flex items-center justify-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Analyze Another Resume
                      </Button>
                      
                      {user ? (
                        <Link href="/dashboard">
                          <Button 
                            variant="accent"
                            className="flex items-center justify-center w-full md:w-auto"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Go to Dashboard
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth/login?redirectTo=/dashboard">
                          <Button 
                            variant="accent"
                            className="flex items-center justify-center w-full md:w-auto"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Sign in to Save Results
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    {/* Original Resume Text */}
                    <OriginalTextSection resumeText={resumeText} />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 