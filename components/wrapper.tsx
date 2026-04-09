"use client";

import { cn } from "@/lib/utils";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center px-6">
      {/* Corner Accents */}
      <div className="absolute top-5 left-5 aspect-square size-4 bg-white/50 z-30" />
      <div className="absolute top-5 right-5 aspect-square size-4 bg-white/50 z-30" />
      <div className="absolute bottom-5 left-5 aspect-square size-4 bg-white/50 z-30" />
      <div className="absolute right-5 bottom-5 aspect-square size-4 bg-white/50 z-30" />

      {/* Main Container */}
      <div className={cn(
        "relative z-10 m-6 size-full border border-white/10 bg-[#02040a] overflow-hidden",
        "before:absolute before:inset-0 before:z-0",
        // Soft Midnight Radial Polish — easier on the eye than flat black
        "before:[background:radial-gradient(circle_at_center,rgba(10,20,50,1)_0%,rgba(2,4,10,1)_100%)]",
        // Softened Blue Grid- Much less harsh than white
        "after:absolute after:inset-0 after:z-0 after:[background-image:linear-gradient(to_right,rgba(0,120,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,120,255,0.03)_1px,transparent_1px)]",
        "after:[background-size:44px_44px]"
      )}>
        <div className="relative z-20 h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
