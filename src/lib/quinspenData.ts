import {
  CircleInfo,
  WhisperConnectionItem,
} from "@/types/quinspen";

export const STORY_CIRCLES: CircleInfo[] = [
  {
    slug: "midnight-confessions",
    name: "Midnight Confessions",
    tagline: "What stays hidden until the clock strikes two",
    description: "Unfiltered personal truths, private dilemmas, and the secrets you have never dared speak into the light.",
    icon: "Moon",
    gradient: "from-purple-950/80 via-slate-900 to-black",
    accentColor: "#a855f7",
  },
  {
    slug: "unspoken-love",
    name: "Unspoken Love",
    tagline: "Words swallowed before they could bridge the distance",
    description: "Lost encounters, secret pining, words left unsaid on train platforms and rainy mornings.",
    icon: "HeartHandshake",
    gradient: "from-rose-950/80 via-zinc-900 to-black",
    accentColor: "#f43f5e",
  },
  {
    slug: "healing-grief",
    name: "Healing & Grief",
    tagline: "The quiet art of mending broken pieces",
    description: "Loss, survival, finding grace in the aftermath of heartbreaks, deaths, and endings.",
    icon: "Sparkles",
    gradient: "from-cyan-950/80 via-slate-900 to-black",
    accentColor: "#06b6d4",
  },
  {
    slug: "career-burnout",
    name: "Career & Escape",
    tagline: "When the golden cage begins to suffocate",
    description: "Corporate masks, walking away from prestige, quiet quitting, and pursuing authentic survival.",
    icon: "Compass",
    gradient: "from-amber-950/80 via-stone-900 to-black",
    accentColor: "#f59e0b",
  },
  {
    slug: "secret-dreams",
    name: "Secret Dreams",
    tagline: "The lives we secretly build in our notebooks",
    description: "Second chances, clandestine projects, hidden talents, and the future you still dare believe in.",
    icon: "Star",
    gradient: "from-emerald-950/80 via-zinc-900 to-black",
    accentColor: "#10b981",
  },
  {
    slug: "family-ties",
    name: "Family Ties",
    tagline: "Blood, silence, and invisible threads",
    description: "Ancestral burdens, unhealed generational knots, and the bittersweet ties we can neither cut nor tie.",
    icon: "Feather",
    gradient: "from-orange-950/80 via-stone-900 to-black",
    accentColor: "#f97316",
  },
  {
    slug: "late-musings",
    name: "Late Night Musings",
    tagline: "Random wonders while the world is quiet",
    description: "Philosophical wanders, brief epiphanies, poetic fragments, and nostalgia at 3 AM.",
    icon: "BookOpen",
    gradient: "from-indigo-950/80 via-slate-900 to-black",
    accentColor: "#6366f1",
  },
];

export const PEN_NAME_ADJECTIVES = [
  "Velvet", "Silver", "Amber", "Midnight", "Silent", "Paper", "Echoing",
  "Wandering", "Emerald", "Cobalt", "Solitary", "Twilight", "Golden",
  "Starlit", "Hidden", "Shadow", "Rustling", "Whispering", "Luminous"
];

export const PEN_NAME_NOUNS = [
  "Scribe", "Nomad", "Quill", "Wanderer", "Comet", "Lantern", "Poet",
  "Chronicle", "Willow", "Horizon", "Harbor", "Voyager", "Echo",
  "Compass", "Rain", "Keeper", "Shadow", "Solitude", "Monarch"
];

export function generateRandomPenName(): { penName: string; penTag: string } {
  const adj = PEN_NAME_ADJECTIVES[Math.floor(Math.random() * PEN_NAME_ADJECTIVES.length)];
  const noun = PEN_NAME_NOUNS[Math.floor(Math.random() * PEN_NAME_NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return {
    penName: `${adj} ${noun}`,
    penTag: `scribe_${num}`,
  };
}

export const INITIAL_WHISPERS: WhisperConnectionItem[] = [];
