'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import FileUpload from '@/components/resume/FileUpload';
import { Button } from '@/components/ui/Button';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { ArrowLeft, FileText, AlertCircle, Briefcase, CheckCircle, Brain, Upload, FileSearch, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

// Static export notice component
const StaticExportNotice = () => {
  const isStaticExport = typeof window !== 'undefined' && 
    (window.location.hostname.includes('resumethecv.web.app') || 
     window.location.hostname.includes('firebase') ||
     window.location.hostname.includes('vercel') ||
     window.location.protocol === 'file:');
  
  if (!isStaticExport) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start">
      <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
      <div>
        <h3 className="font-medium text-amber-800">Static Website Notice</h3>
        <p className="text-sm text-amber-700 mt-1">
          You are using the static version of Resume AI. Some features like resume analysis 
          require server functionality and are not available in this deployment.
        </p>
        <p className="text-sm text-amber-700 mt-2">
          For full functionality, please download and run the application locally or 
          contact us for access to our hosted API service.
        </p>
      </div>
    </div>
  );
};

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState(1); // 1: Upload, 2: Processing, 3: Redirecting
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError('');
    setUploadStep(2); // Move to processing step
    
    try {
      // Set initial progress
      setUploadProgress(0);
      setAnalysisProgress(0);
      setAnalysisStage('Processing your resume...');
      
      // Start the upload progress animation
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `resume-${Date.now()}.${fileExt}`;
      
      setAnalysisStage('Extracting text from your resume...');
      
      // Check if we're in a static export environment
      const isStaticExport = typeof window !== 'undefined' && 
        (window.location.hostname.includes('resumethecv.web.app') || 
         window.location.hostname.includes('firebase') ||
         window.location.hostname.includes('vercel') ||
         window.location.protocol === 'file:');
      
      if (isStaticExport) {
        // Clear intervals
        clearInterval(uploadInterval);
        
        // Show a more helpful error message
        setError(
          'API functionality is not available in this static website deployment. ' +
          'The resume analysis requires server-side processing which is only available when running the application locally. ' +
          'Options:\n' +
          '1. Download and run the application locally for full functionality\n' +
          '2. Contact us to request access to our hosted API service\n' +
          '3. Use our alternative manual resume review service'
        );
        
        setIsAnalyzing(false);
        setUploadStep(1);
        return;
      }
      
      // Extract text from the resume using server-side API
      let resumeText = '';
      try {
        console.log('Starting server-side text extraction from file...');
        
        // Check if file is an image and update the analysis stage
        if (file.type.includes('image/')) {
          setAnalysisStage('Performing OCR on your resume image...');
        } else {
          setAnalysisStage('Extracting text from your resume document...');
        }
        
        // Create form data for the file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Call the server-side API endpoint
        const extractTextEndpoint = process.env.NEXT_PUBLIC_EXTRACT_TEXT_API || '/api/extract-text';
        console.log('Calling extract text API at:', extractTextEndpoint);
        console.log('File type:', file.type);
        console.log('File size:', file.size);
        
        const response = await fetch(extractTextEndpoint, {
          method: 'POST',
          body: formData,
        });
        
        console.log('Extract text API response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check if the response is HTML instead of JSON
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          throw new Error(`Server error: ${errorText || response.statusText}`);
        }
        
        let data;
        try {
          data = await response.json();
          console.log('API Response data (full):', JSON.stringify(data, null, 2));
          console.log('API Response data keys:', Object.keys(data));
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          const rawText = await response.clone().text();
          console.error('Raw response:', rawText);
          throw new Error('Failed to parse API response as JSON');
        }
        
        if (!data) {
          console.error('Empty response data from API');
          throw new Error('Empty response from text extraction API');
        }
        
        if (!data.data || !data.data.text) {
          console.error('Response missing text field:', data);
          throw new Error('Invalid response from text extraction API - missing text data');
        }
        resumeText = data.data.text;
        
        // Log length only after validating the text exists
        console.log('Extracted text length:', resumeText.length);
        
        if (resumeText.trim().length === 0) {
          throw new Error('Failed to extract text from resume - empty result');
        }
        
        // If the text was extracted from an image, update the stage
        if (resumeText.includes('[Image Analysis:')) {
          setAnalysisStage('Processing image-based resume content...');
        }
      } catch (extractError: any) {
        console.error('Error extracting text:', extractError);
        setError(`Error extracting text: ${extractError.message}`);
        setIsAnalyzing(false);
        setUploadStep(1);
        return;
      }
      
      // Complete upload progress
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      // Simulate the analysis phase progress
      const analysisInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(analysisInterval);
            return 90;
          }
          return prev + 2;
        });
      }, 300);

      // Call DeepSeek API to analyze the resume
      try {
        setAnalysisStage('Analyzing your resume with AI (this may take up to 30 seconds)...');
        
        const analyzeEndpoint = process.env.NEXT_PUBLIC_ANALYZE_RESUME_API || '/api/analyze-resume';
        
        // For static export, we need to handle this differently
        if (typeof window !== 'undefined' && window.location.hostname.includes('resumethecv.web.app')) {
          // We're on Firebase hosting, so we need to use a different approach
          setError('API functionality is not available in the static export. Please use the local development environment for full functionality.');
          setIsAnalyzing(false);
          setUploadStep(1);
          return;
        }

        // Validate resumeText before using it
        if (!resumeText || typeof resumeText !== 'string') {
          throw new Error('No valid resume text available for analysis');
        }
        
        // Log the text length after we've confirmed it exists and is a string
        console.log('Calling API with text length:', resumeText.length);
        
        const response = await fetch(analyzeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText,
            jobTitle: jobTitle || 'General Position',
            jobDescription: jobDescription || '',
            userId: user?.uid || null
          }),
          // Set timeout for the fetch request - increase to 90 seconds
          signal: AbortSignal.timeout(90000), // 90 second timeout
        });
        
        console.log('Analyze resume API response status:', response.status);
        console.log('Analyze resume API response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check if the response is HTML instead of JSON
        const contentType = response.headers.get('content-type');
        console.log('Analyze resume API content type:', contentType);
        
        if (contentType && contentType.includes('text/html')) {
          console.error('Received HTML instead of JSON from analyze-resume API');
          const htmlText = await response.text();
          console.error('HTML response preview:', htmlText.substring(0, 200));
          throw new Error('API returned HTML instead of JSON. This might indicate a server configuration issue.');
        }
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('API error:', errorData);
          } catch (jsonError) {
            console.error('Failed to parse error response as JSON:', jsonError);
            errorData = { error: `HTTP error ${response.status}: ${response.statusText}` };
          }
          
          // Check if this is a non-resume error
          if (errorData.error === 'The uploaded file does not appear to be a resume') {
            setError(errorData.message || 'The uploaded file does not appear to be a resume. Please upload a valid resume document.');
            setIsAnalyzing(false);
            setUploadStep(1); // Go back to upload step
            return;
          }
          
          // Handle other API errors
          if (errorData.error === 'Insufficient balance') {
            setError('API credit limit reached. Please try again later.');
          } else {
            setError(`Error analyzing resume: ${errorData.error || 'Unknown error'}`);
          }
          
          // Check if it's a timeout (504) error, try fallback API
          if (response.status === 504 || errorData.error?.includes('timed out')) {
            console.log('Timeout detected, trying fallback API...');
            try {
              const fallbackResponse = await fetch('/api/analyze-resume-fallback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  resumeText,
                  jobTitle: jobTitle || 'General Position',
                  jobDescription: jobDescription || '',
                }),
              });
              
              if (fallbackResponse.ok) {
                const fallbackResult = await fallbackResponse.json();
                setAnalysisResult(fallbackResult);
                
                // Complete analysis progress
                clearInterval(analysisInterval);
                setAnalysisProgress(100);
                setAnalysisStage('Analysis complete! (Using simplified analysis due to timeout)');
                
                // Move to redirecting step
                setTimeout(() => {
                  setUploadStep(3);
                  
                  // Store analysis result in session storage for the results page
                  try {
                    sessionStorage.setItem('analysisResult', JSON.stringify(fallbackResult));
                    // Also store the resume text for reference in the results page
                    sessionStorage.setItem('resumeText', resumeText);
                    console.log('Fallback analysis result stored in session storage');
                  } catch (storageError) {
                    console.error('Error storing fallback result in session storage:', storageError);
                  }
                  
                  // Redirect to results page after analysis is complete
                  setTimeout(() => {
                    console.log('Redirecting to results page with fallback analysis...');
                    router.push('/results');
                  }, 1500);
                }, 1000);
                
                return; // Exit early as we've handled the fallback case
              } else {
                console.error('Fallback API also failed');
              }
            } catch (fallbackError) {
              console.error('Error using fallback API:', fallbackError);
            }
          }
          
          setIsAnalyzing(false);
          return;
        }
        
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse response as JSON:', jsonError);
          
          // Try to get the raw response text to see what's being returned
          try {
            const rawText = await response.clone().text();
            console.error('Raw response text:', rawText.substring(0, 200));
            
            if (rawText.includes('<!DOCTYPE html>')) {
              setError('The server returned an HTML page instead of JSON. This might indicate a server configuration issue.');
            } else {
              setError('Error processing API response. Please try again.');
            }
          } catch (textError) {
            console.error('Failed to get raw response text:', textError);
            setError('Error processing API response. Please try again.');
          }
          
          setIsAnalyzing(false);
          return;
        }
        
        if (!result) {
          console.error('API returned empty result');
          setError('The API returned an empty response. Please try again.');
          setIsAnalyzing(false);
          return;
        }
        
        if (result.error) {
          // Check if it's an insufficient balance error
          if (result.error.includes('insufficient balance') || result.error.includes('Insufficient Balance')) {
            console.error('API error - insufficient balance:', result.error);
            throw new Error('The AI service account has insufficient balance. Please try again later or contact support.');
          } else {
            throw new Error(result.error);
          }
        }
        
        console.log('API call successful');
        
        // Validate the result structure and provide defaults if missing
        if (!result.overallScore) result.overallScore = 70;
        if (!result.jobMatch) result.jobMatch = 65;
        if (!result.sections) result.sections = [];
        if (!Array.isArray(result.sections)) result.sections = [];
        if (result.sections.length === 0) {
          result.sections.push({
            name: "Overall Resume",
            score: 70,
            feedback: ["Your resume has been analyzed"],
            improvements: ["Consider adding more details to your resume"]
          });
        }
        
        // Ensure each section has the required properties
        result.sections = result.sections.map((section: any) => ({
          name: section.name || "Section",
          score: section.score || 70,
          feedback: Array.isArray(section.feedback) ? section.feedback : ["Good content in this section"],
          improvements: Array.isArray(section.improvements) ? section.improvements : ["Consider enhancing this section"]
        }));
        
        // Ensure keywordMatches is an array
        if (!result.keywordMatches || !Array.isArray(result.keywordMatches)) {
          result.keywordMatches = [];
        }
        
        setAnalysisResult(result);
        
        // Complete analysis progress
        clearInterval(analysisInterval);
        setAnalysisProgress(100);
        setAnalysisStage('Analysis complete!');
        
        // Move to redirecting step
        setTimeout(() => {
          setUploadStep(3);
          
          // Store analysis result in session storage for the results page
          try {
            sessionStorage.setItem('analysisResult', JSON.stringify(result));
            // Also store the resume text for reference in the results page
            sessionStorage.setItem('resumeText', resumeText);
            console.log('Analysis result and resume text stored in session storage');
          } catch (storageError) {
            console.error('Error storing result in session storage:', storageError);
          }
          
          // Redirect to results page after analysis is complete
          setTimeout(() => {
            console.log('Redirecting to results page...');
            router.push('/results');
          }, 1500);
        }, 1000);
        
      } catch (apiError: any) {
        clearInterval(analysisInterval);
        console.error('API Error:', apiError);
        
        // Check for timeout errors
        if (apiError.name === 'TimeoutError' || apiError.message.includes('timed out')) {
          console.log('Timeout detected, trying fallback API...');
          try {
            const fallbackResponse = await fetch('/api/analyze-resume-fallback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                resumeText,
                jobTitle: jobTitle || 'General Position',
                jobDescription: jobDescription || '',
              }),
            });
            
            if (fallbackResponse.ok) {
              const fallbackResult = await fallbackResponse.json();
              setAnalysisResult(fallbackResult);
              
              // Complete analysis progress
              setAnalysisProgress(100);
              setAnalysisStage('Analysis complete!');
              
              // Move to redirecting step
              setTimeout(() => {
                setUploadStep(3);
                
                // Store analysis result in session storage for the results page
                try {
                  sessionStorage.setItem('analysisResult', JSON.stringify(fallbackResult));
                  // Also store the resume text for reference in the results page
                  sessionStorage.setItem('resumeText', resumeText);
                  console.log('Fallback analysis result stored in session storage');
                } catch (storageError) {
                  console.error('Error storing fallback result in session storage:', storageError);
                }
                
                // Redirect to results page after analysis is complete
                setTimeout(() => {
                  console.log('Redirecting to results page with fallback analysis...');
                  router.push('/results');
                }, 1500);
              }, 1000);
              
              return; // Exit early as we've handled the fallback case
            } else {
              console.error('Fallback API also failed');
              setError('Unable to analyze your resume. Please try again.');
            }
          } catch (fallbackError) {
            console.error('Error using fallback API:', fallbackError);
            setError('Unable to analyze your resume. Please try again.');
          }
        }
        // Display a more user-friendly error message for insufficient balance
        else if (apiError.message.includes('insufficient balance') || apiError.message.includes('Insufficient Balance')) {
          setError('The AI service is currently unavailable due to account limitations. Please try again later or contact support.');
        } else {
          setError(`Analysis failed: ${apiError.message}`);
        }
        
        setIsAnalyzing(false);
        setUploadStep(1);
      }
      
    } catch (err: any) {
      console.error('General error:', err);
      setError(err.message || 'An error occurred during analysis');
      setIsAnalyzing(false);
      setUploadStep(1); // Return to upload step on error
    }
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    switch (uploadStep) {
      case 1:
        return (
          <div className="space-y-8">
            <FileUpload onFileUpload={handleFileUpload} />

            <div className="flex flex-col items-center space-y-4">
              {file && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full max-w-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                </Button>
              )}
              {user && (
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 text-sm">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        );
      
      case 2: // Processing step
        return (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8">
            <h2 className="text-2xl font-semibold mb-8 text-gray-900 text-center">Analyzing Your Resume</h2>
            
            <div className="max-w-md mx-auto">
              {/* Custom loading animation */}
              <div className="flex justify-center mb-8">
                {uploadProgress < 100 ? (
                  <div className="flex items-center">
                    <Upload className="h-8 w-8 text-indigo-600 mr-3 animate-bounce" />
                    <LoadingAnimation size="sm" color="indigo" />
                  </div>
                ) : analysisProgress < 100 ? (
                  <div className="flex items-center">
                    <Brain className="h-8 w-8 text-indigo-600 mr-3 animate-pulse" />
                    <LoadingAnimation size="sm" color="indigo" />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <span className="text-green-600 font-medium">Analysis Complete!</span>
                  </div>
                )}
              </div>
              
              {/* Current stage indicator */}
              <div className="text-center mb-6">
                <p className="text-indigo-700 font-medium">{analysisStage}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {uploadProgress < 100 
                    ? "Uploading and processing your document..." 
                    : analysisProgress < 50 
                      ? "Our AI is analyzing your resume content..." 
                      : analysisProgress < 100 
                        ? "Generating personalized recommendations..." 
                        : "Preparing your results..."}
                </p>
              </div>
              
              {/* Progress bars */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Document Processing</span>
                    <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">AI Analysis</span>
                    <span className="text-sm font-medium text-gray-700">{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Helpful tips while waiting */}
              <div className="mt-8 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-medium text-indigo-800 mb-2">While you wait...</h3>
                <p className="text-sm text-indigo-700">
                  Our AI is analyzing your resume against industry standards and best practices. 
                  This typically takes 30-60 seconds depending on the length and complexity of your resume.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 3: // Redirecting step
        return (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Analysis Complete!</h2>
            <p className="text-gray-700 mb-8">
              Your resume has been successfully analyzed. Redirecting you to your results...
            </p>
            <div className="flex justify-center">
              <LoadingAnimation size="sm" color="indigo" />
            </div>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-24 px-4 sm:px-6 bg-gradient-to-br from-white to-indigo-50">
        <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Upload Your Resume</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Our AI will analyze your resume and provide personalized feedback to help you land more interviews.
            </p>
          </div>

          <StaticExportNotice />

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start shadow-sm">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {renderStepContent()}

          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Your Privacy Matters</h3>
                <p className="text-gray-700">
                  Your resume data is encrypted and never shared with third parties. We use it only to provide you with personalized recommendations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
                className="py-3 px-8 text-base font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 