"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface RetroRacerProps {
  onClose: () => void;
  onScore?: (score: number) => void;
}

export function RetroRacer({ onClose, onScore }: RetroRacerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const gameRef = useRef<{
    playerX: number;
    speed: number;
    obstacles: { x: number; y: number; lane: number }[];
    roadOffset: number;
    running: boolean;
  }>({
    playerX: 1,
    speed: 5,
    obstacles: [],
    roadOffset: 0,
    running: true,
  });

  const startGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    gameRef.current = {
      playerX: 1,
      speed: 5,
      obstacles: [],
      roadOffset: 0,
      running: true,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = gameRef.current;
    let animationId: number;
    let lastTime = 0;
    let scoreTimer = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // IMPORTANT: Stop propagation so main game doesn't receive these events
      e.stopPropagation();
      e.preventDefault();
      
      if (e.key === "ArrowLeft" && game.playerX > 0) {
        game.playerX--;
      } else if (e.key === "ArrowRight" && game.playerX < 2) {
        game.playerX++;
      } else if (e.key === " " && gameOver) {
        startGame();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    // Use capture phase to intercept events before they reach other handlers
    window.addEventListener("keydown", handleKeyDown, true);

    const drawPixelRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    };

    // Draw a BIGGER, more detailed car
    const drawCar = (x: number, y: number, isPlayer: boolean) => {
      const color = isPlayer ? "#FF6B35" : "#E74C3C";
      const highlight = isPlayer ? "#CCAA4C" : "#C0392B";
      const darkColor = isPlayer ? "#B84A22" : "#A93226";
      
      // Main body - MUCH BIGGER (40x60 instead of 20x24)
      drawPixelRect(x + 6, y, 28, 60, color);
      
      // Body sides (3D effect)
      drawPixelRect(x + 4, y + 4, 4, 52, darkColor);
      drawPixelRect(x + 32, y + 4, 4, 52, darkColor);
      
      // Hood (front)
      drawPixelRect(x + 8, y + 2, 24, 12, color);
      drawPixelRect(x + 10, y, 20, 4, highlight);
      
      // Windshield
      drawPixelRect(x + 10, y + 14, 20, 12, "#1E293B");
      drawPixelRect(x + 12, y + 16, 16, 8, "#334155");
      
      // Cabin roof
      drawPixelRect(x + 8, y + 26, 24, 14, color);
      
      // Rear windshield
      drawPixelRect(x + 10, y + 40, 20, 8, "#1E293B");
      
      // Trunk
      drawPixelRect(x + 8, y + 48, 24, 10, color);
      
      // Wheels - bigger and chunkier
      drawPixelRect(x - 2, y + 8, 8, 16, "#1a1a1a");
      drawPixelRect(x + 34, y + 8, 8, 16, "#1a1a1a");
      drawPixelRect(x - 2, y + 38, 8, 16, "#1a1a1a");
      drawPixelRect(x + 34, y + 38, 8, 16, "#1a1a1a");
      
      // Wheel rims
      drawPixelRect(x, y + 10, 4, 12, "#6B7280");
      drawPixelRect(x + 36, y + 10, 4, 12, "#6B7280");
      drawPixelRect(x, y + 40, 4, 12, "#6B7280");
      drawPixelRect(x + 36, y + 40, 4, 12, "#6B7280");
      
      // Headlights
      drawPixelRect(x + 10, y + 2, 6, 4, "#FEF08A");
      drawPixelRect(x + 24, y + 2, 6, 4, "#FEF08A");
      
      // Tail lights
      drawPixelRect(x + 10, y + 54, 6, 4, "#DC2626");
      drawPixelRect(x + 24, y + 54, 6, 4, "#DC2626");
      
      // Racing stripe (player only)
      if (isPlayer) {
        drawPixelRect(x + 18, y + 4, 4, 50, highlight);
      }
      
      // Spoiler (player only)
      if (isPlayer) {
        drawPixelRect(x + 4, y + 52, 32, 4, "#1C1917");
        drawPixelRect(x + 6, y + 56, 4, 4, "#1C1917");
        drawPixelRect(x + 30, y + 56, 4, 4, "#1C1917");
      }
    };

    const gameLoop = (time: number) => {
      if (!game.running) return;
      
      const deltaTime = time - lastTime;
      lastTime = time;

      // Clear
      ctx.fillStyle = "#1f1c13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road - WIDER for bigger cars
      const roadWidth = 240;
      const roadX = (canvas.width - roadWidth) / 2;
      const laneWidth = 70; // Each lane is 70px wide
      
      // Road background
      drawPixelRect(roadX, 0, roadWidth, canvas.height, "#353535");
      
      // Shoulder stripes
      drawPixelRect(roadX - 10, 0, 10, canvas.height, "#2d2d2d");
      drawPixelRect(roadX + roadWidth, 0, 10, canvas.height, "#2d2d2d");
      
      // Road lines (moving) - adjusted for 3 lanes
      game.roadOffset = (game.roadOffset + game.speed * 0.5) % 50;
      ctx.fillStyle = "#CCAA4C";
      for (let y = -50 + game.roadOffset; y < canvas.height; y += 50) {
        // Lane dividers
        drawPixelRect(roadX + laneWidth - 3, y, 6, 30, "#CCAA4C");
        drawPixelRect(roadX + laneWidth * 2 - 3, y, 6, 30, "#CCAA4C");
      }
      
      // Lane markers - edge lines (solid)
      drawPixelRect(roadX, 0, 6, canvas.height, "#E3E2D5");
      drawPixelRect(roadX + roadWidth - 6, 0, 6, canvas.height, "#E3E2D5");

      // Spawn obstacles - less frequent, adjusted positions
      if (Math.random() < 0.015 + score * 0.00008) {
        const lane = Math.floor(Math.random() * 3);
        game.obstacles.push({
          x: roadX + 15 + lane * laneWidth,
          y: -70,
          lane: lane,
        });
      }

      // Update and draw obstacles
      game.obstacles = game.obstacles.filter((obs) => {
        obs.y += game.speed;
        drawCar(obs.x, obs.y, false);
        return obs.y < canvas.height + 70;
      });

      // Draw player car - CENTERED in lane
      const playerLaneX = roadX + 15 + game.playerX * laneWidth;
      const playerY = canvas.height - 90; // More room at bottom for bigger car
      drawCar(playerLaneX, playerY, true);

      // Collision detection - adjusted for bigger cars (40x60)
      game.obstacles.forEach((obs) => {
        if (
          Math.abs(obs.x - playerLaneX) < 30 &&
          obs.y + 60 > playerY &&
          obs.y < playerY + 60
        ) {
          game.running = false;
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
          }
          onScore?.(score);
        }
      });

      // Update score
      scoreTimer += deltaTime;
      if (scoreTimer > 100) {
        setScore((s) => s + 1);
        scoreTimer = 0;
        // Gradually increase speed
        game.speed = Math.min(15, 5 + score * 0.01);
      }

      // Draw UI - bigger text
      ctx.fillStyle = "#CCAA4C";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`SCORE: ${score}`, 10, 30);
      ctx.fillText(`SPEED: ${Math.floor(game.speed * 10)}`, 10, 55);
      
      // Draw speedometer bar
      const speedPercent = (game.speed - 5) / 10;
      drawPixelRect(10, 65, 100, 8, "#353535");
      drawPixelRect(10, 65, 100 * speedPercent, 8, "#FF6B35");

      if (game.running) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver, highScore, onClose, onScore, score, startGame]);

  // Touch/click controls for mobile
  const moveLeft = useCallback(() => {
    if (gameRef.current.playerX > 0) {
      gameRef.current.playerX--;
    }
  }, []);

  const moveRight = useCallback(() => {
    if (gameRef.current.playerX < 2) {
      gameRef.current.playerX++;
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-[#252219] border-4 border-[#FF6B35] p-4 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-2xl font-black uppercase tracking-tight text-[#FF6B35]"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Retro Racer
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
            width={400}
            height={500}
            className="w-full border-2 border-[#353535] bg-[#1f1c13]"
            style={{ imageRendering: "pixelated" }}
          />
          
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <p className="text-[#FF6B35] text-3xl font-black mb-2">GAME OVER</p>
              <p className="text-white text-xl mb-1">Score: {score}</p>
              <p className="text-[#CCAA4C] text-sm mb-4">High Score: {highScore}</p>
              <button
                onClick={startGame}
                className="bg-[#FF6B35] text-white px-6 py-2 font-bold uppercase hover:bg-[#CCAA4C]"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Touch/Click Controls */}
        <div className="mt-4 flex justify-center gap-4">
          <button
            onMouseDown={moveLeft}
            onTouchStart={moveLeft}
            className="bg-[#FF6B35] text-white px-8 py-4 font-black text-2xl uppercase hover:bg-[#CCAA4C] active:scale-95 transition-transform select-none"
          >
            ← LEFT
          </button>
          <button
            onMouseDown={moveRight}
            onTouchStart={moveRight}
            className="bg-[#FF6B35] text-white px-8 py-4 font-black text-2xl uppercase hover:bg-[#CCAA4C] active:scale-95 transition-transform select-none"
          >
            RIGHT →
          </button>
        </div>

        <div className="mt-3 text-center text-[#AEACA1] text-xs">
          <p>← → Arrow keys or click buttons to steer | ESC to exit</p>
        </div>
      </div>
    </div>
  );
}
