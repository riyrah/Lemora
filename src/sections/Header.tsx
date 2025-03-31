import LogoIcon from "@/assets/lemora.png";
import LangIcon from "@/assets/lang-icon.svg";
import MenuIcon from "@/assets/icon-menu.svg";
import { Button } from "@/components/button";
import Link from "next/link";

// make it more minimal, just add the menu icon logo and the button (with lang icon)
// have why us section?

export const Header = () => {
  return (
    <header className="pt-2 pb-2 sticky top-0 z-10 backdrop-blur-md border-b border-white/15">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left side: Logo and navigation */}
          <div className="flex items-center gap-12">
            <div className="h-8 flex items-center -mt-0.4">
              <img src={LogoIcon.src} className="h-6 w-auto" alt="Lemora Logo" />
            </div>
            
            <nav className="hidden md:flex gap-8">
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">Features</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">Affiliate</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">About Us</a>
            </nav>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-3">
            <a href="#" className="hidden md:block text-white/80 hover:text-white transition-colors duration-300 text-sm">
              Log In
            </a>
            <LangIcon className="hidden md:block w-5 h-5 text-white/70 hover:text-white transition-colors duration-300 [&_*]:fill-current [&_*]:text-inherit" />
            
            <Link href="/dashboard">
              <div className="transform scale-[0.75] origin-right">
                <Button>
                  <span className="tracking-normal text-base">
                    Get Started
                  </span>
                </Button>
              </div>
            </Link>
            
            <MenuIcon className="block md:hidden text-white/70 hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </header>
  );
};