// components/FooterContent.tsx

import React from "react";
import LogoLemora from "@/assets/lemoraslogan3.png";
import XSocial from "@/assets/social-x.svg";
import InstagramSocial from "@/assets/social-instagram.svg";
import YoutubeSocial from "@/assets/social-youtube.svg";


//dont have "follow us" just have logos
// have a have a contact section 
// have a legal section
export default function FooterContent() {
  return (
    <div
      className="h-full w-full flex flex-col justify-between px-6 py-5 text-white"
      style={{ background: "black" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(140,69,255,0.13),transparent)] pointer-events-none" />
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8 mt-1 md:mt-16">
        {/* Logo Section - Left */}
        <div className="flex items-center">
          <img src={LogoLemora.src} alt="Lemora Logo" className="h-20 md:h-28" />
        </div>

        {/* Right Section - Navigation and Social */}
        <div className="flex flex-col md:flex-row gap-16">
          {/* Modified container for mobile layout */}
          <div className="w-full flex justify-between gap-20 md:flex-row md:gap-16">
            {/* Navigation Column */}
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-sm md:text-lg text-white">Navigation</h2>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">Features</a>
                <a href="#" className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">Affiliate</a>
                {/*<a href="#" className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">Mentality</a> */}
                <a href="#" className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">About Us</a>
              </nav>
            </div>

            {/* Follow Us Column */}
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-sm md:text-lg text-white">Socials</h2>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <XSocial className="text-white/40 hover:text-white transition-colors duration-300" />
                  <span className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">Twitter</span>
                </div>
                <div className="flex gap-2">
                  <InstagramSocial className="text-white/40 hover:text-white transition-colors duration-300" />
                  <span className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">Instagram</span>
                </div>
                <div className="flex gap-2">
                  <YoutubeSocial className="text-white/40 hover:text-white transition-colors duration-300" />
                  <span className="text-xs md:text-sm text-white/50 hover:text-white transition-colors duration-300">YouTube</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full max-w-6xl">
        <p className="text-white/50 text-xs">© 2025 Lemora Team.</p>
      </div>
    </div>
  );
}
