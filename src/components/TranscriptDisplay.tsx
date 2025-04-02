"use client";

import React, { useMemo } from 'react';

interface TranscriptItem {
    text: string;
    duration: number;
    offset: number; // in milliseconds
}

interface TranscriptBlock {
    startTime: number;
    formattedTime: string;
    segments: {
        time: number;
        formattedTime: string;
        text: string;
    }[];
}

interface TranscriptDisplayProps {
    transcript: TranscriptItem[];
    onTimestampClick?: (timeSeconds: number) => void; 
}

// Helper to format milliseconds to MM:SS
const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to decode HTML entities using browser DOM + explicit fallbacks
const decodeHtmlEntities = (text: string): string => {
    let decoded = text;
    // Try browser decoding first
    if (typeof window !== 'undefined') {
        try {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = text; 
            decoded = textarea.value;
        } catch (e) {
            console.error("Error decoding HTML entities via textarea:", e);
            // Fall through to basic replacement if textarea fails
            decoded = text; // Reset to original text for basic replacement
        }
    }

    // Apply basic replacements as a fallback or secondary cleanup
    // Target specific entities observed or common ones
    decoded = decoded
        .replace(/&#39;/g, "'")       // Numeric entity for single quote
        .replace(/&apos;/g, "'")      // Named entity for single quote
        .replace(/&amp;#39;/g, "'")   // Double encoded single quote (ampersand first)
        .replace(/&quot;/g, '"')      // Named entity for double quote
        .replace(/&amp;quot;/g, '"')  // Double encoded double quote
        .replace(/&amp;/g, "&")        // Named entity for ampersand (must come after double encoded checks)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s{2,}/g, ' '); // Consolidate multiple spaces into one, keeping single spaces

    return decoded;
};

export const TranscriptDisplay = ({ transcript, onTimestampClick }: TranscriptDisplayProps) => {
    
    const CHUNK_DURATION_MS = 30000; 
    const ESTIMATED_VIDEO_LENGTH_MS = 900000; // Estimate 15 minutes if we can't determine length
    const AVG_SEGMENT_DURATION_MS = 3000; // Average segment is about 3 seconds

    // --- Moved this function inside the component scope ---
    function calculateSegmentTimestamps(segments: TranscriptItem[]): TranscriptItem[] {
        console.log("Starting timestamp calculation...");
        const totalSegments = segments.length;
        if (totalSegments === 0) return [];

        // Check if offsets seem valid (at least some are > 1 second)
        const hasValidOffsets = segments.some(s => s.offset > 1000);
        if (hasValidOffsets) {
            console.log("Using existing offset values as they seem valid.");
            return segments; // Assume existing offsets are correct
        }
        
        console.log("Existing offsets seem invalid (all near zero). Calculating timestamps based on durations.");

        // Check if durations exist for calculation
        const hasAnyDurations = segments.some(s => s.duration > 0);

        if (hasAnyDurations) {
            console.log("Calculating timestamps using cumulative durations.");
            let cumulativeTime = 0;
            return segments.map((segment, index) => {
                const timestamp = cumulativeTime;
                // Use provided duration, or average if missing/zero
                const duration = segment.duration > 0 ? segment.duration : AVG_SEGMENT_DURATION_MS;
                cumulativeTime += duration;
                // Log first few calculated timestamps
                if (index < 5) {
                    console.log(`Segment ${index}: startTime=${timestamp}ms, duration=${duration}ms -> nextStart=${cumulativeTime}ms`);
                }
                return {
                    ...segment,
                    offset: timestamp // Overwrite offset with calculated time
                };
            });
        } else {
            // Fallback: Distribute timestamps evenly if no durations exist
            console.warn("No valid durations found. Distributing timestamps evenly across estimated video length.");
            // const ESTIMATED_VIDEO_LENGTH_MS = 900000; // Now accessible from component scope
            return segments.map((segment, index) => {
                const position = index / (totalSegments - 1 || 1);
                const timestamp = Math.floor(position * ESTIMATED_VIDEO_LENGTH_MS);
                if (index < 5) {
                    console.log(`Segment ${index}: Even distribution -> ${timestamp}ms`);
                }
                return {
                    ...segment,
                    offset: timestamp // Overwrite offset
                };
            });
        }
    }
    
    const transcriptBlocks = useMemo(() => {
        if (!transcript || transcript.length === 0) {
            return [];
        }

        // Log raw data before processing
        console.log("Raw sample transcript items (first 10):", transcript.slice(0, 10).map(item => ({
            offset: item.offset,
            duration: item.duration,
            text: item.text.substring(0, 20) + "..."
        })));

        // Filter out empty segments
        const nonEmptySegments = transcript.filter(item => 
            decodeHtmlEntities(item.text).trim().length > 0
        );
        
        if (nonEmptySegments.length === 0) return [];

        // --- Use the revised function to get segments with calculated timestamps ---
        const segmentsWithProperTiming = calculateSegmentTimestamps(nonEmptySegments);
            
        console.log("First 5 segments after timestamp calculation:", segmentsWithProperTiming.slice(0, 5).map(item => ({
            offset: item.offset,
            formattedTime: formatTime(item.offset),
            text: item.text.substring(0, 20) + "..."
        })));

        // --- Chunking logic remains the same, but uses the corrected segment times ---
        const blocks: TranscriptBlock[] = [];
        let currentChunkTime = 0;
        let currentChunkSegments: {time: number, formattedTime: string, text: string}[] = [];
        
        for (const segment of segmentsWithProperTiming) {
            const segmentTime = segment.offset; // Use the potentially corrected offset
            const decodedText = decodeHtmlEntities(segment.text).trim();
            if (!decodedText) continue;
            
            if (segmentTime >= currentChunkTime + CHUNK_DURATION_MS) {
                if (currentChunkSegments.length > 0) {
                    blocks.push({
                        startTime: currentChunkTime,
                        formattedTime: formatTime(currentChunkTime),
                        segments: currentChunkSegments
                    });
                }
                currentChunkTime = Math.floor(segmentTime / CHUNK_DURATION_MS) * CHUNK_DURATION_MS;
                currentChunkSegments = [];
            }
            
            currentChunkSegments.push({
                time: segmentTime,
                formattedTime: formatTime(segmentTime),
                text: decodedText
            });
        }
        
        if (currentChunkSegments.length > 0) {
            blocks.push({
                startTime: currentChunkTime,
                formattedTime: formatTime(currentChunkTime),
                segments: currentChunkSegments
            });
        }
        
        console.log("Final blocks with timestamps:", 
            blocks.map(b => `${b.formattedTime} (${b.segments.length} segments)`)
        );
        
        return blocks;
    }, [transcript]);
    
    if (transcriptBlocks.length === 0) {
        return <p className="text-sm text-gray-500">Transcript not available or empty.</p>;
    }

    // Redesigned rendering to show individual segments with timestamps
    return (
        <div className="space-y-6"> 
            {transcriptBlocks.map((block) => (
                <div key={block.startTime} className="rounded-lg bg-gray-50 p-3">
                    {/* Block Header with Timestamp */}
                    <div className="mb-2 border-b border-gray-200 pb-1">
                        <button 
                            className="text-sm font-semibold text-purple-700 hover:text-purple-900"
                            onClick={() => onTimestampClick?.(block.startTime / 1000)}
                            disabled={!onTimestampClick}
                        >
                            {block.formattedTime}
                        </button>
                    </div>
                    
                    {/* Individual Segments */}
                    <div className="space-y-2">
                        {block.segments.map((segment, idx) => (
                            <div key={idx} className="grid grid-cols-[50px_1fr] gap-1 text-sm">
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 font-mono">{segment.formattedTime}</span>
                                </div>
                                <div>
                                    <p className="text-gray-700">{segment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}; 