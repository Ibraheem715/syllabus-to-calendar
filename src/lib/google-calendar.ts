import { google } from 'googleapis';
import { SyllabusEvent, GoogleCalendarEvent } from '@/types/syllabus';

export class GoogleCalendarService {
  private calendar;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Convert SyllabusEvent to Google Calendar event format
   */
  private convertToGoogleEvent(event: SyllabusEvent): GoogleCalendarEvent {
    const startDate = new Date(event.date);
    const endDate = new Date(event.date);

    // If time is specified, use it
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      startDate.setHours(hours, minutes);
      endDate.setHours(hours + (event.duration ? Math.floor(event.duration / 60) : 1), 
                      minutes + (event.duration ? event.duration % 60 : 0));
    } else {
      // All-day event
      endDate.setDate(endDate.getDate() + 1);
    }

    const googleEvent: GoogleCalendarEvent = {
      summary: event.title,
      description: this.formatDescription(event),
      location: event.location,
      start: {},
      end: {},
    };

    if (event.time) {
      googleEvent.start = {
        dateTime: startDate.toISOString(),
        timeZone: 'America/New_York', // Default timezone, could be configurable
      };
      googleEvent.end = {
        dateTime: endDate.toISOString(),
        timeZone: 'America/New_York',
      };
    } else {
      googleEvent.start = {
        date: event.date,
      };
      googleEvent.end = {
        date: endDate.toISOString().split('T')[0],
      };
    }

    return googleEvent;
  }

  /**
   * Format event description for Google Calendar
   */
  private formatDescription(event: SyllabusEvent): string {
    let description = event.description;
    
    description += `\n\nEvent Type: ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`;
    description += `\nPriority: ${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}`;
    
    if (event.course) {
      description += `\nCourse: ${event.course}`;
    }
    
    description += '\n\nCreated by Syllabus-to-Calendar';
    
    return description;
  }

  /**
   * Create a single event in Google Calendar
   */
  async createEvent(event: SyllabusEvent, calendarId: string = 'primary'): Promise<string> {
    try {
      const googleEvent = this.convertToGoogleEvent(event);
      
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: googleEvent,
      });

      return response.data.id || '';
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error(`Failed to create event: ${event.title}`);
    }
  }

  /**
   * Create multiple events in Google Calendar
   */
  async createEvents(events: SyllabusEvent[], calendarId: string = 'primary'): Promise<{ success: string[], failed: { event: SyllabusEvent, error: string }[] }> {
    const success: string[] = [];
    const failed: { event: SyllabusEvent, error: string }[] = [];

    for (const event of events) {
      try {
        const eventId = await this.createEvent(event, calendarId);
        success.push(eventId);
      } catch (error) {
        failed.push({
          event,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success, failed };
  }

  /**
   * Get list of user's calendars
   */
  async getCalendars() {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw new Error('Failed to fetch calendars');
    }
  }

  /**
   * Create a new calendar for syllabus events
   */
  async createSyllabusCalendar(courseName: string): Promise<string> {
    try {
      const response = await this.calendar.calendars.insert({
        requestBody: {
          summary: `${courseName} - Syllabus Events`,
          description: `Calendar created for ${courseName} syllabus events`,
          timeZone: 'America/New_York',
        },
      });

      return response.data.id || '';
    } catch (error) {
      console.error('Error creating calendar:', error);
      throw new Error('Failed to create calendar');
    }
  }
}

/**
 * Generate Google OAuth URL for calendar access
 */
export function getGoogleAuthUrl(clientId: string, redirectUri: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
  });
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string }> {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return {
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || undefined,
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw new Error('Failed to authenticate with Google');
  }
}
