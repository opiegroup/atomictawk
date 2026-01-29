"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ReactionTestProps {
  onClose: () => void;
  onScore?: (score: number) => void;
}

type GameState = "waiting" | "ready" | "go" | "clicked" | "early";

export function ReactionTest({ onClose, onScore }: ReactionTestProps) {
  const [state, setState] = useState<GameState>("waiting");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = useCallback(() => {
    setState("ready");
    
    // Random delay between 1-5 seconds
    const delay = 1000 + Math.random() * 4000;
    
    timeoutRef.current = setTimeout(() => {
      setState("go");
      startTimeRef.current = performance.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (state === "waiting") {
      startRound();
    } else if (state === "ready") {
      // Clicked too early!
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setState("early");
    } else if (state === "go") {
      const time = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(time);
      setAttempts((prev) => [...prev, time]);
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        onScore?.(time);
      }
      
      setState("clicked");
    } else if (state === "clicked" || state === "early") {
      startRound();
    }
  }, [state, startRound, bestTime, onScore]);

  // Keyboard handling effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " ") {
        handleClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClick, onClose]);
  
  // Cleanup timeout on unmount only
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getAverageTime = () => {
    if (attempts.length === 0) return null;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };

  const getRating = (time: number) => {
    if (time < 200) return { label: "SUPERHUMAN", color: "#FF6B35" };
    if (time < 250) return { label: "EXCELLENT", color: "#CCAA4C" };
    if (time < 300) return { label: "GOOD", color: "#4ECDC4" };
    if (time < 400) return { label: "AVERAGE", color: "#9B59B6" };
    return { label: "SLOW", color: "#E74C3C" };
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#252219] border-4 border-[#4ECDC4] p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-2xl font-black uppercase tracking-tight text-[#4ECDC4]"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Reaction Test
          </h2>
          <button
            onClick={onClose}
            className="text-[#AEACA1] hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <button
          onClick={handleClick}
          className={`w-full h-64 flex flex-col items-center justify-center border-4 transition-all ${
            state === "waiting"
              ? "bg-[#1f1c13] border-[#AEACA1] hover:border-[#4ECDC4]"
              : state === "ready"
              ? "bg-[#E74C3C] border-[#E74C3C] cursor-wait"
              : state === "go"
              ? "bg-[#2ECC71] border-[#2ECC71] cursor-pointer"
              : state === "early"
              ? "bg-[#E74C3C] border-[#E74C3C]"
              : "bg-[#4ECDC4] border-[#4ECDC4]"
          }`}
        >
          {state === "waiting" && (
            <>
              <p className="text-3xl font-black text-white mb-2">CLICK TO START</p>
              <p className="text-[#AEACA1] text-sm">Test your reflexes</p>
            </>
          )}
          
          {state === "ready" && (
            <>
              <p className="text-4xl font-black text-white mb-2">WAIT...</p>
              <p className="text-white/80 text-sm">Click when it turns GREEN</p>
            </>
          )}
          
          {state === "go" && (
            <>
              <p className="text-5xl font-black text-white mb-2">GO!</p>
              <p className="text-white/80 text-sm">CLICK NOW!</p>
            </>
          )}
          
          {state === "early" && (
            <>
              <p className="text-3xl font-black text-white mb-2">TOO EARLY!</p>
              <p className="text-white/80 text-sm">Click to try again</p>
            </>
          )}
          
          {state === "clicked" && reactionTime && (
            <>
              <p 
                className="text-5xl font-black mb-2"
                style={{ color: getRating(reactionTime).color }}
              >
                {reactionTime}ms
              </p>
              <p 
                className="text-xl font-bold mb-2"
                style={{ color: getRating(reactionTime).color }}
              >
                {getRating(reactionTime).label}
              </p>
              <p className="text-white/80 text-sm">Click to try again</p>
            </>
          )}
        </button>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-[#1f1c13] p-3">
            <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Best</p>
            <p className="text-xl font-black text-[#CCAA4C]">
              {bestTime ? `${bestTime}ms` : "—"}
            </p>
          </div>
          <div className="bg-[#1f1c13] p-3">
            <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Average</p>
            <p className="text-xl font-black text-white">
              {getAverageTime() ? `${getAverageTime()}ms` : "—"}
            </p>
          </div>
          <div className="bg-[#1f1c13] p-3">
            <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Tries</p>
            <p className="text-xl font-black text-white">{attempts.length}</p>
          </div>
        </div>

        <div className="mt-4 text-center text-[#AEACA1] text-xs">
          <p>Press SPACE or Click | ESC to exit</p>
        </div>
      </div>
    </div>
  );
}
