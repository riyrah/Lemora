"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Image from 'next/image';

// --- Define and Export Types ---
export type Flashcard = { front: string; back: string; };

export type ExampleVideo = {
  title: string;
  description: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  // Precomputed fields - added for parent component use
  videoId: string;
  videoTitle: string;
  precomputedSummary: string;
  precomputedFlashcards?: Flashcard[]; 
  precomputedTranscript?: { text: string; duration: number; offset: number; }[];
};
// --- End Types ---

interface YoutubeInputProps {
  // Updated prop type to accept string or the full ExampleVideo object
  onSubmit: (urlOrData: string | ExampleVideo) => void; 
}

// --- Example Video Data (Using the defined type) ---
const exampleVideos: ExampleVideo[] = [
  {
    title: "Inside the mind of a master procrastinator",
    description: "Tim Urban | TED",
    thumbnailUrl: "/procrastination-thumb.png",
    youtubeUrl: "https://www.youtube.com/watch?v=arj7oStGLkU",
    // --- Precomputed Data --- Assign placeholder values ---
    videoId: "arj7oStGLkU",
    videoTitle: "Inside the mind of a master procrastinator | Tim Urban",
    // Updated with detailed summary
    precomputedSummary: `## 🎥 Video Overview
This talk explains why we procrastinate using fun characters like the Rational Decision-Maker, the Instant Gratification Monkey, and the Panic Monster. It explores why the monkey often wins and how deadlines force us into action.

## 📝 Summary
- Everyone has a Rational Decision-Maker in their brain who plans for the future.
- Procrastinators also have an Instant Gratification Monkey who only cares about easy and fun things right now.
- The Monkey often takes the wheel from the Rational Decision-Maker, leading to activities like browsing the internet instead of working.
- This fun continues until a deadline gets very close, which awakens the Panic Monster.
- The Panic Monster is the only thing the Monkey is scared of, so it runs away when the Monster appears.
- This allows the Rational Decision-Maker to finally take control and get the work done in a stressful rush.
- The speaker notes that some procrastination happens on important tasks that don't have deadlines, which can be a source of long-term unhappiness because the Panic Monster never arrives to force action.

## 🔑 Main Ideas
- Procrastination is a battle between the part of us that plans rationally and the part that seeks immediate pleasure.
- Deadlines trigger panic, which is a (stressful) mechanism to overcome procrastination.
- Long-term procrastination on important, deadline-free goals is a serious issue because the panic trigger is absent.

## ❓ Why This Matters
Understanding the 'monkey' and the 'panic monster' helps us recognize why we procrastinate. It highlights the danger of putting off important life goals that don't have external deadlines to force us into action.

## 🚀 Try This
Think about a task you're putting off. Can you identify the Instant Gratification Monkey's influence? What could act as a 'Panic Monster' for you, even if you have to create mini-deadlines yourself?`,
    precomputedFlashcards: [
      { front: "What are the three characters Tim Urban uses?", back: "Rational Decision-Maker, Instant Gratification Monkey, Panic Monster." },
      { front: "What does the Instant Gratification Monkey prioritize?", back: "Things that are easy and fun in the present moment." },
      { front: "What scares the Instant Gratification Monkey away?", back: "The Panic Monster, which is triggered by approaching deadlines." },
      { front: "When does the Rational Decision-Maker usually regain control?", back: "After the Panic Monster appears and scares the Monkey away." },
      { front: "Why is procrastination without deadlines potentially worse?", back: "The Panic Monster never gets triggered, so important long-term tasks may never get done." }
    ],
    precomputedTranscript: [
      { offset: 0, duration: 5000, text: "So in the last year, I've been thinking a lot about procrastination..." },
      { offset: 5000, duration: 8000, text: "...and I realized that while everyone procrastinates, there are different types." },
      { offset: 13000, duration: 6000, text: "You have the Rational Decision-Maker in your head..." },
      { offset: 19000, duration: 7000, text: "...but the procrastinator also has the Instant Gratification Monkey." },
      // Add more placeholder segments as needed
    ]
  },
  {
    title: "Advanced Algorithms (COMPSCI 224), Lecture 1",
    description: "Harvard University | Computer Science",
    thumbnailUrl: "/harvard-algorithms-thumb.png",
    youtubeUrl: "https://youtu.be/0JUN9aDxVmI",
    // --- Precomputed Data --- Assign placeholder values ---
    videoId: "0JUN9aDxVmI",
    videoTitle: "Advanced Algorithms (COMPSCI 224), Lecture 1",
    // Updated with detailed summary
    precomputedSummary: `## 🎥 Video Overview
This first lecture for Harvard's Advanced Algorithms course (COMPSCI 224) introduces the course structure, topics, and grading. It then dives into fundamental concepts of complexity theory, including the classes P and NP, and the significance of the P vs NP problem.

## 📝 Summary
- Introduction and Logistics: Covers course staff, syllabus, prerequisites (strong algorithms/discrete math), and grading policy.
- Course Topics: Will include randomized algorithms, hashing, spectral methods, optimization, complexity theory, approximation algorithms, and more.
- Complexity Theory Intro: Focuses on classifying problems based on the computational resources (like time) required to solve them.
- Class P: Problems solvable by a deterministic algorithm in Polynomial time relative to the input size. Considered 'efficiently solvable'. Example: Sorting.
- Class NP: Problems where a potential solution can be Verified in Polynomial time. Example: Does a graph have a path that visits every city exactly once (Traveling Salesperson)? Verifying a given path is easy.
- P vs NP Problem: A major unsolved question - does P equal NP? If yes, any problem whose solution can be checked quickly can also be found quickly. Most believe P ≠ NP.
- Importance: Understanding complexity helps determine if a problem is feasible to solve efficiently and guides algorithm design.

## 🔑 Main Ideas
- Advanced algorithms build upon core CS principles but explore more complex problems and techniques.
- Complexity classes (P, NP) categorize problem difficulty based on time/resource requirements.
- The P vs NP question is fundamental to understanding the limits of efficient computation.

## ❓ Why This Matters
Knowing if a problem is likely in P or NP-hard influences how we approach solving it. We might seek exact solutions for P problems but resort to approximations or heuristics for NP-hard ones.

## 🚀 Try This
Think about checking if a number is prime versus finding the prime factors of a large number. Which seems easier (likely in P)? Which seems harder to solve but potentially easy to verify if given the factors (likely in NP)?`,
    precomputedFlashcards: [
      { front: "What does 'P' stand for in P vs NP?", back: "Polynomial time. Problems solvable efficiently as input size grows." },
      { front: "What does 'NP' stand for in P vs NP?", back: "Nondeterministic Polynomial time. Solutions can be verified efficiently." },
      { front: "What is the core P vs NP question?", back: "Are all problems with efficiently verifiable solutions also efficiently solvable?" },
      { front: "What is an example of a problem likely in P?", back: "Sorting a list of numbers." },
      { front: "What is an example of a problem likely in NP (but maybe not P)?", back: "The Traveling Salesperson Problem (finding the shortest route through many cities)." }
    ],
    precomputedTranscript: [
        { offset: 0, duration: 7000, text: "Okay, so welcome to COMPSCI 224, Advanced Algorithms." },
        { offset: 7000, duration: 9000, text: "My name is Jelani Nelson, I'll be the instructor for this course." },
        { offset: 16000, duration: 10000, text: "Let's start with some course logistics. The website is listed here..." },
        { offset: 26000, duration: 8000, text: "Grading will be based on scribing, problem sets, and a final project." },
      // Add more placeholder segments as needed
    ]
  },
  {
    title: "The Essence of Calculus",
    description: "3Blue1Brown | Chapter 1",
    thumbnailUrl: "/calculus-thumb.png",
    youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    // --- Precomputed Data --- Assign placeholder values ---
    videoId: "WUvTyaaNkzM",
    videoTitle: "The Essence of Calculus, Chapter 1",
    // Updated with detailed summary
    precomputedSummary: `## 🎥 Video Overview
This video visually introduces the fundamental ideas of calculus by exploring the problem of finding the area of a circle and relating it to the concepts of integrals and derivatives.

## 📝 Summary
- Calculus helps understand change. The video uses finding the area of a circle as a central example.
- Approximation: We can approximate the circle's area by dividing it into many thin concentric rings (like tree rings).
- Unrolling the Rings: If we 'unroll' these rings, they form shapes that are almost rectangles.
- Creating a Graph: Plotting the circumference (2πr) of each ring against its radius (r) creates a straight-line graph (y=2πx).
- Area Connection: The total area of all the 'unrolled' rings approximates the area under the y=2πx graph, which forms a triangle.
- Area of Triangle: The area of this triangle is (1/2) * base * height = (1/2) * R * (2πR) = πR².
- Integral Calculus: This process of summing up infinitely many tiny pieces (the areas of the unrolled rings) to find the total area is the essence of integral calculus.
- Derivative Calculus: The inverse idea, finding the rate of change (how the area changes as the radius increases), relates to the circumference (2πR). This is the essence of derivative calculus.

## 🔑 Main Ideas
- Calculus tackles problems by breaking them down into infinitely small parts and analyzing how they add up or change.
- Integrals are about accumulation - summing up tiny quantities (like the area of thin rings) to get a whole.
- Derivatives are about instantaneous rates of change - how one quantity changes relative to another (like how circle area changes with radius).

## ❓ Why This Matters
This way of thinking allows us to solve complex problems involving curves, motion, growth, and optimization that are impossible with basic algebra alone.

## 🚀 Try This
Imagine slicing a sphere into thin circular disks. Can you relate the volume of the sphere to the area under some curve, similar to how the circle's area was related to the area under the circumference graph?`,
    precomputedFlashcards: [
      { front: "What shape is used to approximate the circle's area initially?", back: "Thin concentric rings (like tree rings)." },
      { front: "What graph is created by plotting ring circumference vs. radius?", back: "A straight line graph representing y = 2πx (or C = 2πr)." },
      { front: "What shape does the area under the circumference graph form?", back: "A triangle." },
      { front: "What does integral calculus represent in this example?", back: "Summing the areas of all the infinitely thin 'unrolled' rings to find the total circle area." },
      { front: "What does derivative calculus relate to in this example?", back: "The rate at which the circle's area changes as the radius increases, which is the circumference (2πR)." }
    ],
    precomputedTranscript: [
        { offset: 0, duration: 6000, text: "What is calculus? At its heart, it's the study of change."}, 
        { offset: 6000, duration: 9000, text: "But let's start with a classic problem: finding the area of a circle."}, 
        { offset: 15000, duration: 11000, text: "We can approximate it by slicing it into thin concentric rings."}, 
        { offset: 26000, duration: 10000, text: "If you unroll these rings, they almost form rectangles..."},
      // Add more placeholder segments as needed
    ]
  }
];
// --- End Example Video Data ---

export const YoutubeInput = ({ onSubmit }: YoutubeInputProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExampleLoading, setIsExampleLoading] = useState<string | null>(null); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(url);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = async (videoData: ExampleVideo) => {
    if (isLoading || isExampleLoading) return; 
    setIsExampleLoading(videoData.youtubeUrl);
    try {
      await onSubmit(videoData);
    } catch (error) { 
      console.error("Error submitting example URL:", error);
      setIsExampleLoading(null); 
    } 
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const urlPattern = /^(https?:\/\/)/i; 
    if (urlPattern.test(pastedText)) {
      console.log("URL pasted, triggering submit:", pastedText);
      setUrl(pastedText);
      setTimeout(() => {
        onSubmit(pastedText);
      }, 0);
    } else {
      console.log("Pasted text does not look like a URL:", pastedText);
    }
  };

  return (
    <motion.div
      key="input-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-7xl w-full h-full flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-4xl mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center tracking-tight">
          What do you want to learn today?
        </h1>
        <h2 className="mb-10 text-center text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
          Generate Summaries, Flashcards, and Chat with any YouTube Video
        </h2>
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="relative rounded-full shadow-sm bg-gray-50 border border-gray-200 focus-within:border-gray-300 transition-colors h-20">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-600 transition-colors"
                onClick={() => alert('File upload not implemented yet.')}
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
              onPaste={handlePaste}
              placeholder="Enter YouTube URL or upload file"
              className="w-full pl-20 pr-24 py-6 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-gray-900 placeholder-gray-400"
              required
              disabled={isLoading || !!isExampleLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !!isExampleLoading}
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

      <div className="w-full">
        <h3 className="text-sm font-normal text-gray-500 mb-4 text-center">Or try one of these examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exampleVideos.map((video) => (
            <button
              key={video.youtubeUrl}
              onClick={() => handleExampleClick(video)}
              disabled={isLoading || !!isExampleLoading}
              className={`relative text-left p-5 rounded-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-4 ${ (isLoading || !!isExampleLoading) ? 'opacity-50 cursor-not-allowed' : '' }`}
            >
              {(isExampleLoading === video.youtubeUrl) && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              )}
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4 relative">
                <Image 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  layout="fill" 
                  objectFit="cover" 
                  className="group-hover:opacity-90 transition-opacity"
                /> 
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1 truncate">{video.title}</h4>
              <p className="text-base text-gray-600 line-clamp-2">{video.description}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 