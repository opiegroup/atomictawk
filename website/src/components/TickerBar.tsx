import { Zap, AlertTriangle, Wrench, Gamepad2 } from "lucide-react";

interface TickerItem {
  icon: "bolt" | "warning" | "construction" | "gaming";
  text: string;
  highlight?: boolean;
}

const defaultItems: TickerItem[] = [
  { icon: "bolt", text: "SIGNAL STRENGTH: OPTIMAL", highlight: true },
  { icon: "warning", text: "CAUTION: HIGH OCTANE CONTENT AHEAD", highlight: false },
  { icon: "construction", text: "NEW BUILD LOG: THE RUST-BUCKET SPECIAL", highlight: true },
  { icon: "gaming", text: "GAMING UPDATE: WASTELAND CHRONICLES V2.0", highlight: false },
];

const iconMap = {
  bolt: Zap,
  warning: AlertTriangle,
  construction: Wrench,
  gaming: Gamepad2,
};

interface TickerBarProps {
  items?: TickerItem[];
}

export function TickerBar({ items = defaultItems }: TickerBarProps) {
  // Double items for seamless loop
  const allItems = [...items, ...items];

  return (
    <div className="bg-[#353535] py-3 border-b-4 border-[#CCAA4C] overflow-hidden whitespace-nowrap">
      <div className="animate-marquee flex gap-20 items-center">
        {allItems.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <div
              key={index}
              className={`flex items-center gap-4 font-bold uppercase tracking-widest text-sm ${
                item.highlight ? "text-[#CCAA4C]" : "text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
