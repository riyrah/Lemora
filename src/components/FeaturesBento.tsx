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
        <span className="text-white">
        Upload your notes or lectures, and Lemora creates clear summaries and bullet points with references instantly.
        </span> {" "}
        Still confused? Get explanations in a different style or just ask questions. Learning has never been this quick.
      </>
    ),
    image: "/lemorareallogo.png",
  },
  {
    title: "AI Lecture Recorder",
    description: (
      <>
        <span className="text-white">
          Record lectures, and Lemora turns them into detailed notes in seconds.
        </span>
        {" "}
        Focus on listening and revising smarter.
      </>
    ),
    lottie: "/assets/lottie/stars.lottie",
  },
  {
    title: "Ace Exams with Practice",
    description: (
      <>
        <span className="text-white">
        Create flashcards and quizzes from your learning material to study actively and think critically.
        </span>{" "}
        Difficulty adapts as you improve, helping you truly understand the material.
  
        
      </>
    ),
    lottie: "/assets/lottie/click.lottie",
    background: "/notesharing.png",
  },
  {
    title: "Interactive Note Sharing",
    description: (
      <>
        <span className="text-white">
        Share and discover top-rated notes with peers to prepare better for exams.
        </span>
        {" "}
        Collaborate and learn together.
  
        
      </>
    ),
    lottie: "/assets/lottie/vroom.lottie",
  },
  {
    title: "Smart Productivity",
    description: (
      <>
        <span className="text-white">
        Stay organized with a smart to-do list, time-blocked calendar, and a Pomodoro timer with LoFi beats.
        </span> 
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
      // Slight scale on hover
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      // Must be relative for the absolute border to layer properly
      className={`relative cursor-pointer 
        border border-white/15 
        rounded-[2.5rem] p-4 md:p-8 bg-black 
        hover:border-[#A369FF]/50 hover:bg-white/5 
        transition-colors duration-200 flex flex-col
        h-full overflow-hidden
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
            <div className="flex items-center gap-2">
              <h3
                className={`${titleSize} text-2xl md:text-3xl font-semibold tracking-tighter`}
              >
                {title}
              </h3>
              {isNew && (
                <div className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
                  new
                </div>
              )}
            </div>
          </div>
          <p className="text-white/50 font-semibold text-base md:text-lg tracking-tight">
  {description}
</p>



        </div>
        {image && (
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
        <div className="flex flex-col gap-7 mt-7">
          <div className="flex flex-col md:flex-row gap-7 md:h-[700px] relative">
            <div className="w-full h-[300px] md:h-auto md:flex-1">
              <BentoCard
                index={0}
                animationOrder={0}
                title={features[0].title}
                description={features[0].description}
                selected={selectedCard === 0}
                onSelect={setSelectedCard}
                titleSize="text-3xl"
                image={features[0].image}
              />
            </div>

            <div className="w-full md:w-[475px] flex flex-col gap-7 h-full relative">
              <div className="h-[300px] md:h-1/2">
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
              <div className="h-[300px] md:h-1/2">
                <BentoCard
                  index={2}
                  animationOrder={2}
                  title={features[2].title}
                  description={features[2].description}
                  selected={selectedCard === 2}
                  onSelect={setSelectedCard}
                  lottie={features[2].lottie}
                  // background={features[2].background}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-7 md:h-[300px] relative">
            <div className="w-full h-[350px] md:w-[400px]">
              <BentoCard
                index={3}
                animationOrder={3}
                title={features[3].title}
                description={features[3].description}
                selected={selectedCard === 3}
                onSelect={setSelectedCard}
                lottie={features[3].lottie}
              />
            </div>
            <div className="w-full h-[350px] md:flex-1">
              <BentoCard
                index={4}
                animationOrder={4}
                title={features[4].title}
                description={features[4].description}
                selected={selectedCard === 4}
                onSelect={setSelectedCard}
                lottie={features[4].lottie}
                isNew={features[4].isNew}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
