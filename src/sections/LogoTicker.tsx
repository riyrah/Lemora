"use client";

import { useEffect, useRef } from "react";
import harvard from "@/assets/uni-logos/harvard-logo.png";
import oxford from "@/assets/uni-logos/oxford-logo.png";
import mit from "@/assets/uni-logos/mit-logo.png";
import tech from "@/assets/uni-logos/tech-logo.png";
import stanford from "@/assets/uni-logos/stanford-logo.png";
import cambridge from "@/assets/uni-logos/cambridge-logo.png";
import nus from "@/assets/uni-logos/nus-logo.png";
import nyu from "@/assets/uni-logos/nyu-logo.png";
import upenn from "@/assets/uni-logos/upen-logo.png";
import ut from "@/assets/uni-logos/ut-logo.png";
import ku from "@/assets/uni-logos/ku-logo.png";
import eth from "@/assets/uni-logos/eth-logo.png";
import gsap from "gsap";

const logos = [
  harvard, oxford, mit, tech, stanford, cambridge, nus, nyu, upenn, ut, ku, eth,
];

export const LogoTicker = () => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (tickerRef.current) {
      // Set initial position - start from negative position
      gsap.set(tickerRef.current, { x: `-${100 / 2}%` });

      // Create infinite scrolling animation - move to 0 (right)
      animation.current = gsap.to(tickerRef.current, {
        x: 0,
        duration: 33,
        ease: "none",
        repeat: -1,
        onRepeat: () => {
          gsap.set(tickerRef.current, { x: `-${100 / 2}%` });
        }
      });
    }

    return () => {
      if (animation.current) {
        animation.current.kill();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (animation.current) {
      animation.current.pause();
    }
  };

  const handleMouseLeave = () => {
    if (animation.current) {
      animation.current.play();
    }
  };

  return (
    <section className="py-24 md:py-24">
      <div className="container">
        <div className="flex items-center">
          <div className="flex-1 md:flex-none px-3">
            <h2 className="uppercase font-normal text-sm text-white/80">Trusted by top students globally</h2>
          </div>
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <div
              ref={tickerRef}
              className="flex flex-none gap-14 pr-14 py-4"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* First set of logos */}
              {logos.map((logo) => (
                <img
                  src={logo.src}
                  key={`first-${logo.src}`}
                  className="h-8 w-auto md:h-12 md:w-auto grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-300 hover:scale-110"
                  alt="University Logo"
                />
              ))}
              {/* Second set of logos for seamless loop */}
              {logos.map((logo) => (
                <img
                  src={logo.src}
                  key={`second-${logo.src}`}
                  className="h-8 w-auto md:h-12 md:w-auto grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-300 hover:scale-110"
                  alt="University Logo"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
