"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DotLottiePlayer, DotLottieCommonPlayer } from "@dotlottie/react-player";
import React from "react";

const features = [
  {
    title: "Study Faster with AI",
    description: (
      <>
        Upload your notes or lectures, and Lemora creates clear summaries and bullet points with references instantly.
        {" "}
        Still confused? Get explanations in a different style or just ask questions. Learning has never been this quick.
      </>
    ),
  },
  {
    title: "AI Lecture Recorder",
    description: (
      <>
        Record lectures, and Lemora turns them into detailed notes in seconds.
        {" "}
        Focus on listening and revising smarter.
      </>
    ),
    lottie: "/assets/lottie/stars.lottie",
  },

  // add this AI icon <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" d="M5.5 1v1.5m-3 3H1m14 0h-1.5M2.5 8H1m14 0h-1.5m-11 2.5H1m14 0h-1.5m-8 3V15M8 1v1.5m0 11V15m2.5-14v1.5m0 11V15m2-12.5 1 1v9l-1 1h-9l-1-1v-9l1-1h9Z"/><path stroke="currentColor" d="M8.5 11V8.5m-3 2.5V8.5m0 0v-2l1-1h2v3m-3 0h3M10.5 5v6"/></svg>
  {
    title: "Ace Exams with Practice",
    description: (
      <>
        Create flashcards and quizzes from your learning material to study actively and think critically.
        {" "}
        Difficulty adapts as you improve, helping you truly understand the material.
      </>
    ),
    lottie: "/assets/lottie/click.lottie",
    background: "/notesharing.png",
  },
  {
    title: "Quick-Solve Extension",
    description: (
      <>
        Snap a screenshot of any problem and our Chrome extension delivers immediate solutions.
        {" "}
        Breeze through assignments with AI-powered help.
      </>
    ),
    image: "/chrome-logo.png",
  },
  {
    title: "Smart Productivity",
    description: (
      <>
        Stay organized with a smart to-do list, time-blocked calendar, and a Pomodoro timer with LoFi beats.
        {" "}
        Access motivational tools to boost focus and crush procrastination. Stronger Mind.
      </>
    ),
    isNew: true,
  },
];

function BentoCard({
  index,
  title,
  description,
  selected,
  onSelect,
  titleSize = "text-2xl",
  animationOrder = 0,
  image,
  lottie,
  isNew,
  background,
}: {
  index: number;
  title: string;
  description: string | ReactNode;
  selected: boolean;
  onSelect: (idx: number) => void;
  titleSize?: string;
  animationOrder?: number;
  image?: string;
  lottie?: string;
  isNew?: boolean;
  background?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dotLottieRef = useRef<DotLottieCommonPlayer>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Create the motion values for the radial gradient
  const xPercentage = useMotionValue(50);
  const yPercentage = useMotionValue(0);

  // We want the radial gradient to be visible
  // black => visible, transparent => hidden
  const maskImage = useMotionTemplate`
    radial-gradient(120px 120px at ${xPercentage}% ${yPercentage}%, black, transparent)
  `;

  useEffect(() => {
    if (!selected || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    const circumference = width * 2 + height * 2;

    const times = [
      0,
      width / circumference,
      (width + height) / circumference,
      (width * 2 + height) / circumference,
      1,
    ];

    // Animate x
    animate(xPercentage, [0, 100, 100, 0, 0], {
      duration: 7,
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop",
      times,
    });

    // Animate y
    animate(yPercentage, [0, 0, 100, 100, 0], {
      duration: 7,
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop",
      times,
    });
  }, [selected]);

  // GSAP fade in on scroll
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%", // adjust as you like
          toggleActions: "play reverse play reverse",
        },
        duration: 1,
        delay: 0.1 * animationOrder,
        ease: "power3.out",
      }
    );
  }, [animationOrder]);

  // Replay the lottie on hover
  const handleCardHover = () => {
    if (!dotLottieRef.current) return;
    dotLottieRef.current.seek(0);
    dotLottieRef.current.play();
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={handleCardHover}
      onClick={() => onSelect(index)}
      // Updated hover and active effects to match button behavior
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.2 }}
      className={`relative cursor-pointer 
        border border-white/15 
        rounded-[2.5rem] p-4 md:p-8 bg-[#0A0A0A] 
        hover:border-[#A369FF]/50 hover:bg-white/5 
        transition-colors duration-200 flex flex-col
        h-full overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]
      `}
      style={
        background
          ? {
              backgroundImage: `url(${background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "darken",
              backgroundColor: "rgba(0,0,0,0.6)",
            }
          : {}
      }
    >
      {/* This is the traveling purple border, only shown if "selected" */}
      {selected && (
        <motion.div
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
          className="absolute inset-0 -m-px 
                     border-2 border-[#A369FF] 
                     rounded-[2.5rem] pointer-events-none
                     z-10"
        />
      )}

      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            {lottie && (
              <div className="w-12 h-12 border border-white/15 rounded-lg inline-flex items-center justify-center flex-shrink-0">
                <DotLottiePlayer
                  ref={dotLottieRef}
                  src={lottie}
                  className="w-5 h-5"
                  autoplay
                />
              </div>
            )}
            {image && !(/lemorareallogo/).test(image) && (
              <div className="w-12 h-12 border border-white/15 rounded-lg inline-flex items-center justify-center flex-shrink-0">
                <Image
                  src={image}
                  alt={title}
                  width={22}
                  height={22}
                  className="w-6 h-6 object-contain"
                  style={{ opacity: 0.7 }}
                  priority
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <h3
                className={`${titleSize} text-2xl md:text-3xl font-semibold tracking-tighter`}
              >
                {title}
              </h3>
              {isNew && (
                <div className="text-xs rounded-full px-2 py-0.5 bg-[#876dac] text-black font-semibold">
                  new
                </div>
              )}
            </div>
          </div>
          <p className="text-[#9792b7] font-normal text-base md:text-lg tracking-tight">
            {description}
          </p>
        </div>
        {image && (/lemorareallogo/).test(image) && (
          <div className="flex-1 flex items-center justify-center relative">
            <div
              className="relative w-[110px] md:w-[300px] h-auto"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 30%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 30%, transparent 100%)",
              }}
            >
              <Image
                src={image}
                alt="Lemora Logo"
                width={200}
                height={200}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FeaturesBento() {
  const [selectedCard, setSelectedCard] = useState(0);

  return (
    <section className="relative container mx-auto py-20 md:py-10 bg-black">
      <div className="px-4">
        <div className="flex flex-col gap-8">
          {/* First row - Full width horizontal box */}
          <div className="h-[300px] md:h-[350px]">
            <BentoCard
              index={0}
              animationOrder={0}
              title={features[0].title}
              description={features[0].description}
              selected={selectedCard === 0}
              onSelect={setSelectedCard}
              titleSize="text-3xl"
            />
          </div>

          {/* Second row - Two boxes stacked next to each other */}
          <div className="flex flex-col md:flex-row gap-8 md:h-[350px]">
            <div className="w-full md:w-1/2 h-[300px] md:h-full">
              <BentoCard
                index={1}
                animationOrder={1}
                title={features[1].title}
                description={features[1].description}
                selected={selectedCard === 1}
                onSelect={setSelectedCard}
                lottie={features[1].lottie}
              />
            </div>
            <div className="w-full md:w-1/2 h-[300px] md:h-full">
              <BentoCard
                index={2}
                animationOrder={2}
                title={features[2].title}
                description={features[2].description}
                selected={selectedCard === 2}
                onSelect={setSelectedCard}
                lottie={features[2].lottie}
              />
            </div>
          </div>

          {/* Third row - Full width horizontal box */}
          <div className="h-[300px] md:h-[350px]">
            <BentoCard
              index={3}
              animationOrder={3}
              title={features[3].title}
              description={features[3].description}
              selected={selectedCard === 3}
              onSelect={setSelectedCard}
              image={features[3].image}
            />
          </div>

          {/* Fourth row - Full width horizontal box */}
          <div className="h-[300px] md:h-[350px]">
            <BentoCard
              index={4}
              animationOrder={4}
              title={features[4].title}
              description={features[4].description}
              selected={selectedCard === 4}
              onSelect={setSelectedCard}
              isNew={features[4].isNew}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
