-- ====================================================
-- PURPOSE CLINIC DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public."User" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatarUrl TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Purpose Profiles (Tracking user stage & clarity)
CREATE TABLE IF NOT EXISTS public."PurposeProfile" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    currentStage INTEGER DEFAULT 1 NOT NULL,
    stagesCompleted INTEGER[] DEFAULT '{}'::integer[] NOT NULL,
    initialClarity INTEGER DEFAULT 3 NOT NULL,
    currentClarity INTEGER DEFAULT 3 NOT NULL,
    purposeStatement TEXT,
    lifeTheme TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Life Audit (Stage 1)
CREATE TABLE IF NOT EXISTS public."LifeAudit" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    careerScore INTEGER DEFAULT 5 NOT NULL,
    healthScore INTEGER DEFAULT 5 NOT NULL,
    relationshipScore INTEGER DEFAULT 5 NOT NULL,
    growthScore INTEGER DEFAULT 5 NOT NULL,
    creativityScore INTEGER DEFAULT 5 NOT NULL,
    financeScore INTEGER DEFAULT 5 NOT NULL,
    environmentScore INTEGER DEFAULT 5 NOT NULL,
    spiritualScore INTEGER DEFAULT 5 NOT NULL,
    topFriction TEXT,
    energyLeaks TEXT,
    topPriority TEXT,
    auditNotes TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS "LifeAudit_userId_idx" ON public."LifeAudit"(userId);

-- 4. Core Values (Stage 2)
CREATE TABLE IF NOT EXISTS public."CoreValue" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    valueName TEXT NOT NULL,
    rank INTEGER DEFAULT 1 NOT NULL,
    personalDefinition TEXT,
    actionExample TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS "CoreValue_userId_idx" ON public."CoreValue"(userId);

-- 5. Superpower Map (Stage 3)
CREATE TABLE IF NOT EXISTS public."SuperpowerMap" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    naturalTalents TEXT[] DEFAULT '{}'::text[] NOT NULL,
    flowActivities TEXT[] DEFAULT '{}'::text[] NOT NULL,
    childhoodPassions TEXT[] DEFAULT '{}'::text[] NOT NULL,
    energyGivers TEXT[] DEFAULT '{}'::text[] NOT NULL,
    energyDrainers TEXT[] DEFAULT '{}'::text[] NOT NULL,
    proudestMoments TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Ikigai Entry (Stage 4)
CREATE TABLE IF NOT EXISTS public."IkigaiEntry" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    whatYouLove TEXT[] DEFAULT '{}'::text[] NOT NULL,
    whatYouAreGoodAt TEXT[] DEFAULT '{}'::text[] NOT NULL,
    whatWorldNeeds TEXT[] DEFAULT '{}'::text[] NOT NULL,
    whatYouCanGetPaidFor TEXT[] DEFAULT '{}'::text[] NOT NULL,
    passionTheme TEXT,
    missionTheme TEXT,
    professionTheme TEXT,
    vocationTheme TEXT,
    ikigaiSynthesis TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Purpose Manifesto (Stage 5)
CREATE TABLE IF NOT EXISTS public."PurposeManifesto" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT UNIQUE NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    fullStatement TEXT NOT NULL,
    whoIServe TEXT NOT NULL,
    whatITransform TEXT NOT NULL,
    guidingPrinciples TEXT[] DEFAULT '{}'::text[] NOT NULL,
    dailyDeclaration TEXT,
    isPublic BOOLEAN DEFAULT false NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Action Milestones (Stage 6)
CREATE TABLE IF NOT EXISTS public."ActionMilestone" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    timeframe TEXT NOT NULL, -- '30_DAYS', '90_DAYS', '1_YEAR'
    status TEXT DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    alignmentReason TEXT,
    dueDate TIMESTAMP WITH TIME ZONE,
    completedAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS "ActionMilestone_userId_idx" ON public."ActionMilestone"(userId);

-- 9. Daily Check-Ins (Life Tracker)
CREATE TABLE IF NOT EXISTS public."DailyCheckIn" (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    userId TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD
    morningIntention TEXT,
    eveningReflection TEXT,
    alignmentScore INTEGER DEFAULT 5 NOT NULL,
    energyLevel INTEGER DEFAULT 5 NOT NULL,
    clarityScore INTEGER DEFAULT 5 NOT NULL,
    gratitude TEXT,
    mood TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT "DailyCheckIn_userId_date_unique" UNIQUE (userId, date)
);

CREATE INDEX IF NOT EXISTS "DailyCheckIn_userId_idx" ON public."DailyCheckIn"(userId);
