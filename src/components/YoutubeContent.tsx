"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/button";
import { Flashcard } from "@/types/flashcard";
import { Flashcards } from "@/components/Flashcards";
import { Chat } from "@/components/Chat";
import { useState, useEffect } from 'react';

interface YoutubeContentProps {
  url: string;
  summary: string;
  videoThumbnail: string;
  videoTitle: string;
  flashcards: Flashcard[];
  isGeneratingCards: boolean;
  onReset: () => void;
  onGenerateFlashcards: () => void;
  videoId: string;
}

export const YoutubeContent = ({
  url,
  summary,
  videoThumbnail,
  videoTitle,
  flashcards,
  isGeneratingCards,
  onReset,
  onGenerateFlashcards,
  videoId
}: YoutubeContentProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'chat'>('summary');
  const [panelWidth, setPanelWidth] = useState(70); // Default to 70% width
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const container = document.querySelector('.resizable-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setPanelWidth(Math.min(Math.max(30, newWidth), 70));
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <motion.div
      key="summary-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 w-full h-full overflow-hidden"
    >
      <div 
        className="flex h-full w-full resizable-container"
        style={{ userSelect: isResizing ? 'none' : 'auto' }}
      >
        {/* Left Panel - Video and Notes */}
        <div 
          style={{ 
            width: `${panelWidth}%`,
            pointerEvents: isResizing ? 'none' : 'auto' 
          }}
          className="flex-shrink-0"
        >
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4 flex-shrink-0">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Bulleted Notes Section</h3>
            <div className="text-gray-600">
              {/* Placeholder for notes - add actual notes content later */}
              [Bulleted notes will appear here]
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 flex-shrink-0 relative group cursor-col-resize bg-gray-200 hover:bg-purple-500 transition-colors"
          style={{ userSelect: 'none' }}
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute inset-0 -left-1 right-0 w-2 z-20" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Right Panel - Tabs */}
        <div 
          style={{ 
            width: `${100 - panelWidth}%`,
            pointerEvents: isResizing ? 'none' : 'auto'
          }}
          className="flex-shrink-0"
        >
          <div className="relative border-b border-gray-200">
            <div className="flex justify-center">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'summary'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'flashcards'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Flashcards
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-3 font-medium ${
                    activeTab === 'chat'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Chat
                </button>
              </div>
            </div>
          </div>

          <div className="h-[calc(100%-49px)] overflow-y-auto">
            {activeTab === 'summary' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{videoTitle}</h2>
                  <Button 
                    onClick={onGenerateFlashcards}
                    disabled={isGeneratingCards}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5"
                  >
                    {isGeneratingCards ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : 'Generate Flashcards'}
                  </Button>
                </div>
                <div className="prose text-gray-700 max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="p-6">
                <Flashcards cards={flashcards} />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                <Chat videoUrl={url} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 