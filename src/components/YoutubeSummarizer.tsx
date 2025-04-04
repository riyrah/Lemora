"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { YoutubeInput, ExampleVideo, Flashcard } from "@/components/YoutubeInput";
import { YoutubeContent } from "@/components/YoutubeContent";
import { Loader2 } from "lucide-react";

interface YoutubeSummarizerProps {
  onClose: () => void;
}

type SubmitData = string | ExampleVideo;

// Define structure for transcript items (can be shared or defined here)
interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
}

export const YoutubeSummarizer = ({ onClose }: YoutubeSummarizerProps) => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [videoId, setVideoId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptItem[]>([]); // State for transcript

  const handleSubmit = async (data: SubmitData) => {
    setIsLoading(true);
    setError(null);
    setFlashcards([]);
    setTranscriptData([]); // Reset transcript
    try {
      if (typeof data === 'object' && data !== null && 'precomputedSummary' in data) {
        console.log("Using precomputed data for:", data.title);
        setSummary(data.precomputedSummary);
        setFlashcards(data.precomputedFlashcards || []);
        setVideoTitle(data.videoTitle);
        setVideoId(data.videoId);
        setUrl(data.youtubeUrl);
        setVideoThumbnail(`https://img.youtube.com/vi/${data.videoId}/0.jpg`);
        setTranscriptData(data.precomputedTranscript || []); // Use precomputed transcript
      } else if (typeof data === 'string') {
        console.log("Fetching summary for URL:", data);
        const currentUrl = data;
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to summarize video');
        }

        setSummary(result.summary);
        setVideoThumbnail(`https://img.youtube.com/vi/${result.video_id}/0.jpg`);
        setUrl(currentUrl);
        setVideoTitle(result.video_title);
        setVideoId(result.video_id);
        setTranscriptData(result.transcript || []); // Store fetched transcript
      } else {
        console.error("Invalid data type passed to handleSubmit:", data);
        throw new Error("Invalid submission data.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error during submission:", errorMessage);
      setError(errorMessage);
      setSummary('');
      setTranscriptData([]); // Clear transcript on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setSummary('');
    setVideoThumbnail('');
    setVideoTitle('');
    setFlashcards([]);
    setVideoId('');
    setIsLoading(false);
    setError(null);
    setTranscriptData([]); // Reset transcript data
  };

  const handleGenerateFlashcards = async () => {
    setIsGeneratingCards(true);
    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to generate flashcards');
      
      setFlashcards(result.flashcards || []);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)]">
      <div className="bg-gray-50 rounded-2xl h-full w-full">
        <div className={`p-6 relative h-full ${!summary && !isLoading && !error ? 'pt-32' : ''}`}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-3" />
                <p className="text-gray-600">Processing Video...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="text-gray-700 mb-4">{error}</p>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : !summary ? (
              <YoutubeInput onSubmit={handleSubmit} />
            ) : (
              <YoutubeContent
                url={url}
                summary={summary}
                videoThumbnail={videoThumbnail}
                videoTitle={videoTitle}
                flashcards={flashcards}
                isGeneratingCards={isGeneratingCards}
                onReset={handleReset}
                onGenerateFlashcards={handleGenerateFlashcards}
                videoId={videoId}
                transcript={transcriptData}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 