"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TargetShooterProps {
  onClose: () => void;
  onScore?: (score: number) => void;
}

interface Target {
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  points: number;
  color: string;
}

export function TargetShooter({ onClose, onScore }: TargetShooterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const targetsRef = useRef<Target[]>([]);
  const crosshairRef = useRef({ x: 150, y: 200 });

  const spawnTarget = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const types = [
      { size: 40, points: 10, color: "#FF6B35", speed: 1 },
      { size: 30, points: 25, color: "#CCAA4C", speed: 2 },
      { size: 20, points: 50, color: "#E74C3C", speed: 3 },
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    targetsRef.current.push({
      x: Math.random() * (canvas.width - type.size * 2) + type.size,
      y: Math.random() * (canvas.height - type.size * 2) + type.size,
      size: type.size,
      speed: type.speed,
      direction: Math.random() * Math.PI * 2,
      points: type.points,
      color: type.color,
    });
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setCombo(0);
    targetsRef.current = [];
    for (let i = 0; i < 5; i++) {
      spawnTarget();
    }
  }, [spawnTarget]);

  // Handle game over when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      onScore?.(score);
    }
  }, [timeLeft, gameOver, score, highScore, onScore]);

  // Timer countdown
  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      crosshairRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleClick = () => {
      if (gameOver) return;

      const crosshair = crosshairRef.current;
      let hit = false;

      targetsRef.current = targetsRef.current.filter((target) => {
        const dx = crosshair.x - target.x;
        const dy = crosshair.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < target.size) {
          hit = true;
          const comboMultiplier = Math.min(5, 1 + combo * 0.5);
          const points = Math.floor(target.points * comboMultiplier);
          setScore((s) => s + points);
          setCombo((c) => c + 1);
          spawnTarget();
          return false;
        }
        return true;
      });

      if (!hit) {
        setCombo(0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " && gameOver) {
        startGame();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);

    // Initial spawn
    if (targetsRef.current.length === 0 && !gameOver) {
      for (let i = 0; i < 5; i++) {
        spawnTarget();
      }
    }

    const drawPixelCircle = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const gameLoop = () => {
      if (gameOver) return;

      // Clear
      ctx.fillStyle = "#1f1c13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid background
      ctx.strokeStyle = "#353535";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw targets
      targetsRef.current.forEach((target) => {
        // Move target
        target.x += Math.cos(target.direction) * target.speed;
        target.y += Math.sin(target.direction) * target.speed;

        // Bounce off walls
        if (target.x < target.size || target.x > canvas.width - target.size) {
          target.direction = Math.PI - target.direction;
        }
        if (target.y < target.size || target.y > canvas.height - target.size) {
          target.direction = -target.direction;
        }

        // Draw target rings
        drawPixelCircle(target.x, target.y, target.size, target.color);
        drawPixelCircle(target.x, target.y, target.size * 0.7, "#252219");
        drawPixelCircle(target.x, target.y, target.size * 0.4, target.color);
        drawPixelCircle(target.x, target.y, target.size * 0.15, "#E3E2D5");

        // Points label
        ctx.fillStyle = "#E3E2D5";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${target.points}`, target.x, target.y + 4);
      });

      // Draw crosshair
      const ch = crosshairRef.current;
      ctx.strokeStyle = "#FF6B35";
      ctx.lineWidth = 2;
      
      // Outer circle
      ctx.beginPath();
      ctx.arc(ch.x, ch.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      // Cross
      ctx.beginPath();
      ctx.moveTo(ch.x - 25, ch.y);
      ctx.lineTo(ch.x - 10, ch.y);
      ctx.moveTo(ch.x + 10, ch.y);
      ctx.lineTo(ch.x + 25, ch.y);
      ctx.moveTo(ch.x, ch.y - 25);
      ctx.lineTo(ch.x, ch.y - 10);
      ctx.moveTo(ch.x, ch.y + 10);
      ctx.lineTo(ch.x, ch.y + 25);
      ctx.stroke();
      
      // Center dot
      drawPixelCircle(ch.x, ch.y, 3, "#FF6B35");

      // Draw UI
      ctx.fillStyle = "#CCAA4C";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 10, 25);
      ctx.fillText(`TIME: ${timeLeft}s`, 10, 45);
      
      if (combo > 1) {
        ctx.fillStyle = "#FF6B35";
        ctx.fillText(`COMBO x${combo}!`, 10, 65);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver, onClose, score, spawnTarget, startGame, combo, timeLeft]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#252219] border-4 border-[#CCAA4C] p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-2xl font-black uppercase tracking-tight text-[#CCAA4C]"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Target Practice
          </h2>
          <button
            onClick={onClose}
            className="text-[#AEACA1] hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={400}
            className="w-full border-2 border-[#353535] bg-[#1f1c13] cursor-none"
            style={{ imageRendering: "pixelated" }}
          />
          
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <p className="text-[#CCAA4C] text-3xl font-black mb-2">TIME'S UP!</p>
              <p className="text-white text-xl mb-1">Final Score: {score}</p>
              <p className="text-[#FF6B35] text-sm mb-4">High Score: {highScore}</p>
              <button
                onClick={startGame}
                className="bg-[#CCAA4C] text-[#353535] px-6 py-2 font-bold uppercase hover:bg-white"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-[#AEACA1] text-xs">
          <p>Click targets to score | Smaller = More points | Build combos!</p>
        </div>
      </div>
    </div>
  );
}
