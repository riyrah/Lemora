"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface YoutubeInputProps {
  onSubmit: (url: string) => void;
}

export const YoutubeInput = ({ onSubmit }: YoutubeInputProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="input-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl w-full h-full flex items-center justify-center"
    >
      <div className="w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center tracking-tight">
          What do you want to learn today?
        </h1>
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative rounded-[2.5rem] shadow-sm bg-gray-50 border border-gray-200 focus-within:border-gray-300 transition-colors h-24">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL or upload file"
              className="w-full pl-20 pr-24 py-8 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-gray-900 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              ) : (
                <span className="text-xl font-medium text-gray-600">→</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}; 