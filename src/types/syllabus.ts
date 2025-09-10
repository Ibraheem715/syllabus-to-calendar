export interface SyllabusEvent {
  id?: string;
  title: string;
  description: string;
  date: string; // ISO format (YYYY-MM-DD)
  time?: string; // HH:MM format
  type: 'assignment' | 'exam' | 'reading' | 'lecture' | 'project' | 'quiz' | 'other';
  priority: 'high' | 'medium' | 'low';
  course?: string;
  location?: string;
  duration?: number; // in minutes
}

export interface ProcessedSyllabus {
  events: SyllabusEvent[];
  courseName?: string;
  instructor?: string;
  semester?: string;
  year?: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: ProcessedSyllabus;
  error?: string;
}

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  location?: string;
}

export interface CalendarViewMode {
  type: 'month' | 'week' | 'list';
}

export interface EventEditFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  type: SyllabusEvent['type'];
  priority: SyllabusEvent['priority'];
  location?: string;
}
