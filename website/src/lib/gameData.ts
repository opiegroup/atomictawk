// Man Cave Commander Game Data

export type RoomSize = "shed" | "garage" | "bunker" | "warehouse";
export type Zone = "workshop" | "gaming" | "bar" | "display" | "security";
export type Brand = "boscotek" | "weaponss" | "generic";

export interface GameItem {
  id: string;
  name: string;
  category: Zone;
  description: string;
  stats: {
    function: number;
    cool: number;
    security: number;
    storage: number;
  };
  cost: number;
  size: number; // slots required
  brand: Brand;
  productLink?: string;
  productName?: string;
  icon: string;
  synergies?: string[]; // IDs of items that boost this one
  conflicts?: string[]; // IDs of items that conflict
}

export interface RoomConfig {
  id: RoomSize;
  name: string;
  description: string;
  slots: number;
  budget: number;
  zones: Zone[];
}

export const roomConfigs: RoomConfig[] = [
  {
    id: "shed",
    name: "Small Shed",
    description: "Compact 3x3m workspace. Perfect for starting out.",
    slots: 50,
    budget: 5000,
    zones: ["workshop", "gaming", "display", "security"],
  },
  {
    id: "garage",
    name: "Double Garage",
    description: "6x6m of prime real estate. Room to grow.",
    slots: 75,
    budget: 15000,
    zones: ["workshop", "gaming", "display", "security"],
  },
  {
    id: "bunker",
    name: "Underground Bunker",
    description: "Serious setup for serious blokes. 8x8m fortified.",
    slots: 100,
    budget: 35000,
    zones: ["workshop", "gaming", "bar", "display", "security"],
  },
  {
    id: "warehouse",
    name: "Warehouse",
    description: "The ultimate man cave. 15x10m industrial space.",
    slots: 150,
    budget: 75000,
    zones: ["workshop", "gaming", "bar", "display", "security"],
  },
];

export const gameItems: GameItem[] = [
  // WORKSHOP ZONE - Boscotek
  {
    id: "workbench-hd",
    name: "Heavy Duty Workbench",
    category: "workshop",
    description: "Industrial-grade steel workbench. Built to last generations.",
    stats: { function: 9, cool: 6, security: 3, storage: 5 },
    cost: 1899,
    size: 2,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Industrial Workbench",
    icon: "🔧",
    synergies: ["tool-cabinet", "tool-wall"],
  },
  {
    id: "workbench-hilo",
    name: "Hi-Lo Adjustable Bench",
    category: "workshop",
    description: "Electric height-adjustable workstation. Work standing or seated.",
    stats: { function: 10, cool: 8, security: 3, storage: 4 },
    cost: 3499,
    size: 2,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Hi-Lo Workbench",
    icon: "⚡",
    synergies: ["tool-cabinet"],
  },
  {
    id: "tool-cabinet",
    name: "Tool Drawer Cabinet",
    category: "workshop",
    description: "High-density drawer system. Every tool in its place.",
    stats: { function: 7, cool: 5, security: 6, storage: 10 },
    cost: 2499,
    size: 1,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek High Density Cabinet",
    icon: "🗄️",
    synergies: ["workbench-hd", "workbench-hilo"],
  },
  {
    id: "tool-wall",
    name: "Tool Wall Panel",
    category: "workshop",
    description: "Modular wall-mounted tool storage with twist-lock hooks.",
    stats: { function: 6, cool: 7, security: 2, storage: 8 },
    cost: 899,
    size: 1,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Visual Tool Storage",
    icon: "🔨",
    synergies: ["workbench-hd"],
  },
  {
    id: "mobile-cabinet",
    name: "Mobile Tool Chest",
    category: "workshop",
    description: "Roll-around cabinet. Take your tools to the job.",
    stats: { function: 8, cool: 6, security: 5, storage: 7 },
    cost: 1599,
    size: 1,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Mobile Cabinet",
    icon: "🛒",
  },
  {
    id: "industrial-cupboard",
    name: "Industrial Cupboard",
    category: "workshop",
    description: "Heavy-duty enclosed storage. Keeps the mess hidden.",
    stats: { function: 5, cool: 4, security: 7, storage: 9 },
    cost: 1299,
    size: 1,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Industrial Cupboard",
    icon: "📦",
  },
  {
    id: "slope-top-cupboard",
    name: "Slope Top Cupboard",
    category: "workshop",
    description: "Angled top prevents dust and clutter from piling up.",
    stats: { function: 5, cool: 5, security: 7, storage: 8 },
    cost: 1399,
    size: 1,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Slope Top Cupboard",
    icon: "📐",
  },
  {
    id: "roller-door",
    name: "Industrial Roller Door",
    category: "workshop",
    description: "Heavy-duty roll-up door. Let your project drive out when complete!",
    stats: { function: 8, cool: 7, security: 6, storage: 0 },
    cost: 600,
    size: 1,
    brand: "generic",
    icon: "🚪",
  },
  {
    id: "pegboard",
    name: "Basic Pegboard",
    category: "workshop",
    description: "Simple wall organizer. Hang your tools!",
    stats: { function: 4, cool: 3, security: 1, storage: 5 },
    cost: 75,
    size: 1,
    brand: "generic",
    icon: "📌",
  },
  {
    id: "folding-table",
    name: "Folding Work Table",
    category: "workshop",
    description: "Portable workspace. Folds flat when not needed.",
    stats: { function: 5, cool: 2, security: 1, storage: 2 },
    cost: 100,
    size: 1,
    brand: "generic",
    icon: "🪜",
  },

  // SECURITY ZONE - WeaponsS
  {
    id: "padlock-box",
    name: "Padlock Storage Box",
    category: "security",
    description: "Basic lockable box. Better than nothing!",
    stats: { function: 2, cool: 2, security: 4, storage: 2 },
    cost: 60,
    size: 1,
    brand: "generic",
    icon: "🔒",
  },
  {
    id: "key-safe",
    name: "Wall Key Safe",
    category: "security",
    description: "Keep your keys organized and secure.",
    stats: { function: 3, cool: 3, security: 5, storage: 1 },
    cost: 85,
    size: 1,
    brand: "generic",
    icon: "🔑",
  },
  {
    id: "pistol-cabinet",
    name: "Pistol Cabinet",
    category: "security",
    description: "Certified secure pistol storage. Dual-key BI-LOCK system.",
    stats: { function: 4, cool: 7, security: 10, storage: 6 },
    cost: 2899,
    size: 1,
    brand: "weaponss",
    productLink: "https://weaponss.com.au/",
    productName: "WeaponsS Pistol Cabinet",
    icon: "🔫",
    synergies: ["ammo-vault"],
  },
  {
    id: "secure-locker",
    name: "Secure Personal Locker",
    category: "security",
    description: "Individual modular locker with dual-lock security.",
    stats: { function: 5, cool: 6, security: 9, storage: 5 },
    cost: 1499,
    size: 1,
    brand: "weaponss",
    productLink: "https://weaponss.com.au/",
    productName: "WeaponsS Individual Locker",
    icon: "🔒",
  },
  {
    id: "belt-locker",
    name: "Belt & Gear Locker",
    category: "security",
    description: "6-door appointment locker for duty belts and gear.",
    stats: { function: 6, cool: 5, security: 8, storage: 7 },
    cost: 2199,
    size: 2,
    brand: "weaponss",
    productLink: "https://weaponss.com.au/",
    productName: "WeaponsS Belt Locker",
    icon: "🎒",
  },
  {
    id: "ammo-vault",
    name: "Ammunition Vault",
    category: "security",
    description: "Reinforced steel ammunition storage. Maximum security.",
    stats: { function: 3, cool: 8, security: 10, storage: 4 },
    cost: 1899,
    size: 1,
    brand: "weaponss",
    productLink: "https://weaponss.com.au/",
    productName: "WeaponsS Secure Cabinet",
    icon: "💥",
    synergies: ["pistol-cabinet"],
  },

  // GAMING ZONE
  {
    id: "retro-console",
    name: "Retro Console Setup",
    category: "gaming",
    description: "Classic gaming console with CRT TV. Budget-friendly gaming!",
    stats: { function: 4, cool: 6, security: 1, storage: 1 },
    cost: 250,
    size: 1,
    brand: "generic",
    icon: "🎮",
  },
  {
    id: "handheld-station",
    name: "Handheld Gaming Station",
    category: "gaming",
    description: "Charging dock and display for portable gaming.",
    stats: { function: 3, cool: 5, security: 1, storage: 2 },
    cost: 150,
    size: 1,
    brand: "generic",
    icon: "📱",
  },
  {
    id: "folding-chair-gaming",
    name: "Folding Gaming Chair",
    category: "gaming",
    description: "Basic but comfy. Everyone starts somewhere!",
    stats: { function: 2, cool: 3, security: 0, storage: 0 },
    cost: 50,
    size: 1,
    brand: "generic",
    icon: "🪑",
  },
  {
    id: "sim-rig",
    name: "Racing Simulator Rig",
    category: "gaming",
    description: "Full cockpit sim racing setup. Feel every corner.",
    stats: { function: 5, cool: 10, security: 1, storage: 2 },
    cost: 3500,
    size: 3,
    brand: "generic",
    icon: "🏎️",
    synergies: ["gaming-desk"],
  },
  {
    id: "gaming-desk",
    name: "Gaming Command Center",
    category: "gaming",
    description: "Multi-monitor desk setup with cable management.",
    stats: { function: 7, cool: 9, security: 2, storage: 4 },
    cost: 1200,
    size: 2,
    brand: "generic",
    icon: "🖥️",
  },
  {
    id: "arcade-cabinet",
    name: "Retro Arcade Cabinet",
    category: "gaming",
    description: "Classic arcade machine. 1000+ games built in.",
    stats: { function: 4, cool: 10, security: 1, storage: 1 },
    cost: 2500,
    size: 1,
    brand: "generic",
    icon: "🕹️",
  },
  {
    id: "racer-cabinet",
    name: "Retro Racer Arcade",
    category: "gaming",
    description: "Classic racing arcade. Compete for high scores!",
    stats: { function: 6, cool: 10, security: 1, storage: 1 },
    cost: 1800,
    size: 1,
    brand: "generic",
    icon: "🏎️",
  },
  {
    id: "shooter-cabinet",
    name: "Target Practice Arcade",
    category: "gaming",
    description: "Precision shooting arcade. Test your aim!",
    stats: { function: 6, cool: 9, security: 3, storage: 1 },
    cost: 2000,
    size: 1,
    brand: "generic",
    icon: "🎯",
  },
  {
    id: "vr-station",
    name: "VR Play Station",
    category: "gaming",
    description: "Dedicated VR gaming area with room-scale tracking.",
    stats: { function: 6, cool: 9, security: 2, storage: 3 },
    cost: 1800,
    size: 2,
    brand: "generic",
    icon: "🥽",
  },

  // BAR ZONE
  {
    id: "esky",
    name: "Classic Esky",
    category: "bar",
    description: "Keeps your drinks cold. Aussie essential!",
    stats: { function: 4, cool: 5, security: 0, storage: 3 },
    cost: 45,
    size: 1,
    brand: "generic",
    icon: "🧊",
  },
  {
    id: "milk-crate-seats",
    name: "Milk Crate Seats (4)",
    category: "bar",
    description: "The original budget seating. Classic!",
    stats: { function: 3, cool: 4, security: 0, storage: 1 },
    cost: 20,
    size: 1,
    brand: "generic",
    icon: "📦",
  },
  {
    id: "mini-fridge",
    name: "Mini Bar Fridge",
    category: "bar",
    description: "Compact fridge for a few coldies.",
    stats: { function: 5, cool: 5, security: 1, storage: 3 },
    cost: 150,
    size: 1,
    brand: "generic",
    icon: "🍻",
  },
  {
    id: "bar-fridge",
    name: "Industrial Bar Fridge",
    category: "bar",
    description: "Glass-door beverage fridge. Always cold, always ready.",
    stats: { function: 8, cool: 8, security: 2, storage: 6 },
    cost: 1200,
    size: 1,
    brand: "generic",
    icon: "🍺",
  },
  {
    id: "bar-counter",
    name: "Custom Bar Counter",
    category: "bar",
    description: "Built-in bar with sink and bottle storage.",
    stats: { function: 7, cool: 10, security: 3, storage: 5 },
    cost: 3500,
    size: 3,
    brand: "generic",
    icon: "🍸",
    synergies: ["bar-fridge", "bar-stools"],
  },
  {
    id: "bar-stools",
    name: "Industrial Bar Stools (4)",
    category: "bar",
    description: "Heavy-duty steel stools. Built for blokes.",
    stats: { function: 6, cool: 7, security: 1, storage: 1 },
    cost: 800,
    size: 1,
    brand: "generic",
    icon: "🪑",
    synergies: ["bar-counter"],
  },
  {
    id: "kegerator",
    name: "Dual Tap Kegerator",
    category: "bar",
    description: "Two kegs on tap. The dream.",
    stats: { function: 9, cool: 10, security: 2, storage: 3 },
    cost: 2200,
    size: 1,
    brand: "generic",
    icon: "🍻",
    synergies: ["bar-counter"],
  },

  // DISPLAY ZONE
  {
    id: "helmet-rack",
    name: "Helmet Display Rack",
    category: "display",
    description: "Wall-mounted helmet showcase. Show off your lids.",
    stats: { function: 3, cool: 8, security: 2, storage: 4 },
    cost: 450,
    size: 1,
    brand: "generic",
    icon: "⛑️",
  },
  {
    id: "trophy-shelf",
    name: "Trophy & Memorabilia Shelf",
    category: "display",
    description: "Lit display shelving for your wins.",
    stats: { function: 2, cool: 9, security: 3, storage: 5 },
    cost: 650,
    size: 1,
    brand: "generic",
    icon: "🏆",
  },
  {
    id: "neon-sign",
    name: "Custom Neon Sign",
    category: "display",
    description: "Personalised neon. Make it yours.",
    stats: { function: 1, cool: 10, security: 1, storage: 0 },
    cost: 800,
    size: 1,
    brand: "generic",
    icon: "💡",
  },
  {
    id: "wall-art",
    name: "Atomic Propaganda Posters",
    category: "display",
    description: "Vintage-style wall art. Set the mood.",
    stats: { function: 1, cool: 8, security: 1, storage: 0 },
    cost: 80,
    size: 1,
    brand: "generic",
    icon: "🖼️",
  },
  {
    id: "poster-hang-in-there",
    name: "Hang In There Poster",
    category: "display",
    description: "Mechanical Morale Division approved. Failure is temporary. The shed is forever.",
    stats: { function: 2, cool: 9, security: 1, storage: 0 },
    cost: 45,
    size: 1,
    brand: "generic",
    icon: "🔧",
  },
  {
    id: "poster-tidy-shed",
    name: "Tidy Shed Poster",
    category: "display",
    description: "A tidy shed is a ready shed. Disorder delays greatness.",
    stats: { function: 3, cool: 9, security: 1, storage: 0 },
    cost: 45,
    size: 1,
    brand: "generic",
    icon: "🧹",
  },
  {
    id: "poster-build-cave",
    name: "Build Your Cave Poster",
    category: "display",
    description: "Build your cave. Defend your peace. Approved for bloke occupancy.",
    stats: { function: 1, cool: 10, security: 2, storage: 0 },
    cost: 45,
    size: 1,
    brand: "generic",
    icon: "🏠",
  },
  {
    id: "string-lights",
    name: "LED String Lights",
    category: "display",
    description: "Cheap mood lighting. Instant vibe upgrade!",
    stats: { function: 1, cool: 5, security: 0, storage: 0 },
    cost: 25,
    size: 1,
    brand: "generic",
    icon: "💡",
  },
  {
    id: "poster-frame",
    name: "Framed Poster",
    category: "display",
    description: "Your favorite band/car/game. Show it off!",
    stats: { function: 0, cool: 4, security: 0, storage: 0 },
    cost: 35,
    size: 1,
    brand: "generic",
    icon: "🎨",
  },
  {
    id: "display-cabinet",
    name: "Glass Display Cabinet",
    category: "display",
    description: "Lit glass cabinet for collectibles.",
    stats: { function: 3, cool: 8, security: 5, storage: 6 },
    cost: 1100,
    size: 1,
    brand: "boscotek",
    productLink: "https://boscotek.com.au/our-products/",
    productName: "Boscotek Display Storage",
    icon: "✨",
  },
];

export const zoneInfo: Record<Zone, { name: string; icon: string; color: string }> = {
  workshop: { name: "Workshop Zone", icon: "🧰", color: "#CCAA4C" },
  gaming: { name: "Gaming Zone", icon: "🎮", color: "#FF6B35" },
  bar: { name: "Bar & Fridge Zone", icon: "🍺", color: "#4ECDC4" },
  display: { name: "Display Zone", icon: "🏆", color: "#9B59B6" },
  security: { name: "Security Zone", icon: "🔐", color: "#E74C3C" },
};

export function calculateStats(items: GameItem[]) {
  const base = { function: 0, cool: 0, security: 0, storage: 0 };
  
  items.forEach((item) => {
    base.function += item.stats.function;
    base.cool += item.stats.cool;
    base.security += item.stats.security;
    base.storage += item.stats.storage;
    
    // Synergy bonuses
    if (item.synergies) {
      item.synergies.forEach((synergyId) => {
        if (items.find((i) => i.id === synergyId)) {
          base.function += 2;
          base.cool += 1;
        }
      });
    }
  });
  
  // Calculate atomic rating based on total stats vs a reasonable target
  // Target: ~200 total stat points for a "perfect" build
  const total = base.function + base.cool + base.security + base.storage;
  const targetTotal = 150; // A good build should aim for this
  const atomicRating = Math.min(10, Math.max(1, Math.round((total / targetTotal) * 10)));
  
  // If no items, rating is 0
  if (items.length === 0) {
    return { ...base, atomicRating: 0 };
  }
  
  return { ...base, atomicRating };
}

export function getGrade(atomicRating: number): { grade: string; label: string } {
  if (atomicRating >= 9) return { grade: "S", label: "LEGENDARY" };
  if (atomicRating >= 8) return { grade: "A", label: "APPROVED" };
  if (atomicRating >= 6) return { grade: "B", label: "SOLID" };
  if (atomicRating >= 4) return { grade: "C", label: "BASIC" };
  return { grade: "D", label: "NEEDS WORK" };
}
