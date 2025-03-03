import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createHash } from 'crypto';
import { ApiResponse, AnalysisResponse } from '@/types';

// Check if we're in a build/static export environment
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// DeepSeek API configuration
const deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
const deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';

console.log('DeepSeek API Key exists:', !!deepseekApiKey);
console.log('DeepSeek API Key first 5 chars:', deepseekApiKey?.substring(0, 5));

// Generate a hash for the input to use as a cache key
function generateCacheKey(resumeText: string, jobTitle: string, jobDescription: string): string {
  const input = `${resumeText}|${jobTitle}|${jobDescription}`;
  return createHash('md5').update(input).digest('hex');
}

// Check if we have a cached result
async function getCachedResult(cacheKey: string) {
  try {
    // Query Firestore for cached results
    const cacheCollection = collection(db, 'analysis_cache');
    const q = query(cacheCollection, where('cache_key', '==', cacheKey));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Return the first matching document
      const cachedDoc = querySnapshot.docs[0].data();
      console.log('Cache hit! Using cached analysis result');
      return cachedDoc.result;
    }
    
    console.log('Cache miss. No cached result found.');
    return null;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null; // Proceed without caching on error
  }
}

// Store result in cache
async function cacheResult(cacheKey: string, result: any, userId: string | null) {
  try {
    // Add to Firestore cache collection
    await addDoc(collection(db, 'analysis_cache'), {
      cache_key: cacheKey,
      result: result,
      user_id: userId,
      created_at: serverTimestamp(),
      // Set TTL to 7 days (in milliseconds)
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    console.log('Analysis result cached successfully');
  } catch (error) {
    console.error('Error caching result:', error);
    // Continue without caching on error
  }
}

// Call DeepSeek API
async function callDeepSeekAPI(prompt: string) {
  try {
    console.log('DeepSeek API Key exists:', !!process.env.DEEPSEEK_API_KEY);
    console.log('DeepSeek API Key first 5 chars:', process.env.DEEPSEEK_API_KEY?.substring(0, 5));
    
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured');
    }
    
    // Log the request details (without sensitive data)
    console.log('Calling DeepSeek API with prompt length:', prompt.length);
    
    // Use a simple timeout promise
    const fetchWithTimeout = async (url: string, options: any, timeout: number) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal as any // Cast to any to avoid type issues
        });
        return response;
      } catch (fetchError: any) {
        console.error('Fetch error in fetchWithTimeout:', fetchError.message);
        // Rethrow with more context
        throw new Error(`Network error during API call: ${fetchError.message}`);
      } finally {
        clearTimeout(id);
      }
    };
    
    let response;
    try {
      response = await fetchWithTimeout(
        'https://api.deepseek.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are an expert resume analyst and career coach. Analyze the resume and provide detailed feedback. ONLY use the information provided in the resume text. If the text indicates it was extracted from an image (contains "[Image Analysis:" tag), pay special attention to the formatting and structure. Do NOT reference or assume information from external sources like LinkedIn or other profiles. Only analyze what is explicitly stated in the resume text.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        },
        180000 // 180 second timeout (3 minutes)
      );
    } catch (timeoutError: any) {
      console.error('Timeout or network error calling DeepSeek API:', timeoutError.message);
      throw new Error(`API call failed: ${timeoutError.message}`);
    }

    // Log the response status and headers for debugging
    console.log('DeepSeek API response status:', response.status);
    
    // Convert headers to a simple object for logging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('DeepSeek API response headers:', JSON.stringify(headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', `DeepSeek API returned ${response.status}: ${errorText}`);
      throw new Error(`DeepSeek API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received successfully');
    
    // Log a sample of the response (first 100 chars)
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const sampleContent = data.choices[0].message.content.substring(0, 100);
      console.log('DeepSeek API response sample:', sampleContent + '...');
    }
    
    return data;
  } catch (error: any) {
    console.error('DeepSeek API error:', error.message);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  // During build time, return a mock response
  if (isBuildTime) {
    console.log('Build time detected, returning mock response');
    return NextResponse.json<ApiResponse<AnalysisResponse>>({
      data: {
        id: 'mock-id',
        overallScore: 75,
        jobMatch: 70,
        sections: [],
        status: 'completed'
      },
      status: 'success'
    });
  }
  
  console.log('API route called');
  
  try {
    // Parse the request body
    const { resumeText, jobTitle, jobDescription, userId } = await request.json();
    
    // Validate the request
    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }
    
    console.log('Analyzing resume for job:', jobTitle || 'General Position');
    console.log('Resume text length:', resumeText.length);
    
    // Check if the text contains a warning about non-resume content
    if (resumeText.includes('does not appear to be a resume')) {
      console.log('Non-resume content detected');
      return NextResponse.json(
        { 
          error: 'The uploaded file does not appear to be a resume',
          message: resumeText,
          details: 'The system detected that the uploaded file may not be a resume. Please upload a valid resume document.'
        }, 
        { status: 400 }
      );
    }
    
    // Check if the text contains mock data
    if (resumeText.includes('[THIS IS MOCK RESUME DATA - NOT FROM USER UPLOAD]')) {
      console.log('Mock resume data detected');
      return NextResponse.json(
        { 
          error: 'The system is using mock resume data instead of your actual resume',
          message: 'Please try uploading your resume again with a different filename. Make sure the filename contains resume-related keywords like "resume", "cv", etc.',
          details: 'The system detected that mock data is being used instead of your actual resume. This typically happens when the system cannot properly extract text from your uploaded file.'
        }, 
        { status: 400 }
      );
    }

    // Clean up PDF text if needed
    let textForAnalysis = resumeText;
    if (resumeText.includes('[PDF DOCUMENT:')) {
      console.log('PDF document detected, cleaning up text for analysis');
      
      // Remove the PDF header
      let cleanedText = resumeText.replace(/\[PDF DOCUMENT: .+\]\s*/, '');
      
      // Remove page markers
      cleanedText = cleanedText.replace(/--- Page \d+ ---\s*/g, '');
      
      // Use the cleaned text for analysis
      textForAnalysis = cleanedText;
    }

    // Generate cache key for the analysis request
    const cacheKey = generateCacheKey(textForAnalysis, jobTitle || '', jobDescription || '');
    
    // Check if we have a cached result
    const cachedResult = await getCachedResult(cacheKey);
    
    if (cachedResult) {
      // Return cached result
      console.log('Returning cached analysis result');
      return NextResponse.json(cachedResult);
    }

    // Prepare the prompt with the resume text and job description
    const prompt = `
I need you to analyze the following resume for a ${jobTitle || 'General Position'} role.

${jobDescription ? `The job description is as follows:
${jobDescription}

` : ''}

The resume text is as follows:
${textForAnalysis}

Please provide a comprehensive analysis of this resume with the following:

1. Overall score (0-100)
2. Job match score (0-100) if a job description is provided
3. Section-by-section analysis with scores and feedback for each major section (e.g., Contact Information, Summary, Experience, Education, Skills, etc.)
4. Specific improvements for each section
5. Keyword matches if a job description is provided

Format your response as a JSON object with the following structure:
{
  "overallScore": number,
  "jobMatch": number,
  "sections": [
    {
      "name": string,
      "score": number,
      "feedback": string[],
      "improvements": string[]
    }
  ],
  "keywordMatches": [
    {
      "keyword": string,
      "found": boolean
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Base your analysis ONLY on the resume text provided above.
2. Do NOT reference or assume information from external sources like LinkedIn or other profiles.
3. Do NOT use any default or template resume data (especially not the "Alex Taylor" resume).
4. Only analyze what is explicitly stated in the resume text provided.
5. If the resume appears to be invalid or not a proper resume, indicate this in your analysis.
6. If the resume text is from a PDF, focus on the actual content and ignore any formatting artifacts.
7. Provide specific, actionable feedback that will help improve the resume.

Return ONLY the JSON object with no additional text.
`;

    try {
      // Call DeepSeek API
      console.log('Calling DeepSeek API...');
      const data = await callDeepSeekAPI(prompt);

      // Parse the response
      let analysisResult;
      try {
        // Try to parse the response as JSON
        const responseText = data.choices[0].message.content || '';
        console.log('Raw response text:', responseText.substring(0, 100) + '...');
        
        // Check if the response is wrapped in markdown code blocks
        let jsonText = responseText;
        
        // Try to extract JSON from markdown code blocks
        const markdownJsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const markdownMatch = responseText.match(markdownJsonRegex);
        
        if (markdownMatch && markdownMatch[1]) {
          console.log('Found JSON in markdown code block');
          jsonText = markdownMatch[1];
        }
        
        try {
          analysisResult = JSON.parse(jsonText);
          console.log('Successfully parsed JSON');
        } catch (innerParseError) {
          console.error('Failed to parse JSON from API response:', innerParseError);
          console.log('Attempting to clean and parse JSON...');
          
          // Try to clean the JSON string and parse again
          const cleanedJsonText = jsonText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/\\(?!["\\/bfnrt])/g, '\\\\') // Escape backslashes
            .replace(/"/g, '\\"') // Escape quotes
            .replace(/\n/g, '\\n') // Replace newlines
            .replace(/\r/g, '\\r') // Replace carriage returns
            .replace(/\t/g, '\\t'); // Replace tabs
          
          try {
            analysisResult = JSON.parse(`{"rawText": "${cleanedJsonText}"}`);
            console.log('Successfully parsed cleaned JSON');
          } catch (cleanedParseError) {
            console.error('Failed to parse cleaned JSON:', cleanedParseError);
            throw new Error('Failed to parse API response as JSON. The API returned an invalid response format.');
          }
        }
      } catch (parseError: any) {
        console.error('Error parsing API response:', parseError);
        return NextResponse.json({ 
          error: 'Failed to parse API response',
          details: `The API response could not be parsed: ${parseError.message}`,
          rawResponse: data.choices[0]?.message?.content?.substring(0, 500) || 'No response content'
        }, { status: 500 });
      }
      
      // Validate the analysis result
      if (!analysisResult || typeof analysisResult !== 'object') {
        console.error('Invalid analysis result:', analysisResult);
        return NextResponse.json({ 
          error: 'Invalid analysis result',
          details: 'The API returned an invalid analysis result. Please try again.'
        }, { status: 500 });
      }
      
      // Ensure the result has the expected structure
      if (!analysisResult.overallScore) {
        analysisResult.overallScore = 0;
      }
      
      if (!analysisResult.sections || !Array.isArray(analysisResult.sections)) {
        analysisResult.sections = [];
      }
      
      // Cache the result
      await cacheResult(cacheKey, analysisResult, userId);
      
      // Return the analysis result
      console.log('Returning analysis result');
      return NextResponse.json(analysisResult);
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      
      // Check if it's a timeout error
      if (error.message && error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Analysis timeout',
          details: 'The resume analysis took too long to complete. Please try again or use a shorter resume.',
          message: error.message
        }, { status: 504 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to analyze resume',
        details: error.message || 'An unknown error occurred during resume analysis.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unhandled error in API route:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error.message || 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
} 