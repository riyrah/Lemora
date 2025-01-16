// sections/Footer.tsx

import React from "react";
import FooterContent from "@/components/FooterContent";

export const Footer = () => {
  return (
    <div className="border-t border-white/15 relative">
      
      <div className="container">
      
        <div
          className="relative h-[350px]"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            background: "black",
          }}
          
        >
          <div className="relative h-[calc(100vh+350px)] -top-[100vh]">
            <div className="h-[350px] sticky top-[calc(100vh-350px)]">
              <FooterContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
