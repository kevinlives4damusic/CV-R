import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, TextExtractionResponse } from '@/types';
import { parsePDF } from '@/lib/pdf-parser';

// Skip actual PDF processing during build time
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export async function POST(request: NextRequest) {
  try {
    // During build time, return a mock response
    if (isBuildTime || isStaticExport) {
      console.log('Build time or static export detected, returning mock response');
      return NextResponse.json<ApiResponse<TextExtractionResponse>>({
        data: { text: "Mock text for build process or static export" },
        status: 'success'
      });
    }

    // Check if the request is multipart/form-data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json<ApiResponse<never>>({
        error: 'Request must be multipart/form-data',
        status: 'error'
      }, { status: 400 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ApiResponse<never>>({
        error: 'No file provided',
        status: 'error'
      }, { status: 400 });
    }

    // Check file type and support more file types
    const fileType = file.type;
    const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!supportedTypes.some(type => fileType.includes(type))) {
      return NextResponse.json<ApiResponse<never>>({
        error: 'Unsupported file type. Please upload a PDF, Word document, image, or text file.',
        status: 'error'
      }, { status: 400 });
    }

    // Convert the file to an ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    try {
      // Use our custom PDF parser
      const data = await parsePDF(buffer);
      
      // Return the extracted text
      return NextResponse.json<ApiResponse<TextExtractionResponse>>({
        data: { text: data.text },
        status: 'success'
      });
    } catch (pdfError: any) {
      console.error('PDF processing error:', pdfError);
      return NextResponse.json<ApiResponse<never>>({
        error: `Failed to process file: ${pdfError.message}`,
        status: 'error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error extracting text from file:', error);
    return NextResponse.json<ApiResponse<never>>({
      error: `Failed to extract text: ${error.message}`,
      status: 'error'
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 