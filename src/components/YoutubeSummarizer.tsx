"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { YoutubeInput } from "@/components/YoutubeInput";
import { YoutubeContent } from "@/components/YoutubeContent";
import { Flashcard } from "@/types/flashcard";

interface YoutubeSummarizerProps {
  onClose: () => void;
}

export const YoutubeSummarizer = ({ onClose }: YoutubeSummarizerProps) => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [videoId, setVideoId] = useState('');

  const handleSubmit = async (url: string) => {
    const response = await fetch('http://localhost:5000/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to summarize');
    
    setSummary(result.summary);
    setVideoThumbnail(`https://img.youtube.com/vi/${result.video_id}/0.jpg`);
    setUrl(url);
    setVideoTitle(result.video_title);
    setVideoId(result.video_id);
  };

  const handleReset = () => {
    setUrl('');
    setSummary('');
    setVideoThumbnail('');
    setVideoTitle('');
    setFlashcards([]);
  };

  const handleGenerateFlashcards = async () => {
    setIsGeneratingCards(true);
    try {
      const response = await fetch('http://localhost:5000/generate-flashcards', {
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
    <div className="max-w-full mx-auto h-[calc(100vh-80px)]">
      <div className="bg-gray-50 rounded-2xl flex h-full">
        <div className="flex-1 p-6 flex items-center justify-center relative h-full">
          <AnimatePresence mode="wait">
            {!summary ? (
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
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 