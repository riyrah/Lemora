"use client";

import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addHours } from 'date-fns';
import { useState } from 'react';
import { DashboardButton } from "@/components/dashboard-button";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

interface CalendarProps {
  onClose?: () => void;
}

export const Calendar = ({ onClose }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>();

  const handlePrev = () => {
    setCurrentDate(prev => {
      if (viewMode === 'day') return addDays(prev, -1);
      if (viewMode === 'week') return addDays(prev, -7);
      return addDays(prev, -31);
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      if (viewMode === 'day') return addDays(prev, 1);
      if (viewMode === 'week') return addDays(prev, 7);
      return addDays(prev, 31);
    });
  };

  const handleTimeSlotClick = (date: Date) => {
    const startTime = new Date(date);
    setNewEvent({
      start: startTime,
      end: addHours(startTime, 1),
      color: '#38bdf8' // default color
    });
  };

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weeks: Date[][] = [];
    
    while (daysInMonth.length > 0) {
      weeks.push(daysInMonth.splice(0, 7));
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-white p-2 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dayEvents = events.filter(event => 
              isSameDay(event.start, day) || isSameDay(event.end, day)
            );
            
            return (
              <div 
                key={`${weekIndex}-${dayIndex}`}
                className={`bg-white p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 
                  ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : ''}`}
                onClick={() => handleTimeSlotClick(new Date(day.setHours(9, 0, 0, 0)))}
              >
                <div className={`text-sm ${isSameDay(day, new Date()) ? 'bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80`}
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewEvent(event);
                      }}
                    >
                      {format(event.start, 'HH:mm')} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const WeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex-1 grid grid-cols-8 gap-px bg-gray-200">
        {/* Time labels column */}
        <div className="bg-white pt-10">
          {hours.map(hour => (
            <div key={hour} className="h-12 text-xs text-gray-500 text-right pr-2">
              {format(new Date().setHours(hour), 'ha')}
            </div>
          ))}
        </div>
        
        {/* Days columns */}
        {days.map(day => (
          <div key={day.toString()} className="bg-white">
            <div className={`p-2 text-center text-sm font-semibold 
              ${isSameDay(day, new Date()) ? 'bg-purple-100' : ''}`}>
              {format(day, 'EEE d')}
            </div>
            <div className="relative">
              {hours.map(hour => {
                const timeSlot = new Date(day.setHours(hour));
                const slotEvents = events.filter(event => 
                  isSameDay(event.start, timeSlot) && 
                  event.start.getHours() === hour
                );

                return (
                  <div 
                    key={hour}
                    className="h-12 border-t border-gray-100 relative group"
                    onClick={() => handleTimeSlotClick(timeSlot)}
                  >
                    <div className="absolute inset-0 group-hover:bg-purple-50 cursor-pointer" />
                    {slotEvents.map(event => (
                      <div
                        key={event.id}
                        className="absolute inset-x-0 rounded px-1 cursor-pointer hover:opacity-80 z-10"
                        style={{ 
                          backgroundColor: event.color,
                          top: '2px',
                          height: 'calc(100% - 4px)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewEvent(event);
                        }}
                      >
                        <span className="text-xs truncate block">
                          {format(event.start, 'HH:mm')} {event.title}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex-1 bg-white grid grid-cols-1 gap-px">
        <div className="p-2 text-center text-sm font-semibold text-gray-600">
          {format(currentDate, 'EEEE, MMM d')}
        </div>
        <div className="relative flex">
          {/* Time labels */}
          <div className="w-16 flex-shrink-0">
            {hours.map(hour => (
              <div key={hour} className="h-12 text-xs text-gray-500 text-right pr-2 pt-2">
                {format(new Date().setHours(hour), 'ha')}
              </div>
            ))}
          </div>
          
          {/* Time slots */}
          <div className="flex-1">
            {hours.map(hour => {
              const timeSlot = new Date(currentDate.setHours(hour));
              const slotEvents = events.filter(event => 
                isSameDay(event.start, timeSlot) && 
                event.start.getHours() === hour
              );

              return (
                <div 
                  key={hour}
                  className="h-12 border-t border-gray-100 relative group"
                  onClick={() => handleTimeSlotClick(timeSlot)}
                >
                  <div className="absolute inset-0 group-hover:bg-purple-50 cursor-pointer" />
                  {slotEvents.map(event => (
                    <div
                      key={event.id}
                      className="absolute inset-x-0 rounded px-2 cursor-pointer hover:opacity-80 z-10"
                      style={{ 
                        backgroundColor: event.color,
                        top: '2px',
                        height: 'calc(100% - 4px)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewEvent(event);
                      }}
                    >
                      <span className="text-sm truncate block">
                        {format(event.start, 'HH:mm')} {event.title}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {viewMode === 'month' ? <MonthView /> : 
         viewMode === 'week' ? <WeekView /> : 
         <DayView />}
      </div>
    </section>
  );
};