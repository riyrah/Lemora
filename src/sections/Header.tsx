import LogoIcon from "@/assets/lemora.png";
import LangIcon from "@/assets/lang-icon.svg";
import MenuIcon from "@/assets/icon-menu.svg";
import { Button } from "@/components/button";

// make it more minimal, just add the menu icon logo and the button (with lang icon)
// have why us section?

export const Header = () => {
  return (
 <header className="py-4 border-b border-white/15 md:border-none sticky top-0 z-10 backdrop-blur md:backdrop-blur-none">
      <div className="container">
        <div className="flex justify-between items-center md:border border-white/15 md:p-2.5 rounded-2xl max-w-3xl mx-auto md:backdrop-blur"> {/* Added backdrop-blur-md */}
          <div>
            <div className="border h-10 w-36 rounded-xl inline-flex items-center justify-center border-white/15">
              <img src={LogoIcon.src} className="h-7 w-auto" alt="Lemora Logo" />
            </div>
          </div>

          <div className="hidden md:block">
            <nav className="flex gap-8 text-sm ">
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">Features</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">Affiliate</a>
              {/* <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">Mentality</a> */}
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">About Us</a>
            </nav>
          </div>

          <div className="flex gap-4 items-center">
            <LangIcon className="hidden md:block w-5 h-5" />
            <Button>Get Started</Button>
            <MenuIcon className="block md:hidden" />
          </div>
        </div>
      </div>
    </header>
  );
};