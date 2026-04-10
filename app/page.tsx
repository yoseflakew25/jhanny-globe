"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState, Suspense, memo } from "react";
import dynamic from "next/dynamic";
import CountryNameDisplay from "@/components/globe/CountryNameDisplay";
import { JAHNNY_VLOGS } from "@/lib/constants";

const Globe = dynamic(() => import("@/components/globe/Globe"), { ssr: false });
const VlogDrawer = dynamic(() => import("@/components/globe/VlogDrawer"), { ssr: false });

function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#010101]">
      <div className="relative flex flex-col items-center">
        {/* Animated Scanning Ring */}
        <div className="relative size-24 mb-6">
          <div className="absolute inset-0 animate-[ping_3s_linear_infinite] rounded-full border border-green-500/20" />
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-2 border-transparent border-t-green-500" />
          <div className="absolute inset-4 animate-[spin_2s_linear_infinite_reverse] rounded-full border border-transparent border-t-white/30" />
        </div>

        <h2 className="font-mono text-sm font-bold text-white tracking-[0.3em] uppercase opacity-80">
          Syncing World Model
        </h2>
        <div className="mt-2 h-[1px] w-32 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
        <p className="mt-4 font-mono text-[10px] text-white/30 uppercase tracking-widest animate-pulse">
          Establishing Terminal Link...
        </p>
      </div>
    </div>
  );
}

const Instructions = memo(({ hoveredCountry }: { hoveredCountry: string | null }) => {
  return (
    <>
      {/* Bottom Left: Branding Title */}
      <div className="absolute left-8 bottom-8 z-30 flex flex-col items-start gap-1 text-left pointer-events-none opacity-90">
        <div className="flex items-center gap-2 mb-1">
          <span className="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
          <h3 className="font-mono text-base font-black text-green-500 uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            Countries that Jahnny has visited
          </h3>
        </div>
        <div className="h-[1px] w-32 bg-gradient-to-r from-green-500/50 to-transparent" />
        <p className="font-mono text-[9px] text-white/25 uppercase tracking-wider pl-1 font-bold">
          Global Archival System Active @jahnnyVLOGS
        </p>
      </div>

      {/* Bottom Right: Interaction Controls */}
      <div className="absolute right-8 bottom-8 z-30 flex flex-col items-end gap-4 text-right pointer-events-none">
        {hoveredCountry ? (
          <div className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-tighter transition-all duration-300">
            <span className="text-green-400 uppercase drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">{hoveredCountry}</span>
            <span className="h-[1px] w-8 bg-green-500/50" />
            <span className="text-white/40 uppercase">Tracking Target</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-tighter opacity-20">
            <span className="text-white/40 uppercase">Awaiting Selection</span>
            <span className="h-[1px] w-8 bg-white/10" />
            <span className="text-white/30 uppercase">Standby Mode</span>
          </div>
        )}

        <div className="flex flex-col items-end gap-3">
          <div className="rounded-none border-r-2 border-green-500/40 bg-black/60 px-5 py-3 font-mono text-[10px] font-normal text-white/70 backdrop-blur-3xl transition-all border-y border-l border-white/5">
            <p className="leading-tight">
              <span className="text-green-400 font-bold uppercase mr-1">Left Click</span>
              to Establish Data Link & View Vlogs
            </p>
            <div className="mt-2 flex items-center justify-end gap-1.5 opacity-30">
              <div className="h-[2px] w-2 bg-green-500/30" />
              <div className="h-[2px] w-4 bg-green-500/60" />
              <div className="h-[2px] w-8 bg-green-500" />
            </div>
          </div>
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest leading-none">
            EST. RECORD COUNT: 23+ Countries
          </p>
        </div>
      </div>
    </>
  );
});

Instructions.displayName = "Instructions";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Suspense fallback={<LoadingScreen />}>
        <CountryNameDisplay selectedCountry={selectedCountry || hoveredCountry} />

        <VlogDrawer
          isOpen={!!selectedCountry}
          onClose={() => setSelectedCountry(null)}
          countryName={selectedCountry}
          vlogs={selectedCountry ? (JAHNNY_VLOGS[selectedCountry] || []) : []}
        />

        <Instructions hoveredCountry={hoveredCountry} />

        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          dpr={[1, 2]}
          onPointerMissed={() => setSelectedCountry(null)}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff00" />

          <Globe
            onCountryClick={setSelectedCountry}
            onCountryHover={setHoveredCountry}
            selectedCountry={selectedCountry}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            zoomSpeed={0.8}
            rotateSpeed={0.7}
            minDistance={3.5}
            maxDistance={12}
            makeDefault
            dampingFactor={0.07}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
