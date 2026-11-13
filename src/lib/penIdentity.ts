import { randomInt } from "crypto";
import { PEN_NAME_ADJECTIVES, PEN_NAME_NOUNS } from "@/lib/quinspenData";

export function generatePenTag(): string {
  return `scribe_${randomInt(100000, 1000000)}`;
}

export function generatePenIdentity(): { penName: string; penTag: string } {
  const adjective =
    PEN_NAME_ADJECTIVES[randomInt(0, PEN_NAME_ADJECTIVES.length)];
  const noun = PEN_NAME_NOUNS[randomInt(0, PEN_NAME_NOUNS.length)];
  return {
    penName: `${adjective} ${noun}`,
    penTag: generatePenTag(),
  };
}
