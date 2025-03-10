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
        <div className="flex justify-between items-center md:border border-white/15 md:p-2.5 rounded-[2.5rem] max-w-3xl mx-auto md:backdrop-blur"> {/* Added backdrop-blur-md */}
          <div>
            <div className="h-11 px-6 rounded-3xl inline-flex items-center justify-center">
              <img src={LogoIcon.src} className="h-8 w-auto" alt="Lemora Logo" />
            </div>
          </div>

          <div className="hidden md:block">
            <nav className="flex gap-8 text-sm">
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-normal">Features</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-normal">Affiliate</a>
              {/* <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-normal">Mentality</a> */}
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-normal">About Us</a>
            </nav>
          </div>

          <div className="flex gap-4 items-center">
            <LangIcon className="hidden md:block w-5 h-5 text-white/70 hover:text-white transition-colors duration-300 [&_*]:fill-current [&_*]:text-inherit" />
            <Button>
              <span className="uppercase tracking-normal">
                Get Started
              </span>
            </Button>
            <MenuIcon className="block md:hidden text-white/70 hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </header>
  );
};