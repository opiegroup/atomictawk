"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const blokeScienceFacts = [
  {
    title: "The First V8 Engine",
    fact: "The first V8 engine was patented in 1902 by Léon Levavasseur, a French inventor. Originally designed for aircraft, the V8 configuration became the heart of American muscle cars by the 1960s. Talk about a power upgrade."
  },
  {
    title: "Burnout Physics",
    fact: "A proper burnout can heat tyre rubber to over 200°C (392°F). The smoke you see is actually vaporized rubber particles mixed with superheated air. That's science, mate - just more exciting."
  },
  {
    title: "The 10mm Socket Curse",
    fact: "Studies show the average mechanic loses 3-5 10mm sockets per year. Scientists believe they may be slipping into a parallel dimension. No other explanation makes sense."
  },
  {
    title: "Shed Acoustics",
    fact: "The optimal shed size for acoustic privacy while using power tools is 4x3 metres. Any larger and the missus can hear you 'just checking something'. Any smaller and you can't fit the fridge."
  },
  {
    title: "Beer Fridge Efficiency",
    fact: "A dedicated beer fridge in the shed reaches optimal temperature 23% faster than a kitchen fridge. This is due to the 'anticipation factor' - you check it more often."
  },
  {
    title: "Torque vs Horsepower",
    fact: "Horsepower is how fast you hit the wall. Torque is how far you take the wall with you. Both are essential for a proper burnout, but only one impresses the neighbors."
  },
  {
    title: "The WD-40 Principle",
    fact: "If it moves and shouldn't: duct tape. If it doesn't move and should: WD-40. This covers approximately 87% of all mechanical problems known to mankind."
  },
  {
    title: "Man Cave Temperature",
    fact: "The ideal man cave temperature is 22°C - warm enough for comfort, cool enough for the beer fridge to not work overtime. This has been scientifically optimized since 1973."
  },
  {
    title: "Tool Organization",
    fact: "The average bloke spends 2.3 hours per week looking for tools. Installing a pegboard reduces this to 47 minutes. The remaining time is spent admiring said pegboard."
  },
  {
    title: "Exhaust Note Science",
    fact: "The human ear finds V8 exhaust notes between 80-120Hz most pleasing. This frequency range triggers the same brain response as a perfectly cooked steak. Coincidence? We think not."
  },
];

export function BlokeScienceSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [animatingCards, setAnimatingCards] = useState<{index: number, direction: 'left' | 'right'}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-advance slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % blokeScienceFacts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Animate cards on mount
  useEffect(() => {
    const animateIn = () => {
      blokeScienceFacts.forEach((_, index) => {
        setTimeout(() => {
          setAnimatingCards(prev => [...prev, { 
            index, 
            direction: index % 2 === 0 ? 'left' : 'right' 
          }]);
          setTimeout(() => {
            setVisibleCards(prev => [...prev, index]);
            setAnimatingCards(prev => prev.filter(c => c.index !== index));
          }, 500);
        }, index * 150);
      });
    };
    
    animateIn();
  }, []);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + blokeScienceFacts.length) % blokeScienceFacts.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % blokeScienceFacts.length);
  };

  const getVisibleIndices = () => {
    const indices = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + blokeScienceFacts.length) % blokeScienceFacts.length;
      indices.push(index);
    }
    return indices;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Cards Container - with padding for buttons */}
      <div className="flex justify-center items-center gap-6 py-4 px-20 md:px-24 overflow-hidden">
        {getVisibleIndices().map((factIndex, position) => {
          const fact = blokeScienceFacts[factIndex];
          const isCenter = position === 1;
          const isAnimating = animatingCards.find(c => c.index === factIndex);
          const isVisible = visibleCards.includes(factIndex);
          
          return (
            <div
              key={factIndex}
              className={`
                industrial-border bg-[#E3E2D5] p-6 md:p-8 relative transition-all duration-500 ease-out
                ${isCenter ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-60 z-0'}
                ${isAnimating ? (isAnimating.direction === 'left' ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0') : 'translate-x-0'}
                ${!isVisible && !isAnimating ? 'opacity-0' : ''}
                w-full max-w-sm shrink-0
              `}
              style={{
                transform: isAnimating 
                  ? `translateX(${isAnimating.direction === 'left' ? '-100%' : '100%'}) scale(0.8)`
                  : isCenter 
                    ? 'translateX(0) scale(1)' 
                    : position === 0 
                      ? 'translateX(0) scale(0.9)' 
                      : 'translateX(0) scale(0.9)',
              }}
            >
              <div className="absolute top-4 right-4 stamp text-xs">Did You Know?</div>
              <div className="absolute top-4 left-4 bg-[#FF6B35] text-white px-2 py-1 text-[10px] font-black">
                #{factIndex + 1}
              </div>
              <h3 
                className="text-xl md:text-2xl font-black uppercase mb-4 text-[#353535] pr-24 pt-6"
                style={{ fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {fact.title}
              </h3>
              <p className="font-mono text-sm text-[#353535]/80 leading-relaxed">
                {fact.fact}
              </p>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons - positioned at edges, outside cards */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white flex items-center justify-center transition-colors shadow-lg"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-[#CCAA4C] hover:bg-[#FF6B35] text-[#353535] hover:text-white flex items-center justify-center transition-colors shadow-lg"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {blokeScienceFacts.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 transition-all ${
              index === currentIndex 
                ? 'bg-[#CCAA4C] scale-125' 
                : 'bg-[#E3E2D5]/50 hover:bg-[#E3E2D5]'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="text-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-[#E3E2D5]/50 hover:text-[#CCAA4C] text-xs uppercase tracking-widest"
        >
          {isAutoPlaying ? '⏸ Auto-playing' : '▶ Click to auto-play'}
        </button>
      </div>
    </div>
  );
}
