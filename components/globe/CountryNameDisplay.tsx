"use client";

import { memo } from "react";

interface CountryNameDisplayProps {
    selectedCountry: string | null;
}

const CountryNameDisplay = memo(({ selectedCountry }: CountryNameDisplayProps) => {
    if (!selectedCountry) return null;

    return (
        <div className="absolute top-6 left-6 z-30 transform rounded-none border border-green-500/30 bg-black/40 px-4 py-2 text-zinc-400 backdrop-blur-md">
            <p className="font-mono text-lg font-semibold text-green-400/80 uppercase tracking-widest [text-shadow:0_0_10px_rgba(74,222,128,0.3)]">
                {selectedCountry}
            </p>
        </div>
    );
});

CountryNameDisplay.displayName = "CountryNameDisplay";

export default CountryNameDisplay;
