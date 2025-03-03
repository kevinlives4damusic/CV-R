import pdfParse from 'pdf-parse';

export async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  try {
    const data = await pdfParse(buffer, {
      // Disable any test file loading
      max: 0,
    });
    return { text: data.text };
  } catch (error: any) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
} 