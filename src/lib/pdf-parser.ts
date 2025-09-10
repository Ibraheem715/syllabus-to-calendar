export interface PDFParseResult {
  text: string;
  numpages: number;
  info?: any;
  metadata?: any;
}

export class PDFProcessor {
  /**
   * Extract text content from PDF buffer
   */
  static async extractText(buffer: Buffer): Promise<PDFParseResult> {
    try {
      // Dynamic import to avoid build issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      
      return {
        text: data.text,
        numpages: data.numpages,
        info: data.info,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean and preprocess extracted text for better AI processing
   */
  static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page breaks and form feeds
      .replace(/[\f\r]/g, ' ')
      // Clean up bullet points and list markers
      .replace(/[•·‣⁃]/g, '-')
      // Normalize quotes
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Remove extra spaces around punctuation
      .replace(/\s+([.,;:!?])/g, '$1')
      // Ensure proper spacing after punctuation
      .replace(/([.,;:!?])([^\s])/g, '$1 $2')
      // Trim whitespace
      .trim();
  }

  /**
   * Validate PDF file before processing
   */
  static validatePDFBuffer(buffer: Buffer): boolean {
    // Check PDF magic number
    const pdfSignature = buffer.slice(0, 4).toString();
    return pdfSignature === '%PDF';
  }

  /**
   * Check if PDF might be scanned/image-based (basic heuristic)
   */
  static async isScannedPDF(buffer: Buffer): Promise<boolean> {
    try {
      const result = await this.extractText(buffer);
      const textLength = result.text.trim().length;
      const avgTextPerPage = textLength / result.numpages;
      
      // If very little text per page, likely scanned
      return avgTextPerPage < 100;
    } catch {
      return true; // Assume scanned if can't extract text
    }
  }

  /**
   * Extract text with preprocessing and validation
   */
  static async processForAI(buffer: Buffer): Promise<string> {
    // Validate PDF
    if (!this.validatePDFBuffer(buffer)) {
      throw new Error('Invalid PDF file format');
    }

    // Check if scanned
    if (await this.isScannedPDF(buffer)) {
      throw new Error('Scanned PDFs are not currently supported. Please provide a text-based PDF.');
    }

    // Extract and clean text
    const result = await this.extractText(buffer);
    const cleanedText = this.cleanText(result.text);

    if (cleanedText.length < 50) {
      throw new Error('PDF appears to contain very little text content');
    }

    return cleanedText;
  }
}