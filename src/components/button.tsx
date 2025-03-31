import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, isLoading, disabled, ...props }: ButtonProps & { isLoading?: boolean }) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative py-3 px-8 rounded-3xl text-sm bg-gradient-to-b from-[#1e103a] to-[#5b2ca3] shadow-[0px_0px_25px_rgba(140,69,255,0.7)] transition-all duration-200 transform 
        hover:scale-[1.02] hover:shadow-[0px_0px_20px_rgba(140,69,255,0.7),0_0_35px_rgba(140,69,255,0.5)] hover:bg-gradient-to-b hover:from-[#5b2ca3] hover:to-[#a560ff]
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-[#18042B]
        active:scale-[0.99] 
        disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none
        ${isLoading ? 'relative text-transparent' : 'font-normal'}`}
      aria-disabled={disabled || isLoading}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="absolute w-[200%] h-[200%] -left-[40%] -top-[40%] bg-[radial-gradient(circle_at_top_left,rgba(114,35,150,0.95)_20%,transparent_40%)]"></div>
        </div>
        <div className="rounded-3xl border border-white/25 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
        <div className="rounded-3xl border border-white/45 absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
        <div className="absolute inset-0 shadow-[0_0_12px_rgba(140,69,255,0.7)_inset] rounded-3xl"></div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      <span className="relative z-10">{children}</span>
    </button>
  );
};