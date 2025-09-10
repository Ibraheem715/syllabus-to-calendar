import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-parser';
import { SyllabusProcessor } from '@/lib/openai-client';

export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    let extractedText: string;
    try {
      extractedText = await PDFProcessor.processForAI(buffer);
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      return NextResponse.json(
        { 
          success: false, 
          error: pdfError instanceof Error ? pdfError.message : 'Failed to process PDF' 
        },
        { status: 400 }
      );
    }

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
        },
        { status: 500 }
      );
    }

    // Process with OpenAI
    const syllabusProcessor = new SyllabusProcessor();
    let processedSyllabus;
    
    try {
      processedSyllabus = await syllabusProcessor.extractEventsWithFallback(extractedText);
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return NextResponse.json(
        { 
          success: false, 
          error: aiError instanceof Error ? aiError.message : 'Failed to process syllabus with AI' 
        },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      message: `Successfully extracted ${processedSyllabus.events.length} events from syllabus`,
      data: processedSyllabus
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while processing the syllabus' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
