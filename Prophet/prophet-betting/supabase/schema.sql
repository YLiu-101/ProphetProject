-- Prophet Betting Platform Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bets table
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    arbitrator_type TEXT CHECK (arbitrator_type IN ('friend', 'ai')) NOT NULL,
    arbitrator_contact TEXT, -- email for friend arbitrator
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('active', 'pending_resolution', 'resolved', 'cancelled')) DEFAULT 'active',
    total_pool DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bet participants table
CREATE TABLE IF NOT EXISTS public.bet_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    prediction TEXT CHECK (prediction IN ('yes', 'no')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(bet_id, user_id) -- One participation per user per bet
);

-- Arbitrator decisions table
CREATE TABLE IF NOT EXISTS public.arbitrator_decisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bet_id UUID REFERENCES public.bets(id) ON DELETE CASCADE NOT NULL UNIQUE,
    arbitrator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    decision TEXT CHECK (decision IN ('yes', 'no', 'tie')) NOT NULL,
    reasoning TEXT,
    is_ai_decision BOOLEAN DEFAULT FALSE,
    appeal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrator_decisions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Bets policies
CREATE POLICY "Anyone can view active bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Users can create bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own bets" ON public.bets FOR UPDATE USING (auth.uid() = creator_id);

-- Bet participants policies
CREATE POLICY "Anyone can view bet participants" ON public.bet_participants FOR SELECT USING (true);
CREATE POLICY "Users can join bets" ON public.bet_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.bet_participants FOR UPDATE USING (auth.uid() = user_id);

-- Arbitrator decisions policies
CREATE POLICY "Anyone can view decisions" ON public.arbitrator_decisions FOR SELECT USING (true);
CREATE POLICY "Arbitrators can create decisions" ON public.arbitrator_decisions FOR INSERT WITH CHECK (
    auth.uid() = arbitrator_id OR 
    EXISTS (SELECT 1 FROM public.bets WHERE id = bet_id AND arbitrator_type = 'ai')
);

-- Functions and Triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update total pool when participant joins
CREATE OR REPLACE FUNCTION public.update_bet_total_pool()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.bets 
    SET total_pool = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.bet_participants 
        WHERE bet_id = NEW.bet_id
    )
    WHERE id = NEW.bet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update bet total pool
DROP TRIGGER IF EXISTS on_bet_participant_changed ON public.bet_participants;
CREATE TRIGGER on_bet_participant_changed
    AFTER INSERT OR UPDATE OR DELETE ON public.bet_participants
    FOR EACH ROW EXECUTE FUNCTION public.update_bet_total_pool();

-- Updated at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_bets_updated_at BEFORE UPDATE ON public.bets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bets_creator_id ON public.bets(creator_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_deadline ON public.bets(deadline);
CREATE INDEX IF NOT EXISTS idx_bet_participants_bet_id ON public.bet_participants(bet_id);
CREATE INDEX IF NOT EXISTS idx_bet_participants_user_id ON public.bet_participants(user_id);
