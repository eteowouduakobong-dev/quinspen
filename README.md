# QUINSPEN — Anonymous Storytelling Platform

> **"The Quill of Untold Stories. Real Human Emotion. Zero Identity Exposure."**

**QUINSPEN** is a modern, interactive storytelling sanctuary where individuals can sign up to safely record their journeys and share their deepest, rawest stories with complete anonymity. Readers and writers can connect 1-on-1 through masked **Whispers** without ever revealing their names, emails, or personal identities.

---

## 🌟 Key Features

### 1. 🛡️ 100% Identity Shield & Pen Identities
- **Anonymous Pen Names**: Every account is granted an evocative anonymous persona (e.g., *Midnight Scribe*, *Florentine Ghost*, *Raindrop Scribe*) with a randomizer button.
- **Strict Privacy Controls**: Real emails stay in the account profile, which row-level security restricts to its owner. Story and reflection APIs expose pen names, not email addresses.
- **Total Ghost Mode**: Writers can detach even their account pen name for specific posts, publishing under a transient alias (e.g. *Nameless Scribe*).

### 2. 🌌 Thematic Story Circles
Seven dedicated circles designed to give voice to specific frequencies of silence:
- **Midnight Confessions**: Unspoken truths that only surface late at night.
- **Unspoken Love**: Words swallowed before they could bridge the distance.
- **Healing & Grief**: The quiet art of mending broken pieces.
- **Career & Escape**: Walking away from burnout and golden cages.
- **Secret Dreams**: The lives we secretly construct in our notebooks.
- **Family Ties**: Blood, silence, and invisible generational threads.
- **Late Night Musings**: Epiphanies and poetic fragments at 3 AM.

### 3. 🕯️ Emotional Resonances (Interactive Reactions)
Replaces shallow social media likes with heartfelt human resonance:
- 🕯️ **Felt This** (Deep empathy & understanding)
- 🫂 **Virtual Hug** (Warm comfort & support)
- 💫 **Inspired** (Hope & perspective)
- 🌊 **Cathartic** (Tears and emotional release)
- 🖋️ **Poetic** (Admiration of craft)

### 4. 💬 Masked Peer Whispers (Anonymous 1-on-1 Connection)
Connects users together safely:
- Readers moved by a story can transmit an **Anonymous Whisper** to the author.
- The author can accept or decline the connection request.
- Once accepted, both parties engage in a real-time-friendly, encrypted-feel **1-on-1 dialogue** under their masked pen names.

### 5. 📜 My Chronicle & Lifetime Records
Maintains a full, organized record of each user's contributions:
- **Penned Stories**: Total views, resonance counts, reflection counters, and management tools.
- **Saved Stories / Bookmarks**: Preserves stories that touched the user.
- **My Resonances**: History of all reactions left across the sanctuary.
- **Pen Mask Customizer**: Custom pen name, bio editor, and security audit report.

### 6. 🎧 Web Audio Ambience Synthesizer
Built-in procedural soundscapes (Gentle Rain, Midnight Fireplace, Night Wind) generated with the Web Audio API without requiring bulky external audio downloads.

### 7. 🤝 Real Human Listener Sessions
- Stories, reactions, and reflections are stored in the shared database and require a verified Supabase account.
- Safe Haven creates a private, persisted conversation request. It does not generate automated or simulated replies.
- Authorized human staff accept waiting requests and answer from `/listener-inbox`. Public conversation views use pen names and do not expose account email addresses.
- Staff access is controlled by the server-only `LISTENER_STAFF_EMAILS` environment variable. Add the exact, verified Supabase Auth emails for the people who will handle sessions.
- A waiting request is not a promise of an immediate response. Continuous availability requires real staff coverage; this chat is not emergency or clinical care.

For an existing database, run `npx prisma db push` to add the listener tables, then apply the updated `supabase/schema.sql` in the Supabase SQL Editor to enable the profile and private-listener row-level security rules. The SQL script is safe to re-run.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, Server & Client Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Secure Auth)
- **ORM**: [Prisma](https://www.prisma.io/) (Type-safe client & schema)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (Configured in `vercel.json` with automated Prisma generation)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd gitclass
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the Supabase and Prisma connection strings:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
LISTENER_STAFF_EMAILS=listener@example.com
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

The app requires Supabase Auth and a configured PostgreSQL database for account registration, community stories, and listener sessions. It does not create local demo accounts or sample stories.

### 3. Generate Prisma Client & Push Schema
```bash
npx prisma generate
npx prisma db push
```

Alternatively, run the SQL script in `supabase/schema.sql` inside the Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com/).
3. Add the environment variables from your `.env` file into Vercel Settings -> Environment Variables.
4. Click **Deploy**. Vercel will automatically run `prisma generate && next build` as defined in `vercel.json`.

---

## 🔒 Anonymity & Security

- User email addresses are kept private for authentication and personal chronicle access only.
- All public storytelling feeds, comments, and 1-on-1 whispers operate strictly via anonymized Pen Names (`penName` & `penTag`).
- No personally identifiable information (PII) is exposed through public API endpoints.
