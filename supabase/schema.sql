-- =========================================================
-- QUINSPEN - Anonymous Storytelling Platform Database Schema
-- Supabase PostgreSQL Schema
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ANONYMOUS PEN PROFILES
CREATE TABLE IF NOT EXISTS public."User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  "penName" TEXT NOT NULL,
  "penTag" TEXT UNIQUE NOT NULL,
  "avatarIcon" TEXT NOT NULL DEFAULT 'feather',
  "avatarColor" TEXT NOT NULL DEFAULT 'amber',
  bio TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STORIES
CREATE TABLE IF NOT EXISTS public."Story" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'Vulnerable',
  "circleCategory" TEXT NOT NULL DEFAULT 'midnight-confessions',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  "coverTheme" TEXT NOT NULL DEFAULT 'twilight-ink',
  "readTimeMinutes" INTEGER NOT NULL DEFAULT 3,
  "isDraft" BOOLEAN NOT NULL DEFAULT false,
  "isGhostMode" BOOLEAN NOT NULL DEFAULT false,
  "ghostAlias" TEXT,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "authorId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. REACTIONS (Emotional Resonances)
CREATE TABLE IF NOT EXISTS public."Reaction" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "storyId" UUID NOT NULL REFERENCES public."Story"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'FELT_THIS', 'VIRTUAL_HUG', 'INSPIRED', 'CATHARTIC', 'POETIC'
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_story_user_reaction UNIQUE ("storyId", "userId", type)
);

-- 4. COMMENTS (Reflections)
CREATE TABLE IF NOT EXISTS public."Comment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "storyId" UUID NOT NULL REFERENCES public."Story"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "penNameSnapshot" TEXT NOT NULL,
  "avatarIcon" TEXT NOT NULL DEFAULT 'feather',
  "avatarColor" TEXT NOT NULL DEFAULT 'amber',
  "isAuthor" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BOOKMARKS (Saved Stories)
CREATE TABLE IF NOT EXISTS public."Bookmark" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "storyId" UUID NOT NULL REFERENCES public."Story"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_story_bookmark UNIQUE ("storyId", "userId")
);

-- 6. WHISPER CONNECTIONS (Anonymous 1-on-1 dialogue requests)
CREATE TABLE IF NOT EXISTS public."WhisperConnection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "storyId" UUID REFERENCES public."Story"(id) ON DELETE SET NULL,
  "initiatorId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  "recipientId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
  "initialNote" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. WHISPER MESSAGES (Private encrypted-feel dialogue between masked pen names)
CREATE TABLE IF NOT EXISTS public."WhisperMessage" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "connectionId" UUID NOT NULL REFERENCES public."WhisperConnection"(id) ON DELETE CASCADE,
  "senderId" UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_author ON public."Story"("authorId");
CREATE INDEX IF NOT EXISTS idx_story_circle ON public."Story"("circleCategory");
CREATE INDEX IF NOT EXISTS idx_story_mood ON public."Story"(mood);
CREATE INDEX IF NOT EXISTS idx_reaction_story ON public."Reaction"("storyId");
CREATE INDEX IF NOT EXISTS idx_comment_story ON public."Comment"("storyId");
CREATE INDEX IF NOT EXISTS idx_whisper_conn_users ON public."WhisperConnection"("initiatorId", "recipientId");
CREATE INDEX IF NOT EXISTS idx_whisper_msg_conn ON public."WhisperMessage"("connectionId");
