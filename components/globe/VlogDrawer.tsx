"use client";

import { Vlog } from "@/lib/constants";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VlogDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    countryName: string | null;
    vlogs: Vlog[];
}

export default function VlogDrawer({ isOpen, onClose, countryName, vlogs }: VlogDrawerProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "absolute top-0 right-0 z-50 h-full w-full sm:w-1/2 border-l border-white/10 bg-[#02040a]/90 backdrop-blur-2xl transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex h-full flex-col p-8">
                    {/* Header */}
                    <div className="mb-8 flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-green-500">
                                Vlogs
                            </span>
                            <h2 className="font-mono text-2xl font-black uppercase text-white tracking-tight">
                                {countryName}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="group relative flex size-8 items-center justify-center border border-white/10 hover:border-green-500/50 transition-colors"
                        >
                            <span className="font-mono text-xs text-white group-hover:text-green-500">✕</span>
                        </button>
                    </div>

                    {/* Vlog List */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {vlogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vlogs.map((vlog, idx) => {
                                    const getYoutubeId = (url: string) => {
                                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                        const match = url.match(regExp);
                                        return (match && match[2].length === 11) ? match[2] : url;
                                    };

                                    const videoId = getYoutubeId(vlog.youtubeLink);
                                    const href = vlog.youtubeLink.startsWith('http')
                                        ? vlog.youtubeLink
                                        : `https://www.youtube.com/watch?v=${vlog.youtubeLink}`;

                                    return (
                                        <a
                                            key={idx}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col gap-3 border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-green-500/30 hover:bg-green-500/[0.05]"
                                        >
                                            <div className="relative aspect-video w-full bg-white/5 overflow-hidden">
                                                {/* Thumbnail Image */}
                                                <img
                                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                                    alt={vlog.title}
                                                    className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                                                />

                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity z-10">
                                                    <div className="size-10 rounded-full border border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-md">
                                                        <div className="ml-1 size-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white" />
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="font-mono text-sm leading-tight text-zinc-300 group-hover:text-white transition-colors">
                                                {vlog.title}
                                            </h3>
                                            <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500">
                                                <span className="uppercase">Watch on Youtube</span>
                                                <span className="h-[1px] flex-1 bg-white/5" />
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex h-40 flex-col items-center justify-center text-center">
                                <p className="font-mono text-xs text-zinc-500 uppercase">
                                    No vlogs found for this region
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer Branding */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                                @jahnnyVLOGS Official
                            </span>
                            <div className="flex gap-1">
                                <div className="size-1 bg-green-500/50" />
                                <div className="size-1 bg-green-500/30" />
                                <div className="size-1 bg-green-500/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
