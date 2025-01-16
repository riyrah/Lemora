"use client";
import {
  DotLottieCommonPlayer,
  DotLottiePlayer,
} from "@dotlottie/react-player";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  Transition, // <-- Use `Transition` instead of `ValueAnimationTransition`
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  ComponentPropsWithoutRef,
} from "react";
import FeaturesBento from "@/components/FeaturesBento";

// Import GSAP + ScrollTrigger
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const tabs = [
  {
    icon: "/assets/lottie/click.lottie",
    title: "Access Shared Notes",
    isNew: false,
    backgroundPositionX: 98,
    backgroundPositionY: 100,
    backgroundSizeX: 135,
  },
  {
    icon: "/assets/lottie/stars.lottie",
    title: "Stay In Control",
    isNew: false,
    backgroundPositionX: 100,
    backgroundPositionY: 27,
    backgroundSizeX: 177,
  },
  {
    icon: "/assets/lottie/vroom.lottie",
    title: "Test Your Knowledge",
    isNew: true,
    backgroundPositionX: 0,
    backgroundPositionY: 0,
    backgroundSizeX: 150,
  },
];

const FeatureTab = (
  props: typeof tabs[number] &
    ComponentPropsWithoutRef<"div"> & {
      selected: boolean;
    }
) => {
  const tabRef = useRef<HTMLDivElement>(null);
  const dotLottieRef = useRef<DotLottieCommonPlayer>(null);

  const xPercentage = useMotionValue(50);
  const yPercentage = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(80px 80px at ${xPercentage}% ${yPercentage}%, black, transparent)`;

  useEffect(() => {
    if (!tabRef.current) return;
    const { height, width } = tabRef.current.getBoundingClientRect();
    const circumference = height * 2 + width * 2;

    const times = [
      0,
      width / circumference,
      (width + height) / circumference,
      (width * 2 + height) / circumference,
      1,
    ];

    // Use `Transition` or omit the type to let TypeScript infer it
    const options: Transition = {
      times,
      duration: 4,
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop",
    };

    animate(xPercentage, [0, 100, 100, 0, 0], options);
    animate(yPercentage, [0, 0, 100, 100, 0], options);
  }, [xPercentage, yPercentage]);

  const handleTabHover = () => {
    // Restart and play the Lottie animation on hover
    if (dotLottieRef.current === null) return;
    dotLottieRef.current.seek(0);
    dotLottieRef.current.play();
  };

  return (
    <motion.div
      ref={tabRef}
      onMouseEnter={handleTabHover}
      onClick={props.onClick}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border border-white/15 flex p-2.5 rounded-xl gap-2.5 items-center 
                 lg:flex-1 relative transition-colors duration-200 
                 hover:border-[#A369FF]/50 hover:bg-white/5 cursor-pointer"
    >
      {props.selected && (
        <motion.div
          style={{
            maskImage,
          }}
          className="absolute inset-0 -m-px border border-[#A369FF] rounded-xl pointer-events-none"
        />
      )}

      <div className="w-12 h-12 border border-white/15 rounded-lg inline-flex items-center justify-center">
        <DotLottiePlayer
          ref={dotLottieRef}
          src={props.icon}
          className="w-5 h-5"
          autoplay
        />
      </div>

      <div className="font-medium">{props.title}</div>
      {props.isNew && (
        <div className="text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold">
          new
        </div>
      )}
    </motion.div>
  );
};

export const Features = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use GSAP Context for scoping
    const ctx = gsap.context(() => {
      // Fade in "Your Ultimate Study Hub."
      gsap.fromTo(
        ".features-heading-1",
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".features-heading-1",
            start: "top+=150 bottom",
          },
        }
      );

      // Fade in "Meet Lemora"
      gsap.fromTo(
        ".features-subheading-1",
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".features-subheading-1",
            start: "top+=100 bottom",
          },
        }
      );

      // Fade in "It&apos;s everything you need..."
      gsap.fromTo(
        ".features-subheading-2",
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".features-subheading-2",
            start: "top+=300 bottom",
          },
        }
      );
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={featuresRef} className="py-20 md:py-32 mt-28">
      <div className="container">
        {/* Fade-in target */}
        <h2 className="features-heading-1 text-6xl md:text-7xl font-semibold text-center tracking-tighter">
          Your Ultimate Study Hub.
        </h2>
        {/* Fade-in target */}
        <p className="features-subheading-1 text-white/50 font-semibold text-2xl md:text-3xl tracking-tight text-center mt-8 max-w-4xl mx-auto">
          Meet <span className="text-[#8c44ff]">Lemora</span>
        </p>
      </div>

      <FeaturesBento />

      <div className="container">
        {/* Fade-in target */}
        <p className="features-subheading-2 text-white/50 font-semibold text-3xl md:text-4xl tracking-tight text-center py-40 max-w-4xl mx-auto">
          It&apos;s{" "}
          <span className="text-[#8c44ff]">
            everything you need to conquer your studies
          </span>
          , all in one seamless platform.
        </p>
      </div>
    </section>
  );
};
