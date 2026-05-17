-- 1. PROFILES (Extends Auth.Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('donator', 'fund_raiser', 'hospital', 'admin')),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  patient_name TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  medical_proof_url TEXT,
  target_amount DECIMAL(15, 2) NOT NULL,
  raised_amount DECIMAL(15, 2) DEFAULT 0,
  urgency TEXT DEFAULT 'high',
  status TEXT DEFAULT 'pending_verification',
  verification_status TEXT DEFAULT 'pending_hospital',
  fraud_score INT DEFAULT 0,
  trust_score INT DEFAULT 70,
  donor_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 3. DONATIONS
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns ON DELETE CASCADE,
  donor_id UUID REFERENCES auth.users,
  amount DECIMAL(15, 2) NOT NULL,
  status TEXT DEFAULT 'completed',
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 4. WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'LKR',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- 5. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets ON DELETE CASCADE,
  type TEXT CHECK (type IN ('inflow', 'outflow')),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  campaign_id UUID REFERENCES public.campaigns,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role',
    (NEW.raw_user_meta_data->>'is_verified')::BOOLEAN
  );
  
  -- Also create a wallet for them
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
