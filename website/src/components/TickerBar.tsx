import { Zap, AlertTriangle, Wrench, Gamepad2, Radio, Flame, Gauge, Cog, Car, Trophy } from "lucide-react";
import { getTickerMessages, TickerMessage, defaultTickerMessages } from "@/lib/siteSettings";

// Icon mapping for ticker messages
const iconMap: Record<string, React.ComponentType<any>> = {
  zap: Zap,
  bolt: Zap,
  'alert-triangle': AlertTriangle,
  warning: AlertTriangle,
  wrench: Wrench,
  construction: Wrench,
  'gamepad-2': Gamepad2,
  gaming: Gamepad2,
  radio: Radio,
  flame: Flame,
  gauge: Gauge,
  cog: Cog,
  car: Car,
  trophy: Trophy,
};

function getIcon(iconName: string) {
  return iconMap[iconName.toLowerCase()] || Zap;
}

interface TickerBarProps {
  messages?: TickerMessage[];
}

export async function TickerBar({ messages: propMessages }: TickerBarProps = {}) {
  // Fetch data if not provided as props
  let messages = propMessages;

  if (!messages) {
    try {
      messages = await getTickerMessages();
    } catch (e) {
      messages = defaultTickerMessages;
    }
  }

  // Double items for seamless loop
  const allItems = [...messages, ...messages];

  return (
    <div className="bg-[#353535] py-3 border-b-4 border-[#CCAA4C] overflow-hidden whitespace-nowrap">
      <div className="animate-marquee flex gap-20 items-center">
        {allItems.map((item, index) => {
          const Icon = getIcon(item.icon);
          return (
            <div
              key={`${item.id}-${index}`}
              className={`flex items-center gap-4 font-bold uppercase tracking-widest text-sm ${
                item.is_highlight ? "text-[#CCAA4C]" : "text-white"
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

// Client-side version for use in client components
export function TickerBarClient({ messages }: { messages: TickerMessage[] }) {
  const allItems = [...messages, ...messages];

  return (
    <div className="bg-[#353535] py-3 border-b-4 border-[#CCAA4C] overflow-hidden whitespace-nowrap">
      <div className="animate-marquee flex gap-20 items-center">
        {allItems.map((item, index) => {
          const Icon = getIcon(item.icon);
          return (
            <div
              key={`${item.id}-${index}`}
              className={`flex items-center gap-4 font-bold uppercase tracking-widest text-sm ${
                item.is_highlight ? "text-[#CCAA4C]" : "text-white"
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
