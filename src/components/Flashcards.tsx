"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Flashcard } from "@/types/flashcard";
import { DashboardButton } from "@/components/dashboard-button";

export const Flashcards = ({ cards }: { cards: Flashcard[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No flashcards generated yet
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] flex flex-col flashcard">
      <motion.div
        key={currentIndex}
        initial={{ rotateX: 0 }}
        animate={{ rotateX: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.4,
          ease: "easeInOut"
        }}
        className="flex-1 bg-white rounded-xl shadow-lg cursor-pointer border border-gray-200 h-64"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: 1000
        }}
      >
        <div className="flashcard-inner h-full w-full">
          {/* Front Side */}
          <div 
            className="flashcard-front absolute w-full h-full flex items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xl font-medium text-gray-900 text-center">
              {cards[currentIndex].front}
            </p>
          </div>
          
          {/* Back Side */}
          <div 
            className="flashcard-back absolute w-full h-full flex items-center justify-center p-6"
            style={{ 
              transform: 'rotateX(180deg)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xl font-medium text-gray-900 text-center">
                {cards[currentIndex].back}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between mt-6">
        <DashboardButton
          variant="light"
          color="primary"
          onClick={() => {
            setCurrentIndex(prev => Math.max(0, prev - 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
        >
          Previous
        </DashboardButton>
        
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {cards.length}
        </div>

        <DashboardButton
          variant="light"
          color="primary"
          onClick={() => {
            setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === cards.length - 1}
        >
          Next
        </DashboardButton>
      </div>
    </div>
  );
}; 