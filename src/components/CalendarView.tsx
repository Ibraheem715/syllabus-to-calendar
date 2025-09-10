'use client';

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { SyllabusEvent } from '@/types/syllabus';
import { Calendar as CalendarIcon, List, Clock, MapPin, AlertCircle } from 'lucide-react';

interface CalendarViewProps {
  events: SyllabusEvent[];
  onEventEdit?: (event: SyllabusEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

type ViewMode = 'calendar' | 'list';

export default function CalendarView({ events, onEventEdit, onEventDelete }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SyllabusEvent | null>(null);

  // Group events by date for calendar display
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = event.date;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, SyllabusEvent[]>);

  // Get events for a specific date
  const getEventsForDate = (date: Date): SyllabusEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return eventsByDate[dateStr] || [];
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div className="flex flex-wrap justify-center mt-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className={`calendar-event-indicator event-${event.priority}`}
                title={event.title}
              />
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 ml-1">+{dayEvents.length - 3}</div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
    } else {
      setSelectedEvent(null);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return '📝';
      case 'assignment':
        return '📄';
      case 'reading':
        return '📚';
      case 'lecture':
        return '🎓';
      case 'project':
        return '🚀';
      case 'quiz':
        return '❓';
      default:
        return '📌';
    }
  };

  // Sort events by date and priority
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    // If same date, sort by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="w-full">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Calendar Events ({events.length} total)
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar
              onChange={(date) => handleDateClick(date as Date)}
              value={selectedDate}
              tileContent={tileContent}
              className="w-full"
            />
          </div>

          {/* Selected Date Events */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(
                      event.priority
                    )}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{getTypeIcon(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        {event.time && (
                          <div className="flex items-center text-xs mt-1 opacity-75">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.time}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No events on this date</p>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border">
          {sortedEvents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getTypeIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            event.priority
                          )}`}
                        >
                          {event.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        {event.time && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {event.time}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events to display</p>
            </div>
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getTypeIcon(selectedEvent.type)}</span>
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700">{selectedEvent.description}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedEvent.time}
                  </div>
                )}
              </div>

              {selectedEvent.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedEvent.location}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    selectedEvent.priority
                  )}`}
                >
                  {selectedEvent.priority} priority
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {selectedEvent.type}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              {onEventEdit && (
                <button
                  onClick={() => {
                    onEventEdit(selectedEvent);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Edit Event
                </button>
              )}
              {onEventDelete && (
                <button
                  onClick={() => {
                    onEventDelete(selectedEvent.id!);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
