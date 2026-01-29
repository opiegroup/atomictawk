"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Gamepad2, Wrench, Crosshair, Zap, Trophy, Volume2, VolumeX, Info } from "lucide-react";

// Dynamically import 3D component to avoid SSR issues
const PixelShed = dynamic(
  () => import("@/components/shed/PixelShed").then((mod) => mod.PixelShed),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#1f1c13]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#CCAA4C] font-bold uppercase tracking-widest">Loading Shed...</p>
        </div>
      </div>
    ),
  }
);

// Dynamically import mini-games
const RetroRacer = dynamic(
  () => import("@/components/minigames/RetroRacer").then((mod) => mod.RetroRacer),
  { ssr: false }
);

const TargetShooter = dynamic(
  () => import("@/components/minigames/TargetShooter").then((mod) => mod.TargetShooter),
  { ssr: false }
);

const ReactionTest = dynamic(
  () => import("@/components/minigames/ReactionTest").then((mod) => mod.ReactionTest),
  { ssr: false }
);

interface HighScores {
  racer: number;
  shooter: number;
  reaction: number | null;
}

export default function ShedPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [highScores, setHighScores] = useState<HighScores>({
    racer: 0,
    shooter: 0,
    reaction: null,
  });

  const handleOpenGame = (game: string) => {
    if (game === "racer" || game === "shooter" || game === "reaction") {
      setActiveGame(game);
    } else {
      // For non-game interactions, could show info modals
      console.log("Interacted with:", game);
    }
  };

  const handleScore = (game: string, score: number) => {
    setHighScores((prev) => {
      if (game === "racer" && score > prev.racer) {
        return { ...prev, racer: score };
      }
      if (game === "shooter" && score > prev.shooter) {
        return { ...prev, shooter: score };
      }
      if (game === "reaction" && (prev.reaction === null || score < prev.reaction)) {
        return { ...prev, reaction: score };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-[#1f1c13] flex flex-col">
      {/* Header */}
      <header className="bg-[#252219] border-b-4 border-[#FF6B35] px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[#AEACA1] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 
              className="text-2xl font-black uppercase tracking-tight text-white"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              The Virtual Shed
            </h1>
            <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">
              Interactive 3D Experience • Click objects to interact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* High Scores */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-[#1f1c13] px-3 py-2 border border-[#AEACA1]/20">
              <Gamepad2 className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-[#AEACA1]">Racer:</span>
              <span className="text-white font-bold">{highScores.racer}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1f1c13] px-3 py-2 border border-[#AEACA1]/20">
              <Crosshair className="w-4 h-4 text-[#CCAA4C]" />
              <span className="text-[#AEACA1]">Shooter:</span>
              <span className="text-white font-bold">{highScores.shooter}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1f1c13] px-3 py-2 border border-[#AEACA1]/20">
              <Zap className="w-4 h-4 text-[#4ECDC4]" />
              <span className="text-[#AEACA1]">Reaction:</span>
              <span className="text-white font-bold">
                {highScores.reaction ? `${highScores.reaction}ms` : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-[#1f1c13] border border-[#AEACA1]/20 text-[#AEACA1] hover:text-white hover:border-white transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <PixelShed onOpenGame={handleOpenGame} />

        {/* Help Overlay */}
        {showHelp && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-[#252219]/95 border-2 border-[#CCAA4C] p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C]">
                Controls
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-[#AEACA1] hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-20 text-[#AEACA1]">Rotate:</span>
                <span className="text-white">Click + Drag</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-[#AEACA1]">Zoom:</span>
                <span className="text-white">Scroll Wheel</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-[#AEACA1]">Interact:</span>
                <span className="text-white">Click Objects</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#AEACA1]/20">
              <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest mb-2">
                Available Games:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#FF6B35]/20 border border-[#FF6B35] flex items-center justify-center mx-auto mb-1">
                    <Gamepad2 className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <span className="text-[9px] text-white">Racer</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#CCAA4C]/20 border border-[#CCAA4C] flex items-center justify-center mx-auto mb-1">
                    <Crosshair className="w-5 h-5 text-[#CCAA4C]" />
                  </div>
                  <span className="text-[9px] text-white">Shooter</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#4ECDC4]/20 border border-[#4ECDC4] flex items-center justify-center mx-auto mb-1">
                    <Zap className="w-5 h-5 text-[#4ECDC4]" />
                  </div>
                  <span className="text-[9px] text-white">Reaction</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game select buttons (mobile-friendly) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
          <button
            onClick={() => setActiveGame("racer")}
            className="bg-[#FF6B35] text-white p-3 rounded-full"
          >
            <Gamepad2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveGame("shooter")}
            className="bg-[#CCAA4C] text-[#353535] p-3 rounded-full"
          >
            <Crosshair className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveGame("reaction")}
            className="bg-[#4ECDC4] text-[#353535] p-3 rounded-full"
          >
            <Zap className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mini-games */}
      {activeGame === "racer" && (
        <RetroRacer
          onClose={() => setActiveGame(null)}
          onScore={(score) => handleScore("racer", score)}
        />
      )}
      {activeGame === "shooter" && (
        <TargetShooter
          onClose={() => setActiveGame(null)}
          onScore={(score) => handleScore("shooter", score)}
        />
      )}
      {activeGame === "reaction" && (
        <ReactionTest
          onClose={() => setActiveGame(null)}
          onScore={(score) => handleScore("reaction", score)}
        />
      )}
    </div>
  );
}
