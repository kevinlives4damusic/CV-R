// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: 'success' | 'error';
}

// Text Extraction Types
export interface TextExtractionResponse {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    creationDate?: string;
    pageCount?: number;
  };
}

// User Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Resume Analysis Types
export interface ResumeAnalysis {
  id: string;
  userId: string;
  resumeText: string;
  analysis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keywords: string[];
    sections: {
      [key: string]: {
        score: number;
        feedback: string;
      };
    };
  };
  createdAt: number;
}

// Analysis Response Type
export interface AnalysisResponse {
  id?: string;
  job_title?: string;
  overallScore?: number;
  jobMatch?: number;
  sections?: Array<{
    name: string;
    score: number;
    feedback?: string[];
    improvements?: string[];
  }>;
  keywordMatches?: Array<{
    keyword: string;
    found: boolean;
  }>;
  created_at?: any;
  status?: 'processing' | 'completed' | 'failed';
}

// Comparison Types
export interface ResumeComparison {
  id: string;
  userId: string;
  resumeIds: string[];
  results: {
    [resumeId: string]: {
      score: number;
      strengths: string[];
      weaknesses: string[];
    };
  };
  createdAt: number;
} 