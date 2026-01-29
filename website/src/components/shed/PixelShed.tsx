"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Box, Plane, Text, Html } from "@react-three/drei";
import * as THREE from "three";

interface InteractiveObjectProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  hoverColor: string;
  label: string;
  onClick: () => void;
}

function InteractiveObject({ position, size, color, hoverColor, label, onClick }: InteractiveObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={size}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? hoverColor : color} 
          flatShading
        />
      </Box>
      {hovered && (
        <Html center position={[0, size[1] / 2 + 0.5, 0]}>
          <div className="bg-[#FF6B35] text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Workbench({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Table top */}
      <Box args={[3, 0.2, 1.5]} position={[0, 1, 0]}>
        <meshStandardMaterial color={hovered ? "#CCAA4C" : "#8B4513"} flatShading />
      </Box>
      {/* Legs */}
      <Box args={[0.2, 1, 0.2]} position={[-1.3, 0.5, 0.5]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.2, 1, 0.2]} position={[1.3, 0.5, 0.5]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.2, 1, 0.2]} position={[-1.3, 0.5, -0.5]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      <Box args={[0.2, 1, 0.2]} position={[1.3, 0.5, -0.5]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {/* Tools on top */}
      <Box args={[0.3, 0.1, 0.8]} position={[-0.5, 1.15, 0]}>
        <meshStandardMaterial color="#FF6B35" flatShading />
      </Box>
      {hovered && (
        <Html center position={[0, 2, 0]}>
          <div className="bg-[#CCAA4C] text-[#353535] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded">
            🔧 Workshop Tools
          </div>
        </Html>
      )}
    </group>
  );
}

function ArcadeCabinet({ position, onClick, label }: { position: [number, number, number]; onClick: () => void; label: string }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Cabinet body */}
      <Box args={[1, 2.2, 0.8]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color={hovered ? "#FF6B35" : "#1a1a1a"} flatShading />
      </Box>
      {/* Screen */}
      <Box args={[0.7, 0.6, 0.1]} position={[0, 1.5, 0.4]}>
        <meshStandardMaterial color="#4ECDC4" emissive="#4ECDC4" emissiveIntensity={hovered ? 0.5 : 0.2} flatShading />
      </Box>
      {/* Controls panel */}
      <Box args={[0.8, 0.3, 0.3]} position={[0, 0.9, 0.3]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {/* Joystick */}
      <Box args={[0.08, 0.15, 0.08]} position={[-0.15, 1.1, 0.35]}>
        <meshStandardMaterial color="#E74C3C" flatShading />
      </Box>
      {/* Buttons */}
      <Box args={[0.1, 0.05, 0.1]} position={[0.15, 1.05, 0.35]}>
        <meshStandardMaterial color="#CCAA4C" flatShading />
      </Box>
      <Box args={[0.1, 0.05, 0.1]} position={[0.3, 1.05, 0.35]}>
        <meshStandardMaterial color="#FF6B35" flatShading />
      </Box>
      {hovered && (
        <Html center position={[0, 2.5, 0]}>
          <div className="bg-[#4ECDC4] text-[#1a1a1a] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded">
            🎮 {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function Fridge({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Fridge body */}
      <Box args={[1, 2, 0.8]} position={[0, 1, 0]}>
        <meshStandardMaterial color={hovered ? "#CCAA4C" : "#E3E2D5"} flatShading />
      </Box>
      {/* Handle */}
      <Box args={[0.05, 0.4, 0.1]} position={[0.4, 1.2, 0.45]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {/* Divider line */}
      <Box args={[0.9, 0.02, 0.1]} position={[0, 0.8, 0.4]}>
        <meshStandardMaterial color="#353535" flatShading />
      </Box>
      {hovered && (
        <Html center position={[0, 2.3, 0]}>
          <div className="bg-[#4ECDC4] text-[#1a1a1a] px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded">
            🍺 Bar Fridge
          </div>
        </Html>
      )}
    </group>
  );
}

function ToolCabinet({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Cabinet body */}
      <Box args={[1.2, 1.5, 0.6]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={hovered ? "#CCAA4C" : "#E74C3C"} flatShading />
      </Box>
      {/* Drawers */}
      {[0.3, 0.6, 0.9, 1.2].map((y, i) => (
        <Box key={i} args={[1.1, 0.02, 0.55]} position={[0, y, 0.05]}>
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </Box>
      ))}
      {/* Handles */}
      {[0.4, 0.7, 1.0, 1.3].map((y, i) => (
        <Box key={i} args={[0.3, 0.04, 0.08]} position={[0, y, 0.35]}>
          <meshStandardMaterial color="#CCAA4C" flatShading />
        </Box>
      ))}
      {hovered && (
        <Html center position={[0, 1.8, 0]}>
          <div className="bg-[#E74C3C] text-white px-3 py-1 text-sm font-bold uppercase whitespace-nowrap rounded">
            🧰 Tool Cabinet
          </div>
        </Html>
      )}
    </group>
  );
}

function Shed({ onInteract }: { onInteract: (type: string) => void }) {
  return (
    <>
      {/* Floor */}
      <Plane args={[12, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4a4a4a" flatShading />
      </Plane>

      {/* Back wall */}
      <Plane args={[12, 4]} position={[0, 2, -5]}>
        <meshStandardMaterial color="#353535" flatShading side={THREE.DoubleSide} />
      </Plane>

      {/* Left wall */}
      <Plane args={[10, 4]} rotation={[0, Math.PI / 2, 0]} position={[-6, 2, 0]}>
        <meshStandardMaterial color="#3d3d3d" flatShading side={THREE.DoubleSide} />
      </Plane>

      {/* Right wall */}
      <Plane args={[10, 4]} rotation={[0, -Math.PI / 2, 0]} position={[6, 2, 0]}>
        <meshStandardMaterial color="#3d3d3d" flatShading side={THREE.DoubleSide} />
      </Plane>

      {/* Ceiling beams */}
      <Box args={[12, 0.3, 0.3]} position={[0, 3.8, -2]}>
        <meshStandardMaterial color="#8B4513" flatShading />
      </Box>
      <Box args={[12, 0.3, 0.3]} position={[0, 3.8, 2]}>
        <meshStandardMaterial color="#8B4513" flatShading />
      </Box>

      {/* Hazard stripes on floor */}
      {[-4, 0, 4].map((x) => (
        <Box key={x} args={[1.5, 0.02, 10]} position={[x, 0.01, 0]}>
          <meshStandardMaterial color="#CCAA4C" flatShading />
        </Box>
      ))}

      {/* Workbench */}
      <Workbench position={[-4, 0, -4]} onClick={() => onInteract("workshop")} />

      {/* Arcade cabinets */}
      <ArcadeCabinet position={[3, 0, -4]} onClick={() => onInteract("racer")} label="Retro Racer" />
      <ArcadeCabinet position={[5, 0, -4]} onClick={() => onInteract("shooter")} label="Target Practice" />

      {/* Reaction test machine */}
      <ArcadeCabinet position={[4, 0, -2]} onClick={() => onInteract("reaction")} label="Reaction Test" />

      {/* Tool cabinet */}
      <ToolCabinet position={[-5, 0, -2]} onClick={() => onInteract("tools")} />

      {/* Bar fridge */}
      <Fridge position={[-5, 0, 2]} onClick={() => onInteract("fridge")} />

      {/* Neon sign on back wall */}
      <Text
        position={[0, 3, -4.9]}
        fontSize={0.5}
        color="#FF6B35"
        anchorX="center"
        anchorY="middle"
        font="/fonts/oswald.woff"
      >
        ATOMIC TAWK
      </Text>

      {/* Lights */}
      <pointLight position={[0, 3.5, 0]} intensity={50} color="#CCAA4C" />
      <pointLight position={[-4, 3, -3]} intensity={20} color="#FF6B35" />
      <pointLight position={[4, 3, -3]} intensity={20} color="#4ECDC4" />
    </>
  );
}

interface PixelShedProps {
  onOpenGame: (game: string) => void;
}

export function PixelShed({ onOpenGame }: PixelShedProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 4, 8], fov: 60 }}
        style={{ background: "#1f1c13" }}
        gl={{ antialias: false }} // Pixel art style - no antialiasing
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <Shed onInteract={onOpenGame} />
          <OrbitControls 
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
