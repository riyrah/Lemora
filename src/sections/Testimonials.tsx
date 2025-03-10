"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import avatar6 from "@/assets/avatar-6.png";
import Image from "next/image";
import { TextAnimate } from "@/components/magicui/text-animate";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    text: "“Lemora has completely changed the way I study. The AI flashcards and quizzes save me so much time and actually test my knowledge, and the shared notes have been a lifesaver for tough exams.”",
    name: "Charlotte Davies",
    title: "Biology Major, University of Manchester",
    avatarImg: avatar1,
  },
  {
    text: "“I love how everything is in one place. The productivity tools keep me on track, and the AI summarizer helped me understand a 50-page research paper in minutes. I feel much more confident going into exams now.”",
    name: "Riyaan Rahman",
    title: "Computer Science Sophomore, Texas Tech University",
    avatarImg: avatar6,
  },
  {
    text: "“Preparing for AP exams is so much easier with Lemora. The shared notes and quizzes make reviewing wayyy less stressful.”",
    name: "Nia Adeyemi",
    title: "11th Grade AP Student, Dublin, Ireland",
    avatarImg: avatar3,
  },
  {
    text: "“I didn't realize how much time I wasted before using Lemora. Now, I can organize my week, review shared notes, and use the Pomodoro timer to focus. It's really like having a personal study assistant.”",
    name: "Thomas Janssen",
    title: "Business Senior, University of Amsterdam",
    avatarImg: avatar4,
  },
  {
    text: "“Lemora isn't just another app; I find that it's essential. I recorded my lectures and used the AI summarizer to prep for finals total game-changer for me and my friends.”",
    name: "Lukas Müller",
    title: "Engineering Junior, Technical University of Munich",
    avatarImg: avatar5,
  },
  {
    text: "“I use Lemora to stay organized and study for tests. The AI tools make learning faster and the shared notes are a great way to review. Really like having a personal tutor on my laptop.”",
    name: "David Chen",
    title: "10th Grade Honors Student, Los Angeles, USA",
    avatarImg: avatar2,
  },
];



export const Testimonials = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up marquee scrolling
    let ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        ".marquee-content",
        { x: "-50%" },
        {
          x: "0%",
          duration: 33,
          ease: "linear",
          repeat: -1,
        }
      );

      const marqueeEl = marqueeRef.current;
      if (!marqueeEl) return;

      marqueeEl.addEventListener("mouseenter", () => tween.pause());
      marqueeEl.addEventListener("mouseleave", () => tween.play());
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Fade in "Beyond Expectations." and "See for yourself."
    let ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonials-heading-1",
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".testimonials-heading-1",
            start: "top+=200 bottom",
          },
        }
      );

      gsap.fromTo(
        ".testimonials-heading-2",
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".testimonials-heading-2",
            start: "top+=200 bottom",
          },
        }
      );
    }, testimonialsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={testimonialsRef} className="py-18 md:py-32">
      <div className="container">
        {/* Replace h2 with TextAnimate */}
        <TextAnimate
          className="testimonials-heading-1 text-[2.6rem] md:text-7xl font-semibold text-center tracking-tight"
          animation="blurInUp"
          by="character"
          startOnView={true}
        >
          Beyond Expectations.
        </TextAnimate>

        {/* Fade-in target */}
        <p className="testimonials-heading-2 text-white/50 font-semibold text-2xl md:text-3xl text-center mt-5 tracking-tight max-w-xl mx-auto">
        The <span className="text-[#876dac]"><em>smartest</em></span> way to master any subject.
        </p>

        {/* Marquee container */}
        <div
          className="flex overflow-hidden mt-10 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] py-2"
          ref={marqueeRef}
        >
          {/* Inner container: duplicated testimonials for a seamless loop */}
          <div className="marquee-content flex gap-3 md:gap-5 pr-3 md:pr-5 flex-none font-normal">
            {[...testimonials, ...testimonials].map((t) => (
              <div
                key={t.name}
                className="group border border-white/15 p-4 md:p-6 lg:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)] max-w-[260px] sm:max-w-xs md:max-w-md flex-none hover:scale-[1.02] transition-transform duration-300 my-2"
              >
                <div className="text-base md:text-lg lg:text-xl tracking-tight px-1 md:px-3 lg:px-0">
                  {t.text}
                </div>
                <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-5">
                  <div className="relative flex-shrink-0 after:content-[''] after:absolute after:inset-0 after:bg-[rgb(140,69,244,.7)] after:mix-blend-soft-light before:absolute before:inset-0 before:border before:border-white/30 before:z-10 before:rounded-lg group-hover:after:bg-transparent">
                    <Image
                      src={t.avatarImg}
                      alt={`Avatar for ${t.name}`}
                      className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg grayscale group-hover:grayscale-0"
                    />
                  </div>

                  <div>
                    <div className="text-sm md:text-base">{t.name}</div>
                    <div className="text-[#9792b7] text-xs md:text-sm">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
