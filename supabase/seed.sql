-- ====================================================
-- PURPOSE CLINIC SEED DATA FOR SUPABASE
-- ====================================================

-- 1. Insert Initial Sample User
INSERT INTO public."User" (id, email, name, avatarUrl)
VALUES (
    'demo-seeker-001',
    'seeker@purposeclinic.app',
    'Uduakobong Eteowo',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 2. Purpose Profile (Stage 6 Completed, Clarity 9/10)
INSERT INTO public."PurposeProfile" (id, userId, currentStage, stagesCompleted, initialClarity, currentClarity, purposeStatement, lifeTheme)
VALUES (
    'profile-001',
    'demo-seeker-001',
    6,
    ARRAY[1, 2, 3, 4, 5, 6],
    3,
    9,
    'My purpose is to synthesize life wisdom and human-centered design into practical tools for overwhelmed individuals, empowering them to shed fear, discover authentic gifts, and craft lives of deep meaning.',
    'From Confusion to Grounded Purpose'
)
ON CONFLICT (userId) DO UPDATE
SET currentStage = EXCLUDED.currentStage, currentClarity = EXCLUDED.currentClarity, purposeStatement = EXCLUDED.purposeStatement;

-- 3. Life Audit
INSERT INTO public."LifeAudit" (id, userId, careerScore, healthScore, relationshipScore, growthScore, creativityScore, financeScore, environmentScore, spiritualScore, topFriction, energyLeaks, topPriority, auditNotes)
VALUES (
    'audit-001',
    'demo-seeker-001',
    8, 7, 8, 9, 8, 7, 8, 8,
    'Feeling like I was living someone else''s script instead of my authentic calling.',
    'Doomscrolling late at night and agreeing to projects out of social obligation.',
    'Aligning my creative work with lasting human empowerment and financial peace.',
    'The audit helped me realize I had strong technical stability but had abandoned creative expression.'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Core Values (Top 5)
INSERT INTO public."CoreValue" (id, userId, valueName, rank, personalDefinition, actionExample)
VALUES
    ('val-1', 'demo-seeker-001', 'Authenticity', 1, 'Living in congruence with my inner truth rather than external expectations.', 'Speaking honestly and declining misaligned projects.'),
    ('val-2', 'demo-seeker-001', 'Empowerment', 2, 'Helping others uncover their innate potential and courage.', 'Listening deeply without judgment and guiding seekers.'),
    ('val-3', 'demo-seeker-001', 'Curiosity', 3, 'Approaching life with wonder, lifelong inquiry, and beginner''s mind.', 'Reading across disciplines and asking clarifying questions.'),
    ('val-4', 'demo-seeker-001', 'Compassion', 4, 'Holding space for human struggle with gentle empathy.', 'Extending grace to myself and others during setbacks.'),
    ('val-5', 'demo-seeker-001', 'Creative Mastery', 5, 'Translating messy insights into elegant, accessible tools and systems.', 'Designing software and writing guides that remove anxiety.')
ON CONFLICT (id) DO NOTHING;

-- 5. Superpowers
INSERT INTO public."SuperpowerMap" (id, userId, naturalTalents, flowActivities, childhoodPassions, energyGivers, energyDrainers, proudestMoments)
VALUES (
    'sp-001',
    'demo-seeker-001',
    ARRAY['Synthesizing complex ideas into simple roadmaps', 'Empathetic listening and calming others', 'Designing serene digital experiences'],
    ARRAY['Deep creative coding and building tools', 'Mentoring someone through a difficult life transition', 'Writing philosophical essays and journals'],
    ARRAY['Building intricate Lego worlds and forts', 'Drawing adventure maps and stories', 'Stargazing and pondering life mysteries'],
    ARRAY['Quiet morning coffee with a journal', 'One-on-one deep conversations about life dreams', 'Finishing a creation that genuinely helps a friend'],
    ARRAY['Superficial gossip and cynicism', 'Chaotic and noisy environments', 'Pointless bureaucracy'],
    'When a close friend told me my guidance helped them leave a soul-crushing job to launch their true calling.'
)
ON CONFLICT (userId) DO UPDATE
SET naturalTalents = EXCLUDED.naturalTalents, flowActivities = EXCLUDED.flowActivities;

-- 6. Ikigai Entry
INSERT INTO public."IkigaiEntry" (id, userId, whatYouLove, whatYouAreGoodAt, whatWorldNeeds, whatYouCanGetPaidFor, passionTheme, missionTheme, professionTheme, vocationTheme, ikigaiSynthesis)
VALUES (
    'ikigai-001',
    'demo-seeker-001',
    ARRAY['Guiding people through uncertainty', 'Writing and storytelling', 'Designing calm software', 'Human psychology'],
    ARRAY['Framework architecture and breakdown', 'Empathetic coaching', 'Writing clear prose', 'Product engineering'],
    ARRAY['Mental clarity in a noisy world', 'Tools that restore human agency', 'Safe spaces to admit confusion without shame'],
    ARRAY['Life and career transformation coaching', 'Software engineering & SaaS development', 'Workshop facilitation & writing'],
    'Expressing empathetic wisdom through creative systems',
    'Helping lost seekers find clarity and courageous purpose',
    'Human-centered design and purpose engineering',
    'Transformative educational tools and communities',
    'At the intersection of deep empathy, structured design, and life philosophy, I create tools and spaces that guide people from chronic confusion to grounded purpose.'
)
ON CONFLICT (userId) DO UPDATE
SET ikigaiSynthesis = EXCLUDED.ikigaiSynthesis;

-- 7. Purpose Manifesto
INSERT INTO public."PurposeManifesto" (id, userId, headline, fullStatement, whoIServe, whatITransform, guidingPrinciples, dailyDeclaration, isPublic)
VALUES (
    'manifesto-001',
    'demo-seeker-001',
    'To illuminate paths through uncertainty so that thoughtful seekers can live courageously.',
    'My purpose is to synthesize life wisdom and human-centered design into soothing, practical tools for overwhelmed individuals, empowering them to shed fear, discover their authentic gifts, and craft a life of deep meaning.',
    'Seekers, career-switchers, and creators who feel adrift and yearn for direction.',
    'From paralyzing self-doubt and aimless distraction to intentional, joyful purpose.',
    ARRAY[
        'Clarity is uncovered step by step, never forced overnight.',
        'Small daily intentional acts compound into an extraordinary life.',
        'Kindness to oneself is the prerequisite for authentic service to the world.',
        'Serve the human heart, not just the algorithm.'
    ],
    'Today, I bring my genuine presence, honor my values, and take one courageous step in service of my purpose.',
    true
)
ON CONFLICT (userId) DO UPDATE
SET headline = EXCLUDED.headline, fullStatement = EXCLUDED.fullStatement;

-- 8. Action Milestones
INSERT INTO public."ActionMilestone" (id, userId, title, timeframe, status, alignmentReason)
VALUES
    ('ms-1', 'demo-seeker-001', 'Host my first Purpose Circle for 5 friends feeling stuck', '30_DAYS', 'COMPLETED', 'Validates my superpower of facilitating transformative clarity.'),
    ('ms-2', 'demo-seeker-001', 'Publish 8 weekly essays on navigating quarter-life transitions', '90_DAYS', 'IN_PROGRESS', 'Brings my writing flow into the service of seekers.'),
    ('ms-3', 'demo-seeker-001', 'Launch an ongoing mentorship cohort and digital sanctuary toolkit', '1_YEAR', 'PENDING', 'Establishes long-term sustainable impact and financial harmony.')
ON CONFLICT (id) DO NOTHING;

-- 9. Daily Check-Ins
INSERT INTO public."DailyCheckIn" (id, userId, date, morningIntention, eveningReflection, alignmentScore, energyLevel, clarityScore, gratitude, mood)
VALUES
    ('log-1', 'demo-seeker-001', '2026-11-05', 'Listen carefully before reacting and protect morning focus time.', 'Felt centered during meetings. Took a 20-minute walk to decompress.', 8, 8, 8, 'A quiet moment with warm tea and supportive peers.', 'peaceful'),
    ('log-2', 'demo-seeker-001', '2026-11-06', 'Anchor into stillness before responding to incoming requests.', 'Deep sense of gratitude. Felt entirely aligned while helping an anxious colleague.', 9, 8, 9, 'Sunlight filtering through morning trees, and clarity of direction.', 'grounded')
ON CONFLICT (userId, date) DO NOTHING;
