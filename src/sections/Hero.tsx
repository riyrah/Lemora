
"use client"

import { Button } from "@/components/button";
import starsBg from "@/assets/stars.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";


// have  a lottie animation saying to scroll down

export const Hero = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const backgroundPositionY = useTransform(scrollYProgress, [0, 1], [-300, 300])

  return (
    <motion.section
      ref={sectionRef}
      className="h-[524px] md:h-[875px] flex items-center overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      style={{ backgroundImage: `url(${starsBg.src})`,
      backgroundPositionY,
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
      <div className="absolute inset-0 bg-[radial-gradient(75%_75%_at_center_center,rgb(140,69,255,.5)_15%,rgb(14,0,36,.5)_78%,transparent)]"></div>
      {/* Start planet */}
      <div className="absolute h-72 w-72 md:h-96 md:w-96 bg-purple-500 rounded-full border border-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(50%_50%_at_16.8%_18.3%,white,rgb(184,148,255)_37.7%,rgb(24,0,66))] shadow-[-20px_-20px_50px_rgb(255,255,255,.5),-20px_-20px_80px_rgb(255,255,255,.1),0_0_50px_rgb(140,69,255)]"></div>
      {/* End planet */}

      {/* Start ring 1 */}
      <motion.div 
      style={{
        translateY: '-50%',
        translateX: '-50%',
      }}
      animate={{
        rotate: "1turn"
      }}
      transition={{
        duration: 60,
        repeat: Infinity,
        ease: "linear"
      }} className="absolute h-[364px] w-[364px] md:h-[580px] md:w-[580px] border border-white opacity-20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-2 w-2 left-1/2 bg-white rounded-full top-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-5 w-5 left-full border border-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full"></div>
        </div>
      </motion.div>
      {/* End ring 1 */}

      {/* Start ring 2 */}
      <motion.div 
        style={{
          translateY: '-50%',
          translateX: '-50%',
        }}
        animate={{
           rotate: "-1turn"
        }} 
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear"
        }}
      className="absolute h-[464px] w-[464px] md:h-[780px] md:w-[780px] rounded-full border border-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed">
      </motion.div>
      {/* End ring 2 */}

      {/* Start ring 3 */}
      <motion.div 
        style={{
          translateY: '-50%',
          translateX: '-50%',
        }}
        animate={{
           rotate: "1turn"
        }} 
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: "linear"
        }}
      className="absolute h-[564px] w-[564px] md:h-[980px] md:w-[980px] rounded-full border border-white opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute h-2 w-2 left-full bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>
      {/* End ring 3 */}

      <div className="container relative mt-16">
        <h1 className="text-6xl md:text-8xl md:leading-none font-bold tracking-tighter py-2 bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,32,128,.5))] text-transparent bg-clip-text text-center ">
          Productivity, Reimagined
        </h1>
        <p className="text-xs md:text-xl font-bold md:font-semibold text-white/70 mt-5 text-center max-w-3xl mx-auto">
          Learn faster with AI, stay ahead of tasks, and prepare with notes shared by students like you - all to help you achieve more in less time.
        </p>

        <div className="flex justify-center mt-5">
          <Button>Get Started</Button>
        </div>
      </div>
    </motion.section>
  );
};

