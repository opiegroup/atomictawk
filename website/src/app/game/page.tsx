"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Check, 
  ExternalLink,
  RotateCcw,
  Share2,
  Wrench,
  Shield,
  Zap,
  Star,
  Package,
  AlertTriangle,
  Trophy,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Gamepad2,
  Crosshair,
  Hammer,
  Eye,
  ChevronDown,
  Coins,
  Lock,
  Unlock,
  Sparkles,
  User,
  Mail,
  Plus,
  Minus,
  Move,
  GripVertical
} from "lucide-react";
import {
  roomConfigs,
  gameItems,
  zoneInfo,
  calculateStats,
  getGrade,
  type RoomSize,
  type Zone,
  type GameItem,
} from "@/lib/gameData";
import { gameAudio } from "@/lib/gameAudio";

// Dynamic imports for 3D components
const ManCave3D = dynamic(
  () => import("@/components/game/ManCave3D").then((mod) => mod.ManCave3D),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#1f1c13]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#CCAA4C] font-bold uppercase tracking-widest text-sm">INITIALIZING CAVE...</p>
        </div>
      </div>
    ),
  }
);

// Dynamic imports for mini-games
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

type GameState = "start" | "register" | "room-select" | "building" | "complete";

interface HighScores {
  racer: number;
  shooter: number;
  reaction: number | null;
}

// Extended placed item with position and unique instance ID
interface PlacedItemInstance {
  instanceId: string;
  item: GameItem;
  position: { x: number; y: number; z: number };
  rotation: number;
}

// Player profile
interface PlayerProfile {
  name: string;
  email: string;
}

// Wall-mounted item IDs
const WALL_ITEMS = ['neon-sign', 'wall-art', 'tool-wall', 'helmet-rack', 'trophy-shelf', 'roller-door', 'string-lights', 'poster-frame', 'pegboard', 'key-safe', 'poster-hang-in-there', 'poster-tidy-shed', 'poster-build-cave'];

// Items that can have multiples (most items should be stackable)
const STACKABLE_ITEMS = [
  // Workshop
  'workbench', 'hi-lo-bench', 'tool-drawer', 'tool-wall', 'tool-chest', 'cupboard', 'slope-top-cupboard', 'pegboard', 'folding-table',
  // Bar
  'bar-fridge', 'bar-stools', 'wine-rack', 'keg-tap', 'esky', 'milk-crate-seats', 'mini-fridge',
  // Display
  'wall-art', 'helmet-rack', 'trophy-shelf', 'neon-sign', 'string-lights', 'poster-frame',
  // Gaming  
  'sim-rig', 'gaming-desk', 'arcade-cabinet', 'vr-station', 'racer-cabinet', 'shooter-cabinet', 'retro-console', 'handheld-station', 'folding-chair-gaming',
  // Security
  'pistol-cabinet', 'secure-locker', 'belt-locker', 'ammo-vault', 'padlock-box', 'key-safe',
];

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [selectedRoom, setSelectedRoom] = useState<RoomSize | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedItemInstance[]>([]);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<Zone>("workshop");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState(true);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [bonusBudget, setBonusBudget] = useState(500); // Start with $500 to buy starter items!
  const [showMiniGameHub, setShowMiniGameHub] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<HighScores>({
    racer: 0,
    shooter: 0,
    reaction: null,
  });
  const [player, setPlayer] = useState<PlayerProfile>({ name: "", email: "" });
  const [unlockedGames, setUnlockedGames] = useState<string[]>([]);
  const [unlockedRooms, setUnlockedRooms] = useState<string[]>(['shed']); // Start with shed unlocked
  const [completedRooms, setCompletedRooms] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'add' | 'move' | 'walk'>('add');
  const [characterPosition, setCharacterPosition] = useState({ x: 0, z: 2 });
  
  // Cleanup game state (works for all rooms)
  const [cleanupGameState, setCleanupGameState] = useState({
    hasBroom: false,
    broomStored: false, // Broom stored in slope top cabinet = WIN!
    score: 0,
    targetPosition: null as { x: number; z: number } | null,
    // Bunker
    cleanedSlimes: [] as string[],
    killedSnakes: [] as string[],
    // Shed
    cleanedWebs: [] as string[],
    killedRoaches: [] as string[],
    killedBoss: false,
    // Garage
    cleanedOil: [] as string[],
    killedRats: [] as string[],
    // Project/Hobby
    projectLevel: 0,
    isWorking: false,
    workProgress: 0,
  });
  
  // Level won state
  const [levelWon, setLevelWon] = useState(false);
  
  // Track if budget has been earned for each room
  const [budgetEarned, setBudgetEarned] = useState<Record<string, boolean>>({});

  const roomConfig = roomConfigs.find((r) => r.id === selectedRoom);
  const usedSlots = placedItems.reduce((sum, pi) => sum + pi.item.size, 0);
  // Budget starts at 0 - you earn the room budget by completing cleanup
  const roomBudget = selectedRoom && budgetEarned[selectedRoom] ? (roomConfig?.budget || 0) : 0;
  const totalBudget = roomBudget + bonusBudget;
  const usedBudget = placedItems.reduce((sum, pi) => sum + pi.item.cost, 0);
  
  // Calculate stats from placed item instances
  const stats = calculateStats(placedItems.map(pi => pi.item));
  const grade = getGrade(stats.atomicRating);
  
  // Calculate zone balance score (0-100)
  const zoneBalance = (() => {
    if (!roomConfig) return 0;
    const zonesUsed = new Set(placedItems.map(pi => pi.item.category));
    const availableZones = roomConfig.zones.length;
    const usedZoneCount = Array.from(zonesUsed).filter(z => roomConfig.zones.includes(z as Zone)).length;
    // Score based on how many of the available zones are used
    const zoneScore = availableZones > 0 ? (usedZoneCount / availableZones) * 100 : 0;
    return Math.round(zoneScore);
  })();
  
  // Calculate remaining budget
  const remainingBudget = totalBudget - usedBudget;
  
  // Check if all money is spent (within $100 tolerance OR can cash out with small amount)
  const allMoneySpent = remainingBudget <= 100 && totalBudget > 0;
  const canCashOut = remainingBudget > 0 && remainingBudget <= 500 && totalBudget > 0; // Can cash out if under $500 remaining
  
  // Check if player has a slope top cabinet to store the broom
  const hasSlopeTopCabinet = placedItems.some(pi => pi.item.id === 'slope-top-cupboard');
  
  // Check if current room is complete (cleanup done + project done + good balance)
  const isRoomComplete = (() => {
    if (!selectedRoom || !budgetEarned[selectedRoom]) return false;
    if (cleanupGameState.projectLevel < 5) return false;
    if (zoneBalance < 50) return false; // Need at least 50% zone coverage
    return true;
  })();
  
  // WIN CONDITION: Budget low enough AND have cabinet AND have broom
  const canWinLevel = (allMoneySpent || canCashOut) && hasSlopeTopCabinet && cleanupGameState.hasBroom && !cleanupGameState.broomStored;
  
  // Get next room in progression
  const roomProgression = ['shed', 'garage', 'bunker', 'warehouse'];
  const nextRoom = (() => {
    if (!selectedRoom) return null;
    const currentIndex = roomProgression.indexOf(selectedRoom);
    if (currentIndex < 0 || currentIndex >= roomProgression.length - 1) return null;
    return roomProgression[currentIndex + 1];
  })();

  // Get count of an item type placed
  const getItemCount = (itemId: string) => {
    return placedItems.filter(pi => pi.item.id === itemId).length;
  };

  // Check if item can have more instances
  const canAddMore = (item: GameItem) => {
    const count = getItemCount(item.id);
    if (STACKABLE_ITEMS.includes(item.id)) {
      return count < 10; // Max 10 of stackable items
    }
    return count < 1; // Only 1 of non-stackable items
  };

  const availableItems = gameItems.filter(
    (item) => item.category === activeZone && canAddMore(item)
  );

  // Check for gaming equipment to unlock mini-games
  useEffect(() => {
    const gamingItems = placedItems.filter(pi => pi.item.category === 'gaming');
    const newUnlocked: string[] = [];
    
    // Racer unlocked by racer-cabinet, arcade-cabinet, sim-rig, retro-console, or any gaming item
    if (gamingItems.some(pi => ['racer-cabinet', 'arcade-cabinet', 'sim-rig', 'retro-console', 'folding-chair-gaming'].includes(pi.item.id))) {
      newUnlocked.push('racer');
    }
    // Target Practice unlocked by shooter-cabinet, or (vr-station/arcade-cabinet + security gear)
    const hasSecurityGear = placedItems.some(pi => pi.item.category === 'security');
    if (gamingItems.some(pi => pi.item.id === 'shooter-cabinet') || 
        (gamingItems.some(pi => pi.item.id === 'vr-station' || pi.item.id === 'arcade-cabinet') && hasSecurityGear)) {
      newUnlocked.push('shooter');
    }
    // Reaction unlocked by gaming-desk, arcade-cabinet, handheld-station, retro-console, or folding chair
    if (gamingItems.some(pi => ['gaming-desk', 'arcade-cabinet', 'handheld-station', 'retro-console', 'folding-chair-gaming'].includes(pi.item.id))) {
      newUnlocked.push('reaction');
    }
    
    setUnlockedGames(newUnlocked);
  }, [placedItems]);

  // Achievement system
  const checkAchievement = useCallback((id: string, name: string) => {
    if (!achievements.includes(id)) {
      setAchievements(prev => [...prev, id]);
      setShowAchievement(name);
      gameAudio.playSuccess();
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [achievements]);

  useEffect(() => {
    if (placedItems.length === 1) checkAchievement("first_item", "First Item Placed!");
    if (placedItems.length >= 5) checkAchievement("five_items", "Building Momentum!");
    if (placedItems.length >= 10) checkAchievement("ten_items", "Serious Setup!");
    if (stats.atomicRating >= 8) checkAchievement("high_rating", "Cave Master!");
    if (bonusBudget >= 500) checkAchievement("bonus_earned", "Mini-Game Master!");
    if (unlockedGames.length >= 3) checkAchievement("arcade_complete", "Full Arcade!");
  }, [placedItems, stats.atomicRating, bonusBudget, unlockedGames.length, checkAchievement]);
  
  // Check for room completion and unlock next room
  useEffect(() => {
    if (!isRoomComplete || !selectedRoom || !nextRoom) return;
    if (completedRooms.includes(selectedRoom)) return; // Already completed
    if (unlockedRooms.includes(nextRoom)) return; // Already unlocked
    
    // Room complete! Unlock next room
    setCompletedRooms(prev => [...prev, selectedRoom]);
    setUnlockedRooms(prev => [...prev, nextRoom]);
    gameAudio.playLevelUp();
    
    const roomNames: Record<string, string> = {
      shed: 'Shed',
      garage: 'Garage', 
      bunker: 'Bunker',
      warehouse: 'Warehouse'
    };
    
    setShowError(`🎉 ${roomNames[selectedRoom]} COMPLETE! ${roomNames[nextRoom]} UNLOCKED!`);
    setTimeout(() => setShowError(null), 4000);
    checkAchievement(`${selectedRoom}_complete`, `${roomNames[selectedRoom]} Master!`);
  }, [isRoomComplete, selectedRoom, nextRoom, completedRooms, unlockedRooms, checkAchievement]);

  const toggleSound = () => {
    const newState = gameAudio.toggle();
    setSoundEnabled(newState);
    if (!newState) {
      // Stop music when sound is disabled
      gameAudio.stopMusic();
      setMusicEnabled(false);
    } else {
      gameAudio.playClick();
    }
  };
  
  const toggleMusic = () => {
    if (!soundEnabled) return; // Can't play music if sound is off
    const newState = gameAudio.toggleMusic();
    setMusicEnabled(newState);
  };

  const handleAddItem = (item: GameItem) => {
    if (!roomConfig) return;
    if (usedSlots + item.size > roomConfig.slots) {
      gameAudio.playError();
      setShowError("Not enough space!");
      setTimeout(() => setShowError(null), 2000);
      return;
    }
    if (usedBudget + item.cost > totalBudget) {
      gameAudio.playError();
      // Give more helpful error message based on situation
      if (!budgetEarned[selectedRoom || '']) {
        setShowError("Complete cleanup first to unlock budget! Use Walk mode.");
      } else {
        setShowError("Over budget! Play mini-games or work on project to earn more!");
      }
      setTimeout(() => setShowError(null), 3000);
      return;
    }
    
    // Calculate position based on item type
    const room = roomConfigs.find(r => r.id === selectedRoom);
    const roomWidth = room?.id === 'shed' ? 8 : room?.id === 'garage' ? 12 : room?.id === 'bunker' ? 14 : 20;
    const roomDepth = room?.id === 'shed' ? 6 : room?.id === 'garage' ? 10 : room?.id === 'bunker' ? 12 : 16;
    
    let position: { x: number; y: number; z: number };
    
    if (WALL_ITEMS.includes(item.id)) {
      // Wall items go on the back wall - positioned flush against wall
      // Y position is center of item - keep well above floor (minimum 1.5m center)
      const wallX = (Math.random() - 0.5) * (roomWidth - 3);
      const wallY = 1.5 + Math.random() * 0.3; // Height between 1.5m and 1.8m center
      position = { x: wallX, y: wallY, z: -roomDepth / 2 + 0.15 }; // Right against the back wall
    } else {
      // Floor items spread across the floor
      const existingCount = placedItems.length;
      const row = Math.floor(existingCount / 4);
      const col = existingCount % 4;
      position = {
        x: -roomWidth / 2 + 2 + col * 2.5,
        y: 0,
        z: -roomDepth / 2 + 2 + row * 2.5
      };
    }
    
    const newInstance: PlacedItemInstance = {
      instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item,
      position,
      rotation: 0
    };
    
    gameAudio.playAddItem();
    setRecentlyAdded(newInstance.instanceId);
    setTimeout(() => setRecentlyAdded(null), 500);
    setPlacedItems([...placedItems, newInstance]);
  };

  const handleRemoveItem = (instanceId: string) => {
    gameAudio.playRemoveItem();
    setPlacedItems(placedItems.filter((pi) => pi.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  const handleUpdateItemPosition = (instanceId: string, newPosition: { x: number; y: number; z: number }) => {
    setPlacedItems(prev => prev.map(pi => 
      pi.instanceId === instanceId 
        ? { ...pi, position: newPosition }
        : pi
    ));
  };

  const handleUpdateItemRotation = (instanceId: string, newRotation: number) => {
    setPlacedItems(prev => prev.map(pi => 
      pi.instanceId === instanceId 
        ? { ...pi, rotation: newRotation }
        : pi
    ));
  };

  // Work progress timer effect - rewards scale with workshop items
  useEffect(() => {
    if (!cleanupGameState.isWorking) return;
    
    // Count workshop items for bonus multiplier
    const workshopItemCount = placedItems.filter(pi => pi.item.category === 'workshop').length;
    const itemBonus = workshopItemCount * 100; // +$100 per workshop item
    
    // Play grinding sound periodically while working
    const soundInterval = setInterval(() => {
      gameAudio.playGrinding();
    }, 300);
    
    const interval = setInterval(() => {
      setCleanupGameState(prev => {
        const newProgress = prev.workProgress + 2; // 2% per tick = 50 ticks = ~5 seconds
        
        if (newProgress >= 100) {
          // Work complete! Level up and earn cash - scales with workshop items!
          const baseCash = 500 + prev.projectLevel * 200; // $500 base + $200 per level
          const cashEarned = baseCash + itemBonus; // Plus $100 per workshop item
          const newLevel = Math.min(5, prev.projectLevel + 1);
          
          setTimeout(() => {
            setBonusBudget(b => b + cashEarned);
            const itemText = workshopItemCount > 0 ? ` (+$${itemBonus} from ${workshopItemCount} items!)` : '';
            
            // If project is now complete (level 5), play engine start!
            if (newLevel === 5) {
              gameAudio.playEngineStart();
              setShowError(`PROJECT COMPLETE! +$${cashEarned}${itemText} 🏆`);
            } else {
              setShowError(`+$${cashEarned} from hobby work!${itemText}`);
            }
            setTimeout(() => setShowError(null), 3000);
          }, 0);
          
          return {
            ...prev,
            isWorking: false,
            workProgress: 0,
            projectLevel: newLevel,
          };
        }
        
        return { ...prev, workProgress: newProgress };
      });
    }, 100); // 100ms per tick
    
    return () => {
      clearInterval(interval);
      clearInterval(soundInterval);
    };
  }, [cleanupGameState.isWorking, placedItems]);

  // Cleanup game action handler (works for all rooms)
  const handleCleanupAction = (action: { 
    type: 'cleanSlime' | 'killSnake' | 'cleanWeb' | 'killRoach' | 'killBoss' | 'cleanOil' | 'killRat' | 'pickupBroom' | 'setTarget' | 'startWork' | 'storeBroom'; 
    id?: string; 
    position?: { x: number; z: number } 
  }) => {
    // Pickup broom
    if (action.type === 'pickupBroom') {
      setCleanupGameState(prev => ({ ...prev, hasBroom: true }));
      return;
    }
    
    // Store broom in slope top cabinet - WIN CONDITION!
    if (action.type === 'storeBroom') {
      if (cleanupGameState.hasBroom && (allMoneySpent || canCashOut) && hasSlopeTopCabinet) {
        setCleanupGameState(prev => ({ ...prev, broomStored: true, hasBroom: false }));
        setLevelWon(true);
        gameAudio.playLevelUp();
        return;
      }
    }
    
    // Start working on project
    if (action.type === 'startWork') {
      setCleanupGameState(prev => {
        if (prev.isWorking || prev.projectLevel >= 5) return prev;
        return { ...prev, isWorking: true, workProgress: 0 };
      });
      return;
    }
    
    // Set target position
    if (action.type === 'setTarget') {
      setCleanupGameState(prev => ({
        ...prev,
        targetPosition: action.position || null,
      }));
      return;
    }
    
    // Helper to check completion and award budget (75% completion is enough!)
    const checkCompletion = (roomType: string, done: number, total: number) => {
      const completionPercent = done / total;
      if (completionPercent >= 0.75 && !budgetEarned[roomType]) {
        setBudgetEarned(prev => ({ ...prev, [roomType]: true }));
        // Show completion message
        const roomBudget = roomConfigs.find(r => r.id === roomType)?.budget || 0;
        gameAudio.playLevelUp();
        setShowError(`🎉 Room cleaned! Budget unlocked: $${roomBudget.toLocaleString()}`);
        setTimeout(() => setShowError(null), 3000);
      }
    };
    
    // Bunker actions
    if (action.type === 'cleanSlime' && action.id) {
      setCleanupGameState(prev => {
        if (prev.cleanedSlimes.includes(action.id!) || !prev.hasBroom) return prev;
        const newCleaned = [...prev.cleanedSlimes, action.id!];
        const pointsEarned = 50;
        setTimeout(() => {
          setBonusBudget(b => b + pointsEarned);
          checkCompletion('bunker', newCleaned.length + prev.killedSnakes.length, 8);
        }, 0);
        return { ...prev, cleanedSlimes: newCleaned, score: prev.score + pointsEarned };
      });
    } else if (action.type === 'killSnake' && action.id) {
      setCleanupGameState(prev => {
        if (prev.killedSnakes.includes(action.id!)) return prev;
        const newKilled = [...prev.killedSnakes, action.id!];
        const pointsEarned = 100;
        setTimeout(() => {
          setBonusBudget(b => b + pointsEarned);
          checkCompletion('bunker', prev.cleanedSlimes.length + newKilled.length, 8);
        }, 0);
        return { ...prev, killedSnakes: newKilled, score: prev.score + pointsEarned };
      });
    }
    
    // Shed actions
    else if (action.type === 'cleanWeb' && action.id) {
      setCleanupGameState(prev => {
        if (prev.cleanedWebs.includes(action.id!) || !prev.hasBroom) return prev;
        const newCleaned = [...prev.cleanedWebs, action.id!];
        const pointsEarned = 30;
        setTimeout(() => setBonusBudget(b => b + pointsEarned), 0);
        return { ...prev, cleanedWebs: newCleaned, score: prev.score + pointsEarned };
      });
    } else if (action.type === 'killRoach' && action.id) {
      setCleanupGameState(prev => {
        if (prev.killedRoaches.includes(action.id!)) return prev;
        const newKilled = [...prev.killedRoaches, action.id!];
        const pointsEarned = 25;
        setTimeout(() => setBonusBudget(b => b + pointsEarned), 0);
        return { ...prev, killedRoaches: newKilled, score: prev.score + pointsEarned };
      });
    } else if (action.type === 'killBoss') {
      setCleanupGameState(prev => {
        if (prev.killedBoss) return prev;
        const pointsEarned = 500;
        setTimeout(() => {
          setBonusBudget(b => b + pointsEarned);
          checkCompletion('shed', prev.cleanedWebs.length + prev.killedRoaches.length + 1, 10); // 4 webs + 5 roaches + 1 boss
        }, 0);
        return { ...prev, killedBoss: true, score: prev.score + pointsEarned };
      });
    }
    
    // Garage actions
    else if (action.type === 'cleanOil' && action.id) {
      setCleanupGameState(prev => {
        if (prev.cleanedOil.includes(action.id!) || !prev.hasBroom) return prev;
        const newCleaned = [...prev.cleanedOil, action.id!];
        const pointsEarned = 40;
        setTimeout(() => {
          setBonusBudget(b => b + pointsEarned);
          checkCompletion('garage', newCleaned.length + prev.killedRats.length, 7); // 4 oil + 3 rats
        }, 0);
        return { ...prev, cleanedOil: newCleaned, score: prev.score + pointsEarned };
      });
    } else if (action.type === 'killRat' && action.id) {
      setCleanupGameState(prev => {
        if (prev.killedRats.includes(action.id!)) return prev;
        const newKilled = [...prev.killedRats, action.id!];
        const pointsEarned = 75;
        setTimeout(() => {
          setBonusBudget(b => b + pointsEarned);
          checkCompletion('garage', prev.cleanedOil.length + newKilled.length, 7);
        }, 0);
        return { ...prev, killedRats: newKilled, score: prev.score + pointsEarned };
      });
    }
  };

  const handleZoneChange = (zone: Zone) => {
    gameAudio.playTab();
    setActiveZone(zone);
  };

  const handleRoomSelect = (roomId: RoomSize) => {
    gameAudio.playClick();
    setSelectedRoom(roomId);
    setLevelWon(false); // Reset win state for new room
    // Reset cleanup state for new room
    setCleanupGameState({
      hasBroom: false,
      broomStored: false,
      score: 0,
      targetPosition: null,
      cleanedSlimes: [],
      killedSnakes: [],
      cleanedWebs: [],
      killedRoaches: [],
      killedBoss: false,
      cleanedOil: [],
      killedRats: [],
      projectLevel: 0,
      isWorking: false,
      workProgress: 0,
    });
    setCharacterPosition({ x: 0, z: 2 });
  };

  const handleStartBuilding = () => {
    if (selectedRoom) {
      gameAudio.playStart();
      setGameState("building");
    }
  };

  const handleComplete = () => {
    gameAudio.playSuccess();
    setGameState("complete");
  };

  const handleMiniGameScore = (game: string, score: number) => {
    let bonus = 0;
    if (game === "racer") {
      bonus = Math.floor(score * 5);
      if (score > highScores.racer) {
        setHighScores(prev => ({ ...prev, racer: score }));
      }
    } else if (game === "shooter") {
      bonus = Math.floor(score * 10);
      if (score > highScores.shooter) {
        setHighScores(prev => ({ ...prev, shooter: score }));
      }
    } else if (game === "reaction") {
      bonus = score < 300 ? 200 : score < 400 ? 100 : 50;
      if (highScores.reaction === null || score < highScores.reaction) {
        setHighScores(prev => ({ ...prev, reaction: score }));
      }
    }
    
    if (bonus > 0) {
      setBonusBudget(prev => prev + bonus);
      setShowError(`+$${bonus} bonus earned!`);
      setTimeout(() => setShowError(null), 2000);
    }
  };

  const resetGame = () => {
    gameAudio.playClick();
    setGameState("start");
    setSelectedRoom(null);
    setPlacedItems([]);
    setSelectedItem(null);
    setSelectedInstanceId(null);
    setActiveZone("workshop");
    setBonusBudget(0);
    setHighScores({ racer: 0, shooter: 0, reaction: null });
    setUnlockedGames([]);
  };

  // START SCREEN
  if (gameState === "start") {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/game-bg.png" alt="Man Cave Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c13] via-[#1f1c13]/70 to-transparent" />
          <div className="absolute inset-0 bg-[#1f1c13]/40" />
        </div>

        <div className="absolute inset-0 pointer-events-none z-10 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
          }} />
        </div>

        <div className="absolute top-6 right-6 flex gap-2 z-20">
          <button
            onClick={toggleMusic}
            className={`p-3 backdrop-blur border-2 transition-colors ${
              musicEnabled 
                ? 'bg-[#FF6B35]/80 border-[#FF6B35] text-white animate-pulse' 
                : 'bg-[#252219]/80 border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white'
            }`}
            title={musicEnabled ? "Make it stop!" : "🎵 BOSCOTEK Theme"}
          >
            {musicEnabled ? <Music2 className="w-5 h-5" /> : <Music className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleSound}
            className="p-3 bg-[#252219]/80 backdrop-blur border-2 border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        <div className="max-w-2xl w-full text-center relative z-20">
          <div className="mb-6 animate-slide-up">
            <div className="inline-block bg-[#CCAA4C] px-6 py-2 -rotate-2 animate-bounce-in shadow-lg">
              <span className="text-[#353535] text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Atomic Tawk Presents
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
          </div>

          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h1 
              className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-4 drop-shadow-[0_0_30px_rgba(255,107,53,0.5)]"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Man Cave
              <br />
              <span className="text-[#FF6B35] animate-pulse-glow inline-block">Commander</span>
            </h1>
            <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
              Build your ultimate man cave in <span className="text-[#CCAA4C] font-bold">3D</span>. 
              Add gaming equipment to unlock mini-games and earn bonus budget!
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-10 stagger-children">
            <div className="bg-[#252219]/80 backdrop-blur border-2 border-[#CCAA4C]/50 p-4 hover:border-[#CCAA4C] transition-all group">
              <Hammer className="w-8 h-8 text-[#CCAA4C] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Build</span>
            </div>
            <div className="bg-[#252219]/80 backdrop-blur border-2 border-[#FF6B35]/50 p-4 hover:border-[#FF6B35] transition-all group">
              <Move className="w-8 h-8 text-[#FF6B35] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Arrange</span>
            </div>
            <div className="bg-[#252219]/80 backdrop-blur border-2 border-[#4ECDC4]/50 p-4 hover:border-[#4ECDC4] transition-all group">
              <Gamepad2 className="w-8 h-8 text-[#4ECDC4] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Play</span>
            </div>
            <div className="bg-[#252219]/80 backdrop-blur border-2 border-purple-500/50 p-4 hover:border-purple-500 transition-all group">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Compete</span>
            </div>
          </div>

          <button
            onClick={() => {
              gameAudio.playStart();
              setGameState("register");
            }}
            className="game-btn group relative bg-[#FF6B35] hover:bg-[#CCAA4C] text-white px-16 py-6 font-black uppercase tracking-widest text-xl transition-all animate-pulse-glow shadow-[0_0_40px_rgba(255,107,53,0.4)]"
          >
            <Play className="inline-block w-7 h-7 mr-3" />
            Enter the Cave
            <div className="absolute inset-0 border-4 border-white/20 pointer-events-none"></div>
          </button>

          <p className="mt-10 text-[#AEACA1]/80 text-xs uppercase tracking-widest animate-slide-up" style={{ animationDelay: '0.5s' }}>
            Drag items to position • Add gaming gear to unlock arcade
          </p>
        </div>
      </div>
    );
  }

  // REGISTER SCREEN - Name & Email for Leaderboard
  if (gameState === "register") {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/mancave-bg.png" alt="Man Cave Background" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1f1c13] via-[#1f1c13]/90 to-[#1f1c13]" />
        </div>

        <button
          onClick={toggleSound}
          className="absolute top-6 right-6 p-3 bg-[#252219] border-2 border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white transition-colors z-50"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-block bg-[#4ECDC4] text-[#353535] px-6 py-2 mb-4">
              <span className="text-sm font-black uppercase tracking-widest">Commander Registration</span>
            </div>
            <h2 
              className="text-4xl font-black uppercase tracking-tighter text-white mb-2"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Enter Your <span className="text-[#CCAA4C]">Details</span>
            </h2>
            <p className="text-white/70">Save your high scores and compete on the leaderboard!</p>
          </div>

          <div className="bg-[#252219]/90 backdrop-blur border-4 border-[#CCAA4C] p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCAA4C] mb-2">
                  Commander Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AEACA1]" />
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => setPlayer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name..."
                    className="w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 text-white pl-12 pr-4 py-4 font-bold uppercase tracking-wider focus:border-[#CCAA4C] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#CCAA4C] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AEACA1]" />
                  <input
                    type="email"
                    value={player.email}
                    onChange={(e) => setPlayer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full bg-[#1f1c13] border-2 border-[#AEACA1]/30 text-white pl-12 pr-4 py-4 focus:border-[#CCAA4C] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[#AEACA1] mt-2">We'll send you exclusive shed tips and updates!</p>
              </div>

              <div className="bg-[#1f1c13] border border-[#4ECDC4]/30 p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-[#4ECDC4]" />
                  <div>
                    <p className="text-white font-bold text-sm">Unlock Leaderboard Access</p>
                    <p className="text-[#AEACA1] text-xs">Your high scores will be saved and ranked globally!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  gameAudio.playClick();
                  setGameState("start");
                }}
                className="game-btn flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#AEACA1]/30 text-white hover:border-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => {
                  gameAudio.playStart();
                  setGameState("room-select");
                }}
                disabled={!player.name.trim()}
                className={`game-btn flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold uppercase tracking-widest transition-all ${
                  player.name.trim()
                    ? "bg-[#FF6B35] text-white hover:bg-[#CCAA4C]"
                    : "bg-[#AEACA1]/20 text-[#AEACA1] cursor-not-allowed"
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setPlayer({ name: "Guest Commander", email: "" });
                gameAudio.playClick();
                setGameState("room-select");
              }}
              className="w-full mt-4 text-[#AEACA1] text-sm hover:text-white transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ROOM SELECT
  if (gameState === "room-select") {
    return (
      <div className="min-h-screen relative p-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/mancave-bg.png" alt="Man Cave Background" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1f1c13] via-[#1f1c13]/90 to-[#1f1c13]" />
        </div>

        <button
          onClick={toggleSound}
          className="fixed top-6 right-6 p-3 bg-[#252219] border-2 border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white transition-colors z-50"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Player greeting */}
          {player.name && (
            <div className="text-center mb-4 animate-slide-up">
              <span className="text-[#AEACA1] text-sm">Welcome, <span className="text-[#CCAA4C] font-bold">{player.name}</span>!</span>
            </div>
          )}

          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-2 text-sm font-black uppercase tracking-widest mb-4">
              <span className="w-3 h-3 bg-white/30 rounded-full animate-pulse" />
              Step 1 of 2
            </div>
            <h2 
              className="text-5xl font-black uppercase tracking-tighter text-white mb-4"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              Select Your <span className="text-[#CCAA4C]">Space</span>
            </h2>
            <p className="text-white/70 text-lg">Choose your building footprint. Bigger = more room for activities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 stagger-children">
            {roomConfigs.map((room, index) => {
              const isSelected = selectedRoom === room.id;
              const isUnlocked = unlockedRooms.includes(room.id);
              const isCompleted = completedRooms.includes(room.id);
              const roomIndex = roomProgression.indexOf(room.id);
              
              return (
                <button
                  key={room.id}
                  onClick={() => isUnlocked && handleRoomSelect(room.id)}
                  onMouseEnter={() => isUnlocked && gameAudio.playHover()}
                  disabled={!isUnlocked}
                  className={`game-item-card text-left p-6 border-4 transition-all relative overflow-hidden ${
                    !isUnlocked
                      ? "border-[#AEACA1]/10 bg-[#1a1815]/80 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "border-[#FF6B35] bg-[#FF6B35]/20 scale-[1.02]"
                      : isCompleted
                      ? "border-[#4ECDC4]/50 bg-[#4ECDC4]/10 hover:border-[#4ECDC4] hover:bg-[#4ECDC4]/20"
                      : "border-[#AEACA1]/30 bg-[#252219]/80 backdrop-blur hover:border-[#CCAA4C] hover:bg-[#252219]"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Lock overlay for locked rooms */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-[#AEACA1] mx-auto mb-2" />
                        <p className="text-[#AEACA1] text-xs font-bold uppercase">
                          Complete {roomProgression[roomIndex - 1]} first
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Completed badge */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 bg-[#4ECDC4] px-2 py-1 text-xs font-black text-[#1a1815] uppercase">
                      ✓ Complete
                    </div>
                  )}
                  
                  {isSelected && !isCompleted && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center animate-bounce-in">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  {/* Progression number */}
                  <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                    isCompleted ? 'bg-[#4ECDC4] text-[#1a1815]' : isUnlocked ? 'bg-[#CCAA4C] text-[#1a1815]' : 'bg-[#AEACA1]/20 text-[#AEACA1]'
                  }`}>
                    {roomIndex + 1}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 mt-6">
                    <div className={`grid gap-0.5 ${room.id === 'shed' ? 'grid-cols-2' : room.id === 'garage' ? 'grid-cols-3' : room.id === 'bunker' ? 'grid-cols-4' : 'grid-cols-5'}`}>
                      {Array.from({ length: room.slots > 20 ? 15 : room.slots > 12 ? 12 : room.slots > 6 ? 8 : 4 }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 ${isCompleted ? 'bg-[#4ECDC4]' : isSelected ? 'bg-[#FF6B35]' : 'bg-[#CCAA4C]'}`} />
                      ))}
                    </div>
                  </div>

                  <h3 
                    className={`text-2xl font-black uppercase tracking-tight mb-2 ${isUnlocked ? 'text-white' : 'text-[#AEACA1]'}`}
                    style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                  >
                    {room.name}
                  </h3>
                  <p className={`text-sm mb-4 ${isUnlocked ? 'text-white/70' : 'text-[#AEACA1]/50'}`}>{room.description}</p>
                  
                  <div className="flex gap-3">
                    <span className={`px-3 py-1.5 text-xs font-bold ${isSelected ? 'bg-[#FF6B35] text-white' : 'bg-[#1f1c13] text-[#CCAA4C]'}`}>
                      {room.slots} Slots
                    </span>
                    <span className={`px-3 py-1.5 text-xs font-bold ${isSelected ? 'bg-green-600 text-white' : 'bg-[#1f1c13] text-green-400'}`}>
                      ${room.budget.toLocaleString()}
                    </span>
                    <span className="bg-[#1f1c13] px-3 py-1.5 text-[10px] font-bold text-[#AEACA1]">
                      {room.zones.length} Zones
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => {
                gameAudio.playClick();
                setGameState("register");
              }}
              className="game-btn flex items-center gap-2 px-6 py-3 border-2 border-[#AEACA1]/30 text-white hover:border-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleStartBuilding}
              disabled={!selectedRoom}
              className={`game-btn flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest transition-all ${
                selectedRoom
                  ? "bg-[#FF6B35] text-white hover:bg-[#CCAA4C] animate-pulse-glow shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                  : "bg-[#AEACA1]/20 text-[#AEACA1] cursor-not-allowed"
              }`}
            >
              Enter 3D Builder
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BUILDING PHASE
  if (gameState === "building" && roomConfig) {
    const hasGamingEquipment = unlockedGames.length > 0;

    return (
      <div className="h-screen bg-[#1f1c13] flex flex-col overflow-hidden">
        {showAchievement && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
            <div className="bg-[#CCAA4C] text-[#353535] px-8 py-4 font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg">
              <Trophy className="w-6 h-6" />
              Achievement Unlocked: {showAchievement}
            </div>
          </div>
        )}

        {showError && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-shake">
            <div className={`px-6 py-3 font-bold uppercase tracking-widest flex items-center gap-3 ${
              showError.includes('+') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {showError.includes('+') ? <Coins className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {showError}
            </div>
          </div>
        )}

        {/* Top HUD Bar */}
        <div className="bg-[#252219] border-b-4 border-[#FF6B35] px-4 py-3 z-20 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 
                  className="text-lg font-black uppercase tracking-tight text-white"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {roomConfig.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#AEACA1] uppercase">{player.name}</span>
                  <span className="text-[10px] text-[#CCAA4C]">•</span>
                  <span className="text-[10px] text-[#CCAA4C] uppercase">
                    {editMode === 'add' ? 'Add Mode' : 'Move Mode'}
                  </span>
                </div>
              </div>
              
              <div className="hidden sm:flex gap-3">
                <div className="bg-[#1f1c13] px-4 py-2 border border-[#AEACA1]/30">
                  <span className="text-[10px] text-[#AEACA1] uppercase tracking-widest block">Slots</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[#1f1c13] border border-[#AEACA1]/20">
                      <div 
                        className="h-full bg-[#CCAA4C] transition-all"
                        style={{ width: `${(usedSlots / roomConfig.slots) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${usedSlots > roomConfig.slots * 0.8 ? "text-[#FF6B35]" : "text-white"}`}>
                      {usedSlots}/{roomConfig.slots}
                    </span>
                  </div>
                </div>
                <div className={`px-4 py-2 border ${!budgetEarned[selectedRoom || ''] ? 'bg-[#E74C3C]/20 border-[#E74C3C]/50' : 'bg-[#1f1c13] border-[#AEACA1]/30'}`}>
                  <span className="text-[10px] text-[#AEACA1] uppercase tracking-widest block">Budget</span>
                  {!budgetEarned[selectedRoom || ''] ? (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#E74C3C]" />
                      <span className="text-sm font-bold text-[#E74C3C]">
                        Cleanup to unlock ${roomConfig?.budget.toLocaleString()}!
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#1f1c13] border border-[#AEACA1]/20">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${(totalBudget - usedBudget) < 500 ? "text-[#FF6B35]" : "text-green-400"}`}>
                          ${(totalBudget - usedBudget).toLocaleString()}
                        </span>
                        <span className="text-[9px] text-[#AEACA1]">left</span>
                      </div>
                      <span className="text-[9px] text-[#AEACA1]">
                        Total: ${totalBudget.toLocaleString()} | Spent: ${usedBudget.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Room Completion Progress */}
                <div className={`px-4 py-2 border ${isRoomComplete ? 'bg-[#4ECDC4]/20 border-[#4ECDC4]' : 'bg-[#1f1c13] border-[#AEACA1]/30'}`}>
                  <span className="text-[10px] text-[#AEACA1] uppercase tracking-widest block">
                    {isRoomComplete ? '🎉 Room Complete!' : 'Completion'}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1" title="Cleanup Done">
                      <span className={`text-xs ${budgetEarned[selectedRoom || ''] ? 'text-green-400' : 'text-[#AEACA1]'}`}>
                        {budgetEarned[selectedRoom || ''] ? '✓' : '○'} Clean
                      </span>
                    </div>
                    <div className="flex items-center gap-1" title={`Project Level: ${cleanupGameState.projectLevel}/5`}>
                      <span className={`text-xs ${cleanupGameState.projectLevel >= 5 ? 'text-green-400' : 'text-[#AEACA1]'}`}>
                        {cleanupGameState.projectLevel >= 5 ? '✓' : '○'} Project
                      </span>
                    </div>
                    <div className="flex items-center gap-1" title={`Zone Balance: ${zoneBalance}%`}>
                      <span className={`text-xs ${zoneBalance >= 50 ? 'text-green-400' : 'text-[#AEACA1]'}`}>
                        {zoneBalance >= 50 ? '✓' : '○'} Balance
                      </span>
                    </div>
                  </div>
                  {nextRoom && !isRoomComplete && (
                    <span className="text-[9px] text-[#CCAA4C] block mt-1">
                      Complete to unlock {nextRoom.charAt(0).toUpperCase() + nextRoom.slice(1)}!
                    </span>
                  )}
                </div>
                
                {/* WIN CONDITION TRACKER */}
                <div className={`px-4 py-2 border ${levelWon ? 'bg-[#CCAA4C]/30 border-[#CCAA4C]' : cleanupGameState.broomStored ? 'bg-green-500/20 border-green-500' : 'bg-[#1f1c13] border-[#AEACA1]/30'}`}>
                  <span className="text-[10px] text-[#AEACA1] uppercase tracking-widest block">
                    {levelWon ? '🏆 LEVEL WON!' : 'Win Condition'}
                  </span>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${allMoneySpent || canCashOut ? 'text-green-400' : 'text-[#AEACA1]'}`}>
                        {allMoneySpent ? '✓' : canCashOut ? '✓' : '○'} Budget {allMoneySpent ? 'Spent' : canCashOut ? 'Ready' : 'Spent'}
                      </span>
                      {remainingBudget > 0 && (
                        <span className={`text-[9px] ${canCashOut ? 'text-green-400' : 'text-[#FF6B35]'}`}>
                          ${remainingBudget.toLocaleString()} left {canCashOut && !allMoneySpent ? '(can cash out!)' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${hasSlopeTopCabinet ? 'text-green-400' : 'text-[#AEACA1]'}`}>
                        {hasSlopeTopCabinet ? '✓' : '○'} Slope Top Cabinet
                      </span>
                      {!hasSlopeTopCabinet && (
                        <span className="text-[9px] text-[#AEACA1]">($1,399 in Workshop)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${cleanupGameState.hasBroom ? 'text-green-400' : cleanupGameState.broomStored ? 'text-green-400' : 'text-[#AEACA1]'}`}>
                        {cleanupGameState.broomStored ? '✓ Broom Stored!' : cleanupGameState.hasBroom ? '🧹 Broom Ready' : '○ Get Broom (Walk mode)'}
                      </span>
                    </div>
                  </div>
                  
                  {/* STORE BROOM BUTTON - appears when conditions met */}
                  {canWinLevel && (
                    <button
                      onClick={() => handleCleanupAction({ type: 'storeBroom' })}
                      className="mt-2 w-full py-2 bg-[#CCAA4C] text-[#353535] font-bold text-sm uppercase tracking-widest hover:bg-[#FFD700] transition-colors animate-pulse"
                    >
                      🧹 Store Broom & Win! {remainingBudget > 0 ? `(Cash out $${remainingBudget})` : ''} 🏆
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 bg-[#1f1c13] px-4 py-2 border border-[#AEACA1]/20">
              <div className="flex items-center gap-1.5 text-[#CCAA4C]" title="Function">
                <Wrench className="w-4 h-4" />
                <span className="font-bold text-sm">{stats.function}</span>
              </div>
              <div className="w-px h-4 bg-[#AEACA1]/30" />
              <div className="flex items-center gap-1.5 text-[#FF6B35]" title="Cool">
                <Zap className="w-4 h-4" />
                <span className="font-bold text-sm">{stats.cool}</span>
              </div>
              <div className="w-px h-4 bg-[#AEACA1]/30" />
              <div className="flex items-center gap-1.5 text-red-500" title="Security">
                <Shield className="w-4 h-4" />
                <span className="font-bold text-sm">{stats.security}</span>
              </div>
              <div className="w-px h-4 bg-[#AEACA1]/30" />
              <div className="flex items-center gap-1.5 text-purple-400" title="Storage">
                <Package className="w-4 h-4" />
                <span className="font-bold text-sm">{stats.storage}</span>
              </div>
              <div className="w-px h-4 bg-[#AEACA1]/30" />
              <div className="px-3 py-1 bg-[#FF6B35]">
                <span className="text-white font-black text-sm">{grade.grade}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Mode Toggle */}
              <div className="flex bg-[#1f1c13] border border-[#AEACA1]/30">
                <button
                  onClick={() => setEditMode('add')}
                  className={`px-3 py-2 text-xs font-bold uppercase flex items-center gap-1 transition-colors ${
                    editMode === 'add' ? 'bg-[#CCAA4C] text-[#353535]' : 'text-[#AEACA1] hover:text-white'
                  }`}
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
                <button
                  onClick={() => setEditMode('move')}
                  className={`px-3 py-2 text-xs font-bold uppercase flex items-center gap-1 transition-colors ${
                    editMode === 'move' ? 'bg-[#FF6B35] text-white' : 'text-[#AEACA1] hover:text-white'
                  }`}
                >
                  <Move className="w-3 h-3" /> Move
                </button>
                <button
                  onClick={() => setEditMode('walk')}
                  className={`px-3 py-2 text-xs font-bold uppercase flex items-center gap-1 transition-colors ${
                    editMode === 'walk' ? 'bg-[#4ECDC4] text-[#353535]' : 'text-[#AEACA1] hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" /> Walk
                </button>
              </div>

              <button
                onClick={() => setShowMiniGameHub(true)}
                className={`game-btn flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-widest text-xs transition-colors ${
                  hasGamingEquipment 
                    ? 'bg-[#4ECDC4] text-[#353535] hover:bg-[#4ECDC4]/80' 
                    : 'bg-[#AEACA1]/20 text-[#AEACA1] border border-[#AEACA1]/30'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {hasGamingEquipment ? `Arcade (${unlockedGames.length})` : 'Add Gaming Gear'}
                </span>
              </button>
              <button
                onClick={toggleMusic}
                className={`p-2 border transition-colors ${
                  musicEnabled 
                    ? 'border-[#FF6B35] text-[#FF6B35] bg-[#FF6B35]/20 animate-pulse' 
                    : 'border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white'
                }`}
                title={musicEnabled ? "Stop the madness!" : "Play BOSCOTEK theme"}
              >
                {musicEnabled ? <Music2 className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleSound}
                className="p-2 border border-[#AEACA1]/30 text-[#AEACA1] hover:text-white hover:border-white transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={handleComplete}
                className="game-btn bg-[#CCAA4C] text-[#353535] px-4 py-2 font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                Complete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 relative">
            <ManCave3D 
              placedItems={placedItems} 
              roomSize={selectedRoom}
              onItemClick={(instanceId) => {
                // Always select in move mode, or show details in add mode
                if (editMode === 'move') {
                  setSelectedInstanceId(instanceId);
                } else {
                  const instance = placedItems.find(pi => pi.instanceId === instanceId);
                  if (instance) setSelectedItem(instance.item);
                }
              }}
              onItemMove={handleUpdateItemPosition}
              onItemRotate={handleUpdateItemRotation}
              onItemDelete={(instanceId) => {
                handleRemoveItem(instanceId);
                setSelectedInstanceId(null);
              }}
              onDeselect={() => setSelectedInstanceId(null)}
              onOpenGame={(game) => {
                if (unlockedGames.includes(game)) {
                  setActiveGame(game);
                } else {
                  setShowError("Add gaming equipment to unlock!");
                  setTimeout(() => setShowError(null), 2000);
                }
              }}
              selectedInstanceId={selectedInstanceId}
              editMode={editMode}
              characterPosition={characterPosition}
              onCharacterMove={setCharacterPosition}
              cleanupGameState={cleanupGameState}
              onCleanupAction={handleCleanupAction}
              miniGameActive={activeGame !== null}
              hasRollerDoor={placedItems.some(pi => pi.item.id === 'roller-door')}
            />
            
            {/* UNIFIED CONTROLS PANEL */}
            {editMode === 'move' && selectedInstanceId ? (() => {
              const selectedInstance = placedItems.find(pi => pi.instanceId === selectedInstanceId);
              const isWallItem = selectedInstance && WALL_ITEMS.includes(selectedInstance.item.id);
              
              // Room dimensions for collision detection
              const roomDimensions = {
                shed: { width: 8, depth: 6, height: 3.5 },
                garage: { width: 12, depth: 10, height: 4 },
                bunker: { width: 14, depth: 12, height: 4.5 },
                warehouse: { width: 20, depth: 16, height: 6 },
              };
              const room = roomDimensions[selectedRoom || 'shed'];
              const itemMargin = 0.5;
              const wallItemMargin = 0.15;
              
              const clampPosition = (pos: { x: number; y: number; z: number }, forWallItem: boolean) => {
                const margin = forWallItem ? wallItemMargin : itemMargin;
                return {
                  x: Math.max(-room.width / 2 + margin, Math.min(room.width / 2 - margin, pos.x)),
                  y: forWallItem ? Math.max(1.0, Math.min(room.height - 1.0, pos.y)) : 0,
                  z: Math.max(-room.depth / 2 + margin, Math.min(room.depth / 2 - margin, pos.z)),
                };
              };
              
              const moveItem = (dx: number, dy: number, dz: number) => {
                const instance = placedItems.find(pi => pi.instanceId === selectedInstanceId);
                if (instance) {
                  const newPos = {
                    x: instance.position.x + dx,
                    y: instance.position.y + dy,
                    z: instance.position.z + dz,
                  };
                  handleUpdateItemPosition(selectedInstanceId, clampPosition(newPos, !!isWallItem));
                }
              };
              
              const rotateItem = (degrees: number) => {
                const instance = placedItems.find(pi => pi.instanceId === selectedInstanceId);
                if (instance) {
                  handleUpdateItemRotation(selectedInstanceId, (instance.rotation + degrees + 360) % 360);
                }
              };
              
              return (
                <div className="absolute bottom-4 left-4 bg-[#1a1815]/95 backdrop-blur-sm border border-[#FF6B35] rounded-lg overflow-hidden shadow-xl">
                  {/* Header with item info */}
                  <div className="bg-[#FF6B35] px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedInstance?.item.icon}</span>
                      <span className="text-sm font-bold text-white truncate max-w-[120px]">
                        {selectedInstance?.item.name}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedInstanceId(null)}
                      className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 bg-black/20 rounded"
                    >
                      ESC
                    </button>
                  </div>
                  
                  <div className="p-3">
                    {/* Main controls grid */}
                    <div className="flex gap-4">
                      {/* D-Pad for movement */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-[#AEACA1] uppercase mb-1">
                          {isWallItem ? 'Position' : 'Move'}
                        </span>
                        <div className="grid grid-cols-3 gap-0.5">
                          <div />
                          <button
                            onClick={() => isWallItem ? moveItem(0, 0.25, 0) : moveItem(0, 0, -0.5)}
                            className="w-8 h-8 bg-[#252219] border border-[#AEACA1]/30 text-white hover:bg-[#FF6B35] flex items-center justify-center text-sm rounded-t"
                            title={isWallItem ? "Move Up (W)" : "Move Forward (W)"}
                          >
                            ▲
                          </button>
                          <div />
                          <button
                            onClick={() => moveItem(-0.5, 0, 0)}
                            className="w-8 h-8 bg-[#252219] border border-[#AEACA1]/30 text-white hover:bg-[#FF6B35] flex items-center justify-center text-sm rounded-l"
                            title="Move Left (A)"
                          >
                            ◀
                          </button>
                          <div className="w-8 h-8 bg-[#1f1c13] border border-[#AEACA1]/20 flex items-center justify-center text-[8px] text-[#AEACA1]">
                            {isWallItem ? '🖼️' : '📦'}
                          </div>
                          <button
                            onClick={() => moveItem(0.5, 0, 0)}
                            className="w-8 h-8 bg-[#252219] border border-[#AEACA1]/30 text-white hover:bg-[#FF6B35] flex items-center justify-center text-sm rounded-r"
                            title="Move Right (D)"
                          >
                            ▶
                          </button>
                          <div />
                          <button
                            onClick={() => isWallItem ? moveItem(0, -0.25, 0) : moveItem(0, 0, 0.5)}
                            className="w-8 h-8 bg-[#252219] border border-[#AEACA1]/30 text-white hover:bg-[#FF6B35] flex items-center justify-center text-sm rounded-b"
                            title={isWallItem ? "Move Down (S)" : "Move Back (S)"}
                          >
                            ▼
                          </button>
                          <div />
                        </div>
                      </div>
                      
                      {/* Wall items: Depth control */}
                      {isWallItem && (
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-[#AEACA1] uppercase mb-1">Depth</span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveItem(0, 0, -0.5)}
                              className="w-16 h-8 bg-[#252219] border border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white flex items-center justify-center text-[10px] font-bold rounded-t"
                              title="Move to Back Wall (F)"
                            >
                              ↑ BACK
                            </button>
                            <button
                              onClick={() => moveItem(0, 0, 0.5)}
                              className="w-16 h-8 bg-[#252219] border border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-white flex items-center justify-center text-[10px] font-bold rounded-b"
                              title="Move to Front (R)"
                            >
                              ↓ FWD
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Rotate controls */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-[#AEACA1] uppercase mb-1">Rotate</span>
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => rotateItem(-90)}
                            className="w-10 h-16 bg-[#252219] border border-[#CCAA4C]/50 text-[#CCAA4C] hover:bg-[#CCAA4C] hover:text-[#1a1815] flex flex-col items-center justify-center text-xs font-bold rounded-l"
                            title="Rotate Left (Q)"
                          >
                            <span className="text-lg">↺</span>
                            <span className="text-[8px]">Q</span>
                          </button>
                          <button
                            onClick={() => rotateItem(90)}
                            className="w-10 h-16 bg-[#252219] border border-[#CCAA4C]/50 text-[#CCAA4C] hover:bg-[#CCAA4C] hover:text-[#1a1815] flex flex-col items-center justify-center text-xs font-bold rounded-r"
                            title="Rotate Right (E)"
                          >
                            <span className="text-lg">↻</span>
                            <span className="text-[8px]">E</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Delete */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-[#AEACA1] uppercase mb-1">Remove</span>
                        <button
                          onClick={() => {
                            handleRemoveItem(selectedInstanceId);
                            setSelectedInstanceId(null);
                          }}
                          className="w-10 h-16 bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white flex flex-col items-center justify-center rounded"
                          title="Delete Item (DEL)"
                        >
                          <span className="text-lg">🗑️</span>
                          <span className="text-[8px]">DEL</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Keyboard hints */}
                    <div className="mt-2 pt-2 border-t border-[#AEACA1]/20 text-[8px] text-[#AEACA1] text-center">
                      WASD/Arrows move • Q/E rotate • {isWallItem ? 'R/F depth • ' : ''}DEL remove
                    </div>
                  </div>
                </div>
              );
            })() : (
              /* Default hint when no item selected */
              <div className="absolute bottom-4 left-4 bg-[#252219]/90 backdrop-blur border border-[#AEACA1]/20 px-4 py-2 text-[10px] text-[#AEACA1] uppercase tracking-widest rounded">
                {editMode === 'walk' 
                  ? '🚶 WASD/Arrows to walk • Explore your man cave!'
                  : editMode === 'move' 
                    ? '👆 Click an item to select and move it'
                    : '🛒 Click items to add • Drag to rotate view • Scroll to zoom'
                }
              </div>
            )}

            {/* Mini-game unlock hint */}
            {!hasGamingEquipment && (
              <div className="absolute bottom-4 right-4 bg-[#4ECDC4]/20 border border-[#4ECDC4] px-4 py-3 max-w-xs">
                <p className="text-[#4ECDC4] text-xs font-bold uppercase">Unlock Mini-Games!</p>
                <p className="text-white/70 text-[10px] mt-1">Add Racer Arcade, Shooter Arcade, Sim Rig, or Gaming Desk to unlock and play bonus games!</p>
              </div>
            )}
          </div>

          {/* Inventory Sidebar */}
          <div className={`w-80 bg-[#252219] border-l-2 border-[#AEACA1]/20 flex flex-col transition-all ${showInventory ? '' : 'translate-x-full absolute right-0 h-full'}`}>
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-[#252219] border-2 border-r-0 border-[#AEACA1]/20 flex items-center justify-center text-[#AEACA1] hover:text-white"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${showInventory ? 'rotate-90' : '-rotate-90'}`} />
            </button>

            <div className="p-3 border-b border-[#AEACA1]/20">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#CCAA4C] mb-2">Equipment Zones</h3>
              <div className="flex flex-wrap gap-1">
                {roomConfig.zones.map((zone) => {
                  const info = zoneInfo[zone];
                  const zoneItems = placedItems.filter((pi) => pi.item.category === zone);
                  return (
                    <button
                      key={zone}
                      onClick={() => handleZoneChange(zone)}
                      className={`flex items-center gap-1 px-2 py-1 font-bold uppercase tracking-widest text-[10px] transition-all ${
                        activeZone === zone
                          ? "text-[#353535]"
                          : "bg-[#1f1c13] border border-[#AEACA1]/20 text-white hover:border-[#CCAA4C]"
                      }`}
                      style={activeZone === zone ? { backgroundColor: info.color } : {}}
                    >
                      <span>{info.icon}</span>
                      {info.name.replace(" Zone", "")}
                      {zoneItems.length > 0 && (
                        <span className="bg-white/20 px-1 rounded-full text-[9px]">
                          {zoneItems.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#AEACA1] mb-2">
                Available ({availableItems.length})
              </h4>
              
              {availableItems.length > 0 ? (
                <div className="space-y-2">
                  {availableItems.map((item) => {
                    const remainingBudget = totalBudget - usedBudget;
                    const canAfford = item.cost <= remainingBudget;
                    const hasSpace = usedSlots + item.size <= roomConfig.slots;
                    const canAdd = canAfford && hasSpace;
                    const currentCount = getItemCount(item.id);
                    const isStackable = STACKABLE_ITEMS.includes(item.id);
                    const isWallItem = WALL_ITEMS.includes(item.id);
                    
                    // Determine lock reason
                    const lockReason = !canAfford 
                      ? `Need $${(item.cost - remainingBudget).toLocaleString()} more` 
                      : !hasSpace 
                        ? 'No slots left' 
                        : '';
                    
                    return (
                      <div
                        key={item.id}
                        className={`game-item-card bg-[#1f1c13] border border-[#AEACA1]/20 p-3 transition-all ${
                          canAdd ? 'hover:border-[#FF6B35] cursor-pointer' : 'opacity-60'
                        }`}
                        onClick={() => canAdd && handleAddItem(item)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-white text-sm truncate">{item.name}</h5>
                              <div className="flex items-center gap-1">
                                {isWallItem && (
                                  <span className="text-[8px] bg-purple-500/30 text-purple-300 px-1 py-0.5">WALL</span>
                                )}
                                {isStackable && currentCount > 0 && (
                                  <span className="text-[10px] text-[#CCAA4C]">x{currentCount}</span>
                                )}
                                {!canAdd && <Lock className="w-3 h-3 text-red-500" />}
                              </div>
                            </div>
                            <p className="text-[10px] text-white/50 line-clamp-1">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                ${item.cost.toLocaleString()}
                              </span>
                              <span className={`text-[10px] ${hasSpace ? 'text-[#AEACA1]' : 'text-red-400'}`}>
                                {item.size} slot{item.size > 1 ? 's' : ''}
                              </span>
                              {item.category === 'gaming' && (
                                <span className="text-[8px] bg-[#4ECDC4]/30 text-[#4ECDC4] px-1 py-0.5">+GAME</span>
                              )}
                              {lockReason && (
                                <span className="text-[8px] text-red-400 ml-auto">{lockReason}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[#AEACA1]">
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">All items in this zone placed!</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#AEACA1]/20 p-3 max-h-48 overflow-y-auto">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#CCAA4C] mb-2">
                Your Build ({placedItems.length})
              </h4>
              {placedItems.length > 0 ? (
                <div className="space-y-1">
                  {placedItems.map((pi) => (
                    <div
                      key={pi.instanceId}
                      className={`flex items-center gap-2 bg-[#1f1c13] p-2 border transition-all cursor-pointer ${
                        recentlyAdded === pi.instanceId 
                          ? "border-[#FF6B35] animate-pop-in" 
                          : selectedInstanceId === pi.instanceId
                          ? "border-[#4ECDC4]"
                          : "border-transparent hover:border-[#AEACA1]/30"
                      }`}
                      onClick={() => {
                        if (editMode === 'move') {
                          setSelectedInstanceId(pi.instanceId);
                        }
                      }}
                    >
                      {editMode === 'move' && (
                        <GripVertical className="w-3 h-3 text-[#AEACA1]" />
                      )}
                      <span className="text-lg">{pi.item.icon}</span>
                      <span className="flex-1 text-xs font-bold text-white truncate">{pi.item.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(pi.instanceId);
                        }}
                        className="text-[#AEACA1] hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#AEACA1] text-xs text-center py-2">Click items to add them</p>
              )}
            </div>
          </div>
        </div>

        {/* VICTORY MODAL */}
        {levelWon && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
            <div className="bg-[#252219] border-4 border-[#CCAA4C] max-w-2xl w-full text-center animate-pop-in">
              <div className="bg-gradient-to-r from-[#CCAA4C]/30 via-[#FFD700]/20 to-[#CCAA4C]/30 p-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 
                  className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#CCAA4C] mb-2"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  Level Complete!
                </h2>
                <p className="text-xl text-white/90 mb-4">
                  You&apos;ve built the ultimate man cave!
                </p>
                <div className="flex justify-center gap-4 text-sm text-[#AEACA1]">
                  <span>💰 Budget: ${totalBudget.toLocaleString()}</span>
                  <span>•</span>
                  <span>📦 Items: {placedItems.length}</span>
                  <span>•</span>
                  <span>⭐ Rating: {grade.grade}</span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#1f1c13] p-4 border border-[#AEACA1]/20">
                    <div className="text-2xl font-bold text-[#CCAA4C]">{stats.function}</div>
                    <div className="text-[10px] text-[#AEACA1] uppercase">Function</div>
                  </div>
                  <div className="bg-[#1f1c13] p-4 border border-[#AEACA1]/20">
                    <div className="text-2xl font-bold text-[#FF6B35]">{stats.cool}</div>
                    <div className="text-[10px] text-[#AEACA1] uppercase">Cool</div>
                  </div>
                  <div className="bg-[#1f1c13] p-4 border border-[#AEACA1]/20">
                    <div className="text-2xl font-bold text-[#E74C3C]">{stats.security}</div>
                    <div className="text-[10px] text-[#AEACA1] uppercase">Security</div>
                  </div>
                  <div className="bg-[#1f1c13] p-4 border border-[#AEACA1]/20">
                    <div className="text-2xl font-bold text-[#4ECDC4]">{stats.storage}</div>
                    <div className="text-[10px] text-[#AEACA1] uppercase">Storage</div>
                  </div>
                </div>
                
                <div className="text-[#CCAA4C] text-lg font-bold mb-2">
                  🧹 Broom safely stored in the Slope Top Cabinet!
                </div>
                <p className="text-[#AEACA1] text-sm mb-6">
                  A tidy shed is a ready shed. Disorder delays greatness.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setLevelWon(false)}
                    className="px-8 py-3 bg-[#1f1c13] border-2 border-[#AEACA1] text-white font-bold uppercase tracking-widest hover:border-[#CCAA4C] transition-colors"
                  >
                    Continue Building
                  </button>
                  {nextRoom && (
                    <button
                      onClick={() => {
                        setLevelWon(false);
                        handleRoomSelect(nextRoom as RoomSize);
                      }}
                      className="px-8 py-3 bg-[#CCAA4C] text-[#353535] font-bold uppercase tracking-widest hover:bg-[#FFD700] transition-colors"
                    >
                      Next Room →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mini-Game Hub Modal */}
        {showMiniGameHub && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setShowMiniGameHub(false)}
          >
            <div 
              className="bg-[#252219] border-4 border-[#4ECDC4] max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 
                      className="text-2xl font-black uppercase tracking-tight text-white"
                      style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                    >
                      <Gamepad2 className="inline w-6 h-6 mr-2 text-[#4ECDC4]" />
                      Arcade Zone
                    </h3>
                    <p className="text-[#AEACA1] text-sm">
                      {hasGamingEquipment 
                        ? "Play mini-games to earn bonus budget!" 
                        : "Add gaming equipment to unlock games!"
                      }
                    </p>
                  </div>
                  <button onClick={() => setShowMiniGameHub(false)} className="text-[#AEACA1] hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'racer', name: 'Retro Racer', icon: Gamepad2, color: '#FF6B35', unlock: 'Racer Arcade or Sim Rig', recommend: null },
                    { id: 'shooter', name: 'Target Practice', icon: Crosshair, color: '#CCAA4C', unlock: 'Shooter Arcade or VR+Security', recommend: 'security' },
                    { id: 'reaction', name: 'Reaction Test', icon: Zap, color: '#4ECDC4', unlock: 'Gaming Desk or Arcade Cabinet', recommend: null },
                  ].map((game) => {
                    const isUnlocked = unlockedGames.includes(game.id);
                    const Icon = game.icon;
                    return (
                      <button
                        key={game.id}
                        onClick={() => {
                          if (isUnlocked) {
                            setShowMiniGameHub(false);
                            setActiveGame(game.id);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`p-4 transition-colors group relative ${
                          isUnlocked 
                            ? `bg-[${game.color}]/20 border-2 border-[${game.color}] hover:bg-[${game.color}]/30`
                            : 'bg-[#1f1c13] border-2 border-[#AEACA1]/20 cursor-not-allowed'
                        }`}
                        style={{ 
                          backgroundColor: isUnlocked ? `${game.color}20` : undefined,
                          borderColor: isUnlocked ? game.color : undefined
                        }}
                      >
                        {!isUnlocked && (
                          <Lock className="absolute top-2 right-2 w-4 h-4 text-[#AEACA1]" />
                        )}
                        <Icon 
                          className={`w-10 h-10 mx-auto mb-2 transition-transform ${
                            isUnlocked ? 'group-hover:scale-110' : 'opacity-30'
                          }`}
                          style={{ color: isUnlocked ? game.color : '#AEACA1' }}
                        />
                        <span className={`font-bold text-sm block ${isUnlocked ? 'text-white' : 'text-[#AEACA1]'}`}>
                          {game.name}
                        </span>
                        {isUnlocked ? (
                          <span className="text-[#AEACA1] text-[10px]">
                            High: {game.id === 'reaction' 
                              ? (highScores.reaction ? `${highScores.reaction}ms` : '—')
                              : highScores[game.id as 'racer' | 'shooter']
                            }
                          </span>
                        ) : (
                          <span className="text-[#AEACA1] text-[9px] block mt-1">
                            Needs: {game.unlock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Target Practice Requirement - needs security gear */}
                {!placedItems.some(pi => pi.item.category === 'security') && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500 flex items-center gap-4">
                    <Shield className="w-10 h-10 text-red-500 shrink-0" />
                    <div>
                      <p className="text-red-400 text-xs font-bold uppercase">Target Practice Requires Security Gear!</p>
                      <p className="text-white/70 text-[10px] mt-1">
                        Add <span className="text-red-400 font-bold">Weapons Storage</span> from the Security zone to unlock the shooting range!
                      </p>
                      <button
                        onClick={() => {
                          setShowMiniGameHub(false);
                          setActiveZone('security');
                        }}
                        className="mt-2 text-red-400 text-[10px] font-bold uppercase hover:text-red-300"
                      >
                        → Browse Security Equipment
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-[#1f1c13] border border-[#AEACA1]/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#CCAA4C] text-xs uppercase tracking-widest mb-1">Bonus Budget Earned</p>
                      <p className="text-white text-2xl font-black">${bonusBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#AEACA1] text-xs uppercase tracking-widest mb-1">Games Unlocked</p>
                      <p className="text-[#4ECDC4] text-2xl font-black">{unlockedGames.length}/3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedItem(null)}
          >
            <div 
              className="bg-[#252219] border-4 border-[#AEACA1]/30 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedItem.icon}</span>
                    <div>
                      <h3 
                        className="text-2xl font-black uppercase tracking-tight text-white"
                        style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                      >
                        {selectedItem.name}
                      </h3>
                      <span className="text-green-400 font-bold">
                        ${selectedItem.cost.toLocaleString()}
                      </span>
                      {WALL_ITEMS.includes(selectedItem.id) && (
                        <span className="ml-2 text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5">Wall Mount</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="text-[#AEACA1] hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-white/80 mb-6">{selectedItem.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { key: 'function', label: 'Function', color: '#CCAA4C' },
                    { key: 'cool', label: 'Cool', color: '#FF6B35' },
                    { key: 'security', label: 'Security', color: '#E74C3C' },
                    { key: 'storage', label: 'Storage', color: '#9B59B6' },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="bg-[#1f1c13] p-3">
                      <span className="text-[10px] text-[#AEACA1] uppercase tracking-widest">{label}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-[#AEACA1]/20">
                          <div 
                            className="h-full transition-all" 
                            style={{ 
                              width: `${selectedItem.stats[key as keyof typeof selectedItem.stats] * 10}%`,
                              backgroundColor: color 
                            }} 
                          />
                        </div>
                        <span className="text-white font-bold text-sm">
                          {selectedItem.stats[key as keyof typeof selectedItem.stats]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedItem.category === 'gaming' && (
                  <div className="bg-[#4ECDC4]/10 border border-[#4ECDC4] p-4 mb-6">
                    <p className="text-[#4ECDC4] text-xs font-bold uppercase">Unlocks Mini-Game!</p>
                    <p className="text-white/70 text-sm mt-1">Adding this item will unlock arcade games to earn bonus budget.</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    handleAddItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="w-full bg-[#FF6B35] text-white py-3 font-bold uppercase tracking-widest hover:bg-[#CCAA4C] transition-colors"
                >
                  Add to Build
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mini-games */}
        {activeGame === "racer" && (
          <RetroRacer
            onClose={() => setActiveGame(null)}
            onScore={(score) => handleMiniGameScore("racer", score)}
          />
        )}
        {activeGame === "shooter" && (
          <TargetShooter
            onClose={() => setActiveGame(null)}
            onScore={(score) => handleMiniGameScore("shooter", score)}
          />
        )}
        {activeGame === "reaction" && (
          <ReactionTest
            onClose={() => setActiveGame(null)}
            onScore={(score) => handleMiniGameScore("reaction", score)}
          />
        )}
      </div>
    );
  }

  // COMPLETE SCREEN
  if (gameState === "complete") {
    const boscotekItems = placedItems.filter((pi) => pi.item.brand === "boscotek");
    const weaponssItems = placedItems.filter((pi) => pi.item.brand === "weaponss");

    return (
      <div className="min-h-screen relative p-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/mancave-bg.png" alt="Man Cave Background" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1f1c13] via-[#1f1c13]/90 to-[#1f1c13]" />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-50px`,
                animation: `confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                opacity: 0.5,
              }}
            >
              {['🎉', '⭐', '🏆', '🔧', '🎮', '✨'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto relative z-20">
          <div className="text-center mb-10 animate-slide-up">
            <div className="inline-block bg-[#FF6B35] px-8 py-3 mb-6 -rotate-1 animate-bounce-in shadow-lg">
              <span className="text-white text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Build Complete
                <Trophy className="w-6 h-6" />
              </span>
            </div>
            <h1 
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4"
              style={{ fontFamily: "var(--font-oswald), sans-serif" }}
            >
              {player.name}'s Cave Is
              <br />
              <span className="text-[#CCAA4C] drop-shadow-[0_0_20px_rgba(204,170,76,0.5)]">{grade.label}</span>
            </h1>
          </div>

          <div className="flex justify-center mb-10">
            <div className="relative animate-grade-reveal">
              <div className="w-36 h-36 bg-gradient-to-br from-[#FF6B35] to-[#CCAA4C] rounded-full flex items-center justify-center border-8 border-white/20 shadow-[0_0_60px_rgba(255,107,53,0.5)]">
                <span 
                  className="text-7xl font-black text-white drop-shadow-lg"
                  style={{ fontFamily: "var(--font-oswald), sans-serif" }}
                >
                  {grade.grade}
                </span>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-[#CCAA4C] animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-8 h-8 text-[#FF6B35] animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#252219]/90 backdrop-blur border-4 border-[#CCAA4C] p-8 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-center text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-6">
              Final Stats
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#CCAA4C]/20 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-[#CCAA4C]" />
                </div>
                <p className="text-3xl font-black text-white">{stats.function}</p>
                <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Function</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#FF6B35]/20 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <p className="text-3xl font-black text-white">{stats.cool}</p>
                <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Cool</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-3xl font-black text-white">{stats.security}</p>
                <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Security</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-3xl font-black text-white">{stats.storage}</p>
                <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Storage</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#FF6B35]/30 rounded-full flex items-center justify-center animate-pulse">
                  <Star className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <p className="text-3xl font-black text-[#FF6B35]">{stats.atomicRating}</p>
                <p className="text-[10px] text-[#AEACA1] uppercase tracking-widest">Atomic</p>
              </div>
            </div>
          </div>

          {/* High Scores */}
          {(highScores.racer > 0 || highScores.shooter > 0 || highScores.reaction) && (
            <div className="bg-[#252219]/90 backdrop-blur border-2 border-[#4ECDC4] p-6 mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#4ECDC4] mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Mini-Game High Scores
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {highScores.racer > 0 && (
                  <div className="bg-[#1f1c13] p-3 text-center">
                    <p className="text-[#FF6B35] text-2xl font-black">{highScores.racer}</p>
                    <p className="text-[10px] text-[#AEACA1] uppercase">Retro Racer</p>
                  </div>
                )}
                {highScores.shooter > 0 && (
                  <div className="bg-[#1f1c13] p-3 text-center">
                    <p className="text-[#CCAA4C] text-2xl font-black">{highScores.shooter}</p>
                    <p className="text-[10px] text-[#AEACA1] uppercase">Target Practice</p>
                  </div>
                )}
                {highScores.reaction && (
                  <div className="bg-[#1f1c13] p-3 text-center">
                    <p className="text-[#4ECDC4] text-2xl font-black">{highScores.reaction}ms</p>
                    <p className="text-[10px] text-[#AEACA1] uppercase">Reaction Test</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Summary */}
          <div className="bg-[#252219]/90 backdrop-blur border-2 border-[#AEACA1]/30 p-6 mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
              Your Equipment ({placedItems.length} items • ${usedBudget.toLocaleString()})
            </h3>
            <div className="flex flex-wrap gap-2">
              {placedItems.map((pi) => (
                <div key={pi.instanceId} className="bg-[#1f1c13] px-3 py-2 flex items-center gap-2">
                  <span className="text-xl">{pi.item.icon}</span>
                  <span className="text-xs text-white font-bold">{pi.item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="bg-[#252219]/90 backdrop-blur border-2 border-[#CCAA4C] p-6 mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#CCAA4C] mb-4">
                Achievements Unlocked ({achievements.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <div key={a} className="bg-[#CCAA4C]/20 border border-[#CCAA4C] px-3 py-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#CCAA4C]" />
                    <span className="text-xs text-white font-bold capitalize">{a.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Products */}
          {(boscotekItems.length > 0 || weaponssItems.length > 0) && (
            <div className="space-y-4 mb-10">
              <h3 className="text-center text-sm font-black uppercase tracking-widest text-[#CCAA4C]">
                Recommended Real Equipment
              </h3>

              {boscotekItems.length > 0 && (
                <div className="bg-[#CCAA4C]/10 border-2 border-[#CCAA4C] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-[#CCAA4C] uppercase tracking-widest">Industrial Storage</span>
                      <h4 className="text-xl font-black text-white">Boscotek Workshop Solutions</h4>
                    </div>
                    <span className="text-3xl">🏭</span>
                  </div>
                  <a
                    href="https://boscotek.com.au/our-products/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#CCAA4C] text-[#353535] px-6 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    View Products <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {weaponssItems.length > 0 && (
                <div className="bg-red-500/10 border-2 border-red-500 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-red-500 uppercase tracking-widest">Certified Secure</span>
                      <h4 className="text-xl font-black text-white">WeaponsS Security Solutions</h4>
                    </div>
                    <span className="text-3xl">🔐</span>
                  </div>
                  <a
                    href="https://weaponss.com.au/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-red-400 transition-colors"
                  >
                    View Security <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetGame}
              className="game-btn flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#CCAA4C] transition-colors shadow-[0_0_30px_rgba(255,107,53,0.3)]"
            >
              <RotateCcw className="w-5 h-5" />
              Build Again
            </button>
            <button
              onClick={() => gameAudio.playClick()}
              className="game-btn flex items-center justify-center gap-2 border-2 border-white/30 text-white px-10 py-4 font-bold uppercase tracking-widest hover:border-white hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Build
            </button>
          </div>

          <p className="text-center mt-10 text-[#AEACA1]/60 text-xs uppercase tracking-widest">
            Certified by the Atomic Tawk Bureau of Shed Construction
          </p>
        </div>
      </div>
    );
  }

  return null;
}
