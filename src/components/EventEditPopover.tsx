import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarEvent } from './Calendar'; // Import the interface

// Rename interface and add position prop
interface EventEditPopoverProps {
    eventData: Partial<CalendarEvent>;
    onSave: (event: CalendarEvent) => void;
    onDelete: (eventId: string) => void;
    onClose: () => void;
    categories: Record<string, { color: string }>;
    position: { top: number; left: number }; // Add position prop
}

// Helper to format date/time for input fields
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Mock constant for default color
const defaultCategoryColor = '#d1d5db';

// Update component signature to use new interface and accept position prop
export const EventEditPopover = ({ eventData, onSave, onDelete, onClose, categories, position }: EventEditPopoverProps) => {
    console.log('EventEditPopover rendering with data:', eventData, 'at position:', position);

    const [title, setTitle] = useState('');
    const [start, setStart] = useState<Date>(new Date());
    const [end, setEnd] = useState<Date>(new Date());
    const [category, setCategory] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [eventId, setEventId] = useState<string>('');

    useEffect(() => {
        setEventId(eventData.id || '');
        setTitle(eventData.title || '');
        setStart(eventData.start || new Date());
        setEnd(eventData.end || new Date((eventData.start || new Date()).getTime() + 60 * 60 * 1000));
        setCategory(eventData.category || '');
        setNotes(eventData.notes || '');
    }, [eventData]);

    const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newStartDate = parseISO(e.target.value);
        if (!isNaN(newStartDate.getTime())) { setStart(newStartDate); }
    };

    const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEndDate = parseISO(e.target.value);
        if (!isNaN(newEndDate.getTime())) { setEnd(newEndDate); }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const finalEventId = eventId || `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const finalCategory = category || undefined;
        const finalNotes = notes.trim() || undefined;

        const finalEvent: CalendarEvent = {
            id: finalEventId,
            title: title.trim() || 'Untitled Event',
            start: start,
            end: end,
            category: finalCategory,
            color: finalCategory ? categories[finalCategory]?.color || defaultCategoryColor : defaultCategoryColor,
            notes: finalNotes,
            status: eventData.status || 'planned',
            goalId: eventData.goalId,
        };

        if (finalEvent.end <= finalEvent.start) {
            alert('End time must be after start time.');
            return;
        }
        onSave(finalEvent);
    };

    const handleDelete = () => {
        if (eventId && window.confirm('Are you sure you want to delete this event?')) {
            onDelete(eventId);
        }
    };

    // Apply new styling and positioning
    return (
        // Apply absolute positioning using the position prop
        <div
           className="absolute z-50"
           style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
            {/* Style the inner container like Apple's frosted popover */}
            <div className="bg-gray-50/80 backdrop-blur-lg rounded-lg shadow-xl w-80 text-gray-900 overflow-hidden"> {/* Frosted effect, remove border, add overflow */}
                {/* Form structure resembling Apple Calendar */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                     {/* Title Input Section */} 
                     <div className="p-3 border-b border-gray-200/80"> 
                        <input
                            type="text"
                            id="title"
                            placeholder={eventId ? 'Edit Title' : 'New Event'} // Use placeholder
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-lg font-semibold focus:outline-none placeholder-gray-500" // Larger, borderless title
                            required
                        />
                    </div>

                     {/* Date/Time Section */} 
                     <div className="p-3 border-b border-gray-200/80 space-y-2"> 
                        <div className="flex items-center space-x-2">
                            <span className="text-sm w-10 text-gray-500">Start</span>
                            <input
                                type="datetime-local"
                                id="start"
                                value={formatDateTimeLocal(start)}
                                onChange={handleStartChange}
                                className="flex-grow bg-transparent text-sm focus:outline-none focus:ring-0 border-none p-0" // Minimal style
                                required
                            />
                        </div>
                         <div className="flex items-center space-x-2">
                             <span className="text-sm w-10 text-gray-500">End</span>
                            <input
                                type="datetime-local"
                                id="end"
                                value={formatDateTimeLocal(end)}
                                onChange={handleEndChange}
                                className="flex-grow bg-transparent text-sm focus:outline-none focus:ring-0 border-none p-0" // Minimal style
                                required
                            />
                        </div>
                    </div>

                     {/* Category Section */} 
                     <div className="p-3 border-b border-gray-200/80"> 
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-transparent text-sm focus:outline-none focus:ring-0 border-none p-0 text-gray-700 hover:text-gray-900 cursor-pointer" // Minimal style
                        >
                            <option value="">Add Category</option> {/* Placeholder option */}
                            {Object.entries(categories).map(([catName, catData]) => (
                                <option key={catName} value={catName} style={{ backgroundColor: 'white', color: 'black' }}> {/* Ensure dropdown options are readable */}
                                    {catName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes Section */} 
                     <div className="p-3"> 
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3} // Keep some space for notes
                            placeholder="Add Notes, URL..." // Placeholder
                            className="w-full bg-transparent text-sm focus:outline-none focus:ring-0 border-none p-0 placeholder-gray-500 resize-none"
                        />
                    </div>

                    {/* Footer Buttons - Minimal */}
                    <div className="flex justify-between items-center p-2 bg-gray-100/80 border-t border-gray-200/80">
                         {eventId && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-3 py-1 text-red-600 hover:bg-red-100 rounded text-xs font-medium"
                            >
                                Delete
                            </button>
                         )} 
                         {!eventId && <div />} {/* Placeholder to keep alignment when delete isn't shown */}
                        
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1 border border-gray-300/80 rounded hover:bg-gray-200/80 text-xs font-medium text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-medium"
                            >
                                {eventId ? 'Save' : 'Add'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}; 