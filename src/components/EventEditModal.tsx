import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarEvent } from './Calendar'; // Import the interface

interface EventEditModalProps {
    eventData: Partial<CalendarEvent>; // Add eventData (can be partial for new events)
    onSave: (event: CalendarEvent) => void;    // Add onSave function prop
    onDelete: (eventId: string) => void; // Add onDelete function prop
    onClose: () => void;       // Add onClose function prop
    categories: Record<string, { color: string }>;
}

// Helper to format date/time for input fields
const formatDateTimeLocal = (date: Date): string => {
  // 'yyyy-MM-ddTHH:mm' is the format required by datetime-local input
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Mock constant for default color
const defaultCategoryColor = '#d1d5db';

export const EventEditPopover = ({ eventData, onSave, onDelete, onClose, categories }: EventEditModalProps) => {
    // Log when the modal attempts to render
    console.log('EventEditPopover rendering with data:', eventData);

    const [title, setTitle] = useState('');
    const [start, setStart] = useState<Date>(new Date()); // Ensure type is Date
    const [end, setEnd] = useState<Date>(new Date());   // Ensure type is Date
    const [category, setCategory] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [eventId, setEventId] = useState<string>(''); // Initialize as empty string

    // Initialize state when eventData changes (for opening the modal)
    useEffect(() => {
        setEventId(eventData.id || ''); // Use empty string if id is undefined
        setTitle(eventData.title || '');
        setStart(eventData.start || new Date()); // Default to now if not provided
        setEnd(eventData.end || new Date( (eventData.start || new Date()).getTime() + 60 * 60 * 1000 )); // Default end 1hr after start
        setCategory(eventData.category || '');
        setNotes(eventData.notes || '');
    }, [eventData]);

    const handleStartChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newStartDate = parseISO(e.target.value);
        if (!isNaN(newStartDate.getTime())) { // Check if date is valid
             setStart(newStartDate);
        }
        // Optional: Add validation or adjust end date if needed
    };

    const handleEndChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEndDate = parseISO(e.target.value);
         if (!isNaN(newEndDate.getTime())) { // Check if date is valid
             setEnd(newEndDate);
         }
        // Optional: Add validation (e.g., end > start)
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const finalEventId = eventId || `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`; // Generate ID if new
        const finalCategory = category || undefined; // Ensure undefined if empty
        const finalNotes = notes.trim() || undefined; // Ensure undefined if empty

        const finalEvent: CalendarEvent = {
            id: finalEventId,
            title: title.trim() || 'Untitled Event', // Default title
            start: start, // Pass Date object
            end: end,     // Pass Date object
            category: finalCategory,
            color: finalCategory ? categories[finalCategory]?.color || defaultCategoryColor : defaultCategoryColor, // Add color based on category
            notes: finalNotes,
            status: eventData.status || 'planned', // Preserve status or default to planned
            goalId: eventData.goalId, // Preserve goalId if editing
        };

        // Basic validation: Ensure end is after start
        if (finalEvent.end <= finalEvent.start) {
            alert('End time must be after start time.'); // Add alert for validation
            return; // Stop submission
        }

        onSave(finalEvent);
    };

    const handleDelete = () => {
        if (eventId && window.confirm('Are you sure you want to delete this event?')) {
            onDelete(eventId); // Add the actual call to onDelete
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{eventId ? 'Edit Event' : 'Create Event'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="start" className="block text-sm font-medium text-gray-700">Start</label>
                        <input
                            type="datetime-local"
                            id="start"
                            value={formatDateTimeLocal(start)}
                            onChange={handleStartChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="end" className="block text-sm font-medium text-gray-700">End</label>
                        <input
                            type="datetime-local"
                            id="end"
                            value={formatDateTimeLocal(end)}
                            onChange={handleEndChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">None</option>
                            {Object.entries(categories).map(([catName, catData]) => (
                                <option key={catName} value={catName} style={{ color: catData.color }}>
                                    {catName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                       {eventId && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 text-sm font-medium"
                            >
                                Delete
                            </button>
                        )}
                         <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                        >
                            {eventId ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 