'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Download, Share2, BarChart, Target, Award, FileCheck, ChevronUp, ChevronDown, FileSearch, Check, Plus } from 'lucide-react';
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
  atsScore?: number;
  industryBenchmark?: number;
  missingKeywords?: string[];
  recommendedKeywords?: string[];
  competitorAnalysis?: {
    company: string;
    matchScore: number;
    requirements: string[];
  }[];
  careerPathSuggestions?: {
    role: string;
    matchPercentage: number;
    requiredSkills: string[];
    salaryRange: string;
  }[];
  aiSuggestions?: {
    category: string;
    suggestions: string[];
  }[];
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

  // Add new component for ATS Score
  const ATSScoreCard = ({ score }: { score: number }) => (
    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
      <div className="flex items-center mb-6">
        <FileCheck className="h-5 w-5 text-green-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">ATS Compatibility Score</h2>
      </div>
      <div className="flex flex-col items-center text-center">
        <ProgressCircle 
          score={score} 
          size={140} 
          strokeWidth={10}
        />
        <h3 className="text-xl font-bold mt-4 mb-2">
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
        </h3>
        <p className="text-gray-600 mb-4">How well your resume performs with Applicant Tracking Systems</p>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 w-full">
          <h4 className="font-medium text-green-800 mb-2">What this means</h4>
          <p className="text-green-700 text-sm">
            {score >= 80 
              ? 'Your resume is well-optimized for ATS systems. It has clear headings, proper formatting, and good keyword usage.'
              : score >= 60
              ? 'Your resume is generally ATS-friendly but could be improved. Consider reviewing the format and keywords.'
              : 'Your resume may have formatting issues that make it difficult for ATS systems to parse. Follow our recommendations to improve.'}
          </p>
        </div>
      </div>
    </div>
  );

  // Enhanced Keyword Analysis component
  const KeywordAnalysis = ({ 
    keywordMatches, 
    missingKeywords,
    recommendedKeywords
  }: { 
    keywordMatches?: KeywordMatch[],
    missingKeywords?: string[],
    recommendedKeywords?: string[]
  }) => {
    const foundKeywords = keywordMatches?.filter(k => k.found) || [];
    const missingKeys = missingKeywords || [];
    const recommendedKeys = recommendedKeywords || [];

    return (
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center mb-6">
          <Target className="h-5 w-5 text-indigo-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">Keyword Analysis</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Found Keywords */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Found Keywords ({foundKeywords.length})</h3>
            {foundKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {foundKeywords.map((keyword, index) => (
                  <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    {keyword.keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">No matching keywords found in your resume.</p>
            )}
          </div>
          
          {/* Missing Keywords */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Missing Keywords ({missingKeys.length})</h3>
            {missingKeys.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingKeys.map((keyword, index) => (
                  <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">No critical keywords are missing from your resume.</p>
            )}
          </div>
        </div>
        
        {/* Recommended Keywords with Categories */}
        <div className="mt-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="font-medium text-indigo-800 mb-3">Recommended Keywords ({recommendedKeys.length})</h3>
            {recommendedKeys.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {recommendedKeys.map((keyword, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                      <Plus className="h-3 w-3 mr-1" />
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-lg text-sm text-indigo-700">
                  <p className="font-medium mb-2">💡 How to use these keywords:</p>
                  <ul className="list-disc list-inside space-y-1 text-indigo-600">
                    <li>Naturally incorporate these keywords into your experience descriptions</li>
                    <li>Add relevant keywords to your skills section</li>
                    <li>Use variations of keywords where appropriate</li>
                    <li>Ensure the context matches your actual experience</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-indigo-700 text-sm italic">No additional keywords recommended at this time.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add new component for Industry Comparison
  const IndustryComparison = ({ score, benchmark }: { score: number, benchmark: number }) => (
    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
      <div className="flex items-center mb-6">
        <BarChart className="h-5 w-5 text-purple-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">Industry Comparison</h2>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
              Your Score
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-purple-600">
              {score}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
          <div style={{ width: `${score}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
        </div>
        
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
              Industry Average
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600">
              {benchmark}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div style={{ width: `${benchmark}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"></div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
        <h4 className="font-medium text-purple-800 mb-2">How You Compare</h4>
        <p className="text-purple-700 text-sm">
          {score > benchmark
            ? `Your resume scores ${score - benchmark}% higher than the industry average. Keep up the great work!`
            : score === benchmark
            ? "Your resume matches the industry average. Consider implementing our suggestions to stand out more."
            : `Your resume is ${benchmark - score}% below the industry average. Follow our recommendations to improve your score.`}
        </p>
      </div>
    </div>
  );

  // Add new component for Action Items
  const ActionItems = ({ sections }: { sections: Section[] }) => {
    const priorityImprovements = sections
      .flatMap(section => section.improvements.map(improvement => ({
        section: section.name,
        improvement,
        score: section.score
      })))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);

    return (
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center mb-6">
          <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">Priority Action Items</h2>
        </div>
        
        <div className="space-y-4">
          {priorityImprovements.map((item, index) => (
            <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                  {item.section}
                </span>
                <p className="text-blue-700 text-sm flex-1">{item.improvement}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Add download report functionality
  const downloadReport = (result: AnalysisResult, resumeText: string) => {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore: result.overallScore,
      atsScore: result.atsScore,
      sections: result.sections,
      keywordAnalysis: {
        found: result.keywordMatches?.filter(k => k.found).map(k => k.keyword),
        missing: result.missingKeywords,
        recommended: result.recommendedKeywords
      },
      industryComparison: {
        score: result.overallScore,
        benchmark: result.industryBenchmark
      },
      resumeText: resumeText
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Add new component for Career Path Analysis
  const CareerPathAnalysis = ({ suggestions }: { suggestions?: AnalysisResult['careerPathSuggestions'] }) => {
    if (!suggestions) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center mb-6">
          <Award className="h-5 w-5 text-emerald-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">Career Path Analysis</h2>
        </div>
        
        <div className="space-y-6">
          {suggestions.map((path, index) => (
            <div key={index} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-emerald-800">{path.role}</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {path.matchPercentage}% Match
                </span>
              </div>
              <p className="text-emerald-700 text-sm mb-2">Expected Salary: {path.salaryRange}</p>
              <div className="mt-2">
                <h4 className="text-sm font-medium text-emerald-800 mb-1">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {path.requiredSkills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced AI Suggestions component
  const AISuggestions = ({ suggestions }: { suggestions?: AnalysisResult['aiSuggestions'] }) => {
    if (!suggestions) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center mb-6">
          <FileSearch className="h-5 w-5 text-violet-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">AI-Powered Suggestions</h2>
        </div>
        
        <div className="space-y-6">
          {suggestions.map((category, index) => (
            <div key={index} className="bg-violet-50 p-4 rounded-lg border border-violet-100">
              <h3 className="text-lg font-medium text-violet-800 mb-3">{category.category}</h3>
              <div className="space-y-4">
                {category.suggestions.map((suggestion, suggIndex) => (
                  <div key={suggIndex} className="bg-white rounded-lg p-4 border border-violet-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <span className="inline-block w-2 h-2 bg-violet-400 rounded-full mr-2"></span>
                      </div>
                      <div className="flex-1">
                        <p className="text-violet-900 text-sm font-medium mb-2">{suggestion}</p>
                        <div className="mt-2 text-xs space-y-2">
                          <div className="bg-violet-50 p-2 rounded">
                            <span className="font-medium text-violet-800">Why this matters: </span>
                            <span className="text-violet-700">
                              {generateWhyItMatters(category.category, suggestion)}
                            </span>
                          </div>
                          <div className="bg-violet-50 p-2 rounded">
                            <span className="font-medium text-violet-800">How to implement: </span>
                            <span className="text-violet-700">
                              {generateHowToImplement(category.category, suggestion)}
                            </span>
                          </div>
                          {generateExample(category.category, suggestion) && (
                            <div className="bg-violet-50 p-2 rounded">
                              <span className="font-medium text-violet-800">Example: </span>
                              <span className="text-violet-700">
                                {generateExample(category.category, suggestion)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper functions for generating detailed AI suggestions
  function generateWhyItMatters(category: string, suggestion: string): string {
    // Add logic to generate contextual "why it matters" explanations based on category and suggestion
    const whyMap: Record<string, string[]> = {
      'Content': [
        'Recruiters spend an average of 6-7 seconds scanning resumes initially',
        'Clear, impactful content increases your chances of passing ATS systems',
        'Well-structured information helps hiring managers understand your value quickly'
      ],
      'Format': [
        'Professional formatting shows attention to detail',
        'Consistent styling makes your resume easier to read',
        'Clean layout helps important information stand out'
      ],
      'Skills': [
        'Relevant skills are crucial for ATS optimization',
        'Technical competencies are often the first filter in job applications',
        'Demonstrated expertise increases your perceived value'
      ],
      'Experience': [
        'Quantified achievements provide concrete evidence of your impact',
        'Specific examples help employers visualize your potential contribution',
        'Professional growth demonstrates your ambition and adaptability'
      ]
    };

    const defaultReasons = whyMap[category] || whyMap['Content'];
    return defaultReasons[Math.floor(Math.random() * defaultReasons.length)];
  }

  function generateHowToImplement(category: string, suggestion: string): string {
    // Add logic to generate practical implementation steps based on category and suggestion
    const implementationMap: Record<string, string[]> = {
      'Content': [
        'Review each bullet point and ensure it follows the suggested format',
        'Use action verbs and quantifiable metrics to describe achievements',
        'Focus on results and impact rather than just responsibilities'
      ],
      'Format': [
        'Maintain consistent spacing, fonts, and bullet styles throughout',
        'Use clear section headings and proper hierarchy',
        'Ensure adequate white space for readability'
      ],
      'Skills': [
        'Group related skills into clear categories',
        'Highlight proficiency levels where relevant',
        'Include both technical and soft skills with context'
      ],
      'Experience': [
        'Structure achievements using the STAR method (Situation, Task, Action, Result)',
        'Include specific metrics and percentages where possible',
        'Focus on achievements that align with target job requirements'
      ]
    };

    const defaultSteps = implementationMap[category] || implementationMap['Content'];
    return defaultSteps[Math.floor(Math.random() * defaultSteps.length)];
  }

  function generateExample(category: string, suggestion: string): string {
    // Add logic to generate relevant examples based on category and suggestion
    const exampleMap: Record<string, string[]> = {
      'Content': [
        'Instead of "Responsible for sales", write "Increased quarterly sales by 25% through implementation of new client outreach strategy"',
        'Rather than "Managed team", write "Led cross-functional team of 8 members to deliver $1M project under budget"'
      ],
      'Format': [
        'Skills: Python (Advanced), React (Intermediate), AWS (Certified)',
        'Experience sections with consistent date formatting: "Jan 2020 - Present"'
      ],
      'Skills': [
        'Technical: "Implemented CI/CD pipeline using Jenkins, reducing deployment time by 40%"',
        'Leadership: "Mentored 5 junior developers, improving team velocity by 30%"'
      ],
      'Experience': [
        'Before: "Helped increase sales"\nAfter: "Spearheaded sales initiative resulting in 45% revenue growth in Q3 2023"',
        'Before: "Worked on project management"\nAfter: "Managed $2M budget across 3 concurrent projects with 100% on-time delivery"'
      ]
    };

    const defaultExamples = exampleMap[category] || exampleMap['Content'];
    return defaultExamples[Math.floor(Math.random() * defaultExamples.length)];
  }

  // Add new component for Competitor Analysis
  const CompetitorAnalysis = ({ analysis }: { analysis?: AnalysisResult['competitorAnalysis'] }) => {
    if (!analysis) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <div className="flex items-center mb-6">
          <Target className="h-5 w-5 text-orange-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">Competitor Analysis</h2>
        </div>
        
        <div className="space-y-6">
          {analysis.map((competitor, index) => (
            <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-orange-800">{competitor.company}</h3>
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {competitor.matchScore}% Match
                </span>
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-medium text-orange-800 mb-1">Key Requirements:</h4>
                <ul className="space-y-1">
                  {competitor.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2"></span>
                      <span className="text-orange-700 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
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
          {/* Header with actions */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/upload" className="text-indigo-600 hover:text-indigo-800 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Link>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => downloadReport(analysisResult!, resumeText)}
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  // You might want to add a toast notification here
                }}
              >
                <Share2 className="h-4 w-4" />
                Share Results
              </Button>
            </div>
          </div>

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

          {/* New ATS Score Section */}
          {analysisResult?.atsScore && (
            <ATSScoreCard score={analysisResult.atsScore} />
          )}

          {/* New Keyword Analysis Section */}
          {(analysisResult?.keywordMatches || analysisResult?.missingKeywords || analysisResult?.recommendedKeywords) && (
            <KeywordAnalysis 
              keywordMatches={analysisResult.keywordMatches}
              missingKeywords={analysisResult.missingKeywords}
              recommendedKeywords={analysisResult.recommendedKeywords}
            />
          )}

          {/* New Career Path Analysis Section */}
          {analysisResult?.careerPathSuggestions && (
            <CareerPathAnalysis suggestions={analysisResult.careerPathSuggestions} />
          )}

          {/* New AI-Powered Suggestions Section */}
          {analysisResult?.aiSuggestions && (
            <AISuggestions suggestions={analysisResult.aiSuggestions} />
          )}

          {/* New Competitor Analysis Section */}
          {analysisResult?.competitorAnalysis && (
            <CompetitorAnalysis analysis={analysisResult.competitorAnalysis} />
          )}

          {/* New Industry Comparison Section */}
          {analysisResult?.industryBenchmark && (
            <IndustryComparison 
              score={analysisResult.overallScore} 
              benchmark={analysisResult.industryBenchmark} 
            />
          )}

          {/* New Priority Action Items Section */}
          {analysisResult?.sections && (
            <ActionItems sections={analysisResult.sections} />
          )}

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

          {/* Original Resume Text Section (if expanded) */}
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => setIsResumeExpanded(!isResumeExpanded)}
              className="w-full flex items-center justify-center gap-2"
            >
              {isResumeExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Original Resume
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Original Resume
                </>
              )}
            </Button>
            
            {isResumeExpanded && <OriginalTextSection resumeText={resumeText} />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 