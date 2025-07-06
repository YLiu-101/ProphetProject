-- Updated Prophet Betting Platform Schema
-- This schema matches the RPC functions and API endpoints

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.content_reports CASCADE;
DROP TABLE IF EXISTS public.market_management CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.bet_moderation CASCADE;
DROP TABLE IF EXISTS public.user_management_logs CASCADE;
DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.arbitrator_decisions CASCADE;
DROP TABLE IF EXISTS public.bet_participants CASCADE;
DROP TABLE IF EXISTS public.bets CASCADE;
DROP TABLE IF EXISTS public.markets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table (sync with auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('user', 'admin', 'super_admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Markets table
CREATE TABLE public.markets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'binary' CHECK (type IN ('binary', 'multiple_choice', 'numeric')),
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Bets table (updated to match RPC functions)
CREATE TABLE public.bets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    market_id UUID REFERENCES public.markets(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    arbitrator_type TEXT CHECK (arbitrator_type IN ('creator', 'friend', 'ai')) NOT NULL,
    arbitrator_email TEXT,
    minimum_stake DECIMAL(14,4) DEFAULT 1,
    resolved BOOLEAN DEFAULT false,
    outcome BOOLEAN, -- null until resolved
    resolved_at TIMESTAMPTZ,
    total_pool DECIMAL(14,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Bet participants table (updated column names)
CREATE TABLE public.bet_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    prediction BOOLEAN NOT NULL, -- true = yes/positive, false = no/negative
    stake_amount DECIMAL(14,4) NOT NULL CHECK (stake_amount > 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(bet_id, user_id) -- one bet per user per market
);

-- Arbitrator decisions table
CREATE TABLE public.arbitrator_decisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE NOT NULL,
    arbitrator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    outcome BOOLEAN NOT NULL,
    reasoning TEXT,
    is_ai_decision BOOLEAN DEFAULT false,
    decided_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Credit transactions table (ledger system)
CREATE TABLE public.credit_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(14,4) NOT NULL, -- positive = credit, negative = debit
    transaction_type TEXT CHECK (transaction_type IN ('bonus', 'bet', 'payout', 'refund', 'admin_adjustment')) NOT NULL,
    description TEXT,
    bet_id UUID REFERENCES public.bets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- System AI user for automated decisions
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'system-ai@prophet.betting', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'system-ai@prophet.betting', 'AI Arbitrator', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Functions and Triggers

-- Sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id, 
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update total_pool when participants change
CREATE OR REPLACE FUNCTION public.update_bet_total_pool()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_bet_id UUID;
BEGIN
    -- Handle INSERT/UPDATE
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        target_bet_id := NEW.bet_id;
    -- Handle DELETE
    ELSIF TG_OP = 'DELETE' THEN
        target_bet_id := OLD.bet_id;
    END IF;
    
    UPDATE public.bets
    SET total_pool = COALESCE((
        SELECT SUM(stake_amount)
        FROM public.bet_participants
        WHERE bet_id = target_bet_id
    ), 0)
    WHERE id = target_bet_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trig_bet_participants_pool ON public.bet_participants;
CREATE TRIGGER trig_bet_participants_pool
    AFTER INSERT OR UPDATE OR DELETE ON public.bet_participants
    FOR EACH ROW EXECUTE FUNCTION public.update_bet_total_pool();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER touch_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE TRIGGER touch_bets_updated_at
    BEFORE UPDATE ON public.bets
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE TRIGGER touch_markets_updated_at
    BEFORE UPDATE ON public.markets
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrator_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: anyone can read profiles, users can update their own
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Markets: read all, admins can manage
CREATE POLICY "Anyone can view markets" ON public.markets
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage markets" ON public.markets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Bets: anyone can read, creators can create/update before resolution
CREATE POLICY "Anyone can view bets" ON public.bets
    FOR SELECT USING (true);

CREATE POLICY "Users can create bets" ON public.bets
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update unresolved bets" ON public.bets
    FOR UPDATE USING (auth.uid() = creator_id AND resolved = false);

-- Bet participants: anyone can read, users can join bets
CREATE POLICY "Anyone can view bet participants" ON public.bet_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join bets" ON public.bet_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Arbitrator decisions: anyone can read, arbitrators can create
CREATE POLICY "Anyone can view decisions" ON public.arbitrator_decisions
    FOR SELECT USING (true);

CREATE POLICY "Arbitrators can create decisions" ON public.arbitrator_decisions
    FOR INSERT WITH CHECK (
        auth.uid() = arbitrator_id 
        OR arbitrator_id = '00000000-0000-0000-0000-000000000000' -- AI system
    );

-- Credit transactions: users can view their own, system can create
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Allow system functions to insert transactions
CREATE POLICY "System can create transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_bets_creator ON public.bets(creator_id);
CREATE INDEX idx_bets_deadline ON public.bets(deadline);
CREATE INDEX idx_bets_resolved ON public.bets(resolved);
CREATE INDEX idx_bet_participants_bet ON public.bet_participants(bet_id);
CREATE INDEX idx_bet_participants_user ON public.bet_participants(user_id);
CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_bet ON public.credit_transactions(bet_id);
CREATE INDEX idx_arbitrator_decisions_bet ON public.arbitrator_decisions(bet_id);

-- Seed default markets
INSERT INTO public.markets (name, description, category, type)
VALUES 
    ('Sports Predictions', 'Sports events and game outcomes', 'sports', 'binary'),
    ('Technology Trends', 'Tech adoption and innovation predictions', 'technology', 'binary'),
    ('Market Predictions', 'Financial and crypto market forecasts', 'finance', 'binary'),
    ('Weather & Climate', 'Weather events and climate predictions', 'weather', 'binary'),
    ('Entertainment', 'Movies, TV, and celebrity predictions', 'entertainment', 'binary')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.users IS 'User profiles synced from auth.users';
COMMENT ON TABLE public.markets IS 'Betting market categories';
COMMENT ON TABLE public.bets IS 'Individual betting markets/questions';
COMMENT ON TABLE public.bet_participants IS 'User participation in bets';
COMMENT ON TABLE public.arbitrator_decisions IS 'Final arbitration outcomes';
COMMENT ON TABLE public.credit_transactions IS 'Credit ledger for all financial transactions';
