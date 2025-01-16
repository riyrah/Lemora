export const Button = (props: React.PropsWithChildren) => {
  return (
    <button className="relative py-2 px-4 rounded-full font-medium text-sm bg-gradient-to-b from-[#1e103a] to-[#5b2ca3] shadow-[0px_0px_25px_#8c45ff] transition-all transform hover:scale-105 hover:shadow-[0px_0px_20px_#8c45ff,0_0_35px_#8c45ff] hover:bg-gradient-to-b hover:from-[#5b2ca3] hover:to-[#a560ff]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="absolute w-[200%] h-[200%] -left-[40%] -top-[40%] bg-[radial-gradient(circle_at_top_left,rgba(114,35,150,1)_20%,transparent_40%)]"></div>
        </div>
        <div className="rounded-full border border-white/25 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
        <div className="rounded-full border border-white/50 absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
        <div className="absolute inset-0 shadow-[0_0_12px_rgb(140,69,255,.8)_inset] rounded-full"></div>
      </div>

      <span className="relative z-10">{props.children}</span>
    </button>
  );
};