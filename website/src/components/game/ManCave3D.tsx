"use client";

import { useRef, useState, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Box, Plane, Text, Html, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { GameItem, RoomSize } from "@/lib/gameData";

// Room size configurations for 3D
const roomSizes: Record<RoomSize, { width: number; depth: number; height: number }> = {
  shed: { width: 8, depth: 6, height: 3.5 },
  garage: { width: 12, depth: 10, height: 4 },
  bunker: { width: 14, depth: 12, height: 4.5 },
  warehouse: { width: 20, depth: 16, height: 6 },
};

// Placed item instance with position
interface PlacedItemInstance {
  instanceId: string;
  item: GameItem;
  position: { x: number; y: number; z: number };
  rotation: number;
}

// Wall-mounted item IDs
const WALL_ITEMS = ['neon-sign', 'wall-art', 'tool-wall', 'helmet-rack', 'trophy-shelf', 'poster-hang-in-there', 'poster-tidy-shed', 'poster-build-cave'];

// ==========================================
// BUNKER UNDERGROUND ATMOSPHERE COMPONENTS
// ==========================================

// Animated slime drip on walls
function SlimeDrip({ position, speed = 1, color = "#4ADE80" }: { position: [number, number, number]; speed?: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [dripY, setDripY] = useState(0);
  
  useFrame(({ clock }) => {
    // Drip animation - slowly moves down then resets
    const time = clock.getElapsedTime() * speed;
    const cycle = time % 4; // 4 second cycle
    if (cycle < 3) {
      setDripY(-cycle * 0.3); // Drip down
    } else {
      setDripY(0); // Reset
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Slime blob at top */}
      <Box args={[0.3, 0.2, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} flatShading transparent opacity={0.8} />
      </Box>
      {/* Drip trail */}
      <Box args={[0.15, 0.4 + Math.abs(dripY), 0.08]} position={[0, dripY / 2 - 0.2, 0]}>
        <meshStandardMaterial color={color} flatShading transparent opacity={0.6} />
      </Box>
      {/* Drip drop */}
      <Box args={[0.1, 0.1, 0.1]} position={[0, dripY - 0.5, 0]}>
        <meshStandardMaterial color={color} flatShading transparent opacity={0.9} />
      </Box>
    </group>
  );
}

// Interactive slime puddle that can be cleaned
function InteractiveSlimePuddle({ 
  id,
  position, 
  size = 1, 
  color = "#4ADE80",
  isCleaned,
  onClean
}: { 
  id: string;
  position: [number, number, number]; 
  size?: number; 
  color?: string;
  isCleaned: boolean;
  onClean: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [isBeingCleaned, setIsBeingCleaned] = useState(false);
  
  useFrame(({ clock }) => {
    if (meshRef.current && !isCleaned) {
      // Pulsing glow effect
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.1 + 0.7;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = pulse * (1 - cleaningProgress);
    }
    
    // Cleaning animation - shrink when being cleaned
    if (isBeingCleaned && cleaningProgress < 1) {
      setCleaningProgress(prev => {
        const newProgress = prev + 0.05;
        if (newProgress >= 1) {
          onClean(id);
          return 1;
        }
        return newProgress;
      });
    }
  });

  if (isCleaned) return null;

  const scale = 1 - cleaningProgress * 0.8;

  return (
    <group position={position} scale={[scale, 1, scale]}>
      {/* Main puddle */}
      <Box 
        ref={meshRef} 
        args={[size * 1.2, 0.02, size]} 
        position={[0, 0.01, 0]}
        onClick={() => setIsBeingCleaned(true)}
      >
        <meshStandardMaterial color={isBeingCleaned ? "#FCD34D" : color} flatShading transparent opacity={0.7} />
      </Box>
      {/* Inner highlight */}
      <Box args={[size * 0.6, 0.025, size * 0.5]} position={[0.1, 0.015, 0]}>
        <meshStandardMaterial color={isBeingCleaned ? "#FEF08A" : "#86EFAC"} flatShading transparent opacity={0.5} />
      </Box>
      {/* Cleaning sparkles */}
      {isBeingCleaned && (
        <>
          <Box args={[0.1, 0.1, 0.1]} position={[Math.sin(Date.now() * 0.01) * 0.3, 0.2, Math.cos(Date.now() * 0.01) * 0.3]}>
            <meshStandardMaterial color="#FBBF24" flatShading emissive="#FBBF24" emissiveIntensity={0.5} />
          </Box>
          <Box args={[0.08, 0.08, 0.08]} position={[Math.cos(Date.now() * 0.015) * 0.4, 0.15, Math.sin(Date.now() * 0.015) * 0.4]}>
            <meshStandardMaterial color="#FDE047" flatShading emissive="#FDE047" emissiveIntensity={0.5} />
          </Box>
        </>
      )}
    </group>
  );
}

// Interactive snake that can be killed
function InteractiveSnake({ 
  id,
  startPosition, 
  roomSize,
  isAlive,
  onKill,
  getHeadPosition
}: { 
  id: string;
  startPosition: [number, number, number]; 
  roomSize: { width: number; depth: number; height: number };
  isAlive: boolean;
  onKill: (id: string) => void;
  getHeadPosition: (id: string, pos: { x: number; z: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [segments, setSegments] = useState<Array<{ x: number; z: number }>>([]);
  const directionRef = useRef({ x: 0.012, z: 0 }); // Slower snake
  const headPosRef = useRef({ x: startPosition[0], z: startPosition[2] });
  const [deathAnimation, setDeathAnimation] = useState(0);
  const [isDying, setIsDying] = useState(false);
  
  // Initialize snake segments
  useEffect(() => {
    const initialSegments = Array.from({ length: 8 }, (_, i) => ({
      x: startPosition[0] - i * 0.25,
      z: startPosition[2]
    }));
    setSegments(initialSegments);
  }, [startPosition]);

  useFrame(() => {
    if (!isAlive && !isDying) return;
    
    // Death animation
    if (isDying) {
      setDeathAnimation(prev => {
        if (prev >= 1) {
          onKill(id);
          return 1;
        }
        return prev + 0.08;
      });
      return;
    }

    // Change direction occasionally
    if (Math.random() < 0.02) {
      const directions = [
        { x: 0.025, z: 0 },
        { x: -0.025, z: 0 },
        { x: 0, z: 0.025 },
        { x: 0, z: -0.025 },
      ];
      directionRef.current = directions[Math.floor(Math.random() * 4)];
    }

    // Move head
    let newX = headPosRef.current.x + directionRef.current.x;
    let newZ = headPosRef.current.z + directionRef.current.z;
    
    // Bounce off walls
    const margin = 1;
    if (newX > roomSize.width / 2 - margin || newX < -roomSize.width / 2 + margin) {
      directionRef.current.x *= -1;
      newX = headPosRef.current.x;
    }
    if (newZ > roomSize.depth / 2 - margin || newZ < -roomSize.depth / 2 + margin) {
      directionRef.current.z *= -1;
      newZ = headPosRef.current.z;
    }
    
    headPosRef.current = { x: newX, z: newZ };
    getHeadPosition(id, { x: newX, z: newZ });
    
    // Update segments (follow the leader)
    setSegments(prev => {
      const newSegments = [{ x: newX, z: newZ }];
      for (let i = 0; i < prev.length - 1; i++) {
        newSegments.push(prev[i]);
      }
      return newSegments;
    });
  });

  const snakeColors = ['#22C55E', '#16A34A', '#15803D', '#166534'];
  const deathColors = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'];

  if (!isAlive && !isDying) return null;

  return (
    <group ref={groupRef}>
      {segments.map((seg, i) => (
        <Box 
          key={i} 
          args={[
            (i === 0 ? 0.25 : 0.2) * (isDying ? 1 + deathAnimation : 1), 
            0.15 * (isDying ? 1 - deathAnimation * 0.8 : 1), 
            (i === 0 ? 0.25 : 0.2) * (isDying ? 1 + deathAnimation : 1)
          ]} 
          position={[seg.x, isDying ? 0.1 + deathAnimation * 0.5 : 0.1, seg.z]}
          onClick={() => !isDying && setIsDying(true)}
        >
          <meshStandardMaterial 
            color={isDying ? deathColors[i % deathColors.length] : (i === 0 ? '#4ADE80' : snakeColors[i % snakeColors.length])}
            flatShading 
            transparent={isDying}
            opacity={isDying ? 1 - deathAnimation : 1}
          />
        </Box>
      ))}
      {/* Snake eyes */}
      {segments.length > 0 && !isDying && (
        <>
          <Box args={[0.05, 0.05, 0.05]} position={[segments[0].x + 0.08, 0.18, segments[0].z + 0.08]}>
            <meshStandardMaterial color="#000000" flatShading />
          </Box>
          <Box args={[0.05, 0.05, 0.05]} position={[segments[0].x - 0.08, 0.18, segments[0].z + 0.08]}>
            <meshStandardMaterial color="#000000" flatShading />
          </Box>
        </>
      )}
      {/* Death explosion particles */}
      {isDying && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box 
              key={`particle-${i}`}
              args={[0.15, 0.15, 0.15]} 
              position={[
                segments[0]?.x + Math.sin(i * Math.PI / 3) * deathAnimation * 2,
                0.3 + deathAnimation * 1.5,
                segments[0]?.z + Math.cos(i * Math.PI / 3) * deathAnimation * 2
              ]}
            >
              <meshStandardMaterial 
                color="#FBBF24" 
                flatShading 
                emissive="#FF6B35"
                emissiveIntensity={1 - deathAnimation}
                transparent
                opacity={1 - deathAnimation}
              />
            </Box>
          ))}
          {/* Points popup */}
          <Html center position={[segments[0]?.x || 0, 1 + deathAnimation, segments[0]?.z || 0]}>
            <div 
              className="text-yellow-400 font-black text-2xl animate-bounce"
              style={{ opacity: 1 - deathAnimation, transform: `scale(${1 + deathAnimation})` }}
            >
              +100
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Rusty wall pipe with dripping water
function RustyPipe({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const [dripY, setDripY] = useState(0);
  
  useFrame(({ clock }) => {
    // Animated water drip
    const time = clock.getElapsedTime();
    const cycle = (time * 0.5) % 1;
    setDripY(cycle * 0.8);
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Vertical pipe section */}
      <Box args={[0.15, 2.5, 0.15]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#57534E" flatShading />
      </Box>
      {/* Pipe joint rings */}
      <Box args={[0.2, 0.1, 0.2]} position={[0, 2.3, 0]}>
        <meshStandardMaterial color="#44403C" flatShading />
      </Box>
      <Box args={[0.2, 0.1, 0.2]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#44403C" flatShading />
      </Box>
      <Box args={[0.2, 0.1, 0.2]} position={[0, 0.7, 0]}>
        <meshStandardMaterial color="#44403C" flatShading />
      </Box>
      {/* Rust patches - orange/brown */}
      <Box args={[0.16, 0.25, 0.16]} position={[0, 1.9, 0]}>
        <meshStandardMaterial color="#C2410C" flatShading />
      </Box>
      <Box args={[0.16, 0.2, 0.16]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#9A3412" flatShading />
      </Box>
      {/* Leak point - green corrosion */}
      <Box args={[0.18, 0.15, 0.18]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#166534" flatShading />
      </Box>
      {/* Water drip animation */}
      <Box args={[0.06, 0.1, 0.06]} position={[0.08, 0.3 - dripY, 0.08]}>
        <meshStandardMaterial color="#38BDF8" flatShading transparent opacity={0.8} />
      </Box>
      {/* Puddle at base */}
      <Box args={[0.4, 0.02, 0.4]} position={[0, 0.01, 0]}>
        <meshStandardMaterial color="#38BDF8" flatShading transparent opacity={0.4} />
      </Box>
    </group>
  );
}

// ==========================================
// CLEANUP GAME DATA PER ROOM TYPE
// ==========================================

// BUNKER - Snakes and Slime
const BUNKER_SLIMES = [
  { id: 'slime-1', position: [-4, 0, -3] as [number, number, number], size: 1.2 },
  { id: 'slime-2', position: [3, 0, 3] as [number, number, number], size: 0.8 },
  { id: 'slime-3', position: [-2, 0, 4] as [number, number, number], size: 0.6 },
  { id: 'slime-4', position: [4, 0, -2] as [number, number, number], size: 1.0 },
  { id: 'slime-5', position: [0, 0, 0] as [number, number, number], size: 0.7 },
];

const BUNKER_SNAKES = [
  { id: 'snake-1', position: [-2, 0, 2] as [number, number, number] },
  { id: 'snake-2', position: [3, 0, -3] as [number, number, number] },
  { id: 'snake-3', position: [0, 0, -4] as [number, number, number] },
];

// SHED - Cockroaches, Spiderwebs, Giant Spider Boss
const SHED_SPIDERWEBS = [
  { id: 'web-1', position: [-2.5, 0, -2] as [number, number, number], size: 0.8 },
  { id: 'web-2', position: [2, 0, -1.5] as [number, number, number], size: 1.0 },
  { id: 'web-3', position: [-1, 0, 2] as [number, number, number], size: 0.6 },
  { id: 'web-4', position: [2.5, 0, 1.5] as [number, number, number], size: 0.7 },
];

const SHED_COCKROACHES = [
  { id: 'roach-1', position: [-2, 0, 1] as [number, number, number] },
  { id: 'roach-2', position: [1, 0, -2] as [number, number, number] },
  { id: 'roach-3', position: [2, 0, 2] as [number, number, number] },
  { id: 'roach-4', position: [-1, 0, -1] as [number, number, number] },
  { id: 'roach-5', position: [0, 0, 1.5] as [number, number, number] },
];

// GARAGE - Oil spills and Rats
const GARAGE_OIL_SPILLS = [
  { id: 'oil-1', position: [-4, 0, -3] as [number, number, number], size: 1.5 },
  { id: 'oil-2', position: [3, 0, 2] as [number, number, number], size: 1.2 },
  { id: 'oil-3', position: [-2, 0, 3] as [number, number, number], size: 0.9 },
  { id: 'oil-4', position: [4, 0, -1] as [number, number, number], size: 1.0 },
];

const GARAGE_RATS = [
  { id: 'rat-1', position: [-3, 0, 1] as [number, number, number] },
  { id: 'rat-2', position: [2, 0, -2] as [number, number, number] },
  { id: 'rat-3', position: [0, 0, 3] as [number, number, number] },
];

// Broom spawn positions per room - away from game equipment
const BROOM_POSITIONS: Record<string, [number, number, number]> = {
  shed: [-3, 0, 2],      // Far corner of shed
  garage: [-5, 0, -3],   // Back corner of garage
  bunker: [-5, 0, -4],   // Far corner of bunker
  warehouse: [-8, 0, -6], // Far corner of warehouse
};

// ==========================================
// SHED CLEANUP COMPONENTS
// ==========================================

// Cockroach - fast moving pest
function Cockroach({ 
  id,
  startPosition, 
  roomSize,
  isAlive,
  onKill,
  getPosition
}: { 
  id: string;
  startPosition: [number, number, number]; 
  roomSize: { width: number; depth: number; height: number };
  isAlive: boolean;
  onKill: (id: string) => void;
  getPosition: (id: string, pos: { x: number; z: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef({ x: startPosition[0], z: startPosition[2] });
  // Start with random direction
  const directionRef = useRef({ 
    x: (Math.random() - 0.5) * 0.03, 
    z: (Math.random() - 0.5) * 0.03 
  });
  const stuckCounterRef = useRef(0);
  const [isDying, setIsDying] = useState(false);
  const [deathProgress, setDeathProgress] = useState(0);
  
  // Mower position for collision
  const mowerPos = PROJECT_POSITIONS.shed;
  
  useFrame(() => {
    if (!isAlive && !isDying) return;
    
    if (isDying) {
      setDeathProgress(prev => {
        if (prev >= 1) {
          onKill(id);
          return 1;
        }
        return prev + 0.1;
      });
      return;
    }

    // Cockroaches change direction randomly
    if (Math.random() < 0.02) {
      directionRef.current = {
        x: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      };
    }
    
    // Make sure they're always moving (not stuck at 0,0 direction)
    const speed = Math.sqrt(directionRef.current.x ** 2 + directionRef.current.z ** 2);
    if (speed < 0.01) {
      directionRef.current = {
        x: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      };
    }

    let newX = posRef.current.x + directionRef.current.x;
    let newZ = posRef.current.z + directionRef.current.z;
    
    const margin = 0.5;
    let hitWall = false;
    
    // Wall collision
    if (newX > roomSize.width / 2 - margin || newX < -roomSize.width / 2 + margin) {
      directionRef.current.x *= -1;
      directionRef.current.z += (Math.random() - 0.5) * 0.02; // Add randomness on bounce
      newX = Math.max(-roomSize.width / 2 + margin, Math.min(roomSize.width / 2 - margin, newX));
      hitWall = true;
    }
    if (newZ > roomSize.depth / 2 - margin || newZ < -roomSize.depth / 2 + margin) {
      directionRef.current.z *= -1;
      directionRef.current.x += (Math.random() - 0.5) * 0.02; // Add randomness on bounce
      newZ = Math.max(-roomSize.depth / 2 + margin, Math.min(roomSize.depth / 2 - margin, newZ));
      hitWall = true;
    }
    
    // Avoid the mower
    const mowerRadius = 1.2;
    const distToMower = Math.sqrt(Math.pow(newX - mowerPos[0], 2) + Math.pow(newZ - mowerPos[2], 2));
    if (distToMower < mowerRadius) {
      // Scurry away from mower
      const awayAngle = Math.atan2(posRef.current.z - mowerPos[2], posRef.current.x - mowerPos[0]);
      directionRef.current = {
        x: Math.cos(awayAngle) * 0.03,
        z: Math.sin(awayAngle) * 0.03,
      };
      newX = posRef.current.x;
      newZ = posRef.current.z;
    }
    
    // Anti-stuck: if position hasn't changed much, pick new random direction
    if (hitWall) {
      stuckCounterRef.current++;
      if (stuckCounterRef.current > 10) {
        directionRef.current = {
          x: (Math.random() - 0.5) * 0.05,
          z: (Math.random() - 0.5) * 0.05,
        };
        stuckCounterRef.current = 0;
      }
    } else {
      stuckCounterRef.current = 0;
    }
    
    posRef.current = { x: newX, z: newZ };
    getPosition(id, { x: newX, z: newZ });
    
    // Update group position and rotation directly
    if (groupRef.current) {
      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
      groupRef.current.rotation.y = Math.atan2(directionRef.current.z, directionRef.current.x);
    }
  });

  if (!isAlive && !isDying) return null;

  return (
    <group ref={groupRef} position={[startPosition[0], 0.05, startPosition[2]]}>
      {/* Body */}
      <Box 
        args={[0.2 * (isDying ? 1.5 : 1), 0.08, 0.12]}
        onClick={() => !isDying && setIsDying(true)}
      >
        <meshStandardMaterial 
          color={isDying ? "#7C2D12" : "#451A03"} 
          flatShading 
          transparent={isDying}
          opacity={isDying ? 1 - deathProgress : 1}
        />
      </Box>
      {/* Head */}
      <Box args={[0.08, 0.06, 0.08]} position={[0.12, 0, 0]}>
        <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      {/* Antennae */}
      <Box args={[0.1, 0.02, 0.01]} position={[0.18, 0.03, 0.03]} rotation={[0, 0.3, 0.2]}>
        <meshStandardMaterial color="#1C1917" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      <Box args={[0.1, 0.02, 0.01]} position={[0.18, 0.03, -0.03]} rotation={[0, -0.3, 0.2]}>
        <meshStandardMaterial color="#1C1917" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      {/* Legs */}
      {[-0.05, 0, 0.05].map((xOff, i) => (
        <group key={i}>
          <Box args={[0.02, 0.02, 0.08]} position={[xOff, -0.02, 0.08]}>
            <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
          </Box>
          <Box args={[0.02, 0.02, 0.08]} position={[xOff, -0.02, -0.08]}>
            <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
          </Box>
        </group>
      ))}
      {/* Death splat */}
      {isDying && (
        <Html center position={[0, 0.5 + deathProgress, 0]}>
          <div className="text-green-400 font-black text-xl" style={{ opacity: 1 - deathProgress }}>
            +25
          </div>
        </Html>
      )}
    </group>
  );
}

// Spiderweb - sweep to clean
function Spiderweb({ 
  id,
  position, 
  size = 1,
  isCleaned,
  onClean,
  hasBroom
}: { 
  id: string;
  position: [number, number, number]; 
  size?: number;
  isCleaned: boolean;
  onClean: (id: string) => void;
  hasBroom: boolean;
}) {
  const [cleanProgress, setCleanProgress] = useState(0);
  const [isBeingCleaned, setIsBeingCleaned] = useState(false);
  
  useFrame(() => {
    if (isBeingCleaned && cleanProgress < 1) {
      setCleanProgress(prev => {
        const newProgress = prev + 0.03;
        if (newProgress >= 1) {
          onClean(id);
          return 1;
        }
        return newProgress;
      });
    }
  });

  if (isCleaned) return null;

  const handleClick = () => {
    if (hasBroom) {
      setIsBeingCleaned(true);
    }
  };

  return (
    <group position={position}>
      {/* Web strands - radial pattern */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box 
          key={i}
          args={[size * 0.4, 0.01, 0.02]}
          position={[0, 0.01, 0]}
          rotation={[0, (i * Math.PI) / 4, 0]}
          onClick={handleClick}
        >
          <meshStandardMaterial 
            color={isBeingCleaned ? "#FDE047" : "#D1D5DB"} 
            flatShading 
            transparent 
            opacity={(0.6 - cleanProgress * 0.5) * (1 - cleanProgress)}
          />
        </Box>
      ))}
      {/* Spiral web */}
      {[0.1, 0.2, 0.3].map((radius, i) => (
        <Box 
          key={`ring-${i}`}
          args={[size * radius * 2, 0.01, size * radius * 2]}
          position={[0, 0.015, 0]}
          onClick={handleClick}
        >
          <meshStandardMaterial 
            color={isBeingCleaned ? "#FEF08A" : "#E5E7EB"} 
            flatShading 
            transparent 
            opacity={(0.4 - cleanProgress * 0.3) * (1 - cleanProgress)}
            wireframe
          />
        </Box>
      ))}
      {/* Center blob */}
      <Box args={[0.1, 0.03, 0.1]} position={[0, 0.02, 0]} onClick={handleClick}>
        <meshStandardMaterial 
          color="#9CA3AF" 
          flatShading 
          transparent 
          opacity={0.7 * (1 - cleanProgress)}
        />
      </Box>
      {/* Cleaning sparkle effect */}
      {isBeingCleaned && (
        <Html center position={[0, 0.3, 0]}>
          <div className="text-yellow-300 font-black text-lg animate-pulse" style={{ opacity: 1 - cleanProgress }}>
            +30
          </div>
        </Html>
      )}
    </group>
  );
}

// Giant Spider Boss - BIG and SCARY!
function GiantSpider({ 
  position,
  roomSize,
  isAlive,
  onKill,
  isVulnerable, // Only vulnerable after all other pests cleared
  getPosition,
  projectPosition // Position of the project object (mower) to avoid
}: { 
  position: [number, number, number];
  roomSize: { width: number; depth: number; height: number };
  isAlive: boolean;
  onKill: () => void;
  isVulnerable: boolean;
  getPosition: (pos: { x: number; z: number }) => void;
  projectPosition: [number, number, number];
}) {
  const posRef = useRef({ x: position[0], z: position[2] });
  const directionRef = useRef({ x: 0.012, z: 0.008 });
  const targetAngleRef = useRef(Math.random() * Math.PI * 2); // Random starting angle
  const currentAngleRef = useRef(targetAngleRef.current);
  const moveTimerRef = useRef(0);
  const [isDying, setIsDying] = useState(false);
  const [deathProgress, setDeathProgress] = useState(0);
  const [legPhase, setLegPhase] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  useFrame(({ clock }) => {
    if (!isAlive && !isDying) return;
    
    setLegPhase(clock.getElapsedTime() * 6);
    setPulse(Math.sin(clock.getElapsedTime() * 4) * 0.1);
    
    if (isDying) {
      setDeathProgress(prev => {
        if (prev >= 1) {
          onKill();
          return 1;
        }
        return prev + 0.02;
      });
      return;
    }

    // Spider changes direction periodically with smooth turns
    moveTimerRef.current += 1;
    if (moveTimerRef.current > 120 + Math.random() * 180) { // Every 2-5 seconds
      moveTimerRef.current = 0;
      // Pick a new random angle to move toward
      targetAngleRef.current = Math.random() * Math.PI * 2;
    }
    
    // Smoothly rotate toward target angle
    let angleDiff = targetAngleRef.current - currentAngleRef.current;
    // Normalize angle difference to -PI to PI
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    currentAngleRef.current += angleDiff * 0.02; // Smooth rotation
    
    // Move in the direction we're facing
    const speed = 0.018;
    directionRef.current = {
      x: Math.cos(currentAngleRef.current) * speed,
      z: Math.sin(currentAngleRef.current) * speed,
    };

    let newX = posRef.current.x + directionRef.current.x;
    let newZ = posRef.current.z + directionRef.current.z;
    
    // Bounce off walls and pick new direction
    const margin = 1.5;
    let hitObstacle = false;
    if (newX > roomSize.width / 2 - margin || newX < -roomSize.width / 2 + margin) {
      targetAngleRef.current = Math.PI - currentAngleRef.current + (Math.random() - 0.5) * 1; // Reflect with randomness
      newX = Math.max(-roomSize.width / 2 + margin, Math.min(roomSize.width / 2 - margin, newX));
      hitObstacle = true;
    }
    if (newZ > roomSize.depth / 2 - margin || newZ < -roomSize.depth / 2 + margin) {
      targetAngleRef.current = -currentAngleRef.current + (Math.random() - 0.5) * 1; // Reflect with randomness
      newZ = Math.max(-roomSize.depth / 2 + margin, Math.min(roomSize.depth / 2 - margin, newZ));
      hitObstacle = true;
    }
    
    // Bounce off the project object (mower/car/etc)
    const projectRadius = 1.5;
    const distToProject = Math.sqrt(
      Math.pow(newX - projectPosition[0], 2) + Math.pow(newZ - projectPosition[2], 2)
    );
    if (distToProject < projectRadius) {
      // Calculate angle away from project
      const awayAngle = Math.atan2(posRef.current.z - projectPosition[2], posRef.current.x - projectPosition[0]);
      targetAngleRef.current = awayAngle + (Math.random() - 0.5) * 0.5;
      // Don't update position - stay where we are
      newX = posRef.current.x;
      newZ = posRef.current.z;
      hitObstacle = true;
    }
    
    if (hitObstacle) {
      moveTimerRef.current = 0; // Reset timer so it keeps new direction for a bit
    }
    
    posRef.current = { x: newX, z: newZ };
    getPosition({ x: newX, z: newZ });
    
    // Update visual rotation (facing direction of movement)
    setRotation(currentAngleRef.current);
  });

  if (!isAlive && !isDying) return null;

  const handleClick = () => {
    if (isVulnerable && !isDying) {
      setIsDying(true);
    }
  };

  const scale = 0.5 + (pulse * 0.5); // 50% smaller
  const bodyColor = isDying ? "#7F1D1D" : (isVulnerable ? "#1C1917" : "#374151");

  return (
    <group position={[posRef.current.x, 0.25, posRef.current.z]} rotation={[0, rotation, 0]} scale={[scale, scale, scale]}>
      {/* BOSS label floating above */}
      <Html center position={[0, 1.8, 0]}>
        <div className={`px-3 py-1 rounded font-black text-lg animate-pulse ${isVulnerable ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
          {isVulnerable ? '🕷️ WALK INTO ME!' : '🕷️ BOSS - Clear pests first!'}
        </div>
      </Html>
      
      {/* Cephalothorax (front body) - BIGGER */}
      <Box 
        args={[1.2 * (isDying ? 1 + deathProgress : 1), 0.6, 0.9]}
        onClick={handleClick}
      >
        <meshStandardMaterial 
          color={bodyColor}
          flatShading 
          transparent={isDying}
          opacity={isDying ? 1 - deathProgress : 1}
        />
      </Box>
      
      {/* Abdomen (back) - BIG round bulge */}
      <Sphere args={[0.7, 12, 12]} position={[-0.9, 0.1, 0]} onClick={handleClick}>
        <meshStandardMaterial 
          color={isDying ? "#991B1B" : "#292524"} 
          flatShading
          transparent={isDying}
          opacity={isDying ? 1 - deathProgress : 1}
        />
      </Sphere>
      
      {/* Red hourglass marking on abdomen (like black widow) */}
      <Box args={[0.15, 0.02, 0.3]} position={[-0.9, 0.4, 0]}>
        <meshStandardMaterial color="#DC2626" flatShading emissive="#DC2626" emissiveIntensity={isVulnerable ? 0.8 : 0.3} transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      <Box args={[0.25, 0.02, 0.15]} position={[-0.9, 0.42, 0]}>
        <meshStandardMaterial color="#DC2626" flatShading emissive="#DC2626" emissiveIntensity={isVulnerable ? 0.8 : 0.3} transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      
      {/* Eyes - 8 big glowing ones in 2 rows */}
      {[-0.2, -0.1, 0.1, 0.2].map((z, i) => (
        <group key={`eye-row1-${i}`}>
          <Sphere args={[0.08, 8, 8]} position={[0.55, 0.25, z]}>
            <meshStandardMaterial 
              color={isVulnerable ? "#EF4444" : "#1a1a1a"} 
              flatShading 
              emissive={isVulnerable ? "#FF0000" : "#000"} 
              emissiveIntensity={isVulnerable ? 1 : 0} 
            />
          </Sphere>
        </group>
      ))}
      {[-0.15, 0.15].map((z, i) => (
        <group key={`eye-row2-${i}`}>
          <Sphere args={[0.1, 8, 8]} position={[0.6, 0.1, z]}>
            <meshStandardMaterial 
              color={isVulnerable ? "#EF4444" : "#1a1a1a"} 
              flatShading 
              emissive={isVulnerable ? "#FF0000" : "#000"} 
              emissiveIntensity={isVulnerable ? 1.2 : 0} 
            />
          </Sphere>
        </group>
      ))}
      
      {/* 8 LONG hairy legs with animation */}
      {[1, -1].map((side) => 
        [0.35, 0.15, -0.15, -0.35].map((xOff, i) => {
          const legAngle = Math.sin(legPhase + i * 0.7) * 0.25;
          return (
            <group key={`leg-${side}-${i}`} position={[xOff, -0.2, side * 0.4]} rotation={[side * (0.6 + legAngle), 0, 0]}>
              {/* Upper leg segment */}
              <Box args={[0.1, 0.8, 0.1]}>
                <meshStandardMaterial color="#1C1917" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
              </Box>
              {/* Knee joint */}
              <Sphere args={[0.08, 6, 6]} position={[0, -0.4, 0]}>
                <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
              </Sphere>
              {/* Lower leg segment */}
              <Box args={[0.08, 0.7, 0.08]} position={[0, -0.7, side * 0.25]} rotation={[side * 0.6, 0, 0]}>
                <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
              </Box>
              {/* Foot/claw */}
              <Box args={[0.06, 0.2, 0.06]} position={[0, -1.0, side * 0.45]} rotation={[side * 0.3, 0, 0]}>
                <meshStandardMaterial color="#78350F" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
              </Box>
            </group>
          );
        })
      )}
      
      {/* Big scary fangs/chelicerae */}
      <Box args={[0.12, 0.25, 0.06]} position={[0.6, -0.15, 0.15]} rotation={[0.2, 0, 0.4]}>
        <meshStandardMaterial color="#78350F" flatShading emissive={isVulnerable ? "#FF6600" : "#000"} emissiveIntensity={isVulnerable ? 0.3 : 0} />
      </Box>
      <Box args={[0.12, 0.25, 0.06]} position={[0.6, -0.15, -0.15]} rotation={[-0.2, 0, 0.4]}>
        <meshStandardMaterial color="#78350F" flatShading emissive={isVulnerable ? "#FF6600" : "#000"} emissiveIntensity={isVulnerable ? 0.3 : 0} />
      </Box>
      {/* Fang tips - shiny */}
      <Box args={[0.04, 0.1, 0.04]} position={[0.65, -0.35, 0.15]} rotation={[0.2, 0, 0.4]}>
        <meshStandardMaterial color="#B45309" flatShading />
      </Box>
      <Box args={[0.04, 0.1, 0.04]} position={[0.65, -0.35, -0.15]} rotation={[-0.2, 0, 0.4]}>
        <meshStandardMaterial color="#B45309" flatShading />
      </Box>
      
      {/* Pedipalps (small front appendages) */}
      <Box args={[0.15, 0.08, 0.08]} position={[0.5, 0, 0.25]} rotation={[0.3, 0.3, 0]}>
        <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      <Box args={[0.15, 0.08, 0.08]} position={[0.5, 0, -0.25]} rotation={[-0.3, -0.3, 0]}>
        <meshStandardMaterial color="#292524" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      
      {/* Death explosion */}
      {isDying && (
        <>
          {Array.from({ length: 16 }).map((_, i) => (
            <Box 
              key={`particle-${i}`}
              args={[0.25, 0.25, 0.25]} 
              position={[
                Math.sin(i * Math.PI / 8) * deathProgress * 4,
                0.5 + deathProgress * 3,
                Math.cos(i * Math.PI / 8) * deathProgress * 4
              ]}
            >
              <meshStandardMaterial 
                color="#FBBF24" 
                flatShading 
                emissive="#FF6B35"
                emissiveIntensity={1 - deathProgress}
                transparent
                opacity={1 - deathProgress}
              />
            </Box>
          ))}
          <Html center position={[0, 2 + deathProgress * 2, 0]}>
            <div 
              className="text-yellow-400 font-black text-4xl"
              style={{ opacity: 1 - deathProgress, transform: `scale(${1 + deathProgress * 2})` }}
            >
              +500 BOSS DEFEATED!
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Broom pickup item
function BroomPickup({ 
  position,
  isPickedUp,
  onPickup
}: { 
  position: [number, number, number];
  isPickedUp: boolean;
  onPickup: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [bobPhase, setBobPhase] = useState(0);
  
  useFrame(({ clock }) => {
    setBobPhase(clock.getElapsedTime());
  });

  if (isPickedUp) return null;

  const bobY = Math.sin(bobPhase * 2) * 0.1;

  return (
    <group 
      position={[position[0], position[1] + 0.3 + bobY, position[2]]}
      onClick={onPickup}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Broom handle */}
      <Box args={[0.08, 1.2, 0.08]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color={hover ? "#D97706" : "#92400E"} flatShading />
      </Box>
      {/* Broom head */}
      <Box args={[0.3, 0.4, 0.15]} position={[0.1, -0.7, 0]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color={hover ? "#FCD34D" : "#A16207"} flatShading />
      </Box>
      {/* Bristles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Box 
          key={i}
          args={[0.25, 0.02, 0.02]} 
          position={[0.1, -0.9 - i * 0.03, (i - 2) * 0.03]}
          rotation={[0, 0, 0.2]}
        >
          <meshStandardMaterial color="#78350F" flatShading />
        </Box>
      ))}
      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} intensity={hover ? 5 : 2} color="#FBBF24" distance={2} />
      {/* Pickup prompt */}
      <Html center position={[0, 0.8, 0]}>
        <div className={`bg-yellow-500/90 px-3 py-1 rounded-lg text-black font-bold text-sm whitespace-nowrap transition-all ${hover ? 'scale-110' : ''}`}>
          {hover ? 'Click to grab!' : 'BROOM'}
        </div>
      </Html>
    </group>
  );
}

// Oil spill for garage (similar to slime)
function OilSpill({ 
  id,
  position, 
  size = 1,
  isCleaned,
  onClean,
  hasBroom
}: { 
  id: string;
  position: [number, number, number]; 
  size?: number;
  isCleaned: boolean;
  onClean: (id: string) => void;
  hasBroom: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [isBeingCleaned, setIsBeingCleaned] = useState(false);
  
  useFrame(({ clock }) => {
    if (meshRef.current && !isCleaned) {
      const shimmer = Math.sin(clock.getElapsedTime() * 3) * 0.1 + 0.6;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = shimmer * (1 - cleanProgress);
    }
    
    if (isBeingCleaned && cleanProgress < 1) {
      setCleanProgress(prev => {
        const newProgress = prev + 0.04;
        if (newProgress >= 1) {
          onClean(id);
          return 1;
        }
        return newProgress;
      });
    }
  });

  if (isCleaned) return null;

  const handleClick = () => {
    if (hasBroom) {
      setIsBeingCleaned(true);
    }
  };

  const scale = 1 - cleanProgress * 0.8;

  return (
    <group position={position} scale={[scale, 1, scale]}>
      {/* Oil puddle - dark with rainbow sheen */}
      <Box 
        ref={meshRef} 
        args={[size * 1.3, 0.015, size]} 
        position={[0, 0.01, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial 
          color={isBeingCleaned ? "#78716C" : "#1C1917"} 
          flatShading 
          transparent 
          opacity={0.85}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      {/* Rainbow sheen effect */}
      <Box args={[size * 0.8, 0.02, size * 0.6]} position={[0.1, 0.015, 0]}>
        <meshStandardMaterial 
          color={isBeingCleaned ? "#A8A29E" : "#3B0764"} 
          flatShading 
          transparent 
          opacity={0.3}
          metalness={1}
        />
      </Box>
      {/* Cleaning effect */}
      {isBeingCleaned && (
        <Html center position={[0, 0.3, 0]}>
          <div className="text-orange-400 font-black text-lg" style={{ opacity: 1 - cleanProgress }}>
            +40
          </div>
        </Html>
      )}
    </group>
  );
}

// Rat for garage
function Rat({ 
  id,
  startPosition, 
  roomSize,
  isAlive,
  onKill,
  getPosition
}: { 
  id: string;
  startPosition: [number, number, number]; 
  roomSize: { width: number; depth: number; height: number };
  isAlive: boolean;
  onKill: (id: string) => void;
  getPosition: (id: string, pos: { x: number; z: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef({ x: startPosition[0], z: startPosition[2] });
  // Start with random direction
  const directionRef = useRef({ 
    x: (Math.random() - 0.5) * 0.03, 
    z: (Math.random() - 0.5) * 0.03 
  });
  const stuckCounterRef = useRef(0);
  const [isDying, setIsDying] = useState(false);
  const [deathProgress, setDeathProgress] = useState(0);
  
  // Car position for collision
  const carPos = PROJECT_POSITIONS.garage;
  
  useFrame(() => {
    if (!isAlive && !isDying) return;
    
    if (isDying) {
      setDeathProgress(prev => {
        if (prev >= 1) {
          onKill(id);
          return 1;
        }
        return prev + 0.08;
      });
      return;
    }

    // Rats scurry in bursts
    if (Math.random() < 0.02) {
      directionRef.current = {
        x: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      };
    }
    
    // Make sure they're always moving
    const speed = Math.sqrt(directionRef.current.x ** 2 + directionRef.current.z ** 2);
    if (speed < 0.01) {
      directionRef.current = {
        x: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.04,
      };
    }

    let newX = posRef.current.x + directionRef.current.x;
    let newZ = posRef.current.z + directionRef.current.z;
    
    const margin = 0.5;
    let hitWall = false;
    
    if (newX > roomSize.width / 2 - margin || newX < -roomSize.width / 2 + margin) {
      directionRef.current.x *= -1;
      directionRef.current.z += (Math.random() - 0.5) * 0.02;
      newX = Math.max(-roomSize.width / 2 + margin, Math.min(roomSize.width / 2 - margin, newX));
      hitWall = true;
    }
    if (newZ > roomSize.depth / 2 - margin || newZ < -roomSize.depth / 2 + margin) {
      directionRef.current.z *= -1;
      directionRef.current.x += (Math.random() - 0.5) * 0.02;
      newZ = Math.max(-roomSize.depth / 2 + margin, Math.min(roomSize.depth / 2 - margin, newZ));
      hitWall = true;
    }
    
    // Avoid the car
    const carRadius = 1.5;
    const distToCar = Math.sqrt(Math.pow(newX - carPos[0], 2) + Math.pow(newZ - carPos[2], 2));
    if (distToCar < carRadius) {
      const awayAngle = Math.atan2(posRef.current.z - carPos[2], posRef.current.x - carPos[0]);
      directionRef.current = {
        x: Math.cos(awayAngle) * 0.03,
        z: Math.sin(awayAngle) * 0.03,
      };
      newX = posRef.current.x;
      newZ = posRef.current.z;
    }
    
    // Anti-stuck
    if (hitWall) {
      stuckCounterRef.current++;
      if (stuckCounterRef.current > 10) {
        directionRef.current = {
          x: (Math.random() - 0.5) * 0.05,
          z: (Math.random() - 0.5) * 0.05,
        };
        stuckCounterRef.current = 0;
      }
    } else {
      stuckCounterRef.current = 0;
    }
    
    posRef.current = { x: newX, z: newZ };
    getPosition(id, { x: newX, z: newZ });
    
    // Update group position and rotation directly
    if (groupRef.current) {
      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
      groupRef.current.rotation.y = Math.atan2(directionRef.current.z, directionRef.current.x);
    }
  });

  if (!isAlive && !isDying) return null;

  return (
    <group ref={groupRef} position={[startPosition[0], 0.08, startPosition[2]]}>
      {/* Body */}
      <Box 
        args={[0.3, 0.15, 0.18]}
        onClick={() => !isDying && setIsDying(true)}
      >
        <meshStandardMaterial 
          color={isDying ? "#7F1D1D" : "#57534E"} 
          flatShading 
          transparent={isDying}
          opacity={isDying ? 1 - deathProgress : 1}
        />
      </Box>
      {/* Head */}
      <Box args={[0.15, 0.12, 0.12]} position={[0.18, 0.02, 0]}>
        <meshStandardMaterial color="#44403C" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      {/* Nose */}
      <Box args={[0.05, 0.04, 0.04]} position={[0.28, 0, 0]}>
        <meshStandardMaterial color="#FDA4AF" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      {/* Ears */}
      <Box args={[0.06, 0.08, 0.02]} position={[0.12, 0.1, 0.06]}>
        <meshStandardMaterial color="#FCA5A5" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      <Box args={[0.06, 0.08, 0.02]} position={[0.12, 0.1, -0.06]}>
        <meshStandardMaterial color="#FCA5A5" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      {/* Tail */}
      <Box args={[0.25, 0.03, 0.03]} position={[-0.25, 0.02, 0]} rotation={[0, 0, 0.1]}>
        <meshStandardMaterial color="#FCA5A5" flatShading transparent={isDying} opacity={isDying ? 1 - deathProgress : 1} />
      </Box>
      {/* Eyes */}
      <Box args={[0.03, 0.03, 0.03]} position={[0.22, 0.06, 0.05]}>
        <meshStandardMaterial color="#000" flatShading />
      </Box>
      <Box args={[0.03, 0.03, 0.03]} position={[0.22, 0.06, -0.05]}>
        <meshStandardMaterial color="#000" flatShading />
      </Box>
      {/* Death effect */}
      {isDying && (
        <Html center position={[0, 0.5 + deathProgress, 0]}>
          <div className="text-orange-400 font-black text-xl" style={{ opacity: 1 - deathProgress }}>
            +75
          </div>
        </Html>
      )}
    </group>
  );
}

// ==========================================
// ROOM-SPECIFIC ATMOSPHERE COMPONENTS
// ==========================================

// Shed atmosphere - Cockroaches, Spiderwebs, Giant Spider
function ShedAtmosphere({ 
  room,
  cleanedWebs,
  killedRoaches,
  killedBoss,
  hasBroom,
  onWebClean,
  onRoachKill,
  onBossKill,
  onBroomPickup,
  onPestPositionUpdate,
  cleanProgress
}: { 
  room: { width: number; depth: number; height: number };
  cleanedWebs: string[];
  killedRoaches: string[];
  killedBoss: boolean;
  hasBroom: boolean;
  onWebClean: (id: string) => void;
  onRoachKill: (id: string) => void;
  onBossKill: () => void;
  onBroomPickup: () => void;
  onPestPositionUpdate: (id: string, pos: { x: number; z: number }) => void;
  cleanProgress: number;
}) {
  const allPestsCleared = killedRoaches.length >= SHED_COCKROACHES.length && cleanedWebs.length >= SHED_SPIDERWEBS.length;
  
  // Track spider position for collision detection
  const handleSpiderPosition = (pos: { x: number; z: number }) => {
    onPestPositionUpdate('spider-boss', pos);
  };
  
  return (
    <>
      {/* Dusty atmosphere */}
      <ambientLight intensity={0.3 + cleanProgress * 0.4} />
      <pointLight 
        position={[0, room.height - 0.5, 0]} 
        intensity={20 + cleanProgress * 40} 
        color={cleanProgress > 0.7 ? "#FBBF24" : "#FCD34D"} 
      />
      
      {/* Corner cobwebs on ceiling */}
      {cleanProgress < 0.8 && (
        <>
          <group position={[-room.width / 2 + 0.3, room.height - 0.2, -room.depth / 2 + 0.3]}>
            <Box args={[1.5, 0.02, 1.5]} rotation={[0, Math.PI / 4, 0]}>
              <meshStandardMaterial color="#D1D5DB" flatShading transparent opacity={0.25 * (1 - cleanProgress)} />
            </Box>
          </group>
          <group position={[room.width / 2 - 0.3, room.height - 0.2, room.depth / 2 - 0.3]}>
            <Box args={[1.5, 0.02, 1.5]} rotation={[0, Math.PI / 4, 0]}>
              <meshStandardMaterial color="#E5E7EB" flatShading transparent opacity={0.2 * (1 - cleanProgress)} />
            </Box>
          </group>
        </>
      )}
      
      {/* Broom pickup */}
      <BroomPickup 
        position={BROOM_POSITIONS.shed}
        isPickedUp={hasBroom}
        onPickup={onBroomPickup}
      />
      
      {/* Spiderwebs */}
      {SHED_SPIDERWEBS.map(web => (
        <Spiderweb
          key={web.id}
          id={web.id}
          position={web.position}
          size={web.size}
          isCleaned={cleanedWebs.includes(web.id)}
          onClean={onWebClean}
          hasBroom={hasBroom}
        />
      ))}
      
      {/* Cockroaches */}
      {SHED_COCKROACHES.map(roach => (
        <Cockroach
          key={roach.id}
          id={roach.id}
          startPosition={roach.position}
          roomSize={room}
          isAlive={!killedRoaches.includes(roach.id)}
          onKill={onRoachKill}
          getPosition={onPestPositionUpdate}
        />
      ))}
      
      {/* Giant Spider Boss - only shows after broom is picked up */}
      {hasBroom && !killedBoss && (
        <GiantSpider
          position={[0, 0, -2]}
          roomSize={room}
          isAlive={!killedBoss}
          onKill={onBossKill}
          isVulnerable={allPestsCleared}
          getPosition={handleSpiderPosition}
          projectPosition={PROJECT_POSITIONS.shed}
        />
      )}
      
      {/* Victory glow */}
      {cleanProgress >= 1 && (
        <pointLight position={[0, room.height - 1, 0]} intensity={100} color="#22C55E" />
      )}
    </>
  );
}

// Garage atmosphere - Oil spills and Rats
function GarageAtmosphere({ 
  room,
  cleanedOil,
  killedRats,
  hasBroom,
  onOilClean,
  onRatKill,
  onBroomPickup,
  onPestPositionUpdate,
  cleanProgress
}: { 
  room: { width: number; depth: number; height: number };
  cleanedOil: string[];
  killedRats: string[];
  hasBroom: boolean;
  onOilClean: (id: string) => void;
  onRatKill: (id: string) => void;
  onBroomPickup: () => void;
  onPestPositionUpdate: (id: string, pos: { x: number; z: number }) => void;
  cleanProgress: number;
}) {
  return (
    <>
      {/* Garage lighting - fluorescent feel */}
      <ambientLight intensity={0.35 + cleanProgress * 0.35} />
      <pointLight 
        position={[0, room.height - 0.3, 0]} 
        intensity={40 + cleanProgress * 30} 
        color={cleanProgress > 0.7 ? "#FBBF24" : "#F5F5F4"} 
      />
      <pointLight 
        position={[-room.width / 3, room.height - 0.3, 0]} 
        intensity={20} 
        color="#F5F5F4" 
      />
      
      {/* Broom pickup */}
      <BroomPickup 
        position={BROOM_POSITIONS.garage}
        isPickedUp={hasBroom}
        onPickup={onBroomPickup}
      />
      
      {/* Oil spills */}
      {GARAGE_OIL_SPILLS.map(oil => (
        <OilSpill
          key={oil.id}
          id={oil.id}
          position={oil.position}
          size={oil.size}
          isCleaned={cleanedOil.includes(oil.id)}
          onClean={onOilClean}
          hasBroom={hasBroom}
        />
      ))}
      
      {/* Rats */}
      {GARAGE_RATS.map(rat => (
        <Rat
          key={rat.id}
          id={rat.id}
          startPosition={rat.position}
          roomSize={room}
          isAlive={!killedRats.includes(rat.id)}
          onKill={onRatKill}
          getPosition={onPestPositionUpdate}
        />
      ))}
      
      {/* Victory glow */}
      {cleanProgress >= 1 && (
        <pointLight position={[0, room.height - 1, 0]} intensity={100} color="#3B82F6" />
      )}
    </>
  );
}

// Bunker atmosphere component with interactive elements
function BunkerAtmosphere({ 
  room,
  cleanedSlimes,
  killedSnakes,
  hasBroom,
  onSlimeClean,
  onSnakeKill,
  onBroomPickup,
  onSnakePositionUpdate,
  cleanProgress
}: { 
  room: { width: number; depth: number; height: number };
  cleanedSlimes: string[];
  killedSnakes: string[];
  hasBroom: boolean;
  onSlimeClean: (id: string) => void;
  onSnakeKill: (id: string) => void;
  onBroomPickup: () => void;
  onSnakePositionUpdate: (id: string, pos: { x: number; z: number }) => void;
  cleanProgress: number;
}) {
  // Base brightness increases with clean progress
  const baseBrightness = 0.25 + cleanProgress * 0.5;
  const greenIntensity = 60 - cleanProgress * 40; // Less green as it gets cleaner
  
  return (
    <>
      {/* Broom pickup */}
      <BroomPickup 
        position={BROOM_POSITIONS.bunker}
        isPickedUp={hasBroom}
        onPickup={onBroomPickup}
      />
      
      {/* Slime drips on walls - fade as room gets cleaner */}
      {cleanProgress < 0.8 && (
        <>
          <SlimeDrip position={[-room.width / 4, room.height - 0.5, -room.depth / 2 + 0.1]} speed={0.8} />
          <SlimeDrip position={[room.width / 4, room.height - 1, -room.depth / 2 + 0.1]} speed={1.2} color="#22C55E" />
          <SlimeDrip position={[0, room.height - 0.3, -room.depth / 2 + 0.1]} speed={0.6} color="#86EFAC" />
          <SlimeDrip position={[-room.width / 2 + 0.1, room.height - 0.8, -room.depth / 4]} speed={1} />
          <SlimeDrip position={[room.width / 2 - 0.1, room.height - 1.2, room.depth / 4]} speed={0.9} color="#4ADE80" />
        </>
      )}
      
      {/* Interactive slime puddles - need broom to clean */}
      {BUNKER_SLIMES.map(slime => (
        <InteractiveSlimePuddle
          key={slime.id}
          id={slime.id}
          position={slime.position}
          size={slime.size}
          isCleaned={cleanedSlimes.includes(slime.id)}
          onClean={hasBroom ? onSlimeClean : () => {}}
        />
      ))}
      
      {/* Interactive snakes - can kill without broom */}
      {BUNKER_SNAKES.map(snake => (
        <InteractiveSnake
          key={snake.id}
          id={snake.id}
          startPosition={snake.position}
          roomSize={room}
          isAlive={!killedSnakes.includes(snake.id)}
          onKill={onSnakeKill}
          getHeadPosition={onSnakePositionUpdate}
        />
      ))}
      
      {/* Rusty pipes */}
      <RustyPipe position={[-room.width / 2 + 0.3, 0, -room.depth / 3]} />
      <RustyPipe position={[room.width / 2 - 0.3, 0, room.depth / 5]} rotation={Math.PI} />
      
      {/* Cobwebs (corner decorations) - fade as room gets cleaner */}
      {cleanProgress < 0.9 && (
        <>
          <group position={[-room.width / 2 + 0.5, room.height - 0.3, -room.depth / 2 + 0.5]}>
            <Box args={[1, 0.02, 1]} rotation={[0, Math.PI / 4, 0]}>
              <meshStandardMaterial color="#9CA3AF" flatShading transparent opacity={0.3 * (1 - cleanProgress)} />
            </Box>
          </group>
          <group position={[room.width / 2 - 0.5, room.height - 0.3, -room.depth / 2 + 0.5]}>
            <Box args={[1, 0.02, 1]} rotation={[0, -Math.PI / 4, 0]}>
              <meshStandardMaterial color="#9CA3AF" flatShading transparent opacity={0.3 * (1 - cleanProgress)} />
            </Box>
          </group>
        </>
      )}
      
      {/* Dynamic lighting - gets brighter and less green as room is cleaned */}
      <ambientLight intensity={baseBrightness} />
      <pointLight 
        position={[0, 0.5, 0]} 
        intensity={greenIntensity} 
        color={cleanProgress > 0.7 ? "#FBBF24" : "#4ADE80"} 
      />
      <pointLight 
        position={[-room.width / 3, 0.3, -room.depth / 3]} 
        intensity={10 + cleanProgress * 20} 
        color={cleanProgress > 0.5 ? "#F59E0B" : "#22C55E"} 
      />
      
      {/* Victory light when fully clean */}
      {cleanProgress >= 1 && (
        <pointLight position={[0, room.height - 1, 0]} intensity={100} color="#FBBF24" />
      )}
    </>
  );
}

// ==========================================
// HOBBY PROJECT COMPONENTS
// ==========================================

// Project positions per room - centered for bigger vehicles
const PROJECT_POSITIONS: Record<string, [number, number, number]> = {
  shed: [-1.5, 0, 0],
  garage: [0, 0, 0],  // Car in center of garage
  bunker: [3, 0, 2],
  warehouse: [0, 0, 0],
};

// Ride-on Lawnmower project for Shed - BIGGER & MORE DETAILED
function RideOnMower({ 
  level, 
  isWorking,
  onStartWork,
  canWork,
  onDriveAway,
  hasRollerDoor
}: { 
  level: number; // 0-5
  isWorking: boolean;
  onStartWork: () => void;
  canWork: boolean;
  onDriveAway?: () => void;
  hasRollerDoor?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [exhaustPhase, setExhaustPhase] = useState(0);
  const [driveAwayProgress, setDriveAwayProgress] = useState(0);
  const [hasDrivenAway, setHasDrivenAway] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const driveAwayStarted = useRef(false);
  
  const isComplete = level >= 5;
  const scale = 1.6; // Make mower bigger!
  
  useFrame(({ clock }) => {
    setExhaustPhase(clock.getElapsedTime() * 10);
    if (groupRef.current) {
      if (isWorking) {
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 20) * 0.02;
        groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 15) * 0.01;
      } else if (isComplete && hasRollerDoor && !hasDrivenAway) {
        if (!driveAwayStarted.current) {
          driveAwayStarted.current = true;
          setTimeout(() => setDriveAwayProgress(0.01), 2000);
        }
        
        if (driveAwayProgress > 0 && driveAwayProgress < 1) {
          setDriveAwayProgress(prev => Math.min(1, prev + 0.008));
          const basePos = PROJECT_POSITIONS.shed;
          groupRef.current.position.x = basePos[0] + driveAwayProgress * 15;
          groupRef.current.position.z = basePos[2] + Math.sin(driveAwayProgress * 2) * 0.5;
          groupRef.current.rotation.y = -driveAwayProgress * 0.3;
          groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 40) * 0.01;
        } else if (driveAwayProgress >= 1 && !hasDrivenAway) {
          setHasDrivenAway(true);
          onDriveAway?.();
        } else if (driveAwayProgress === 0) {
          groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 30) * 0.005;
          groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 25) * 0.003;
        }
      } else if (isComplete && !hasRollerDoor) {
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 30) * 0.005;
        groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 25) * 0.003;
      } else if (!isComplete) {
        groupRef.current.position.y = 0;
        groupRef.current.rotation.z = 0;
      }
    }
  });
  
  if (hasDrivenAway) return null;
  
  // Colors based on level
  const bodyColor = level < 2 ? "#78350F" : level < 4 ? "#15803D" : "#22C55E";
  const metalColor = level < 2 ? "#57534E" : level < 4 ? "#A1A1AA" : "#E5E7EB";
  const hasExhaust = level >= 2;
  const hasFlames = level >= 4;
  const hasSupercharger = level >= 3;
  const hasBigWheels = level >= 1;
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (canWork) onStartWork();
  };

  return (
    <group 
      ref={groupRef}
      position={PROJECT_POSITIONS.shed}
      scale={[scale, scale, scale]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* CUTTING DECK - Big green deck underneath */}
      <Box args={[1.6, 0.12, 1.2]} position={[0.1, 0.08, 0]}>
        <meshStandardMaterial color="#15803D" flatShading />
      </Box>
      
      {/* CHASSIS */}
      <Box args={[1.8, 0.2, 1.0]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#1C1917" flatShading />
      </Box>
      
      {/* BODY - Main clickable area */}
      <Box 
        args={[1.8, 0.6, 1.1]} 
        position={[0, 0.55, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial color={hover ? "#FBBF24" : bodyColor} flatShading />
      </Box>
      
      {/* ENGINE HOOD */}
      <Box args={[0.9, 0.35, 0.9]} position={[0.6, 0.9, 0]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      
      {/* ENGINE BLOCK visible */}
      <Box args={[0.5, 0.3, 0.6]} position={[0.6, 0.5, 0]}>
        <meshStandardMaterial color={metalColor} flatShading />
      </Box>
      
      {/* SEAT */}
      <Box args={[0.55, 0.15, 0.5]} position={[-0.35, 0.9, 0]}>
        <meshStandardMaterial color="#1C1917" flatShading />
      </Box>
      {/* Seat back */}
      <Box args={[0.1, 0.45, 0.5]} position={[-0.6, 1.1, 0]}>
        <meshStandardMaterial color="#1C1917" flatShading />
      </Box>
      
      {/* STEERING WHEEL */}
      <group position={[0.15, 1.0, 0]}>
        <Box args={[0.06, 0.35, 0.06]}>
          <meshStandardMaterial color="#1C1917" flatShading />
        </Box>
        <Box args={[0.35, 0.06, 0.35]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#1C1917" flatShading />
        </Box>
      </group>
      
      {/* FENDERS */}
      <Box args={[0.4, 0.15, 0.25]} position={[-0.6, 0.55, 0.5]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      <Box args={[0.4, 0.15, 0.25]} position={[-0.6, 0.55, -0.5]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      
      {/* WHEELS - Bigger rear, smaller front */}
      {/* Rear wheels */}
      {[[-0.6, 0.55], [-0.6, -0.55]].map(([x, z], i) => (
        <group key={`rear-${i}`} position={[x, hasBigWheels ? 0.3 : 0.25, z]}>
          <Box args={[hasBigWheels ? 0.45 : 0.35, hasBigWheels ? 0.5 : 0.4, 0.2]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          <Box args={[hasBigWheels ? 0.35 : 0.25, hasBigWheels ? 0.4 : 0.3, 0.15]}>
            <meshStandardMaterial color="#FBBF24" flatShading />
          </Box>
        </group>
      ))}
      {/* Front wheels */}
      {[[0.7, 0.4], [0.7, -0.4]].map(([x, z], i) => (
        <group key={`front-${i}`} position={[x, 0.18, z]}>
          <Box args={[0.25, 0.28, 0.12]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          <Box args={[0.18, 0.2, 0.08]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
        </group>
      ))}
      
      {/* ROLL BAR / CAGE */}
      {level >= 2 && (
        <group position={[-0.3, 1.2, 0]}>
          <Box args={[0.06, 0.5, 0.06]} position={[0, 0, 0.4]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
          <Box args={[0.06, 0.5, 0.06]} position={[0, 0, -0.4]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
          <Box args={[0.06, 0.06, 0.86]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
        </group>
      )}
      
      {/* SUPERCHARGER */}
      {hasSupercharger && (
        <group position={[0.6, 1.15, 0]}>
          <Box args={[0.25, 0.3, 0.35]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
          <Box args={[0.2, 0.12, 0.4]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color="#EF4444" flatShading />
          </Box>
          {/* Air intake pipes */}
          <Box args={[0.08, 0.08, 0.15]} position={[0.12, 0.1, 0.25]}>
            <meshStandardMaterial color="#374151" flatShading />
          </Box>
          <Box args={[0.08, 0.08, 0.15]} position={[0.12, 0.1, -0.25]}>
            <meshStandardMaterial color="#374151" flatShading />
          </Box>
        </group>
      )}
      
      {/* EXHAUST PIPES */}
      {hasExhaust && (
        <>
          <Box args={[0.1, 0.55, 0.1]} position={[-0.8, 0.8, 0.35]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
          <Box args={[0.1, 0.55, 0.1]} position={[-0.8, 0.8, -0.35]}>
            <meshStandardMaterial color={metalColor} flatShading />
          </Box>
          {/* Flames or smoke */}
          {hasFlames ? (
            <>
              <Box args={[0.12, 0.25 + Math.sin(exhaustPhase) * 0.1, 0.12]} position={[-0.8, 1.2, 0.35]}>
                <meshStandardMaterial color="#F97316" flatShading emissive="#F97316" emissiveIntensity={0.6} transparent opacity={0.85} />
              </Box>
              <Box args={[0.12, 0.25 + Math.cos(exhaustPhase) * 0.1, 0.12]} position={[-0.8, 1.2, -0.35]}>
                <meshStandardMaterial color="#FBBF24" flatShading emissive="#FBBF24" emissiveIntensity={0.6} transparent opacity={0.85} />
              </Box>
            </>
          ) : (
            <>
              <Box args={[0.08, 0.18, 0.08]} position={[-0.8, 1.15, 0.35]}>
                <meshStandardMaterial color="#6B7280" flatShading transparent opacity={0.5} />
              </Box>
              <Box args={[0.08, 0.18, 0.08]} position={[-0.8, 1.15, -0.35]}>
                <meshStandardMaterial color="#6B7280" flatShading transparent opacity={0.5} />
              </Box>
            </>
          )}
        </>
      )}
      
      {/* HEADLIGHTS */}
      <Box args={[0.08, 0.1, 0.12]} position={[0.95, 0.7, 0.3]}>
        <meshStandardMaterial color="#FEF08A" flatShading emissive="#FEF08A" emissiveIntensity={level >= 1 ? 0.4 : 0.1} />
      </Box>
      <Box args={[0.08, 0.1, 0.12]} position={[0.95, 0.7, -0.3]}>
        <meshStandardMaterial color="#FEF08A" flatShading emissive="#FEF08A" emissiveIntensity={level >= 1 ? 0.4 : 0.1} />
      </Box>
      
      {/* Level indicator stars */}
      <Html center position={[0, 1.8, 0]}>
        <div className="flex flex-col items-center gap-1">
          <div className="text-yellow-400 text-lg">
            {'⭐'.repeat(level)}{'☆'.repeat(5 - level)}
          </div>
          <div className={`px-3 py-1.5 rounded text-sm font-bold whitespace-nowrap ${
            driveAwayProgress > 0 
              ? 'bg-[#FF6B35] text-white animate-pulse'
              : isComplete && hasRollerDoor
              ? 'bg-green-500 text-white animate-pulse' 
              : isComplete && !hasRollerDoor
              ? 'bg-[#E74C3C] text-white animate-pulse'
              : hover && canWork 
                ? 'bg-yellow-500 text-black' 
                : 'bg-[#1C1917]/80 text-[#AEACA1]'
          }`}>
            {isWorking ? 'WORKING...' : driveAwayProgress > 0 ? '🏎️ DRIVING AWAY!' : isComplete && hasRollerDoor ? '🔥 ENGINE RUNNING!' : isComplete && !hasRollerDoor ? '🚪 NEED ROLLER DOOR!' : hover && canWork ? 'Click to work!' : 'MOWER PROJECT'}
          </div>
        </div>
      </Html>
      {/* Working particles */}
      {isWorking && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box 
              key={i}
              args={[0.1, 0.1, 0.1]} 
              position={[
                Math.sin(exhaustPhase + i) * 0.7,
                1.0 + Math.abs(Math.sin(exhaustPhase * 0.5 + i)) * 0.6,
                Math.cos(exhaustPhase + i) * 0.6
              ]}
            >
              <meshStandardMaterial color="#FBBF24" flatShading emissive="#FBBF24" emissiveIntensity={0.5} transparent opacity={0.7} />
            </Box>
          ))}
        </>
      )}
    </group>
  );
}

// Project Car for Garage - BIGGER MUSCLE CAR!
function ProjectCar({ 
  level, 
  isWorking,
  onStartWork,
  canWork,
  onDriveAway,
  hasRollerDoor
}: { 
  level: number;
  isWorking: boolean;
  onStartWork: () => void;
  canWork: boolean;
  onDriveAway?: () => void;
  hasRollerDoor?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [sparkPhase, setSparkPhase] = useState(0);
  const [driveAwayProgress, setDriveAwayProgress] = useState(0);
  const [hasDrivenAway, setHasDrivenAway] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const driveAwayStarted = useRef(false);
  
  const isComplete = level >= 5;
  const scale = 1.8; // Make car bigger!
  
  useFrame(({ clock }) => {
    setSparkPhase(clock.getElapsedTime() * 8);
    if (groupRef.current) {
      if (isWorking) {
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 15) * 0.01;
      } else if (isComplete && hasRollerDoor && !hasDrivenAway) {
        if (!driveAwayStarted.current) {
          driveAwayStarted.current = true;
          setTimeout(() => setDriveAwayProgress(0.01), 2000);
        }
        
        if (driveAwayProgress > 0 && driveAwayProgress < 1) {
          setDriveAwayProgress(prev => Math.min(1, prev + 0.006));
          const basePos = PROJECT_POSITIONS.garage;
          groupRef.current.position.x = basePos[0] + driveAwayProgress * 18;
          groupRef.current.position.z = basePos[2];
          groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 30) * 0.01;
        } else if (driveAwayProgress >= 1 && !hasDrivenAway) {
          setHasDrivenAway(true);
          onDriveAway?.();
        }
      } else if (isComplete && !hasRollerDoor) {
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 25) * 0.005;
      }
    }
  });
  
  if (hasDrivenAway) return null;
  
  // Colors based on level - starts rusty, becomes classic muscle car
  const bodyColor = level < 2 ? "#78350F" : level < 3 ? "#DC2626" : level < 5 ? "#1D4ED8" : "#FF6B35";
  const isRusty = level < 2;
  const hasNitro = level >= 3;
  const hasSpoiler = level >= 2;
  const hasWideBody = level >= 4;
  const hasFlames = level >= 5;
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (canWork) onStartWork();
  };
  
  return (
    <group 
      ref={groupRef}
      position={PROJECT_POSITIONS.garage}
      scale={[scale, scale, scale]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* CHASSIS / UNDERCARRIAGE */}
      <Box args={[2.8, 0.15, 1.2]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#1C1917" flatShading />
      </Box>
      
      {/* MAIN BODY - Lower section */}
      <Box 
        args={[hasWideBody ? 3.0 : 2.8, 0.5, hasWideBody ? 1.4 : 1.2]} 
        position={[0, 0.45, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial color={hover ? "#FBBF24" : bodyColor} flatShading />
      </Box>
      
      {/* HOOD - Long muscle car hood */}
      <Box args={[1.4, 0.2, 1.1]} position={[0.7, 0.75, 0]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      
      {/* Hood scoop / Air intake */}
      {level >= 1 && (
        <group position={[0.5, 0.9, 0]}>
          <Box args={[0.5, 0.2, 0.3]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          {level >= 3 && (
            <Box args={[0.4, 0.1, 0.25]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#374151" flatShading />
            </Box>
          )}
        </group>
      )}
      
      {/* CABIN / GREENHOUSE */}
      <Box args={[1.0, 0.45, 1.0]} position={[-0.3, 0.95, 0]}>
        <meshStandardMaterial color={isRusty ? "#57534E" : "#1E293B"} flatShading transparent opacity={0.85} />
      </Box>
      
      {/* Windshield frame */}
      <Box args={[0.08, 0.45, 1.0]} position={[0.2, 0.95, 0]}>
        <meshStandardMaterial color="#1C1917" flatShading />
      </Box>
      
      {/* TRUNK */}
      <Box args={[0.7, 0.25, 1.1]} position={[-1.0, 0.65, 0]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      
      {/* REAR BUMPER */}
      <Box args={[0.15, 0.2, 1.3]} position={[-1.4, 0.35, 0]}>
        <meshStandardMaterial color="#374151" flatShading />
      </Box>
      
      {/* FRONT BUMPER */}
      <Box args={[0.15, 0.2, 1.3]} position={[1.4, 0.35, 0]}>
        <meshStandardMaterial color="#374151" flatShading />
      </Box>
      
      {/* FRONT GRILLE */}
      <Box args={[0.1, 0.25, 0.9]} position={[1.35, 0.45, 0]}>
        <meshStandardMaterial color="#1C1917" flatShading />
      </Box>
      
      {/* SPOILER */}
      {hasSpoiler && (
        <group position={[-1.2, 0.95, 0]}>
          <Box args={[0.08, 0.35, 0.08]} position={[0, 0, 0.5]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          <Box args={[0.08, 0.35, 0.08]} position={[0, 0, -0.5]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          <Box args={[0.25, 0.08, 1.2]} position={[0, 0.2, 0]}>
            <meshStandardMaterial color={bodyColor} flatShading />
          </Box>
        </group>
      )}
      
      {/* WHEELS - Bigger, more detailed */}
      {[[1.0, 0.6], [1.0, -0.6], [-0.9, 0.6], [-0.9, -0.6]].map(([x, z], i) => (
        <group key={i} position={[x, 0.25, z]}>
          {/* Tire */}
          <Box args={[0.25, 0.45, 0.2]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          {/* Rim */}
          <Box args={[0.2, 0.35, 0.15]}>
            <meshStandardMaterial color={level >= 2 ? "#E5E7EB" : "#6B7280"} flatShading />
          </Box>
          {/* Wheel well flare for wide body */}
          {hasWideBody && (
            <Box args={[0.3, 0.15, 0.08]} position={[0, 0.2, z > 0 ? 0.12 : -0.12]}>
              <meshStandardMaterial color={bodyColor} flatShading />
            </Box>
          )}
        </group>
      ))}
      
      {/* HEADLIGHTS */}
      <Box args={[0.08, 0.15, 0.2]} position={[1.38, 0.5, 0.4]}>
        <meshStandardMaterial color="#FEF08A" flatShading emissive="#FEF08A" emissiveIntensity={level >= 1 ? 0.5 : 0.1} />
      </Box>
      <Box args={[0.08, 0.15, 0.2]} position={[1.38, 0.5, -0.4]}>
        <meshStandardMaterial color="#FEF08A" flatShading emissive="#FEF08A" emissiveIntensity={level >= 1 ? 0.5 : 0.1} />
      </Box>
      
      {/* TAIL LIGHTS */}
      <Box args={[0.08, 0.12, 0.25]} position={[-1.38, 0.55, 0.4]}>
        <meshStandardMaterial color="#DC2626" flatShading emissive="#DC2626" emissiveIntensity={0.3} />
      </Box>
      <Box args={[0.08, 0.12, 0.25]} position={[-1.38, 0.55, -0.4]}>
        <meshStandardMaterial color="#DC2626" flatShading emissive="#DC2626" emissiveIntensity={0.3} />
      </Box>
      
      {/* EXHAUST PIPES */}
      {level >= 2 && (
        <>
          <Box args={[0.3, 0.08, 0.08]} position={[-1.5, 0.2, 0.35]}>
            <meshStandardMaterial color="#71717A" flatShading />
          </Box>
          <Box args={[0.3, 0.08, 0.08]} position={[-1.5, 0.2, -0.35]}>
            <meshStandardMaterial color="#71717A" flatShading />
          </Box>
        </>
      )}
      
      {/* NITRO TANKS */}
      {hasNitro && (
        <group position={[-0.6, 0.35, 0]}>
          <Box args={[0.2, 0.35, 0.12]} position={[0, 0, 0.35]}>
            <meshStandardMaterial color="#3B82F6" flatShading />
          </Box>
          <Box args={[0.2, 0.35, 0.12]} position={[0, 0, -0.35]}>
            <meshStandardMaterial color="#3B82F6" flatShading />
          </Box>
        </group>
      )}
      
      {/* SIDE STRIPES / FLAMES */}
      {hasFlames && (
        <>
          <Box args={[1.5, 0.02, 0.15]} position={[0.2, 0.7, 0.58]}>
            <meshStandardMaterial color="#FBBF24" flatShading />
          </Box>
          <Box args={[1.5, 0.02, 0.15]} position={[0.2, 0.7, -0.58]}>
            <meshStandardMaterial color="#FBBF24" flatShading />
          </Box>
          <Box args={[0.8, 0.02, 0.1]} position={[0.7, 0.7, 0.52]}>
            <meshStandardMaterial color="#F97316" flatShading />
          </Box>
          <Box args={[0.8, 0.02, 0.1]} position={[0.7, 0.7, -0.52]}>
            <meshStandardMaterial color="#F97316" flatShading />
          </Box>
        </>
      )}
      
      {/* RUST PATCHES */}
      {isRusty && (
        <>
          <Box args={[0.4, 0.2, 0.4]} position={[0.4, 0.5, 0.55]}>
            <meshStandardMaterial color="#92400E" flatShading />
          </Box>
          <Box args={[0.3, 0.15, 0.35]} position={[-0.6, 0.4, -0.5]}>
            <meshStandardMaterial color="#78350F" flatShading />
          </Box>
          <Box args={[0.25, 0.1, 0.3]} position={[0.8, 0.55, -0.45]}>
            <meshStandardMaterial color="#A16207" flatShading />
          </Box>
        </>
      )}
      
      {/* Level indicator */}
      <Html center position={[0, 1.2, 0]}>
        <div className="flex flex-col items-center gap-1">
          <div className="text-yellow-400 text-lg">
            {'⭐'.repeat(level)}{'☆'.repeat(5 - level)}
          </div>
          <div className={`px-3 py-1.5 rounded text-sm font-bold whitespace-nowrap ${
            driveAwayProgress > 0 
              ? 'bg-[#FF6B35] text-white animate-pulse'
              : isComplete && hasRollerDoor
              ? 'bg-green-500 text-white animate-pulse' 
              : isComplete && !hasRollerDoor
              ? 'bg-[#E74C3C] text-white animate-pulse'
              : hover && canWork 
                ? 'bg-yellow-500 text-black' 
                : 'bg-[#1C1917]/80 text-[#AEACA1]'
          }`}>
            {isWorking ? 'WORKING...' : driveAwayProgress > 0 ? '🏎️ DRIVING OUT!' : isComplete && hasRollerDoor ? '🔥 FULLY SOUPED!' : isComplete && !hasRollerDoor ? '🚪 NEED ROLLER DOOR!' : hover && canWork ? 'Click to work!' : 'PROJECT CAR'}
          </div>
        </div>
      </Html>
      {/* Working sparks */}
      {isWorking && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box 
              key={i}
              args={[0.08, 0.08, 0.08]} 
              position={[
                Math.sin(sparkPhase + i * 1.2) * 1.2,
                0.8 + Math.abs(Math.sin(sparkPhase * 0.7 + i)) * 0.6,
                Math.cos(sparkPhase + i * 1.2) * 0.6
              ]}
            >
              <meshStandardMaterial color="#FBBF24" flatShading emissive="#F97316" emissiveIntensity={0.8} transparent opacity={0.9} />
            </Box>
          ))}
        </>
      )}
    </group>
  );
}

// Pipe Repair Station for Bunker - Fix rusty pipes and make them shine
function PipeRepairStation({ 
  level, 
  isWorking,
  onStartWork,
  canWork
}: { 
  level: number;
  isWorking: boolean;
  onStartWork: () => void;
  canWork: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [sparkPhase, setSparkPhase] = useState(0);
  const [waterDrip, setWaterDrip] = useState(0);
  
  useFrame(({ clock }) => {
    setSparkPhase(clock.getElapsedTime() * 8);
    setWaterDrip((clock.getElapsedTime() * 0.5) % 1);
  });
  
  // Pipe appearance based on repair level
  const pipeColor = level < 2 ? "#57534E" : level < 4 ? "#71717A" : "#A1A1AA";
  const rustAmount = Math.max(0, 1 - level * 0.2); // Less rust at higher levels
  const hasPolish = level >= 3;
  const hasChrome = level >= 4;
  const isPerfect = level >= 5;
  const leakAmount = Math.max(0, 1 - level * 0.25); // Less leak at higher levels
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (canWork) onStartWork();
  };
  
  return (
    <group position={PROJECT_POSITIONS.bunker}>
      {/* Main vertical pipe */}
      <Box 
        args={[0.2, 3, 0.2]} 
        position={[0, 1.5, 0]}
        onClick={handleClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial 
          color={hover ? "#FBBF24" : (hasChrome ? "#E5E7EB" : pipeColor)} 
          flatShading 
          metalness={hasPolish ? 0.8 : 0.2}
          roughness={hasPolish ? 0.2 : 0.8}
        />
      </Box>
      
      {/* Pipe joints - improve with level */}
      {[0.5, 1.5, 2.5].map((y, i) => (
        <Box key={i} args={[0.28, 0.15, 0.28]} position={[0, y, 0]} onClick={handleClick}>
          <meshStandardMaterial 
            color={isPerfect ? "#FBBF24" : (hasChrome ? "#D4D4D8" : "#44403C")} 
            flatShading 
            metalness={hasPolish ? 0.9 : 0.3}
          />
        </Box>
      ))}
      
      {/* Rust patches - fade with level */}
      {rustAmount > 0 && (
        <>
          <Box args={[0.22, 0.3, 0.22]} position={[0, 2.0, 0]}>
            <meshStandardMaterial color="#C2410C" flatShading transparent opacity={rustAmount * 0.8} />
          </Box>
          <Box args={[0.22, 0.25, 0.22]} position={[0, 1.0, 0]}>
            <meshStandardMaterial color="#9A3412" flatShading transparent opacity={rustAmount * 0.6} />
          </Box>
          <Box args={[0.22, 0.2, 0.22]} position={[0, 0.3, 0]}>
            <meshStandardMaterial color="#78350F" flatShading transparent opacity={rustAmount * 0.7} />
          </Box>
        </>
      )}
      
      {/* Green corrosion at leak point - reduces with level */}
      {leakAmount > 0 && (
        <Box args={[0.24, 0.15, 0.24]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color="#166534" flatShading transparent opacity={leakAmount * 0.8} />
        </Box>
      )}
      
      {/* Water drip - less water at higher levels */}
      {leakAmount > 0.3 && (
        <Box args={[0.06, 0.1, 0.06]} position={[0.1, 0.5 - waterDrip * 0.5, 0.1]}>
          <meshStandardMaterial color="#38BDF8" flatShading transparent opacity={0.8 * leakAmount} />
        </Box>
      )}
      
      {/* Water puddle - shrinks with repair */}
      {leakAmount > 0.2 && (
        <Box args={[0.5 * leakAmount, 0.02, 0.5 * leakAmount]} position={[0, 0.01, 0]}>
          <meshStandardMaterial color="#38BDF8" flatShading transparent opacity={0.4 * leakAmount} />
        </Box>
      )}
      
      {/* Horizontal pipe section */}
      <Box 
        args={[1.5, 0.15, 0.15]} 
        position={[0.75, 2.0, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial 
          color={hasChrome ? "#E5E7EB" : pipeColor} 
          flatShading 
          metalness={hasPolish ? 0.8 : 0.2}
        />
      </Box>
      
      {/* Valve wheel */}
      <group position={[1.4, 2.0, 0.15]}>
        <Box args={[0.05, 0.25, 0.05]}>
          <meshStandardMaterial color={isPerfect ? "#EF4444" : "#DC2626"} flatShading />
        </Box>
        <Box args={[0.25, 0.05, 0.05]} position={[0, 0.1, 0]}>
          <meshStandardMaterial color={isPerfect ? "#EF4444" : "#991B1B"} flatShading />
        </Box>
      </group>
      
      {/* Polish shine effect at high levels */}
      {hasPolish && (
        <pointLight position={[0, 1.5, 0.5]} intensity={5 + level * 3} color="#E5E7EB" distance={2} />
      )}
      
      {/* Perfect level golden glow */}
      {isPerfect && (
        <pointLight position={[0, 1.5, 0]} intensity={15} color="#FBBF24" distance={3} />
      )}
      
      {/* Level indicator */}
      <Html center position={[0, 3.5, 0]}>
        <div className="flex flex-col items-center gap-1">
          <div className="text-yellow-400 text-sm">
            {'⭐'.repeat(level)}{'☆'.repeat(5 - level)}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold ${hover && canWork ? 'bg-yellow-500 text-black' : 'bg-[#1C1917]/80 text-[#AEACA1]'}`}>
            {isWorking ? 'REPAIRING...' : level >= 5 ? 'PIPES PERFECT!' : hover && canWork ? 'Click to repair!' : 'PIPE REPAIR'}
          </div>
          {isWorking && (
            <div className="text-[10px] text-yellow-300 animate-pulse">Fixing pipes...</div>
          )}
        </div>
      </Html>
      
      {/* Working sparks */}
      {isWorking && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box 
              key={i}
              args={[0.06, 0.06, 0.06]} 
              position={[
                Math.sin(sparkPhase + i * 1.2) * 0.4,
                1.5 + Math.abs(Math.sin(sparkPhase * 0.7 + i)) * 0.5,
                Math.cos(sparkPhase + i * 1.2) * 0.4
              ]}
            >
              <meshStandardMaterial color="#FBBF24" flatShading emissive="#F97316" emissiveIntensity={0.8} transparent opacity={0.9} />
            </Box>
          ))}
          <pointLight position={[0, 1.5, 0]} intensity={20 + Math.sin(sparkPhase) * 10} color="#FBBF24" />
        </>
      )}
    </group>
  );
}

// Monster Truck for Warehouse
function MonsterTruck({ 
  level, 
  isWorking,
  onStartWork,
  canWork,
  onDriveAway,
  hasRollerDoor
}: { 
  level: number;
  isWorking: boolean;
  onStartWork: () => void;
  canWork: boolean;
  onDriveAway?: () => void;
  hasRollerDoor?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [enginePhase, setEnginePhase] = useState(0);
  const [driveAwayProgress, setDriveAwayProgress] = useState(0);
  const [hasDrivenAway, setHasDrivenAway] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const driveAwayStarted = useRef(false);
  
  const isComplete = level >= 5;
  
  useFrame(({ clock }) => {
    setEnginePhase(clock.getElapsedTime() * 6);
    if (groupRef.current) {
      if (isWorking) {
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 25) * 0.03;
      } else if (isComplete && hasRollerDoor && !hasDrivenAway) {
        // Start drive away after delay (only if roller door installed!)
        if (!driveAwayStarted.current) {
          driveAwayStarted.current = true;
          setTimeout(() => setDriveAwayProgress(0.01), 2000);
        }
        
        if (driveAwayProgress > 0 && driveAwayProgress < 1) {
          setDriveAwayProgress(prev => Math.min(1, prev + 0.005));
          const basePos = PROJECT_POSITIONS.warehouse;
          // Monster truck smashes out!
          groupRef.current.position.x = basePos[0] + driveAwayProgress * 25;
          groupRef.current.position.z = basePos[2] + Math.sin(driveAwayProgress * 4) * 1;
          groupRef.current.position.y = Math.abs(Math.sin(driveAwayProgress * 8)) * 0.5; // Bouncy!
          groupRef.current.rotation.z = Math.sin(driveAwayProgress * 6) * 0.1;
        } else if (driveAwayProgress >= 1 && !hasDrivenAway) {
          setHasDrivenAway(true);
          onDriveAway?.();
        }
      } else if (isComplete && !hasRollerDoor) {
        // Engine running but waiting for door
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 20) * 0.01;
      }
    }
  });
  
  if (hasDrivenAway) return null;
  
  const bodyColor = level < 2 ? "#78350F" : level < 4 ? "#7C3AED" : "#8B5CF6";
  const wheelSize = 0.6 + level * 0.1;
  const liftHeight = level * 0.15;
  const hasNitro = level >= 3;
  const hasFlames = level >= 4;
  const hasSkullHood = level >= 5;
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (canWork) onStartWork();
  };
  
  return (
    <group 
      ref={groupRef}
      position={PROJECT_POSITIONS.warehouse}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Main body - lifted - clickable */}
      <Box 
        args={[3, 0.8, 1.4]} 
        position={[0, 0.8 + liftHeight, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial color={hover ? "#FBBF24" : bodyColor} flatShading />
      </Box>
      {/* Cabin */}
      <Box args={[1.2, 0.7, 1.2]} position={[-0.3, 1.5 + liftHeight, 0]}>
        <meshStandardMaterial color={level < 2 ? "#57534E" : "#1E1B4B"} flatShading transparent opacity={0.8} />
      </Box>
      {/* Hood */}
      <Box args={[1.2, 0.3, 1.2]} position={[0.9, 1.0 + liftHeight, 0]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      {/* Skull hood ornament */}
      {hasSkullHood && (
        <group position={[1.0, 1.3 + liftHeight, 0]}>
          <Box args={[0.25, 0.25, 0.2]}>
            <meshStandardMaterial color="#F5F5F4" flatShading />
          </Box>
          <Box args={[0.08, 0.08, 0.05]} position={[0.05, 0.05, 0.1]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          <Box args={[0.08, 0.08, 0.05]} position={[-0.05, 0.05, 0.1]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
        </group>
      )}
      {/* Bed */}
      <Box args={[1.0, 0.4, 1.2]} position={[-1.0, 0.9 + liftHeight, 0]}>
        <meshStandardMaterial color={bodyColor} flatShading />
      </Box>
      
      {/* Monster wheels */}
      {[[1.0, 0.7], [1.0, -0.7], [-1.0, 0.7], [-1.0, -0.7]].map(([x, z], i) => (
        <group key={i} position={[x, wheelSize / 2 + 0.1, z]}>
          {/* Tire */}
          <Box args={[wheelSize * 0.4, wheelSize, wheelSize * 0.4]}>
            <meshStandardMaterial color="#1C1917" flatShading />
          </Box>
          {/* Rim */}
          <Box args={[wheelSize * 0.35, wheelSize * 0.7, wheelSize * 0.35]}>
            <meshStandardMaterial color="#A1A1AA" flatShading />
          </Box>
          {/* Tread pattern */}
          {[0, 1, 2, 3].map((j) => (
            <Box key={j} args={[wheelSize * 0.45, 0.05, 0.05]} position={[0, (j - 1.5) * wheelSize * 0.25, wheelSize * 0.2]} rotation={[j * 0.3, 0, 0]}>
              <meshStandardMaterial color="#374151" flatShading />
            </Box>
          ))}
        </group>
      ))}
      
      {/* Suspension */}
      {[[0.8, 0.5], [0.8, -0.5], [-0.8, 0.5], [-0.8, -0.5]].map(([x, z], i) => (
        <Box key={i} args={[0.1, 0.4 + liftHeight, 0.1]} position={[x, 0.5 + liftHeight / 2, z]}>
          <meshStandardMaterial color="#374151" flatShading />
        </Box>
      ))}
      
      {/* Roll cage */}
      {level >= 2 && (
        <group position={[-0.3, 1.9 + liftHeight, 0]}>
          <Box args={[1.3, 0.08, 0.08]} position={[0, 0.3, 0.55]}>
            <meshStandardMaterial color="#A1A1AA" flatShading />
          </Box>
          <Box args={[1.3, 0.08, 0.08]} position={[0, 0.3, -0.55]}>
            <meshStandardMaterial color="#A1A1AA" flatShading />
          </Box>
          <Box args={[0.08, 0.08, 1.2]} position={[0.6, 0.3, 0]}>
            <meshStandardMaterial color="#A1A1AA" flatShading />
          </Box>
          <Box args={[0.08, 0.08, 1.2]} position={[-0.6, 0.3, 0]}>
            <meshStandardMaterial color="#A1A1AA" flatShading />
          </Box>
        </group>
      )}
      
      {/* Exhaust stacks */}
      {level >= 1 && (
        <>
          <Box args={[0.12, 0.8, 0.12]} position={[-0.5, 1.4 + liftHeight, 0.6]}>
            <meshStandardMaterial color="#57534E" flatShading />
          </Box>
          <Box args={[0.12, 0.8, 0.12]} position={[-0.5, 1.4 + liftHeight, -0.6]}>
            <meshStandardMaterial color="#57534E" flatShading />
          </Box>
          {/* Exhaust flames */}
          {hasFlames && (
            <>
              <Box args={[0.15, 0.3 + Math.sin(enginePhase) * 0.15, 0.15]} position={[-0.5, 1.95 + liftHeight, 0.6]}>
                <meshStandardMaterial color="#F97316" flatShading emissive="#EF4444" emissiveIntensity={0.7} transparent opacity={0.8} />
              </Box>
              <Box args={[0.15, 0.3 + Math.cos(enginePhase) * 0.15, 0.15]} position={[-0.5, 1.95 + liftHeight, -0.6]}>
                <meshStandardMaterial color="#FBBF24" flatShading emissive="#F97316" emissiveIntensity={0.7} transparent opacity={0.8} />
              </Box>
            </>
          )}
        </>
      )}
      
      {/* Nitro tanks in bed */}
      {hasNitro && (
        <group position={[-1.0, 1.2 + liftHeight, 0]}>
          <Box args={[0.2, 0.3, 0.15]} position={[0, 0, 0.3]}>
            <meshStandardMaterial color="#3B82F6" flatShading />
          </Box>
          <Box args={[0.2, 0.3, 0.15]} position={[0, 0, -0.3]}>
            <meshStandardMaterial color="#3B82F6" flatShading />
          </Box>
          <Box args={[0.2, 0.3, 0.15]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#3B82F6" flatShading />
          </Box>
        </group>
      )}
      
      {/* Level indicator */}
      <Html center position={[0, 2.5 + liftHeight, 0]}>
        <div className="flex flex-col items-center gap-1">
          <div className="text-yellow-400 text-sm">
            {'⭐'.repeat(level)}{'☆'.repeat(5 - level)}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
            driveAwayProgress > 0 
              ? 'bg-[#FF6B35] text-white animate-pulse'
              : isComplete && hasRollerDoor
              ? 'bg-green-500 text-white animate-pulse' 
              : isComplete && !hasRollerDoor
              ? 'bg-[#E74C3C] text-white animate-pulse'
              : hover && canWork 
                ? 'bg-yellow-500 text-black' 
                : 'bg-[#1C1917]/80 text-[#AEACA1]'
          }`}>
            {isWorking ? 'WORKING...' : driveAwayProgress > 0 ? '💥 SMASHING OUT!' : isComplete && hasRollerDoor ? '🔥 BEAST MODE!' : isComplete && !hasRollerDoor ? '🚪 NEED ROLLER DOOR!' : hover && canWork ? 'Click to work!' : 'MONSTER TRUCK'}
          </div>
        </div>
      </Html>
      
      {/* Working effects */}
      {isWorking && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <Box 
              key={i}
              args={[0.1, 0.1, 0.1]} 
              position={[
                Math.sin(enginePhase + i * 0.8) * 1.5,
                1.0 + liftHeight + Math.abs(Math.sin(enginePhase * 0.5 + i)) * 0.6,
                Math.cos(enginePhase + i * 0.8) * 0.8
              ]}
            >
              <meshStandardMaterial color="#FBBF24" flatShading emissive="#F97316" emissiveIntensity={0.6} transparent opacity={0.8} />
            </Box>
          ))}
        </>
      )}
    </group>
  );
}

// Click target indicator for movement
function MoveTarget({ position, visible }: { position: { x: number; z: number }; visible: boolean }) {
  const [scale, setScale] = useState(1);
  
  useFrame(() => {
    if (visible) {
      setScale(prev => 0.8 + Math.sin(Date.now() * 0.01) * 0.2);
    }
  });

  if (!visible) return null;

  return (
    <group position={[position.x, 0.02, position.z]}>
      <Box args={[0.5 * scale, 0.02, 0.5 * scale]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#4ECDC4" flatShading transparent opacity={0.8} emissive="#4ECDC4" emissiveIntensity={0.5} />
      </Box>
      <Box args={[0.3 * scale, 0.03, 0.3 * scale]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#FFFFFF" flatShading transparent opacity={0.9} />
      </Box>
    </group>
  );
}

// Common props for 3D items
interface Item3DBaseProps {
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
  isWallItem?: boolean;
}

// Helper to handle click with propagation stop
const handleItemClick = (e: THREE.Event, onClick: () => void) => {
  e.stopPropagation();
  onClick();
};

function WorkbenchItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current && isSelected) {
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.005) * 0.05;
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[2.5, 0.15, 1.2]} position={[0, 1, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#8B4513"} flatShading />
      </Box>
      {[[-1, 0.5], [1, 0.5], [-1, -0.5], [1, -0.5]].map(([x, z], i) => (
        <Box key={i} args={[0.15, 1, 0.15]} position={[x, 0.5, z]}>
          <meshStandardMaterial color="#353535" flatShading />
        </Box>
      ))}
      <Box args={[0.3, 0.1, 0.6]} position={[-0.5, 1.15, 0]}>
        <meshStandardMaterial color="#FF6B35" flatShading />
      </Box>
      <Box args={[0.4, 0.05, 0.2]} position={[0.5, 1.1, 0.3]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 2, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#CCAA4C]'} text-[#353535] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🔧 Workbench'}
          </div>
        </Html>
      )}
    </group>
  );
}

function ToolCabinetItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[1, 1.4, 0.5]} position={[0, 0.7, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#E74C3C"} flatShading />
      </Box>
      {[0.3, 0.6, 0.9, 1.2].map((y, i) => (
        <Box key={i} args={[0.9, 0.02, 0.45]} position={[0, y, 0.05]}>
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </Box>
      ))}
      {(hovered || isSelected) && (
        <Html center position={[0, 1.8, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#E74C3C]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🧰 Tool Cabinet'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Industrial Cupboard - tall storage with doors (not drawers)
function IndustrialCupboardItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Main cabinet body - taller than tool cabinet */}
      <Box args={[1.2, 1.8, 0.5]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#4A5568"} flatShading />
      </Box>
      {/* Left door panel */}
      <Box args={[0.55, 1.6, 0.02]} position={[-0.28, 0.9, 0.26]}>
        <meshStandardMaterial color="#2D3748" flatShading />
      </Box>
      {/* Right door panel */}
      <Box args={[0.55, 1.6, 0.02]} position={[0.28, 0.9, 0.26]}>
        <meshStandardMaterial color="#2D3748" flatShading />
      </Box>
      {/* Vertical divider line (door gap) */}
      <Box args={[0.02, 1.6, 0.03]} position={[0, 0.9, 0.27]}>
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </Box>
      {/* Door handles */}
      <Box args={[0.08, 0.2, 0.04]} position={[-0.08, 0.9, 0.29]}>
        <meshStandardMaterial color="#A0AEC0" flatShading />
      </Box>
      <Box args={[0.08, 0.2, 0.04]} position={[0.08, 0.9, 0.29]}>
        <meshStandardMaterial color="#A0AEC0" flatShading />
      </Box>
      {/* Vent slits at top */}
      {[1.55, 1.6, 1.65].map((y, i) => (
        <Box key={i} args={[0.4, 0.02, 0.03]} position={[0, y, 0.27]}>
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </Box>
      ))}
      {(hovered || isSelected) && (
        <Html center position={[0, 2.1, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#4A5568]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '📦 Industrial Cupboard'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Slope Top Cupboard - industrial cupboard with angled top (higher at back, slopes down to front)
function SlopeTopCupboardItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Main cabinet body - shorter to accommodate slope */}
      <Box args={[1.2, 1.4, 0.5]} position={[0, 0.7, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#4A5568"} flatShading />
      </Box>
      {/* Back panel extension (taller at back) */}
      <Box args={[1.2, 0.4, 0.1]} position={[0, 1.6, -0.2]}>
        <meshStandardMaterial color={isSelected ? "#3DB8B0" : hovered ? "#B8962A" : "#3D4A5C"} flatShading />
      </Box>
      {/* Sloped top - angled down toward front (positive X rotation tilts front down) */}
      <Box args={[1.22, 0.08, 0.6]} position={[0, 1.55, 0.05]} rotation={[0.35, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#3DB8B0" : hovered ? "#B8962A" : "#3D4A5C"} flatShading />
      </Box>
      {/* Left door panel */}
      <Box args={[0.55, 1.2, 0.02]} position={[-0.28, 0.7, 0.26]}>
        <meshStandardMaterial color="#2D3748" flatShading />
      </Box>
      {/* Right door panel */}
      <Box args={[0.55, 1.2, 0.02]} position={[0.28, 0.7, 0.26]}>
        <meshStandardMaterial color="#2D3748" flatShading />
      </Box>
      {/* Vertical divider line (door gap) */}
      <Box args={[0.02, 1.2, 0.03]} position={[0, 0.7, 0.27]}>
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </Box>
      {/* Door handles */}
      <Box args={[0.08, 0.2, 0.04]} position={[-0.08, 0.7, 0.29]}>
        <meshStandardMaterial color="#A0AEC0" flatShading />
      </Box>
      <Box args={[0.08, 0.2, 0.04]} position={[0.08, 0.7, 0.29]}>
        <meshStandardMaterial color="#A0AEC0" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 2.1, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#4A5568]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '📦 Slope Top Cupboard'}
          </div>
        </Html>
      )}
    </group>
  );
}

function ArcadeCabinetItem({ position, onClick, isSelected, label, isUnlocked }: Item3DBaseProps & { label: string; isUnlocked?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = hovered || isSelected ? 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 0.3;
    }
  });

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[0.9, 2, 0.7]} position={[0, 1, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#FF6B35" : "#1a1a1a"} flatShading />
      </Box>
      <Box ref={screenRef} args={[0.6, 0.5, 0.05]} position={[0, 1.4, 0.38]}>
        <meshStandardMaterial color={isUnlocked ? "#4ECDC4" : "#666"} emissive={isUnlocked ? "#4ECDC4" : "#333"} emissiveIntensity={0.3} flatShading />
      </Box>
      <Box args={[0.7, 0.25, 0.25]} position={[0, 0.85, 0.3]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.06, 0.12, 0.06]} position={[-0.12, 1, 0.35]}>
        <meshStandardMaterial color="#E74C3C" flatShading />
      </Box>
      <Box args={[0.08, 0.04, 0.08]} position={[0.1, 0.97, 0.35]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      <Box args={[0.08, 0.04, 0.08]} position={[0.22, 0.97, 0.35]}>
        <meshStandardMaterial color="#FF6B35" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 2.3, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#4ECDC4]'} text-[#1a1a1a] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : `🎮 ${label}`}
          </div>
        </Html>
      )}
    </group>
  );
}

function FridgeItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[0.8, 1.8, 0.7]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#E3E2D5"} flatShading />
      </Box>
      <Box args={[0.04, 0.35, 0.08]} position={[0.35, 1.1, 0.4]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.75, 0.015, 0.08]} position={[0, 0.7, 0.36]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 2.1, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#4ECDC4]'} text-[#1a1a1a] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🍺 Bar Fridge'}
          </div>
        </Html>
      )}
    </group>
  );
}

function LockerItem({ position, onClick, isSelected, label }: Item3DBaseProps & { label: string }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[0.6, 1.8, 0.5]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#2C3E50"} flatShading />
      </Box>
      {[1.5, 1.4, 1.3].map((y, i) => (
        <Box key={i} args={[0.4, 0.02, 0.05]} position={[0, y, 0.26]}>
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </Box>
      ))}
      <Box args={[0.06, 0.06, 0.04]} position={[0.2, 1, 0.27]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 2.1, 0]}>
          <div className="bg-red-500 text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg">
            {isSelected ? '✓ Selected' : `🔐 ${label}`}
          </div>
        </Html>
      )}
    </group>
  );
}

function DisplayCaseItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[1, 1.6, 0.5]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.9, 1.5, 0.02]} position={[0, 0.8, 0.24]}>
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} flatShading />
      </Box>
      {[0.4, 0.8, 1.2].map((y, i) => (
        <Box key={i} args={[0.85, 0.03, 0.4]} position={[0, y, 0]}>
          <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#4a4a4a"} flatShading />
        </Box>
      ))}
      <Box args={[0.15, 0.25, 0.1]} position={[0, 1.35, 0]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 1.9, 0]}>
          <div className="bg-purple-500 text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg">
            {isSelected ? '✓ Selected' : '🏆 Display Case'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Wall-mounted neon sign
function NeonSignItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[2, 0.6, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </Box>
      <Box ref={meshRef} args={[1.8, 0.15, 0.05]} position={[0, 0.1, 0.08]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : "#FF6B35"} emissive={isSelected ? "#4ECDC4" : "#FF6B35"} emissiveIntensity={0.5} flatShading />
      </Box>
      <Box args={[1.5, 0.1, 0.05]} position={[0, -0.15, 0.08]}>
        <meshStandardMaterial color="#CCAA4C" emissive="#CCAA4C" emissiveIntensity={0.4} flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 0.6, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#FF6B35]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '💡 Neon Sign'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Wall-mounted poster/art
function WallArtItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Frame */}
      <Box args={[1.2, 0.9, 0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : "#353535"} flatShading />
      </Box>
      {/* Poster content */}
      <Box args={[1, 0.7, 0.02]} position={[0, 0, 0.035]}>
        <meshStandardMaterial color={hovered ? "#CCAA4C" : "#8B4513"} flatShading />
      </Box>
      {/* Atomic symbol on poster */}
      <Box args={[0.3, 0.3, 0.01]} position={[0, 0, 0.05]}>
        <meshStandardMaterial color="#FF6B35" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 0.7, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-purple-500'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🖼️ Wall Art'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Propaganda poster with actual image texture
interface PropagandaPosterProps extends Item3DBaseProps {
  posterImage: string;
  posterName: string;
}

function PropagandaPosterItem({ position, onClick, isSelected, posterImage, posterName }: PropagandaPosterProps) {
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(posterImage);
  
  // Configure texture for proper display
  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  // Poster dimensions (2:3 aspect ratio for portrait poster)
  const posterWidth = 1.0;
  const posterHeight = 1.5;
  const frameWidth = posterWidth + 0.15;
  const frameHeight = posterHeight + 0.15;
  const frameDepth = 0.08; // Thicker frame to prevent z-fighting

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Frame - dark wood style */}
      <Box args={[frameWidth, frameHeight, frameDepth]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#5a4a3a" : "#3d3225"} flatShading />
      </Box>
      {/* Poster with texture - sits on front of frame */}
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}>
        <planeGeometry args={[posterWidth, posterHeight]} />
        <meshStandardMaterial 
          map={texture} 
          side={THREE.FrontSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      {(hovered || isSelected) && (
        <Html center position={[0, frameHeight / 2 + 0.2, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#CCAA4C]'} text-[#353535] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : `🖼️ ${posterName}`}
          </div>
        </Html>
      )}
    </group>
  );
}

// Industrial Roller Door - positioned on wall
function RollerDoorItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  const [openAmount, setOpenAmount] = useState(0);
  
  useFrame(({ clock }) => {
    // Gentle animation - door slightly moves as if wind is hitting it
    setOpenAmount(Math.sin(clock.getElapsedTime() * 0.5) * 0.02);
  });

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Door frame */}
      <Box args={[3.5, 3.5, 0.15]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : "#374151"} flatShading />
      </Box>
      {/* Door panels (horizontal slats) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Box 
          key={i} 
          args={[3.2, 0.22, 0.08]} 
          position={[0, 1.5 - i * 0.26 + openAmount * (12 - i), 0.1]}
        >
          <meshStandardMaterial color={hovered ? "#6B7280" : "#4B5563"} flatShading />
        </Box>
      ))}
      {/* Door handle */}
      <Box args={[0.8, 0.15, 0.12]} position={[0, -1.4, 0.15]}>
        <meshStandardMaterial color="#1F2937" flatShading />
      </Box>
      {/* Exit sign above door */}
      <Box args={[0.8, 0.3, 0.05]} position={[0, 2.0, 0.1]}>
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.5} flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 2.5, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-green-600'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🚪 Roller Door'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Wall-mounted tool panel
function ToolWallItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Pegboard */}
      <Box args={[1.5, 1, 0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#8B6914"} flatShading />
      </Box>
      {/* Tools hanging */}
      <Box args={[0.1, 0.4, 0.05]} position={[-0.5, 0.1, 0.05]}>
        <meshStandardMaterial color="#666" flatShading />
      </Box>
      <Box args={[0.15, 0.3, 0.05]} position={[-0.2, 0, 0.05]}>
        <meshStandardMaterial color="#FF6B35" flatShading />
      </Box>
      <Box args={[0.1, 0.5, 0.05]} position={[0.1, 0.1, 0.05]}>
        <meshStandardMaterial color="#666" flatShading />
      </Box>
      <Box args={[0.2, 0.2, 0.05]} position={[0.4, -0.1, 0.05]}>
        <meshStandardMaterial color="#E74C3C" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 0.8, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#CCAA4C]'} text-[#353535] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🔨 Tool Wall'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Helmet rack (wall mounted)
function HelmetRackItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Rack bar */}
      <Box args={[1.2, 0.1, 0.15]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : "#353535"} flatShading />
      </Box>
      {/* Helmet 1 */}
      <Box args={[0.25, 0.2, 0.25]} position={[-0.35, -0.2, 0.1]}>
        <meshStandardMaterial color={hovered ? "#CCAA4C" : "#E74C3C"} flatShading />
      </Box>
      {/* Helmet 2 */}
      <Box args={[0.25, 0.2, 0.25]} position={[0.35, -0.2, 0.1]}>
        <meshStandardMaterial color={hovered ? "#CCAA4C" : "#FF6B35"} flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 0.4, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#E74C3C]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '⛑️ Helmet Rack'}
          </div>
        </Html>
      )}
    </group>
  );
}

// Trophy shelf (wall mounted)
function TrophyShelfItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Shelf */}
      <Box args={[1, 0.05, 0.25]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : "#5D4037"} flatShading />
      </Box>
      {/* Brackets */}
      <Box args={[0.05, 0.15, 0.2]} position={[-0.4, -0.1, 0]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.05, 0.15, 0.2]} position={[0.4, -0.1, 0]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {/* Trophies */}
      <Box args={[0.1, 0.2, 0.1]} position={[-0.25, 0.125, 0]}>
        <meshStandardMaterial color={hovered ? "#FFD700" : "#CCAA4C"} flatShading />
      </Box>
      <Box args={[0.08, 0.15, 0.08]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#C0C0C0" flatShading />
      </Box>
      <Box args={[0.1, 0.18, 0.1]} position={[0.25, 0.115, 0]}>
        <meshStandardMaterial color={hovered ? "#FFD700" : "#CD7F32"} flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 0.5, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#CCAA4C]'} text-[#353535] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🏆 Trophy Shelf'}
          </div>
        </Html>
      )}
    </group>
  );
}

function SimRigItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[1.5, 0.1, 2]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </Box>
      <Box args={[0.5, 0.6, 0.8]} position={[0, 0.4, 0.3]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#2C3E50"} flatShading />
      </Box>
      <Box args={[0.5, 0.8, 0.15]} position={[0, 0.8, 0.7]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#2C3E50"} flatShading />
      </Box>
      <Box args={[1.2, 0.05, 0.1]} position={[0, 1.2, -0.6]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[1.2, 0.7, 0.05]} position={[0, 1.2, -0.7]}>
        <meshStandardMaterial color="#000" flatShading />
      </Box>
      <Box args={[1.1, 0.6, 0.02]} position={[0, 1.2, -0.65]}>
        <meshStandardMaterial color="#4ECDC4" emissive="#4ECDC4" emissiveIntensity={0.2} flatShading />
      </Box>
      <Box args={[0.35, 0.35, 0.1]} position={[0, 0.7, -0.3]}>
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 1.8, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#FF6B35]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🏎️ Racing Sim'}
          </div>
        </Html>
      )}
    </group>
  );
}

function BarCounterItem({ position, onClick, isSelected }: Item3DBaseProps) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[3, 0.1, 0.8]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color={isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : "#5D4037"} flatShading />
      </Box>
      <Box args={[2.8, 1, 0.6]} position={[0, 0.5, 0.1]}>
        <meshStandardMaterial color="#2C3E50" flatShading />
      </Box>
      <Box args={[2.5, 0.08, 0.1]} position={[0, 0.2, -0.45]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <Box key={i} args={[0.1, 0.3, 0.1]} position={[x, 1.3, 0.2]}>
          <meshStandardMaterial color={['#4ECDC4', '#E74C3C', '#F39C12', '#9B59B6', '#2ECC71'][i]} flatShading />
        </Box>
      ))}
      {(hovered || isSelected) && (
        <Html center position={[0, 1.8, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#4ECDC4]'} text-[#1a1a1a] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : '🍸 Bar Counter'}
          </div>
        </Html>
      )}
    </group>
  );
}

function GenericItem({ position, onClick, isSelected, item }: Item3DBaseProps & { item: GameItem }) {
  const [hovered, setHovered] = useState(false);
  const color = isSelected ? "#4ECDC4" : hovered ? "#CCAA4C" : 
    item.category === 'workshop' ? '#8B4513' :
    item.category === 'gaming' ? '#4ECDC4' :
    item.category === 'bar' ? '#E3E2D5' :
    item.category === 'security' ? '#E74C3C' :
    '#9B59B6';

  return (
    <group 
      position={position}
      onClick={(e) => handleItemClick(e, onClick)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <Box args={[0.8 * Math.max(1, item.size * 0.5), 1, 0.6]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={color} flatShading />
      </Box>
      {(hovered || isSelected) && (
        <Html center position={[0, 1.3, 0]}>
          <div className={`${isSelected ? 'bg-[#4ECDC4]' : 'bg-[#252219] border border-[#CCAA4C]'} text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded shadow-lg`}>
            {isSelected ? '✓ Selected' : `${item.icon} ${item.name}`}
          </div>
        </Html>
      )}
    </group>
  );
}

// Item renderer component with rotation wrapper
function PlacedItem3D({ 
  instance, 
  onClick, 
  isSelected,
  isUnlocked,
  onOpenGame
}: { 
  instance: PlacedItemInstance; 
  onClick: () => void;
  isSelected: boolean;
  isUnlocked?: boolean;
  onOpenGame?: (gameId: string) => void;
}) {
  const { item, position, rotation } = instance;
  const pos: [number, number, number] = [position.x, position.y, position.z];
  const rotationRad = (rotation || 0) * (Math.PI / 180); // Convert degrees to radians
  const isWallItem = WALL_ITEMS.includes(item.id);
  const commonProps = { position: [0, 0, 0] as [number, number, number], onClick, isSelected, isWallItem };

  // Wrap item in a group to apply position and rotation
  const renderItem = () => {
    // Map item IDs to specific 3D models
    if (item.id.includes('workbench')) {
      return <WorkbenchItem {...commonProps} />;
    }
    if (item.id === 'tool-cabinet' || item.id === 'mobile-cabinet') {
      return <ToolCabinetItem {...commonProps} />;
    }
    if (item.id === 'industrial-cupboard') {
      return <IndustrialCupboardItem {...commonProps} />;
    }
    if (item.id === 'slope-top-cupboard') {
      return <SlopeTopCupboardItem {...commonProps} />;
    }
    // Specific game cabinets - click to play!
    if (item.id === 'racer-cabinet') {
      return <ArcadeCabinetItem 
        {...commonProps} 
        onClick={() => onOpenGame?.('racer')}
        label="🏎️ Play Racer!" 
        isUnlocked={true} 
      />;
    }
    if (item.id === 'shooter-cabinet') {
      return <ArcadeCabinetItem 
        {...commonProps} 
        onClick={() => onOpenGame?.('shooter')}
        label="🎯 Target Practice!" 
        isUnlocked={true} 
      />;
    }
    if (item.id === 'arcade-cabinet' || item.id === 'gaming-desk' || item.id === 'vr-station') {
      return <ArcadeCabinetItem {...commonProps} label={item.name} isUnlocked={isUnlocked} />;
    }
    if (item.id === 'sim-rig') {
      return <SimRigItem {...commonProps} />;
    }
    if (item.id === 'bar-fridge' || item.id === 'kegerator') {
      return <FridgeItem {...commonProps} />;
    }
    if (item.id === 'bar-counter') {
      return <BarCounterItem {...commonProps} />;
    }
    if (item.id.includes('locker') || item.id.includes('vault')) {
      return <LockerItem {...commonProps} label={item.name} />;
    }
    if (item.id === 'display-cabinet') {
      return <DisplayCaseItem {...commonProps} />;
    }
    if (item.id === 'neon-sign') {
      return <NeonSignItem {...commonProps} />;
    }
    if (item.id === 'wall-art') {
      return <WallArtItem {...commonProps} />;
    }
    if (item.id === 'poster-hang-in-there') {
      return <PropagandaPosterItem {...commonProps} posterImage="/posters/hang-in-there.png" posterName="Hang In There" />;
    }
    if (item.id === 'poster-tidy-shed') {
      return <PropagandaPosterItem {...commonProps} posterImage="/posters/tidy-shed.png" posterName="Tidy Shed" />;
    }
    if (item.id === 'poster-build-cave') {
      return <PropagandaPosterItem {...commonProps} posterImage="/posters/build-your-cave.png" posterName="Build Your Cave" />;
    }
    if (item.id === 'roller-door') {
      return <RollerDoorItem {...commonProps} />;
    }
    if (item.id === 'tool-wall') {
      return <ToolWallItem {...commonProps} />;
    }
    if (item.id === 'helmet-rack') {
      return <HelmetRackItem {...commonProps} />;
    }
    if (item.id === 'trophy-shelf') {
      return <TrophyShelfItem {...commonProps} />;
    }
    return <GenericItem {...commonProps} item={item} />;
  };

  // Wall items CAN rotate to face different walls (0=back, 90=right, 180=front, 270=left)
  return (
    <group position={pos} rotation={[0, rotationRad, 0]}>
      {renderItem()}
    </group>
  );
}

// Keyboard controls for moving, rotating, and deleting items
function KeyboardControls({ 
  selectedInstanceId, 
  placedItems, 
  onItemMove,
  onItemRotate,
  onItemDelete,
  onDeselect,
  roomSize,
  miniGameActive = false
}: { 
  selectedInstanceId: string | null;
  placedItems: PlacedItemInstance[];
  onItemMove: (instanceId: string, newPosition: { x: number; y: number; z: number }) => void;
  onItemRotate: (instanceId: string, rotation: number) => void;
  onItemDelete: (instanceId: string) => void;
  onDeselect: () => void;
  roomSize: RoomSize;
  miniGameActive?: boolean;
}) {
  const room = roomSizes[roomSize];

  useEffect(() => {
    // Don't capture keyboard events when mini-game is active
    if (miniGameActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to deselect
      if (e.key === 'Escape') {
        onDeselect();
        return;
      }

      if (!selectedInstanceId) return;

      // Delete/Backspace to remove item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onItemDelete(selectedInstanceId);
        return;
      }

      const instance = placedItems.find(pi => pi.instanceId === selectedInstanceId);
      if (!instance) return;

      const moveAmount = 0.5;
      const isWallItem = WALL_ITEMS.includes(instance.item.id);
      let newPos = { ...instance.position };

      // Handle rotation with Q and E
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        onItemRotate(selectedInstanceId, (instance.rotation - 90 + 360) % 360);
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onItemRotate(selectedInstanceId, (instance.rotation + 90) % 360);
        return;
      }

      // Collision boundaries - items can't pass through walls
      const floorItemMargin = 0.5; // Floor items need space from walls
      const wallItemMargin = 0.15; // Wall items can be right against wall
      const margin = isWallItem ? wallItemMargin : floorItemMargin;
      
      // Hard boundaries - items CANNOT exceed these
      const minX = -room.width / 2 + margin;
      const maxX = room.width / 2 - margin;
      const minZ = -room.depth / 2 + margin;
      const maxZ = room.depth / 2 - margin;
      const minY = isWallItem ? 1.0 : 0; // Wall items stay above floor
      const maxY = room.height - 1.0;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          // Move left - clamp to wall
          newPos.x = Math.max(minX, newPos.x - moveAmount);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          // Move right - clamp to wall
          newPos.x = Math.min(maxX, newPos.x + moveAmount);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (isWallItem) {
            // Wall items: W moves UP on wall - clamp to ceiling
            newPos.y = Math.min(maxY, newPos.y + moveAmount);
          } else {
            // Floor items: W moves forward - clamp to back wall
            newPos.z = Math.max(minZ, newPos.z - moveAmount);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (isWallItem) {
            // Wall items: S moves DOWN - clamp to floor level
            newPos.y = Math.max(minY, newPos.y - moveAmount);
          } else {
            // Floor items: S moves back - clamp to front wall
            newPos.z = Math.min(maxZ, newPos.z + moveAmount);
          }
          break;
        // Z movement for wall items with R/F keys
        case 'r':
        case 'R':
          if (isWallItem) {
            // R moves wall item forward - clamp to front wall
            newPos.z = Math.min(maxZ, newPos.z + moveAmount);
          }
          break;
        case 'f':
        case 'F':
          if (isWallItem) {
            // F moves wall item back - clamp to back wall
            newPos.z = Math.max(minZ, newPos.z - moveAmount);
          }
          break;
        default:
          return;
      }
      
      // Final safety clamp - ensure position is ALWAYS within bounds
      newPos.x = Math.max(minX, Math.min(maxX, newPos.x));
      newPos.z = Math.max(minZ, Math.min(maxZ, newPos.z));
      if (isWallItem) {
        newPos.y = Math.max(minY, Math.min(maxY, newPos.y));
      }

      e.preventDefault();
      onItemMove(selectedInstanceId, newPos);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInstanceId, placedItems, onItemMove, onItemRotate, onItemDelete, onDeselect, room, miniGameActive]);

  return null;
}

// Cleanup game state type (generic for all rooms)
interface CleanupGameState {
  // Common
  hasBroom: boolean;
  score: number;
  targetPosition: { x: number; z: number } | null;
  // Bunker specific
  cleanedSlimes: string[];
  killedSnakes: string[];
  // Shed specific
  cleanedWebs: string[];
  killedRoaches: string[];
  killedBoss: boolean;
  // Garage specific
  cleanedOil: string[];
  killedRats: string[];
  // Project/Hobby system
  projectLevel: number; // 0-5
  isWorking: boolean;
  workProgress: number; // 0-100
}

// Main scene component
function Scene({ 
  placedItems, 
  roomSize, 
  onItemClick,
  onItemMove,
  onItemRotate,
  onItemDelete,
  onDeselect,
  onOpenGame,
  selectedInstanceId,
  editMode,
  characterPosition,
  onCharacterMove,
  cleanupGameState,
  onCleanupAction,
  cleanProgress,
  miniGameActive,
  hasRollerDoor
}: { 
  placedItems: PlacedItemInstance[]; 
  roomSize: RoomSize;
  onItemClick: (instanceId: string) => void;
  onItemMove: (instanceId: string, newPosition: { x: number; y: number; z: number }) => void;
  onItemRotate: (instanceId: string, rotation: number) => void;
  onItemDelete: (instanceId: string) => void;
  onDeselect: () => void;
  onOpenGame: (game: string) => void;
  selectedInstanceId: string | null;
  editMode: 'add' | 'move' | 'walk';
  characterPosition?: { x: number; z: number };
  onCharacterMove?: (position: { x: number; z: number }) => void;
  cleanupGameState?: CleanupGameState;
  onCleanupAction?: (action: { 
    type: 'cleanSlime' | 'killSnake' | 'cleanWeb' | 'killRoach' | 'killBoss' | 'cleanOil' | 'killRat' | 'pickupBroom' | 'setTarget' | 'startWork'; 
    id?: string; 
    position?: { x: number; z: number } 
  }) => void;
  cleanProgress?: number;
  miniGameActive?: boolean;
  hasRollerDoor?: boolean;
}) {
  const pestPositionsRef = useRef<Map<string, { x: number; z: number }>>(new Map());
  
  const handlePestPositionUpdate = (id: string, pos: { x: number; z: number }) => {
    pestPositionsRef.current.set(id, pos);
  };
  
  const handleInteract = (type: 'snake' | 'slime' | 'roach' | 'web' | 'oil' | 'rat' | 'spider', id: string) => {
    if (!onCleanupAction) return;
    switch (type) {
      case 'snake': onCleanupAction({ type: 'killSnake', id }); break;
      case 'slime': onCleanupAction({ type: 'cleanSlime', id }); break;
      case 'roach': onCleanupAction({ type: 'killRoach', id }); break;
      case 'web': onCleanupAction({ type: 'cleanWeb', id }); break;
      case 'oil': onCleanupAction({ type: 'cleanOil', id }); break;
      case 'rat': onCleanupAction({ type: 'killRat', id }); break;
      case 'spider': onCleanupAction({ type: 'killBoss' }); break;
    }
  };
  const room = roomSizes[roomSize];
  
  // Check if gaming equipment is present for unlocking arcade
  const hasArcade = placedItems.some(pi => pi.item.id === 'arcade-cabinet');
  const hasSimRig = placedItems.some(pi => pi.item.id === 'sim-rig');
  const hasVR = placedItems.some(pi => pi.item.id === 'vr-station');
  const hasGamingDesk = placedItems.some(pi => pi.item.id === 'gaming-desk');

  return (
    <>
      <KeyboardControls 
        selectedInstanceId={selectedInstanceId}
        placedItems={placedItems}
        onItemMove={onItemMove}
        onItemRotate={onItemRotate}
        onItemDelete={onItemDelete}
        onDeselect={onDeselect}
        roomSize={roomSize}
        miniGameActive={miniGameActive}
      />

      {/* Floor - darker for bunker */}
      <Plane args={[room.width, room.depth]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={roomSize === 'bunker' ? "#1a1f1a" : "#3d3d3d"} 
          flatShading 
        />
      </Plane>

      {/* Bunker: concrete cracks pattern on floor */}
      {roomSize === 'bunker' && (
        <>
          <Box args={[room.width * 0.8, 0.01, 0.05]} position={[0.5, 0.005, -1]} rotation={[0, 0.2, 0]}>
            <meshStandardMaterial color="#0f1210" flatShading />
          </Box>
          <Box args={[room.width * 0.5, 0.01, 0.05]} position={[-1, 0.005, 2]} rotation={[0, -0.3, 0]}>
            <meshStandardMaterial color="#0f1210" flatShading />
          </Box>
          <Box args={[room.width * 0.3, 0.01, 0.05]} position={[2, 0.005, -2]} rotation={[0, 0.8, 0]}>
            <meshStandardMaterial color="#0f1210" flatShading />
          </Box>
        </>
      )}

      {/* Hazard stripes on floor - green tint for bunker */}
      {Array.from({ length: Math.ceil(room.width / 4) }).map((_, i) => (
        <Box key={i} args={[1.2, 0.01, room.depth - 0.5]} position={[-room.width / 2 + 2 + i * 4, 0.01, 0]}>
          <meshStandardMaterial 
            color={roomSize === 'bunker' ? "#3d5a3d" : "#CCAA4C"} 
            flatShading 
          />
        </Box>
      ))}

      {/* Back wall - mossy green tint for bunker */}
      <Plane args={[room.width, room.height]} position={[0, room.height / 2, -room.depth / 2]}>
        <meshStandardMaterial 
          color={roomSize === 'bunker' ? "#1f2a1f" : "#353535"} 
          flatShading 
          side={THREE.DoubleSide} 
        />
      </Plane>

      {/* Left wall */}
      <Plane args={[room.depth, room.height]} rotation={[0, Math.PI / 2, 0]} position={[-room.width / 2, room.height / 2, 0]}>
        <meshStandardMaterial 
          color={roomSize === 'bunker' ? "#1a251a" : "#3d3d3d"} 
          flatShading 
          side={THREE.DoubleSide} 
        />
      </Plane>

      {/* Right wall */}
      <Plane args={[room.depth, room.height]} rotation={[0, -Math.PI / 2, 0]} position={[room.width / 2, room.height / 2, 0]}>
        <meshStandardMaterial 
          color={roomSize === 'bunker' ? "#1a251a" : "#3d3d3d"} 
          flatShading 
          side={THREE.DoubleSide} 
        />
      </Plane>

      {/* Room-specific cleanup atmosphere */}
      {roomSize === 'shed' && cleanupGameState && (
        <ShedAtmosphere 
          room={room}
          cleanedWebs={cleanupGameState.cleanedWebs}
          killedRoaches={cleanupGameState.killedRoaches}
          killedBoss={cleanupGameState.killedBoss}
          hasBroom={cleanupGameState.hasBroom}
          onWebClean={(id) => onCleanupAction?.({ type: 'cleanWeb', id })}
          onRoachKill={(id) => onCleanupAction?.({ type: 'killRoach', id })}
          onBossKill={() => onCleanupAction?.({ type: 'killBoss' })}
          onBroomPickup={() => onCleanupAction?.({ type: 'pickupBroom' })}
          onPestPositionUpdate={handlePestPositionUpdate}
          cleanProgress={cleanProgress || 0}
        />
      )}
      
      {roomSize === 'garage' && cleanupGameState && (
        <GarageAtmosphere 
          room={room}
          cleanedOil={cleanupGameState.cleanedOil}
          killedRats={cleanupGameState.killedRats}
          hasBroom={cleanupGameState.hasBroom}
          onOilClean={(id) => onCleanupAction?.({ type: 'cleanOil', id })}
          onRatKill={(id) => onCleanupAction?.({ type: 'killRat', id })}
          onBroomPickup={() => onCleanupAction?.({ type: 'pickupBroom' })}
          onPestPositionUpdate={handlePestPositionUpdate}
          cleanProgress={cleanProgress || 0}
        />
      )}
      
      {roomSize === 'bunker' && cleanupGameState && (
        <BunkerAtmosphere 
          room={room}
          cleanedSlimes={cleanupGameState.cleanedSlimes}
          killedSnakes={cleanupGameState.killedSnakes}
          hasBroom={cleanupGameState.hasBroom}
          onSlimeClean={(id) => onCleanupAction?.({ type: 'cleanSlime', id })}
          onSnakeKill={(id) => onCleanupAction?.({ type: 'killSnake', id })}
          onBroomPickup={() => onCleanupAction?.({ type: 'pickupBroom' })}
          onSnakePositionUpdate={handlePestPositionUpdate}
          cleanProgress={cleanProgress || 0}
        />
      )}
      
      {/* Hobby Project Objects */}
      {cleanupGameState && (
        <>
          {roomSize === 'shed' && (
            <RideOnMower 
              level={cleanupGameState.projectLevel}
              isWorking={cleanupGameState.isWorking}
              onStartWork={() => onCleanupAction?.({ type: 'startWork' })}
              canWork={editMode === 'walk' && !cleanupGameState.isWorking}
              onDriveAway={() => console.log('Mower drove away! Space freed up.')}
              hasRollerDoor={hasRollerDoor}
            />
          )}
          {roomSize === 'garage' && (
            <ProjectCar 
              level={cleanupGameState.projectLevel}
              isWorking={cleanupGameState.isWorking}
              onStartWork={() => onCleanupAction?.({ type: 'startWork' })}
              canWork={editMode === 'walk' && !cleanupGameState.isWorking}
              onDriveAway={() => console.log('Car drove away! Space freed up.')}
              hasRollerDoor={hasRollerDoor}
            />
          )}
          {roomSize === 'bunker' && (
            <PipeRepairStation 
              level={cleanupGameState.projectLevel}
              isWorking={cleanupGameState.isWorking}
              onStartWork={() => onCleanupAction?.({ type: 'startWork' })}
              canWork={editMode === 'walk' && !cleanupGameState.isWorking}
            />
          )}
          {roomSize === 'warehouse' && (
            <MonsterTruck 
              level={cleanupGameState.projectLevel}
              isWorking={cleanupGameState.isWorking}
              onStartWork={() => onCleanupAction?.({ type: 'startWork' })}
              canWork={editMode === 'walk' && !cleanupGameState.isWorking}
              onDriveAway={() => console.log('Monster truck smashed out! Space freed up.')}
              hasRollerDoor={hasRollerDoor}
            />
          )}
        </>
      )}

      {/* Ceiling beams */}
      <Box args={[room.width, 0.25, 0.25]} position={[0, room.height - 0.2, -room.depth / 4]}>
        <meshStandardMaterial color="#5D4037" flatShading />
      </Box>
      <Box args={[room.width, 0.25, 0.25]} position={[0, room.height - 0.2, room.depth / 4]}>
        <meshStandardMaterial color="#5D4037" flatShading />
      </Box>

      {/* Neon sign on back wall */}
      <group position={[0, room.height - 1, -room.depth / 2 + 0.15]}>
        <Box args={[3, 0.8, 0.1]}>
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </Box>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.4}
          color="#FF6B35"
          anchorX="center"
          anchorY="middle"
        >
          ATOMIC TAWK
        </Text>
      </group>

      {/* Placed items */}
      {placedItems.map((instance) => (
        <PlacedItem3D
          key={instance.instanceId}
          instance={instance}
          onClick={() => onItemClick(instance.instanceId)}
          isSelected={selectedInstanceId === instance.instanceId}
          isUnlocked={true}
          onOpenGame={onOpenGame}
        />
      ))}

      {/* Character - always visible with position */}
      {characterPosition && (
        <>
          <Character 
            position={characterPosition} 
            targetPosition={cleanupGameState?.targetPosition || null}
            roomSize={roomSize}
            isMoving={!!cleanupGameState?.targetPosition}
            onReachTarget={() => onCleanupAction?.({ type: 'setTarget', position: undefined })}
            bunkerScore={cleanupGameState?.score}
            hasBroom={cleanupGameState?.hasBroom}
          />
          {/* Character controls only in walk mode */}
          {editMode === 'walk' && (
            <>
              <CharacterControls 
                position={characterPosition}
                targetPosition={cleanupGameState?.targetPosition || null}
                onMove={onCharacterMove || (() => {})}
                onSetTarget={(target) => onCleanupAction?.({ type: 'setTarget', position: target || undefined })}
                roomSize={roomSize}
                enabled={editMode === 'walk' && !miniGameActive}
                snakePositions={pestPositionsRef.current}
                cleanedSlimes={cleanupGameState?.cleanedSlimes || []}
                killedSnakes={cleanupGameState?.killedSnakes || []}
                killedRoaches={cleanupGameState?.killedRoaches || []}
                killedRats={cleanupGameState?.killedRats || []}
                killedBoss={cleanupGameState?.killedBoss || false}
                allPestsCleared={
                  roomSize === 'shed' 
                    ? (cleanupGameState?.killedRoaches?.length || 0) >= SHED_COCKROACHES.length && 
                      (cleanupGameState?.cleanedWebs?.length || 0) >= SHED_SPIDERWEBS.length
                    : false
                }
                placedItems={placedItems}
                onInteract={handleInteract}
              />
              {/* Floor click handler for click-to-move */}
              <FloorClickHandler 
                room={room}
                onFloorClick={(pos) => onCleanupAction?.({ type: 'setTarget', position: pos })}
                enabled={editMode === 'walk' && !miniGameActive}
              />
              {/* Movement target indicator */}
              {cleanupGameState?.targetPosition && (
                <MoveTarget 
                  position={cleanupGameState.targetPosition} 
                  visible={true} 
                />
              )}
            </>
          )}
        </>
      )}

      {/* Lighting - eerie green for bunker */}
      <ambientLight intensity={roomSize === 'bunker' ? 0.25 : 0.4} />
      {roomSize === 'bunker' ? (
        <>
          {/* Bunker: dim flickering green lights */}
          <pointLight position={[0, room.height - 0.5, 0]} intensity={60} color="#4ADE80" />
          <pointLight position={[-room.width / 3, room.height - 0.5, -room.depth / 3]} intensity={40} color="#22C55E" />
          <pointLight position={[room.width / 3, room.height - 0.5, room.depth / 3]} intensity={40} color="#15803D" />
          {/* Emergency red light */}
          <pointLight position={[room.width / 2 - 1, room.height - 0.3, 0]} intensity={30} color="#EF4444" />
        </>
      ) : (
        <>
          {/* Standard warm lighting */}
          <pointLight position={[0, room.height - 0.5, 0]} intensity={100} color="#CCAA4C" />
          <pointLight position={[-room.width / 3, room.height - 0.5, -room.depth / 3]} intensity={50} color="#FF6B35" />
          <pointLight position={[room.width / 3, room.height - 0.5, room.depth / 3]} intensity={50} color="#4ECDC4" />
        </>
      )}

      {/* Camera controls */}
      <OrbitControls 
        makeDefault
        enablePan={true}
        minDistance={5}
        maxDistance={Math.max(room.width, room.depth) * 1.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1, 0]}
      />
    </>
  );
}

// Character component for walk mode with click-to-move
function Character({ 
  position,
  targetPosition,
  roomSize,
  isMoving,
  onReachTarget,
  bunkerScore,
  hasBroom
}: { 
  position: { x: number; z: number }; 
  targetPosition: { x: number; z: number } | null;
  roomSize: RoomSize;
  isMoving: boolean;
  onReachTarget: () => void;
  bunkerScore?: number;
  hasBroom?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [legAnimation, setLegAnimation] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  // Smooth movement - update position directly on the group
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Smoothly interpolate to target position so label stays synced
      groupRef.current.position.x += (position.x - groupRef.current.position.x) * 0.3;
      groupRef.current.position.z += (position.z - groupRef.current.position.z) * 0.3;
      
      // Bobbing animation
      const bobSpeed = isMoving ? 8 : 3;
      groupRef.current.position.y = 0.9 + Math.sin(clock.getElapsedTime() * bobSpeed) * (isMoving ? 0.08 : 0.03);
      
      // Leg animation when moving
      if (isMoving) {
        setLegAnimation(Math.sin(clock.getElapsedTime() * 12) * 0.3);
      } else {
        setLegAnimation(0);
      }
      
      // Calculate rotation to face movement direction
      if (targetPosition && isMoving) {
        const dx = targetPosition.x - groupRef.current.position.x;
        const dz = targetPosition.z - groupRef.current.position.z;
        if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
          const targetRotation = Math.atan2(dx, dz);
          setRotation(prev => {
            const diff = targetRotation - prev;
            return prev + diff * 0.1;
          });
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[position.x, 0.9, position.z]} rotation={[0, rotation, 0]}>
      {/* Body */}
      <Box args={[0.5, 0.8, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4ECDC4" flatShading />
      </Box>
      {/* Head */}
      <Box args={[0.35, 0.35, 0.35]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color="#FFCC80" flatShading />
      </Box>
      {/* Hard hat */}
      <Box args={[0.4, 0.15, 0.4]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      {/* Arms - animated */}
      <Box args={[0.15, 0.5, 0.15]} position={[-0.35, -0.1 + legAnimation * 0.2, legAnimation * 0.15]}>
        <meshStandardMaterial color="#4ECDC4" flatShading />
      </Box>
      <Box args={[0.15, 0.5, 0.15]} position={[0.35, -0.1 - legAnimation * 0.2, -legAnimation * 0.15]}>
        <meshStandardMaterial color="#4ECDC4" flatShading />
      </Box>
      {/* Legs - animated */}
      <Box args={[0.18, 0.5, 0.18]} position={[-0.12, -0.65, legAnimation * 0.2]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.18, 0.5, 0.18]} position={[0.12, -0.65, -legAnimation * 0.2]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {/* Broom when held */}
      {hasBroom && (
        <group position={[0.35, -0.1, 0.3]} rotation={[0.2, 0, -0.3]}>
          <Box args={[0.06, 0.8, 0.06]}>
            <meshStandardMaterial color="#92400E" flatShading />
          </Box>
          <Box args={[0.2, 0.25, 0.1]} position={[0, -0.45, 0]}>
            <meshStandardMaterial color="#A16207" flatShading />
          </Box>
        </group>
      )}
      {/* Name tag with score */}
      <Html center position={[0, 1.2, 0]}>
        <div className="flex flex-col items-center gap-1">
          {bunkerScore !== undefined && bunkerScore > 0 && (
            <div className="bg-yellow-500 text-black px-2 py-0.5 text-[10px] font-black uppercase whitespace-nowrap rounded shadow-lg">
              {bunkerScore} pts
            </div>
          )}
          <div className="bg-[#4ECDC4] text-[#353535] px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap rounded shadow-lg">
            You
          </div>
        </div>
      </Html>
    </group>
  );
}

// Character movement controls with click-to-move
function CharacterControls({ 
  position, 
  targetPosition,
  onMove,
  onSetTarget,
  roomSize,
  enabled,
  snakePositions,
  cleanedSlimes,
  killedSnakes,
  killedRoaches,
  killedRats,
  killedBoss,
  allPestsCleared,
  placedItems,
  onInteract
}: { 
  position: { x: number; z: number };
  targetPosition: { x: number; z: number } | null;
  onMove: (newPosition: { x: number; z: number }) => void;
  onSetTarget: (target: { x: number; z: number } | null) => void;
  roomSize: RoomSize;
  enabled: boolean;
  snakePositions: Map<string, { x: number; z: number }>;
  cleanedSlimes: string[];
  killedSnakes: string[];
  killedRoaches: string[];
  killedRats: string[];
  killedBoss: boolean;
  allPestsCleared: boolean;
  placedItems: Array<{ position: { x: number; z: number }; item: { size: number } }>;
  onInteract: (type: 'snake' | 'slime' | 'roach' | 'rat' | 'spider', id: string) => void;
}) {
  const room = roomSizes[roomSize];
  const moveSpeed = 0.08;
  
  // Get project position for this room
  const projectPos = PROJECT_POSITIONS[roomSize] || [0, 0, 0];

  // Smooth movement towards target
  useFrame(() => {
    if (!enabled || !targetPosition) return;
    
    const dx = targetPosition.x - position.x;
    const dz = targetPosition.z - position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < 0.1) {
      onSetTarget(null);
      return;
    }
    
    // Normalize and move
    let newX = position.x + (dx / distance) * moveSpeed;
    let newZ = position.z + (dz / distance) * moveSpeed;
    
    // Clamp to room bounds
    newX = Math.max(-room.width / 2 + 1, Math.min(room.width / 2 - 1, newX));
    newZ = Math.max(-room.depth / 2 + 1, Math.min(room.depth / 2 - 1, newZ));
    
    // Check collision with placed items
    let blocked = false;
    placedItems.forEach(item => {
      const itemRadius = 0.5 + (item.item.size * 0.3); // Larger items have bigger collision
      const distToItem = Math.sqrt(
        Math.pow(newX - item.position.x, 2) + Math.pow(newZ - item.position.z, 2)
      );
      if (distToItem < itemRadius) {
        blocked = true;
      }
    });
    
    // Check collision with project object (mower, car, pipes, truck)
    const projectRadius = 1.2;
    const distToProject = Math.sqrt(
      Math.pow(newX - projectPos[0], 2) + Math.pow(newZ - projectPos[2], 2)
    );
    if (distToProject < projectRadius) {
      blocked = true;
    }
    
    // Only move if not blocked
    if (!blocked) {
      onMove({ x: newX, z: newZ });
    } else {
      // Try to slide along obstacle - check X and Z separately
      const slideX = position.x + (dx / distance) * moveSpeed;
      const slideZ = position.z + (dz / distance) * moveSpeed;
      
      // Try X only
      let canSlideX = true;
      placedItems.forEach(item => {
        const itemRadius = 0.5 + (item.item.size * 0.3);
        const distX = Math.sqrt(Math.pow(slideX - item.position.x, 2) + Math.pow(position.z - item.position.z, 2));
        if (distX < itemRadius) canSlideX = false;
      });
      const distXProject = Math.sqrt(Math.pow(slideX - projectPos[0], 2) + Math.pow(position.z - projectPos[2], 2));
      if (distXProject < projectRadius) canSlideX = false;
      
      // Try Z only
      let canSlideZ = true;
      placedItems.forEach(item => {
        const itemRadius = 0.5 + (item.item.size * 0.3);
        const distZ = Math.sqrt(Math.pow(position.x - item.position.x, 2) + Math.pow(slideZ - item.position.z, 2));
        if (distZ < itemRadius) canSlideZ = false;
      });
      const distZProject = Math.sqrt(Math.pow(position.x - projectPos[0], 2) + Math.pow(slideZ - projectPos[2], 2));
      if (distZProject < projectRadius) canSlideZ = false;
      
      // Slide in allowed direction
      if (canSlideX && Math.abs(dx) > Math.abs(dz)) {
        const clampedSlideX = Math.max(-room.width / 2 + 1, Math.min(room.width / 2 - 1, slideX));
        onMove({ x: clampedSlideX, z: position.z });
      } else if (canSlideZ) {
        const clampedSlideZ = Math.max(-room.depth / 2 + 1, Math.min(room.depth / 2 - 1, slideZ));
        onMove({ x: position.x, z: clampedSlideZ });
      }
      // If completely blocked, don't move
    }
    
    // Check collision with snakes (kill them!)
    snakePositions.forEach((snakePos, snakeId) => {
      if (!killedSnakes.includes(snakeId)) {
        const snakeDist = Math.sqrt(
          Math.pow(position.x - snakePos.x, 2) + Math.pow(position.z - snakePos.z, 2)
        );
        if (snakeDist < 0.8) {
          onInteract('snake', snakeId);
        }
      }
    });
    
    // Check collision with slimes (clean them!)
    BUNKER_SLIMES.forEach(slime => {
      if (!cleanedSlimes.includes(slime.id)) {
        const slimeDist = Math.sqrt(
          Math.pow(position.x - slime.position[0], 2) + Math.pow(position.z - slime.position[2], 2)
        );
        if (slimeDist < slime.size + 0.3) {
          onInteract('slime', slime.id);
        }
      }
    });
    
    // Check collision with cockroaches (stomp them!)
    snakePositions.forEach((roachPos, roachId) => {
      if (roachId.startsWith('roach-') && !killedRoaches.includes(roachId)) {
        const roachDist = Math.sqrt(
          Math.pow(position.x - roachPos.x, 2) + Math.pow(position.z - roachPos.z, 2)
        );
        if (roachDist < 0.5) { // Close range to stomp
          onInteract('roach', roachId);
        }
      }
    });
    
    // Check collision with rats (catch them!)
    snakePositions.forEach((ratPos, ratId) => {
      if (ratId.startsWith('rat-') && !killedRats.includes(ratId)) {
        const ratDist = Math.sqrt(
          Math.pow(position.x - ratPos.x, 2) + Math.pow(position.z - ratPos.z, 2)
        );
        if (ratDist < 0.6) { // Close range to catch
          onInteract('rat', ratId);
        }
      }
    });
    
    // Check collision with spider boss (only if vulnerable - all pests cleared)
    if (allPestsCleared && !killedBoss) {
      const spiderPos = snakePositions.get('spider-boss');
      if (spiderPos) {
        const spiderDist = Math.sqrt(
          Math.pow(position.x - spiderPos.x, 2) + Math.pow(position.z - spiderPos.z, 2)
        );
        if (spiderDist < 0.8) { // Walk into spider to kill it!
          onInteract('spider', 'spider-boss');
        }
      }
    }
  });

  // Keyboard controls as backup
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let newX = position.x;
      let newZ = position.z;
      const keyMoveSpeed = 0.2;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newZ = Math.max(-room.depth / 2 + 1, position.z - keyMoveSpeed);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newZ = Math.min(room.depth / 2 - 1, position.z + keyMoveSpeed);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX = Math.max(-room.width / 2 + 1, position.x - keyMoveSpeed);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX = Math.min(room.width / 2 - 1, position.x + keyMoveSpeed);
          break;
        default:
          return;
      }

      // Check collision with placed items
      let blocked = false;
      placedItems.forEach(item => {
        const itemRadius = 0.5 + (item.item.size * 0.3);
        const dist = Math.sqrt(Math.pow(newX - item.position.x, 2) + Math.pow(newZ - item.position.z, 2));
        if (dist < itemRadius) blocked = true;
      });
      
      // Check collision with project object
      const projectRadius = 1.2;
      const distProject = Math.sqrt(Math.pow(newX - projectPos[0], 2) + Math.pow(newZ - projectPos[2], 2));
      if (distProject < projectRadius) blocked = true;

      e.preventDefault();
      if (!blocked) {
        onMove({ x: newX, z: newZ });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, position, onMove, room, placedItems, roomSize]);

  return null;
}

// Floor click handler for click-to-move
function FloorClickHandler({ 
  room, 
  onFloorClick,
  enabled
}: { 
  room: { width: number; depth: number; height: number };
  onFloorClick: (pos: { x: number; z: number }) => void;
  enabled: boolean;
}) {
  const { raycaster, camera, pointer } = useThree();
  
  const handleClick = (e: THREE.Event) => {
    if (!enabled) return;
    e.stopPropagation();
    
    // Get click position on floor plane
    const planeY = 0;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
    const intersectPoint = new THREE.Vector3();
    
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    if (intersectPoint) {
      // Clamp to room bounds
      const x = Math.max(-room.width / 2 + 1, Math.min(room.width / 2 - 1, intersectPoint.x));
      const z = Math.max(-room.depth / 2 + 1, Math.min(room.depth / 2 - 1, intersectPoint.z));
      onFloorClick({ x, z });
    }
  };

  return (
    <Plane 
      args={[room.width, room.depth]} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0.001, 0]}
      onClick={handleClick}
      visible={false}
    >
      <meshBasicMaterial transparent opacity={0} />
    </Plane>
  );
}

// Main exported component
interface ManCave3DProps {
  placedItems: PlacedItemInstance[];
  roomSize: RoomSize | null;
  onItemClick: (instanceId: string) => void;
  onItemMove: (instanceId: string, newPosition: { x: number; y: number; z: number }) => void;
  onItemRotate: (instanceId: string, rotation: number) => void;
  onItemDelete: (instanceId: string) => void;
  onDeselect: () => void;
  onOpenGame: (game: string) => void;
  selectedInstanceId: string | null;
  editMode: 'add' | 'move' | 'walk';
  characterPosition?: { x: number; z: number };
  onCharacterMove?: (position: { x: number; z: number }) => void;
  // Cleanup game state (works for all rooms)
  cleanupGameState?: {
    hasBroom: boolean;
    score: number;
    targetPosition: { x: number; z: number } | null;
    // Bunker
    cleanedSlimes: string[];
    killedSnakes: string[];
    // Shed
    cleanedWebs: string[];
    killedRoaches: string[];
    killedBoss: boolean;
    // Garage
    cleanedOil: string[];
    killedRats: string[];
    // Project/Hobby
    projectLevel: number;
    isWorking: boolean;
    workProgress: number;
  };
  onCleanupAction?: (action: { 
    type: 'cleanSlime' | 'killSnake' | 'cleanWeb' | 'killRoach' | 'killBoss' | 'cleanOil' | 'killRat' | 'pickupBroom' | 'setTarget' | 'startWork'; 
    id?: string; 
    position?: { x: number; z: number } 
  }) => void;
  // Disable controls when mini-game is active
  miniGameActive?: boolean;
  // Roller door installed - allows project vehicles to leave
  hasRollerDoor?: boolean;
}

export function ManCave3D({ 
  placedItems, 
  roomSize, 
  onItemClick, 
  onItemMove,
  onItemRotate,
  onItemDelete,
  onDeselect,
  onOpenGame,
  selectedInstanceId,
  editMode,
  characterPosition = { x: 0, z: 2 },
  onCharacterMove,
  cleanupGameState,
  onCleanupAction,
  miniGameActive = false,
  hasRollerDoor = false
}: ManCave3DProps) {
  if (!roomSize) return null;
  
  const room = roomSizes[roomSize];
  const selectedInstance = placedItems.find(pi => pi.instanceId === selectedInstanceId);
  const isWalkMode = editMode === 'walk';
  
  // Calculate clean progress based on room type
  const cleanProgress = cleanupGameState ? (() => {
    switch (roomSize) {
      case 'shed': {
        const total = SHED_SPIDERWEBS.length + SHED_COCKROACHES.length + 1; // +1 for boss
        const done = cleanupGameState.cleanedWebs.length + cleanupGameState.killedRoaches.length + (cleanupGameState.killedBoss ? 1 : 0);
        return done / total;
      }
      case 'garage': {
        const total = GARAGE_OIL_SPILLS.length + GARAGE_RATS.length;
        const done = cleanupGameState.cleanedOil.length + cleanupGameState.killedRats.length;
        return done / total;
      }
      case 'bunker': {
        const total = BUNKER_SLIMES.length + BUNKER_SNAKES.length;
        const done = cleanupGameState.cleanedSlimes.length + cleanupGameState.killedSnakes.length;
        return done / total;
      }
      default:
        return 0;
    }
  })() : 0;

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: isWalkMode 
            ? [characterPosition.x, 3, characterPosition.z + 5] // Follow character
            : [room.width * 0.6, room.height * 1.2, room.depth * 0.8], 
          fov: 55 
        }}
        style={{ background: roomSize === 'bunker' && cleanProgress < 1 ? "#0f1a0f" : "#1f1c13", cursor: isWalkMode ? "crosshair" : "pointer" }}
        gl={{ antialias: false }}
        onPointerMissed={() => {
          // Deselect when clicking on empty space
          if (editMode === 'move' && selectedInstanceId) {
            onDeselect?.();
          }
        }}
      >
        <Suspense fallback={null}>
          <Scene 
            placedItems={placedItems} 
            roomSize={roomSize}
            onItemClick={onItemClick}
            onItemMove={onItemMove}
            onItemRotate={onItemRotate}
            onItemDelete={onItemDelete}
            onDeselect={onDeselect}
            onOpenGame={onOpenGame}
            selectedInstanceId={selectedInstanceId}
            editMode={editMode}
            characterPosition={characterPosition}
            onCharacterMove={onCharacterMove}
            cleanupGameState={cleanupGameState}
            onCleanupAction={onCleanupAction}
            cleanProgress={cleanProgress}
            miniGameActive={miniGameActive}
            hasRollerDoor={hasRollerDoor}
          />
        </Suspense>
      </Canvas>
      
      {/* Cleanup game HUD - different for each room */}
      {isWalkMode && cleanupGameState && (
        <div className={`absolute top-4 left-4 backdrop-blur rounded-lg shadow-2xl p-4 z-50 ${
          roomSize === 'shed' ? 'bg-[#2a1f1a]/95 border-2 border-[#A16207]' :
          roomSize === 'garage' ? 'bg-[#1f1a1a]/95 border-2 border-[#6B7280]' :
          roomSize === 'bunker' ? 'bg-[#1a251a]/95 border-2 border-[#4ADE80]' :
          'bg-[#1a1a2a]/95 border-2 border-[#6366F1]'
        }`}>
          {/* Broom status */}
          {!cleanupGameState.hasBroom && (
            <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500 rounded text-center">
              <div className="text-yellow-400 font-bold text-xs">FIND THE BROOM!</div>
              <div className="text-yellow-300 text-[10px]">Walk to it to pick it up</div>
            </div>
          )}
          
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
            roomSize === 'shed' ? 'text-[#A16207]' :
            roomSize === 'garage' ? 'text-[#9CA3AF]' :
            roomSize === 'bunker' ? 'text-[#4ADE80]' :
            'text-[#818CF8]'
          }`}>
            {roomSize === 'shed' ? 'Shed Cleanup' :
             roomSize === 'garage' ? 'Garage Cleanup' :
             roomSize === 'bunker' ? 'Bunker Cleanup' :
             'Warehouse Cleanup'}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">{cleanupGameState.score}</div>
              <div className="text-[10px] text-[#AEACA1] uppercase">Points</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            
            {/* Shed-specific stats */}
            {roomSize === 'shed' && (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-400">{SHED_COCKROACHES.length - cleanupGameState.killedRoaches.length}</div>
                  <div className="text-[10px] text-[#AEACA1] uppercase">Roaches</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-400">{SHED_SPIDERWEBS.length - cleanupGameState.cleanedWebs.length}</div>
                  <div className="text-[10px] text-[#AEACA1] uppercase">Webs</div>
                </div>
                {cleanupGameState.hasBroom && !cleanupGameState.killedBoss && cleanupGameState.killedRoaches.length >= SHED_COCKROACHES.length && cleanupGameState.cleanedWebs.length >= SHED_SPIDERWEBS.length && (
                  <>
                    <div className="w-px h-10 bg-white/20" />
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-500 animate-pulse">1</div>
                      <div className="text-[10px] text-red-400 uppercase">BOSS!</div>
                    </div>
                  </>
                )}
              </>
            )}
            
            {/* Garage-specific stats */}
            {roomSize === 'garage' && (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-700">{GARAGE_RATS.length - cleanupGameState.killedRats.length}</div>
                  <div className="text-[10px] text-[#AEACA1] uppercase">Rats</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-xl font-bold text-stone-600">{GARAGE_OIL_SPILLS.length - cleanupGameState.cleanedOil.length}</div>
                  <div className="text-[10px] text-[#AEACA1] uppercase">Oil</div>
                </div>
              </>
            )}
            
            {/* Bunker-specific stats */}
            {roomSize === 'bunker' && (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-400">{BUNKER_SNAKES.length - cleanupGameState.killedSnakes.length}</div>
                  <div className="text-[10px] text-[#AEACA1] uppercase">Snakes</div>
                </div>
                <div className="w-px h-10 bg-[#4ADE80]/30" />
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{BUNKER_SLIMES.length - cleanupGameState.cleanedSlimes.length}</div>
                  <div className="text-[10px] text-[#AEACA1] uppercase">Slimes</div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-3">
            <div className="text-[10px] text-[#AEACA1] uppercase mb-1">Clean Progress</div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${cleanProgress * 100}%`,
                  background: cleanProgress >= 1 ? '#FBBF24' : (
                    roomSize === 'shed' ? '#A16207' :
                    roomSize === 'garage' ? '#6B7280' :
                    roomSize === 'bunker' ? '#4ADE80' :
                    '#6366F1'
                  )
                }}
              />
            </div>
          </div>
          
          {cleanProgress >= 1 && (
            <div className="mt-3 text-center animate-pulse">
              <div className="text-yellow-400 font-black text-sm">
                {roomSize === 'shed' ? 'SHED CLEARED!' :
                 roomSize === 'garage' ? 'GARAGE CLEANED!' :
                 roomSize === 'bunker' ? 'BUNKER CLEANED!' :
                 'AREA CLEARED!'}
              </div>
              <div className="text-[10px] text-yellow-300">Budget Unlocked!</div>
            </div>
          )}
          
          <div className="mt-3 text-[9px] text-[#AEACA1]">
            {cleanupGameState.hasBroom 
              ? 'Click to move • Walk into pests to clear'
              : 'Find the broom first!'}
          </div>
        </div>
      )}
      
    </div>
  );
}
