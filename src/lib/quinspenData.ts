import { CircleInfo, StoryItem, AnonymousPenIdentity, WhisperConnectionItem } from "@/types/quinspen";

export const STORY_CIRCLES: CircleInfo[] = [
  {
    slug: "midnight-confessions",
    name: "Midnight Confessions",
    tagline: "What stays hidden until the clock strikes two",
    description: "Unfiltered truths, private dilemmas, and the secrets you have never dared speak into the light.",
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

export const INITIAL_STORIES: StoryItem[] = [
  {
    id: "story-1",
    slug: "ticket-to-florence",
    title: "The Train Ticket to Florence I Kept in My Passport for Seven Years",
    excerpt: "I was supposed to board platform 4 at Santa Maria Novella. You told me you would wait until the whistle. I stayed on the steps across the plaza and watched you leave.",
    content: `Seven years ago, on a drizzling November Tuesday, I bought a one-way Eurostar ticket from Florence to Milan. 

We had spent three weeks pretending we were tourists in each other’s lives. No promises, no last names, just coffees that turned into dinners and midnight walks along the Arno with cheap Chianti. On our last night, sitting by the stone parapet near the Ponte Vecchio, you looked at me and said: "If you don't take your flight back to Boston tomorrow, take the 10:15 train with me. We'll figure out the rest."

I said I would think about it.

At 9:45 AM, I was at Santa Maria Novella. I bought the ticket. I held the crisp thermal paper between fingers that wouldn't stop trembling. My carry-on suitcase sat beside a granite column. 

From where I stood, behind the newspaper kiosk, I could see Platform 4. You were standing by coach 3 in that olive green trench coat with the torn cuff, checking your wristwatch every twenty seconds. 

I had forty thousand dollars in student debt, a visa expiring in four days, and a mother in hospice three thousand miles away. Every piece of pragmatic logic screamed that loving someone without a foundation was reckless suicide. 

When the conductor blew the double-chime whistle, you stepped onto the train car. The doors slid shut with a soft hiss of pneumatic pressure. 

I never boarded. I took the bus to the airport instead.

I still have that train ticket folded into the back pocket of my passport sleeve. The thermal ink has faded into a faint purplish ghost of text, but whenever a flight gets turbulent or I find myself alone in an unfamiliar hotel room, my thumb seeks out the crease.

I don't regret doing the responsible thing for my family. But sometimes, when the streetlights turn on in the evening rain, I wonder who I would be today if I had just crossed the 20 yards of platform concrete.`,
    mood: "Bittersweet",
    circleCategory: "unspoken-love",
    tags: ["trains", "italy", "unspoken", "decisions", "youth"],
    coverTheme: "twilight-ink",
    readTimeMinutes: 4,
    isDraft: false,
    isGhostMode: false,
    viewCount: 1420,
    authorId: "user-florence",
    authorPenName: "Florentine Ghost",
    authorAvatarIcon: "compass",
    authorAvatarColor: "amber",
    authorBio: "An architect who measures distance in missed departures.",
    createdAt: "2026-11-09T18:24:00Z",
    updatedAt: "2026-11-09T18:24:00Z",
    reactions: {
      FELT_THIS: 89,
      VIRTUAL_HUG: 43,
      INSPIRED: 12,
      CATHARTIC: 56,
      POETIC: 114,
    },
    commentsCount: 28,
  },
  {
    id: "story-2",
    slug: "icu-nurse-notes-at-3am",
    title: "Confessions of a Cardiac ICU Nurse in Room 412",
    excerpt: "At 3:14 AM, the monitors create a symphony of fragile survival. Tonight an elderly man squeezed my hand and asked me to tell his wife something he never said out loud.",
    content: `People think the hardest part of working night shift in critical care is the codes — the alarms screaming, chest compressions, adrenaline burning through your veins. 

It isn't. The hardest part is 3:14 AM, when the hospital corridor goes entirely quiet except for the rhythmic sigh of mechanical ventilators.

Tonight in Room 412, Mr. G was extubated after 18 days. He was 81. His wife of 54 years had gone home at midnight because her arthritis was flaring up, promising to return at sunrise with his favorite blueberry scones from the bakery down the street.

His oxygen sat at 88%. He knew the trajectory.

He signaled for a pen. But his hands were shaking too violently from the dopamine weaning. So he reached out, caught the cuff of my scrubs, and pulled me down to eye level.

"Tell Martha," he whispered, his voice raspy and sandpaper-dry, "that the year I spent in the garage building the sailboat wasn't because I was angry with her. It was because I was terrified I wouldn't leave anything beautiful behind. She was the only beautiful thing I ever had."

I wrote every syllable down on the back of my telemetry checklist. 

He fell asleep twenty minutes later. His vitals stabilized by 5:00 AM. When Martha came through the double doors at 6:30 carrying those blueberry scones, I handed her the paper without saying a single word. 

I watched her through the door window as she read it, hands trembling, pressing the ink against her chest while she wept.

I do this job under sterile fluorescent bulbs. Nobody in my normal life knows how often I carry other people's final truths home on the subway. Writing this here, without my badge or hospital lanyard, is the only place I can finally breathe out.`,
    mood: "Cathartic",
    circleCategory: "midnight-confessions",
    tags: ["healthcare", "confession", "marriage", "humanity", "hospital"],
    coverTheme: "emerald-solitude",
    readTimeMinutes: 5,
    isDraft: false,
    isGhostMode: false,
    viewCount: 2310,
    authorId: "user-nurse",
    authorPenName: "Telemetry Vigil",
    authorAvatarIcon: "sparkle",
    authorAvatarColor: "emerald",
    authorBio: "Listening to the heartbeats of strangers when their families are asleep.",
    createdAt: "2026-11-10T04:12:00Z",
    updatedAt: "2026-11-10T04:12:00Z",
    reactions: {
      FELT_THIS: 215,
      VIRTUAL_HUG: 198,
      INSPIRED: 142,
      CATHARTIC: 184,
      POETIC: 97,
    },
    commentsCount: 45,
  },
  {
    id: "story-3",
    slug: "walking-away-from-seven-figures",
    title: "I Resigned from My Managing Partner Seat on a Sticky Note",
    excerpt: "For 14 years, I traded 85-hour weeks for a high-rise view in Manhattan and a hollow chest. Three months ago, I walked out and didn't tell a single colleague where I was going.",
    content: `When you earn seven figures in private equity, people treat you like an apex predator. Waiters at four-star restaurants remember your vintage preferences. Juniors stand up slightly straighter when you enter the boardroom.

What they don't tell you is how quietly you turn into glass.

By 38, I had an apartment overlooking Central Park that smelled like dry cleaning and stale espresso. My panic attacks didn't look like hyperventilating; they looked like staring at an Excel forecast for three hours without being able to process a single digit, my heart hammering against my ribs like a caged crow.

One Thursday afternoon in August, during a heated partner discussion about diluting our junior associates' carry pool, I looked out the floor-to-ceiling glass. Down on 53rd Street, a man in a flour-dusted apron was wheeling a bread rack into a neighborhood bakery, laughing with a delivery driver.

A visceral physical wave hit me: *I have forgotten what warm bread smells like.*

I didn't give a two-month transition speech. I took a canary yellow Post-It note from my desk drawer, wrote: *"Effective immediately, I resign. Distribute my unvested equity to the analysts. Do not call."*

I stuck it to the glass door of the senior partner's corner office, took my coat, and walked down the 44 flights of stairs instead of taking the elevator. Every step sounded like a lock unclicking.

Now I live in a coastal town in Maine. I apprentice at an artisanal bakery. My hands are scarred by hot cast iron, my alarm goes off at 3:30 AM, and my bank account is shrinking at a steady pace. 

Yet last week, when I pulled a batch of country sourdough from the stone hearth and heard the crust crackling like dry autumn twigs, I smiled so hard my jaw ached. 

If anyone from my old firm is reading this under a pseudonym: keep the equity. The bread is better.`,
    mood: "Hopeful",
    circleCategory: "career-burnout",
    tags: ["burnout", "finance", "reinvention", "freedom", "sourdough"],
    coverTheme: "parchment-gold",
    readTimeMinutes: 4,
    isDraft: false,
    isGhostMode: false,
    viewCount: 1890,
    authorId: "user-baker",
    authorPenName: "Flour & Salt",
    authorAvatarIcon: "flame",
    authorAvatarColor: "amber",
    authorBio: "Former spreadsheet prisoner, now waking before dawn to feed the starter.",
    createdAt: "2026-11-11T12:00:00Z",
    updatedAt: "2026-11-11T12:00:00Z",
    reactions: {
      FELT_THIS: 167,
      VIRTUAL_HUG: 62,
      INSPIRED: 310,
      CATHARTIC: 125,
      POETIC: 84,
    },
    commentsCount: 39,
  },
  {
    id: "story-4",
    slug: "what-my-father-left-in-the-cedar-trunk",
    title: "What I Found in My Estranged Father's Cedar Trunk",
    excerpt: "We hadn't spoken since my graduation twelve years ago. When the county sheriff called about his estate in rural Oregon, I expected empty bottles. Instead, I found twenty-four sketchbooks.",
    content: `My father was an angry, taciturn mechanic who spoke in grunts and slammed screen doors when dinner wasn't on the table by 6:00. When I left for art school in Chicago, he threw my portfolio onto the driveway gravel and told me I was dead to him.

Twelve years of radio silence followed. No birthday cards, no holiday calls, nothing.

When the county coroner called three weeks ago to say he had passed away quietly in his sleep, I rented a car with zero grief in my chest — only the cold administrative obligation of an only child cleaning up a mess.

His house was exactly as I remembered: grease-stained work boots by the door, smell of motor oil and sawdust, stale black coffee on the counter. 

In the master closet, pushed behind old flannel shirts, was a heavy cedar trunk with brass latches. 

Inside were twenty-four leather-bound Moleskine sketchbooks. 

I opened the first one. Dated October 2014. It was filled with pencil sketches of my childhood: me riding my first bicycle with scraped knees, me painting the garden wall with water, me sleeping in the passenger seat of his pickup truck during summer storms. 

Under each sketch was a short notation in his cramped, blocky handwriting:
*"She drew the red bird today. Better than anything I ever made with steel."*
*"Saw her illustration in the Chicago magazine archive online. Her mother would have cried from pride."*
*"I wanted to call her today. Hand hovered over the phone for an hour. She deserves a father who knows how to be soft, and I never learned."*

I sat on his dusty linoleum floor with my back against the wall, clutching those notebooks until the room went dark. 

We waste so much of our short lives protecting our foolish pride when all we ever wanted was to be seen. If you have an unspoken bridge to cross, cross it tonight. Before the house goes quiet forever.`,
    mood: "Vulnerable",
    circleCategory: "family-ties",
    tags: ["father", "reconciliation", "grief", "art", "family"],
    coverTheme: "crimson-velvet",
    readTimeMinutes: 5,
    isDraft: false,
    isGhostMode: false,
    viewCount: 3120,
    authorId: "user-daughter",
    authorPenName: "Cedar & Graphite",
    authorAvatarIcon: "book",
    authorAvatarColor: "rose",
    authorBio: "Rebuilding a father's voice through sketches left behind.",
    createdAt: "2026-11-11T19:30:00Z",
    updatedAt: "2026-11-11T19:30:00Z",
    reactions: {
      FELT_THIS: 340,
      VIRTUAL_HUG: 420,
      INSPIRED: 112,
      CATHARTIC: 298,
      POETIC: 180,
    },
    commentsCount: 67,
  },
  {
    id: "story-5",
    slug: "stranger-under-seattle-umbrella",
    title: "To the Stranger Under the Yellow Umbrella on 4th Avenue",
    excerpt: "You saw me crying silently against the glass of the bus shelter. You didn't ask what happened. You simply opened half your umbrella over my head and waited six minutes.",
    content: `You wore an oversized grey corduroy jacket and carried a bright mustard-yellow umbrella with a curved wooden handle.

I had just walked out of a medical clinic having learned that my pregnancy was non-viable. The shock was still settling like ice in my spine; I wasn't wailing, just staring through the sheet of grey Pacific Northwest downpour, tears running down into the collar of my sweater.

You walked past, stopped three strides ahead, turned around, and walked back.

You didn't ask: *"Are you okay?"* (Which would have destroyed the tiny sliver of composure holding me upright).
You didn't offer unsolicited advice or patronizing pity.

You stepped directly beside me, tilted the yellow umbrella so it covered my shivering shoulders, and looked forward into the traffic.

We stood there together for six entire minutes in complete, sacred silence. Two strangers sharing one dry patch of concrete while the city roared around us.

When the #7 bus splashed up to the curb, you reached into your coat pocket, handed me a wrapped peppermint candy, gave my elbow the softest two-finger squeeze, and said: *"You will survive today."*

Then you stepped into the rain and turned down Pine Street.

I never caught your name. You will never know that those six minutes were the difference between me breaking apart on the pavement and making it home to my bedroom. 

Whoever you are: your kindness lives inside me forever.`,
    mood: "Poetic",
    circleCategory: "secret-dreams",
    tags: ["kindness", "seattle", "strangers", "grace", "healing"],
    coverTheme: "amethyst-haze",
    readTimeMinutes: 3,
    isDraft: false,
    isGhostMode: false,
    viewCount: 2740,
    authorId: "user-seattle",
    authorPenName: "Raindrop Scribe",
    authorAvatarIcon: "feather",
    authorAvatarColor: "violet",
    authorBio: "Collecting fragments of grace from city sidewalks.",
    createdAt: "2026-11-12T08:15:00Z",
    updatedAt: "2026-11-12T08:15:00Z",
    reactions: {
      FELT_THIS: 289,
      VIRTUAL_HUG: 312,
      INSPIRED: 254,
      CATHARTIC: 165,
      POETIC: 210,
    },
    commentsCount: 52,
  },
];

export const DEMO_DEFAULT_USER: AnonymousPenIdentity = {
  id: "user-quinspen-demo",
  email: "author.sanctuary@quinspen.internal",
  penName: "Midnight Scribe",
  penTag: "scribe_742",
  avatarIcon: "feather",
  avatarColor: "amber",
  bio: "Quiet observer wandering through the stories people carry in their pockets.",
  createdAt: "2026-11-01T00:00:00Z",
};

export const INITIAL_WHISPERS: WhisperConnectionItem[] = [
  {
    id: "whisper-conn-1",
    storyId: "story-1",
    storyTitle: "The Train Ticket to Florence I Kept in My Passport for Seven Years",
    initiatorId: "user-reader-1",
    initiatorPenName: "Silver Wanderer",
    initiatorAvatarIcon: "compass",
    initiatorAvatarColor: "cyan",
    recipientId: "user-quinspen-demo",
    recipientPenName: "Midnight Scribe",
    recipientAvatarIcon: "feather",
    recipientAvatarColor: "amber",
    status: "ACCEPTED",
    initialNote: "Your story about Florence stopped me in my tracks. I had my own 'Platform 4' moment in Kyoto four years ago. I've never told anyone the full truth of it.",
    lastMessage: "Thank you for creating a space where we can speak without being judged.",
    lastMessageAt: "2026-11-12T13:45:00Z",
    unreadCount: 1,
    createdAt: "2026-11-11T20:00:00Z",
    updatedAt: "2026-11-12T13:45:00Z",
    messages: [
      {
        id: "msg-1",
        connectionId: "whisper-conn-1",
        senderId: "user-reader-1",
        senderPenName: "Silver Wanderer",
        senderAvatarIcon: "compass",
        senderAvatarColor: "cyan",
        content: "Your story about Florence stopped me in my tracks. I had my own 'Platform 4' moment in Kyoto four years ago. I've never told anyone the full truth of it.",
        isRead: true,
        createdAt: "2026-11-11T20:00:00Z",
      },
      {
        id: "msg-2",
        connectionId: "whisper-conn-1",
        senderId: "user-quinspen-demo",
        senderPenName: "Midnight Scribe",
        senderAvatarIcon: "feather",
        senderAvatarColor: "amber",
        content: "Kyoto carries that exact weight, doesn't it? The shrines in the autumn rain. Did you ever reach back out to them?",
        isRead: true,
        createdAt: "2026-11-11T21:10:00Z",
      },
      {
        id: "msg-3",
        connectionId: "whisper-conn-1",
        senderId: "user-reader-1",
        senderPenName: "Silver Wanderer",
        senderAvatarIcon: "compass",
        senderAvatarColor: "cyan",
        content: "Never. But reading your words made me realize that carrying the memory isn't a failure — it's proof that we dared to feel something real.",
        isRead: false,
        createdAt: "2026-11-12T13:45:00Z",
      },
    ],
  },
  {
    id: "whisper-conn-2",
    storyId: "story-4",
    storyTitle: "What I Found in My Estranged Father's Cedar Trunk",
    initiatorId: "user-reader-2",
    initiatorPenName: "Cobalt Solitude",
    initiatorAvatarIcon: "moon",
    initiatorAvatarColor: "violet",
    recipientId: "user-quinspen-demo",
    recipientPenName: "Midnight Scribe",
    recipientAvatarIcon: "feather",
    recipientAvatarColor: "amber",
    status: "PENDING",
    initialNote: "I haven't spoken to my sister in five years over an argument that neither of us even remembers clearly. Your piece on the cedar trunk made me cry at my desk. Could I ask your advice on writing a first letter?",
    lastMessage: "I haven't spoken to my sister in five years...",
    lastMessageAt: "2026-11-12T14:10:00Z",
    unreadCount: 1,
    createdAt: "2026-11-12T14:10:00Z",
    updatedAt: "2026-11-12T14:10:00Z",
    messages: [
      {
        id: "msg-4",
        connectionId: "whisper-conn-2",
        senderId: "user-reader-2",
        senderPenName: "Cobalt Solitude",
        senderAvatarIcon: "moon",
        senderAvatarColor: "violet",
        content: "I haven't spoken to my sister in five years over an argument that neither of us even remembers clearly. Your piece on the cedar trunk made me cry at my desk. Could I ask your advice on writing a first letter?",
        isRead: false,
        createdAt: "2026-11-12T14:10:00Z",
      },
    ],
  },
];
