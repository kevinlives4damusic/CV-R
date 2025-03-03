'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, Zap, Shield, BarChart } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleButtonClick = (path: string) => {
    setIsLoading(true);
    router.push(path);
  };
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-indigo-50 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Get Your CV Past <span className="text-indigo-600">AI Gatekeepers</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Our AI-powered resume review helps you optimize your resume to pass through Applicant Tracking Systems and land more interviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="accent" 
                  size="lg"
                  onClick={() => handleButtonClick('/upload')}
                  className="w-full sm:w-auto py-3 px-8 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-2px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <>
                      Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleButtonClick(user ? '/upload' : '/auth/login')}
                  className="w-full sm:w-auto py-3 px-8 text-base font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <>
                      {user ? 'Check Your Resume' : 'Log In'}
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-2 text-gray-600">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-sm">Your data is secure and never shared</span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resume Analysis</h3>
                    <p className="text-sm text-gray-600">AI-powered feedback</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">Overall Score</span>
                      <span className="text-indigo-600 font-bold">78%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">ATS Compatibility</span>
                      <span className="text-green-600 font-bold">92%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-green-400 to-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">Keyword Match</span>
                      <span className="text-amber-600 font-bold">65%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 relative w-full h-48 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/resume-dashboard.webp" 
                    alt="Resume Analysis Dashboard" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                AI-Powered
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-xl z-0"></div>
              <div className="absolute -left-4 -top-4 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-xl z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container-custom">
          <p className="text-center text-gray-600 mb-8">Trusted by job seekers applying to</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="opacity-70 hover:opacity-100 transition-all">
              <p className="text-xl font-bold text-gray-800">GOOGLE</p>
            </div>
            <div className="opacity-70 hover:opacity-100 transition-all">
              <p className="text-xl font-bold text-gray-800">MICROSOFT</p>
            </div>
            <div className="opacity-70 hover:opacity-100 transition-all">
              <p className="text-xl font-bold text-gray-800">AMAZON</p>
            </div>
            <div className="opacity-70 hover:opacity-100 transition-all">
              <p className="text-xl font-bold text-gray-800">APPLE</p>
            </div>
            <div className="opacity-70 hover:opacity-100 transition-all">
              <p className="text-xl font-bold text-gray-800">META</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Resume.AI Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform analyzes your resume against industry standards and job requirements to help you land more interviews.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Resume</h3>
              <p className="text-gray-600">
                Simply upload your resume in PDF, Word, or image format. Our AI will extract and analyze the content.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your resume against ATS systems and industry standards to identify strengths and weaknesses.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <BarChart className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Detailed Feedback</h3>
              <p className="text-gray-600">
                Receive a comprehensive report with actionable suggestions to improve your resume and increase your chances of landing interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Improve Your Resume?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of job seekers who have optimized their resumes and landed their dream jobs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
                variant="accent" 
            size="lg"
                onClick={() => handleButtonClick('/upload')}
                className="w-full sm:w-auto py-3 px-8 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:translate-y-[-2px] bg-white text-indigo-600 hover:bg-gray-100"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              <>
                    Upload Your Resume <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

