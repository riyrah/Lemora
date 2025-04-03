"use client";

import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addHours, subDays, endOfWeek, setHours, setMinutes, setSeconds, setMilliseconds, roundToNearestMinutes, addMinutes, subMinutes } from 'date-fns';
import { useState, useMemo, useRef, useEffect } from 'react';
import { DashboardButton } from "@/components/dashboard-button";
import { EventEditPopover } from './EventEditPopover';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category?: string;
  goalId?: string;
  status?: 'planned' | 'logged' | 'incomplete';
  color: string;
  notes?: string;
}

const mockCategories: Record<string, { color: string }> = {
  'Deep Work': { color: '#3b82f6' },
  'Meetings': { color: '#f97316' },
  'Personal': { color: '#16a34a' },
  'Learning': { color: '#8b5cf6' },
  'Admin': { color: '#6b7280' },
};
const defaultCategoryColor = '#d1d5db';

interface CalendarProps {
  onClose?: () => void;
}

export const Calendar = ({ onClose }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Team Sync', start: setHours(new Date(), 9), end: setHours(new Date(), 10), category: 'Meetings', status: 'planned', color: mockCategories['Meetings'].color },
    { id: '2', title: 'Code Review', start: setHours(addDays(new Date(), 1), 14), end: setMinutes(setHours(addDays(new Date(), 1), 15), 30), category: 'Deep Work', status: 'planned', color: mockCategories['Deep Work'].color },
    { id: '3', title: 'Gym', start: setHours(subDays(new Date(), 1), 18), end: setHours(subDays(new Date(), 1), 19), category: 'Personal', status: 'logged', color: mockCategories['Personal'].color },
  ]);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingEventInfo, setResizingEventInfo] = useState<{
    id: string;
    initialStart?: Date;
    initialEnd?: Date;
    startY: number;
    dayStart: Date;
    resizeDirection: 'top' | 'bottom';
  } | null>(null);
  const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);

  const handlePrev = () => {
    setCurrentDate(prev => {
      if (viewMode === 'day') return subDays(prev, 1);
      if (viewMode === 'week') return subDays(prev, 7);
      if (viewMode === 'month') return subDays(prev, 31);
      return prev;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      if (viewMode === 'day') return addDays(prev, 1);
      if (viewMode === 'week') return addDays(prev, 7);
      if (viewMode === 'month') return addDays(prev, 31);
      return prev;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calculatePopoverPosition = (event: React.MouseEvent<HTMLElement>) => {
    if (!scrollContainerRef.current) return { top: 0, left: 0 };

    const clickTarget = event.currentTarget;
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const targetRect = clickTarget.getBoundingClientRect();

    let top = targetRect.top - containerRect.top + scrollContainerRef.current.scrollTop;
    let left = targetRect.left - containerRect.left + clickTarget.offsetWidth + 5;

    const popoverWidthEstimate = 320;
    const popoverHeightEstimate = 250;

    if (left + popoverWidthEstimate > scrollContainerRef.current.clientWidth) {
      left = targetRect.left - containerRect.left - popoverWidthEstimate - 5;
    }

    return { top: Math.max(0, top), left: Math.max(0, left) };
  };

  const handleTimeSlotClick = (startTime: Date, event: React.MouseEvent<HTMLElement>) => {
    console.log('Slot clicked:', startTime, event);
    const position = calculatePopoverPosition(event);
    setEditingEvent({
      start: startTime,
      end: addHours(startTime, 1),
      status: 'planned',
    });
    setPopoverPosition(position);
  };

  const handleEventClick = (calendarEvent: CalendarEvent, event: React.MouseEvent<HTMLElement>) => {
    console.log('Event clicked:', calendarEvent, event);
    const position = calculatePopoverPosition(event);
    setEditingEvent(calendarEvent);
    setPopoverPosition(position);
  };

  const handleClosePopover = () => {
    setEditingEvent(null);
    setPopoverPosition(null);
  };

  const handleSaveEvent = (eventToSave: CalendarEvent) => {
    console.log("Saving event:", eventToSave);
    if (editingEvent?.id) {
        setEvents(prevEvents => prevEvents.map(ev => ev.id === eventToSave.id ? eventToSave : ev));
    } else {
        setEvents(prevEvents => [...prevEvents, eventToSave]);
    }
    handleClosePopover();
  };

  const handleDeleteEvent = (eventId: string) => {
      console.log("Deleting event:", eventId);
      setEvents(prevEvents => prevEvents.filter(ev => ev.id !== eventId));
      handleClosePopover();
  };

  const handleResizeTopMouseDown = (event: React.MouseEvent<HTMLDivElement>, eventToResize: CalendarEvent, dayStart: Date) => {
    event.stopPropagation();
    event.preventDefault();
    setIsResizing(true);
    setResizingEventInfo({
      id: eventToResize.id,
      initialStart: eventToResize.start,
      startY: event.clientY,
      dayStart: dayStart,
      resizeDirection: 'top',
    });
  };

  const handleResizeBottomMouseDown = (event: React.MouseEvent<HTMLDivElement>, eventToResize: CalendarEvent, dayStart: Date) => {
    event.stopPropagation();
    event.preventDefault();
    setIsResizing(true);
    setResizingEventInfo({
      id: eventToResize.id,
      initialEnd: eventToResize.end,
      startY: event.clientY,
      dayStart: dayStart,
      resizeDirection: 'bottom',
    });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!resizingEventInfo) return;

      const { id, initialStart, initialEnd, startY, dayStart, resizeDirection } = resizingEventInfo;
      const timeSlotHeight = 48;
      const deltaY = event.clientY - startY;
      const minutesPerPixel = 60 / timeSlotHeight;
      const deltaMinutes = deltaY * minutesPerPixel;
      
      const originalEvent = events.find(e => e.id === id);
      if (!originalEvent) return; 

      let newStartTime = originalEvent.start;
      let newEndTime = originalEvent.end;
      const minDuration = 15;

      if (resizeDirection === 'top' && initialStart) {
        newStartTime = addMinutes(initialStart, deltaMinutes);
        const earliestAllowedStart = subMinutes(originalEvent.end, minDuration);
        if (newStartTime > earliestAllowedStart) {
          newStartTime = earliestAllowedStart;
        }
      } else if (resizeDirection === 'bottom' && initialEnd) {
        newEndTime = addMinutes(initialEnd, deltaMinutes);
        const minEndTime = addMinutes(originalEvent.start, minDuration);
        if (newEndTime < minEndTime) {
            newEndTime = minEndTime;
        }
      }

      setPreviewEvent({ ...originalEvent, start: newStartTime, end: newEndTime });
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!resizingEventInfo) return;

      const { id, resizeDirection } = resizingEventInfo;
      const finalEvent = previewEvent;

      if (finalEvent) {
          let updatedEventProps: Partial<CalendarEvent> = {};
          if (resizeDirection === 'top') {
              updatedEventProps.start = roundToNearestMinutes(finalEvent.start, { nearestTo: 15 });
          } else if (resizeDirection === 'bottom') {
              updatedEventProps.end = roundToNearestMinutes(finalEvent.end, { nearestTo: 15 });
          }
          
          setEvents(prevEvents => 
            prevEvents.map(ev => 
              ev.id === id ? { ...ev, ...updatedEventProps } : ev
            )
          );
      }

      setIsResizing(false);
      setResizingEventInfo(null);
      setPreviewEvent(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizingEventInfo, events, previewEvent]);

  const currentWeekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const firstDayOfGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = Array.from({ length: 35 }, (_, i) => addDays(firstDayOfGrid, i));
    const weeks: Date[][] = [];
    while (days.length > 0) {
      weeks.push(days.splice(0, 7));
    }
    const displayWeeks = weeks.slice(0, 5);

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div 
              key={day} 
              className={`p-2 text-center text-xs font-medium text-gray-500 uppercase`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 h-full flex-1">
          {displayWeeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const dayEvents = events.filter(event => isSameDay(event.start, day));
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`border-r border-b border-gray-200 p-1 relative cursor-pointer transition-colors duration-150 ease-in-out flex flex-col ${ 
                    isCurrentMonth 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 opacity-75'
                  }`}
                  onClick={(e) => handleTimeSlotClick(setHours(day, 9), e)}
                >
                  <span className={`text-xs font-semibold block text-left w-full ${ 
                    isToday 
                    ? 'inline-flex items-center justify-center w-5 h-5 bg-indigo-600 text-white rounded-full' 
                    : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`text-[10px] p-0.5 rounded truncate cursor-pointer hover:opacity-80 ${!isCurrentMonth ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: event.color || defaultCategoryColor }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event, e);
                        }}
                      >
                         <span className={isCurrentMonth ? "text-white font-medium" : "text-gray-200 font-medium"}>{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                       <div className="text-[10px] text-gray-500 mt-0.5">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timeSlotHeight = 48;

    const getEventsForDay = (day: Date) => {
        return events.filter(event => isSameDay(event.start, day));
    };

    const getEventStyle = (event: CalendarEvent, dayStart: Date): React.CSSProperties => {
        const eventToStyle = (previewEvent && previewEvent.id === event.id) ? previewEvent : event;
        
        const startOfDay = setHours(setMinutes(setSeconds(setMilliseconds(dayStart, 0), 0), 0), 0);
        const startMinutes = (eventToStyle.start.getTime() - startOfDay.getTime()) / (1000 * 60);
        const endMinutes = (eventToStyle.end.getTime() - startOfDay.getTime()) / (1000 * 60);
        let durationMinutes = endMinutes - startMinutes;

        if (durationMinutes < 15) durationMinutes = 15;

        const top = (startMinutes / 60) * timeSlotHeight;
        const height = (durationMinutes / 60) * timeSlotHeight;

        return {
            top: `${top}px`,
            height: `${height}px`,
            backgroundColor: eventToStyle.color || defaultCategoryColor,
            position: 'absolute',
            left: '2px',
            right: '2px',
            zIndex: 10,
            minHeight: '20px',
        };
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-auto">
                <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                    {hours.map(hour => (
                        <div key={hour} className="h-12 text-right pr-1 pt-1 border-b border-gray-100 text-xs text-gray-400" style={{ height: `${timeSlotHeight}px`}}>
                            {format(setHours(new Date(), hour), 'ha')}
                        </div>
                    ))}
                </div>

                {days.map(day => {
                   const dayEvents = getEventsForDay(day);
                   return (
                    <div key={day.toISOString()} className="flex-1 border-r border-gray-200 relative">
                        {hours.map(hour => (
                             <div
                                key={hour}
                                className="border-b border-gray-100 cursor-pointer hover:bg-indigo-50"
                                style={{ height: `${timeSlotHeight}px` }}
                                onClick={(e) => handleTimeSlotClick(setHours(day, hour), e)}
                             >
                            </div>
                        ))}
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                style={getEventStyle(event, day)}
                                className="rounded p-1 text-white text-xs overflow-hidden cursor-pointer shadow hover:shadow-md transition-shadow"
                                onClick={(e) => { e.stopPropagation(); handleEventClick(event, e); }}
                            >
                                <div className="font-semibold truncate">{event.title}</div>
                                <div className="text-[10px]">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</div>
                                {event.category && <div className="text-[10px] opacity-80">{event.category}</div>}
                                
                                <div 
                                  className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize" 
                                  onMouseDown={(e) => handleResizeTopMouseDown(e, event, day)}
                                />

                                <div 
                                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize" 
                                  onMouseDown={(e) => handleResizeBottomMouseDown(e, event, day)}
                                />
                            </div>
                        ))}
                    </div>
                   );
                })}
            </div>
        </div>
    );
  };

  const DayView = () => {
    return <div className="p-4">Day View Placeholder - TBD</div>;
  };

  const ListView = () => {
      return <div className="p-4">List View Placeholder - TBD</div>;
  }

  const renderView = () => {
    switch (viewMode) {
      case 'month': return <MonthView />;
      case 'week': return <WeekView />;
      case 'day': return <DayView />;
      case 'list': return <ListView />;
      default: return <WeekView />;
    }
  };

  const viewTitle = useMemo(() => {
      if (viewMode === 'month') return format(currentDate, 'MMMM yyyy');
      if (viewMode === 'week') {
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      }
      if (viewMode === 'day') return format(currentDate, 'EEEE, MMM d, yyyy');
      return '';
  }, [currentDate, viewMode]);

  // --- Add dedicated Month/Year Title ---
  const monthYearTitle = useMemo(() => format(currentDate, 'MMMM yyyy'), [currentDate]);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <DashboardButton variant="bordered" color="primary" onClick={handlePrev} className="px-3 py-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </DashboardButton>
          <DashboardButton variant="light" color="primary" onClick={goToToday} className="px-3 py-2">
            Today
          </DashboardButton>
          <DashboardButton variant="bordered" color="primary" onClick={handleNext} className="px-3 py-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </DashboardButton>
        </div>
        
        <div className="flex items-center space-x-2">
          <DashboardButton 
            variant={viewMode === 'day' ? "light" : "ghost"}
            color="primary" 
            onClick={() => setViewMode('day')}
            className="px-3 py-2"
          >
            Day
          </DashboardButton>
          <DashboardButton 
            variant={viewMode === 'week' ? "light" : "ghost"}
            color="primary" 
            onClick={() => setViewMode('week')}
            className="px-3 py-2"
          >
            Week
          </DashboardButton>
          <DashboardButton 
            variant={viewMode === 'month' ? "light" : "ghost"}
            color="primary" 
            onClick={() => setViewMode('month')}
            className="px-3 py-2"
          >
            Month
          </DashboardButton>
          <DashboardButton 
            variant={viewMode === 'list' ? "light" : "ghost"}
            color="primary" 
            onClick={() => setViewMode('list')}
            className="px-3 py-2"
          >
            List
          </DashboardButton>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto w-full"
      >
        {renderView()}
      </div>
      
      {editingEvent && popoverPosition && (
          <EventEditPopover
              eventData={editingEvent}
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              onClose={handleClosePopover}
              categories={mockCategories}
              position={popoverPosition}
          />
      )}
    </div>
  );
};