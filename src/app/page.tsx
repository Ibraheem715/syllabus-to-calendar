'use client';

import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import CalendarView from '@/components/CalendarView';
import EventEditor from '@/components/EventEditor';
import { SyllabusEvent, ProcessedSyllabus, EventEditFormData } from '@/types/syllabus';
import { Download, Calendar, Share2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Home() {
  const [processedSyllabus, setProcessedSyllabus] = useState<ProcessedSyllabus | null>(null);
  const [events, setEvents] = useState<SyllabusEvent[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SyllabusEvent | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFileProcessed = (result: ProcessedSyllabus) => {
    setProcessedSyllabus(result);
    setEvents(result.events);
    setError('');
    setSuccessMessage(`Successfully extracted ${result.events.length} events from your syllabus!`);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccessMessage('');
  };

  const handleEventEdit = (event: SyllabusEvent) => {
    setEditingEvent(event);
    setIsEditorOpen(true);
  };

  const handleEventSave = (eventData: EventEditFormData) => {
    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...eventData }
          : event
      );
      setEvents(updatedEvents);
    } else {
      // Create new event
      const newEvent: SyllabusEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...eventData
      };
      setEvents([...events, newEvent]);
    }
    
    setIsEditorOpen(false);
    setEditingEvent(undefined);
    setSuccessMessage(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEventDelete = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    setSuccessMessage('Event deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateNewEvent = () => {
    setEditingEvent(undefined);
    setIsEditorOpen(true);
  };

  const downloadAsICS = () => {
    const icsContent = generateICSContent(events);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${processedSyllabus?.courseName || 'syllabus'}-calendar.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMessage('Calendar file downloaded successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const generateICSContent = (events: SyllabusEvent[]): string => {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Syllabus to Calendar//EN\n';
    
    events.forEach(event => {
      const startDate = new Date(event.date);
      let dtstart = startDate.toISOString().replace(/[-:]/g, '').split('.')[0];
      let dtend = startDate.toISOString().replace(/[-:]/g, '').split('.')[0];
      
      if (event.time) {
        const [hours, minutes] = event.time.split(':').map(Number);
        startDate.setHours(hours, minutes);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1); // 1 hour duration by default
        dtstart = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        dtend = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      } else {
        // All-day event
        dtstart = startDate.toISOString().split('T')[0].replace(/-/g, '');
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        dtend = endDate.toISOString().split('T')[0].replace(/-/g, '');
      }

      ics += `BEGIN:VEVENT\n`;
      ics += `UID:${event.id}@syllabus-to-calendar\n`;
      ics += `DTSTART${event.time ? '' : ';VALUE=DATE'}:${dtstart}\n`;
      ics += `DTEND${event.time ? '' : ';VALUE=DATE'}:${dtend}\n`;
      ics += `SUMMARY:${event.title}\n`;
      ics += `DESCRIPTION:${event.description}\\n\\nType: ${event.type}\\nPriority: ${event.priority}\n`;
      if (event.location) {
        ics += `LOCATION:${event.location}\n`;
      }
      ics += `END:VEVENT\n`;
    });
    
    ics += 'END:VCALENDAR';
    return ics;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📅 Syllabus to Calendar
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload your syllabus PDF and automatically extract assignments, exams, and important dates 
          into a beautiful calendar view. Powered by AI for accurate content extraction.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {!processedSyllabus && (
        <div>
          <FileUpload onFileProcessed={handleFileProcessed} onError={handleError} />
          
          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Extraction</h3>
              <p className="text-gray-600">
                AI-powered parsing extracts assignments, exams, and deadlines with high accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600">
                Export to Google Calendar, download as .ics file, or view in our web interface
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Editing</h3>
              <p className="text-gray-600">
                Review and edit extracted events before exporting to your preferred calendar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar and Results Section */}
      {processedSyllabus && (
        <div className="space-y-6">
          {/* Course Info */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {processedSyllabus.courseName || 'Course Calendar'}
                </h2>
                {processedSyllabus.instructor && (
                  <p className="text-gray-600 mt-1">Instructor: {processedSyllabus.instructor}</p>
                )}
                {processedSyllabus.semester && (
                  <p className="text-gray-600">Semester: {processedSyllabus.semester}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateNewEvent}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Add Event
                </button>
                
                <button
                  onClick={downloadAsICS}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download .ics
                </button>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <CalendarView 
            events={events}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDelete}
          />

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setProcessedSyllabus(null);
                setEvents([]);
                setError('');
                setSuccessMessage('');
              }}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Upload a different syllabus
            </button>
          </div>
        </div>
      )}

      {/* Event Editor Modal */}
      <EventEditor
        event={editingEvent}
        isOpen={isEditorOpen}
        onSave={handleEventSave}
        onCancel={() => {
          setIsEditorOpen(false);
          setEditingEvent(undefined);
        }}
      />
    </div>
  );
}
