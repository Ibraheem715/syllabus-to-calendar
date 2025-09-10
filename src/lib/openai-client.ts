import OpenAI from 'openai';
import { SyllabusEvent, ProcessedSyllabus } from '@/types/syllabus';

export class SyllabusProcessor {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate the prompt for extracting syllabus events
   */
  private createExtractionPrompt(syllabusText: string): string {
    return `
You are an expert at analyzing academic syllabi and extracting important dates and events. 

Analyze the following syllabus text and extract ALL important dates, assignments, exams, and deadlines. Return the results as a JSON object with the following structure:

{
  "courseName": "Course name if mentioned",
  "instructor": "Instructor name if mentioned", 
  "semester": "Semester if mentioned (e.g. 'Fall 2024')",
  "year": 2024,
  "events": [
    {
      "title": "Assignment or event title",
      "description": "Detailed description of the assignment/event",
      "date": "YYYY-MM-DD format",
      "time": "HH:MM format if specific time mentioned, otherwise null",
      "type": "assignment|exam|reading|lecture|project|quiz|other",
      "priority": "high|medium|low",
      "location": "location if mentioned, otherwise null"
    }
  ]
}

Focus on extracting:
- Assignment due dates
- Exam dates and times
- Project deadlines
- Reading assignments with due dates
- Quiz dates
- Important class sessions or lectures
- Office hours (if recurring)
- Review sessions

Guidelines:
1. If no year is specified, assume the current or next academic year
2. For dates like "Week 3 Monday" or "Sept 15", try to determine the actual date
3. Mark exams and major projects as "high" priority
4. Mark regular assignments as "medium" priority  
5. Mark readings and optional items as "low" priority
6. If time is mentioned (e.g. "due at 11:59 PM"), include it
7. Be conservative - only extract clear, definite dates
8. If a date is ambiguous, include it but note the ambiguity in the description

Syllabus text:
${syllabusText}

Return only valid JSON, no additional text or explanations.`;
  }

  /**
   * Extract events from syllabus text using OpenAI
   */
  async extractEvents(syllabusText: string): Promise<ProcessedSyllabus> {
    try {
      const prompt = this.createExtractionPrompt(syllabusText);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4', // Use GPT-4 for better accuracy
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic assistant specializing in syllabus analysis. Return only valid JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      let parsedResult: ProcessedSyllabus;
      try {
        parsedResult = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid JSON response from AI model');
      }

      // Validate and clean the result
      return this.validateAndCleanResult(parsedResult);

    } catch (error) {
      console.error('OpenAI processing error:', error);
      throw new Error(`Failed to process syllabus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate and clean the extracted result
   */
  private validateAndCleanResult(result: any): ProcessedSyllabus {
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid result format');
    }

    const events: SyllabusEvent[] = [];
    
    if (Array.isArray(result.events)) {
      for (const event of result.events) {
        if (this.isValidEvent(event)) {
          events.push({
            id: this.generateEventId(),
            title: String(event.title).trim(),
            description: String(event.description || '').trim(),
            date: this.validateDate(event.date),
            time: event.time ? String(event.time).trim() : undefined,
            type: this.validateEventType(event.type),
            priority: this.validatePriority(event.priority),
            location: event.location ? String(event.location).trim() : undefined,
          });
        }
      }
    }

    return {
      events,
      courseName: result.courseName ? String(result.courseName).trim() : undefined,
      instructor: result.instructor ? String(result.instructor).trim() : undefined,
      semester: result.semester ? String(result.semester).trim() : undefined,
      year: result.year ? Number(result.year) : undefined,
    };
  }

  /**
   * Validate if an event object has required fields
   */
  private isValidEvent(event: any): boolean {
    return event && 
           typeof event.title === 'string' && 
           event.title.trim().length > 0 &&
           typeof event.date === 'string' &&
           this.isValidDateFormat(event.date);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private isValidDateFormat(dateStr: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate and format date
   */
  private validateDate(dateStr: string): string {
    if (!this.isValidDateFormat(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    return dateStr;
  }

  /**
   * Validate event type
   */
  private validateEventType(type: string): SyllabusEvent['type'] {
    const validTypes = ['assignment', 'exam', 'reading', 'lecture', 'project', 'quiz', 'other'];
    const lowerType = String(type).toLowerCase();
    return validTypes.includes(lowerType) ? lowerType as SyllabusEvent['type'] : 'other';
  }

  /**
   * Validate priority level
   */
  private validatePriority(priority: string): SyllabusEvent['priority'] {
    const validPriorities = ['high', 'medium', 'low'];
    const lowerPriority = String(priority).toLowerCase();
    return validPriorities.includes(lowerPriority) ? lowerPriority as SyllabusEvent['priority'] : 'medium';
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Fallback extraction using GPT-3.5-turbo for cost optimization
   */
  async extractEventsWithFallback(syllabusText: string): Promise<ProcessedSyllabus> {
    try {
      // Try GPT-4 first
      return await this.extractEvents(syllabusText);
    } catch (error) {
      console.warn('GPT-4 failed, trying GPT-3.5-turbo:', error);
      
      try {
        const prompt = this.createExtractionPrompt(syllabusText);
        
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert academic assistant specializing in syllabus analysis. Return only valid JSON responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response from OpenAI');
        }

        const parsedResult = JSON.parse(content);
        return this.validateAndCleanResult(parsedResult);

      } catch (fallbackError) {
        console.error('Both GPT-4 and GPT-3.5-turbo failed:', fallbackError);
        throw new Error('AI processing failed. Please try again or check your syllabus format.');
      }
    }
  }
}
