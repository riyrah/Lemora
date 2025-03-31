"use client"

import { Button } from "@/components/button";
import starsBg from "@/assets/stars.png";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Lenis from "@studio-freight/lenis";
import gsap from 'gsap'; // Import GSAP


// have  a lottie animation saying to scroll down

export const Hero = () => {
  const sectionRef = useRef(null);
  const h1Ref = useRef<HTMLHeadingElement>(null); // Ref for the H1
  const pRef = useRef<HTMLParagraphElement>(null); // Ref for the Paragraph
  const buttonRef = useRef<HTMLDivElement>(null); // Ref for the Button container
  const planetRef = useRef<HTMLDivElement>(null); // Ref for the Planet container
  const ring1Ref = useRef<HTMLDivElement>(null); // Ref for Ring 1
  const ring2Ref = useRef<HTMLDivElement>(null); // Ref for Ring 2
  const ring3Ref = useRef<HTMLDivElement>(null); // Ref for Ring 3
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const backgroundPositionY = useTransform(
    scrollYProgress, 
    [0, 1], 
    [-450, 450],
    { clamp: true }
  )
  
  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
      touchMultiplier: 1,
    });
    
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;
    
    function rafThrottled(time: number) {
      if (time - lastTime > interval) {
        lastTime = time;
        lenis.raf(time);
      }
      requestAnimationFrame(rafThrottled);
    }
    
    requestAnimationFrame(rafThrottled);
    
    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  // GSAP Animation for H1
  useEffect(() => {
    if (h1Ref.current) {
      const h1Element = h1Ref.current;
      const originalText = h1Element.innerText;
      const chars = originalText.split('');

      // Clear original text and wrap each char in a span
      h1Element.innerHTML = '';
      const spans = chars.map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
        span.style.display = 'inline-block'; // Necessary for transform
        span.style.opacity = '0'; // Start invisible
        span.style.transform = 'translateY(20px)'; // Start slightly lower
        h1Element.appendChild(span);
        return span;
      });

      // Set initial states for paragraph and button
      if (pRef.current) {
        gsap.set(pRef.current, { opacity: 0, y: 20 });
      }
      if (buttonRef.current) {
        gsap.set(buttonRef.current, { opacity: 0, scale: 0.9 });
      }
      // Set initial states for planet and rings
      if (planetRef.current) {
        gsap.set(planetRef.current, { opacity: 0, scale: 0.9, y: 30 });
      }
      const ringRefs = [ring1Ref.current, ring2Ref.current, ring3Ref.current];
      ringRefs.forEach(ring => {
        if (ring) {
          gsap.set(ring, { autoAlpha: 0, scale: 0.9 });
        }
      });

      // Create GSAP Timeline
      const tl = gsap.timeline({ delay: 0.5 }); // Keep initial delay

      // Animate H1 spans
      tl.to(spans, {
        opacity: 1,
        y: 0, // Animate to original position
        stagger: 0.05, // Slower stagger
        duration: 1.2, // Slower duration
        ease: 'power3.out',
      });

      // Animate Paragraph after H1 (with slight overlap)
      if (pRef.current) {
        tl.to(pRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.9, // Slower duration
          ease: 'power3.out'
        }, "-=0.6"); // Keep overlap
      }

      // Animate Button after Paragraph (with slight overlap)
      if (buttonRef.current) {
        tl.to(buttonRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.8, // Slower duration
          ease: 'back.out(1.7)'
        }, "-=0.4"); // Keep overlap
      }

      // --- Planet and Rings Animation ---
      // Determine start time relative to the end of the text animations
      const planetRingStartTime = tl.totalDuration() * 0.8; // Start when text anim is 80% done

      if (planetRef.current) {
          tl.to(planetRef.current, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1.0,
              ease: 'power3.out'
          }, planetRingStartTime);
      }

      // Target opacities based on Tailwind classes for the rings
      const targetOpacities = [0.17, 1, 0.11];

      // Stagger rings slightly after planet starts
      ringRefs.forEach((ring, index) => {
          if (ring) {
              const targetOpacity = targetOpacities[index]; // Get opacity for this ring
              tl.to(ring, {
                  opacity: targetOpacity, // Animate to the specific target opacity
                  visibility: 'visible', // Ensure it becomes visible
                  scale: 1,
                  duration: 1.0,
                  ease: 'power3.out'
              }, planetRingStartTime + 0.15 * (index + 1)); // Stagger start time
          }
      });

    }
    // Basic cleanup
    return () => {
      // Kill tweens of elements that might have been animated
      gsap.killTweensOf([
        h1Ref.current?.children,
        pRef.current,
        buttonRef.current,
        planetRef.current,
        ring1Ref.current,
        ring2Ref.current,
        ring3Ref.current
      ].filter(Boolean)); // Filter out null refs just in case
    }
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="h-screen md:h-[950px] flex items-start pt-10 md:items-center md:pt-0 overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      style={{ 
        backgroundImage: `url(${starsBg.src})`,
        backgroundPositionY,
        willChange: 'background-position',
        backfaceVisibility: 'hidden',
      }}
      
      animate={{
        backgroundPositionX: starsBg.width,
      }}
      transition={{
        duration: 40,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_center_68%,rgb(145,75,255,.42)_10%,rgb(25,5,50,.38)_65%,transparent)]"></div>

      {/* Enhanced vignette effect - top and bottom edges */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.2)_5%,transparent_30%,transparent_70%,rgba(0,0,0,0.2)_95%,rgba(0,0,0,0.3)_100%),linear-gradient(to_right,rgba(0,0,0,0.2),transparent_30%,transparent_70%,rgba(0,0,0,0.2))] pointer-events-none"></div>

      {/* Centered container for the logo */}
      <div ref={planetRef} className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
        {/* Multi-layered glowing rim with directional light effect */}
        <div className="absolute h-[20rem] w-[20rem] md:h-[24.25rem] md:w-[24.25rem] rounded-full
            bg-transparent z-0"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0) translateY(50%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.3),
              -2px -2px 0 2px rgba(140,69,255,0.9),
              -4px -4px 4px 2px rgba(140,69,255,0.8),
              -7px -7px 15px 5px rgba(140,69,255,0.6),
              -10px -10px 35px 7px rgba(140,69,255,0.4),
              2px 2px 0 2px rgba(140,69,255,0.4),
              4px 4px 4px 2px rgba(140,69,255,0.3),
              7px 7px 15px 5px rgba(140,69,255,0.2),
              10px 10px 35px 7px rgba(140,69,255,0.1)
            `,
          }}
        ></div>

        {/* Logo/planet glow with reduced opacity */}
        <div
          className="h-[20rem] w-[20rem] md:h-[24.25rem] md:w-[24.25rem] bg-purple-500 rounded-full border border-white/15
          bg-[radial-gradient(50%_50%_at_16.8%_18.3%,rgba(255,255,255,0.9),rgb(174,142,240,0.85)_37.7%,rgb(24,0,66))]
          shadow-[-20px_-20px_50px_rgb(255,255,255,.22),-20px_-20px_80px_rgb(255,255,255,.05),0_0_45px_rgb(140,69,255,.55)]
          pointer-events-auto translate-y-1/2 relative z-10"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0) translateY(50%)',
            contain: 'paint layout size'
          }}
        >
          <div 
            className="w-full h-full relative"
          style={{
            maskImage: 'radial-gradient(circle at bottom center, transparent 15%, black 50%)',
            WebkitMaskImage: 'radial-gradient(circle at bottom center, transparent 15%, black 50%)'
          }}
        >
          <Image
            src="/lemorareallogo2.png"
            alt="Lemora Logo"
            width={385}
            height={385}
            className="w-full h-full object-contain"
              style={{ opacity: 0.25 }}
            priority
              loading="eager"
              sizes="(max-width: 768px) 20rem, 24.25rem"
              quality={75}
          />
          </div>
        </div>
      </div>

      {/* Ring 1 - original white with proper opacity */}
      <motion.div
        ref={ring1Ref}
        style={{
          translateX: '-50%',
          translateY: '50%',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        animate={{
          rotate: "1turn"
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute h-[410px] w-[410px] md:h-[560px] md:w-[560px] border border-white opacity-[0.17] rounded-full bottom-32 left-1/2">
        <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-2 w-2 left-1/2 bg-white rounded-full top-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-5 w-5 left-full border border-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full"></div>
        </div>
      </motion.div>
      {/* End ring 1 */}

      {/* Ring 2 - original white with proper opacity */}
      <motion.div
        ref={ring2Ref}
        style={{
          translateX: '-50%',
          translateY: '50%',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        animate={{
           rotate: "-1turn"
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear"
        }}
      className="absolute h-[520px] w-[520px] md:h-[750px] md:w-[750px] rounded-full border border-white/[0.16] bottom-32 left-1/2 border-dashed">
      </motion.div>
      {/* End ring 2 */}

      {/* Ring 3 - original white with proper opacity */}
      <motion.div
        ref={ring3Ref}
        style={{
          translateX: '-50%',
          translateY: '50%',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        animate={{
           rotate: "1turn"
        }}
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: "linear"
        }}
      className="absolute h-[650px] w-[650px] md:h-[960px] md:w-[960px] rounded-full border border-white opacity-[0.11] bottom-32 left-1/2">
      <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute h-2 w-2 left-full bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>
      {/* End ring 3 */}

      <div className="absolute w-full top-[17%] md:top-[14%] px-4 z-10">
        <h1
          ref={h1Ref} // Attach the ref here
          className="text-[3.2rem] md:text-[4.5rem] whitespace-nowrap md:whitespace-normal lg:text-[8rem] md:leading-none font-bold tracking-tighter py-0 md:pb-3 mb-0 text-center text-white"
        >
          Learning, Simplified
        </h1>
        <p
          ref={pRef} // Attach ref here
          className="text-base md:text-[1.5rem] font-medium md:font-normal text-white/85 mt-3 md:mt-6 text-center max-w-[80%] md:max-w-[52rem] mx-auto leading-relaxed tracking-tight">
          Too much to learn, too little time? Upload your content and let AI create the perfect learning materials for you. <em>Your grades will thank you.</em>
        </p>

        <div ref={buttonRef} className="flex justify-center mt-8 md:mt-10"> {/* Attach ref here */}
          <Link href="/dashboard">
            <div className="relative scale-[1.1] transform-gpu">
              <div className="absolute -inset-1 rounded-3xl border border-white/10 blur-[1px]"></div>
              <Button>
                <span className="tracking-normal font-normal text-sm">
                  Get Started For Free
                </span>
              </Button>
            </div>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-36 md:bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-4 h-8 md:w-6 md:h-10 rounded-full border-2 border-white/50 flex items-center justify-center"
        >
          <div className="w-0.5 h-1.5 md:w-1 md:h-2 bg-white/80 rounded-full" />
        </motion.div>
      </div>
    </motion.section>
  );
};
