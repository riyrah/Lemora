"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type Flashcard = {
  front: string;
  back: string;
};

// Create a client component that uses useSearchParams
const FlashcardsContent = () => {
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const storedCards = localStorage.getItem("current-flashcards");
    if (storedCards) {
      setCards(JSON.parse(storedCards));
    }
  }, []);

  if (!cards.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          No flashcards found. Generate them first from the summarizer.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Video Flashcards</h1>
          <div className="text-gray-500">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8 h-64 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-xl font-medium">
              {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
            </p>
          </div>
        </motion.div>

        <div className="flex justify-between mt-8">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            onClick={() => {
              setCurrentIndex(prev => Math.max(0, prev - 1));
              setIsFlipped(false);
            }}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            onClick={() => {
              setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
              setIsFlipped(false);
            }}
            disabled={currentIndex === cards.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Main page component that wraps the client component in Suspense
export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div>Loading flashcards...</div>}>
      <FlashcardsContent />
    </Suspense>
  );
} 