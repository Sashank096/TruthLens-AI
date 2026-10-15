-- TruthLens AI: Digital Evidence & Forensic Case Management Schema

-- 1. Cases Table
CREATE TABLE IF NOT EXISTS public.truthlens_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    examiner TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT DEFAULT 'Under Investigation' CHECK (status IN ('Under Investigation', 'Evidence Verified', 'Tampering Confirmed', 'Closed - Inconclusive')),
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Evidence Items Table (Cryptographic Preservation Vault)
CREATE TABLE IF NOT EXISTS public.truthlens_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.truthlens_cases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Forensic Results Table
CREATE TABLE IF NOT EXISTS public.truthlens_forensic_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id UUID REFERENCES public.truthlens_evidence(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.truthlens_cases(id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 2) NOT NULL,
    risk_level TEXT NOT NULL,
    verified_facts JSONB DEFAULT '[]'::jsonb,
    estimates JSONB DEFAULT '[]'::jsonb,
    ela_summary JSONB DEFAULT '{}'::jsonb,
    fft_summary JSONB DEFAULT '{}'::jsonb,
    noise_summary JSONB DEFAULT '{}'::jsonb,
    metadata_summary JSONB DEFAULT '{}'::jsonb,
    c2pa_summary JSONB DEFAULT '{}'::jsonb,
    candidate_matches JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Immutable Chain of Custody Audit Log
CREATE TABLE IF NOT EXISTS public.truthlens_custody_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.truthlens_cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES public.truthlens_evidence(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    hash_verified BOOLEAN DEFAULT TRUE,
    details TEXT DEFAULT ''
);

-- Row Level Security (RLS)
ALTER TABLE public.truthlens_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truthlens_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truthlens_forensic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truthlens_custody_log ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated investigators & app service role
CREATE POLICY "Allow read access to all cases" ON public.truthlens_cases FOR SELECT USING (true);
CREATE POLICY "Allow insert access to cases" ON public.truthlens_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to cases" ON public.truthlens_cases FOR UPDATE USING (true);

CREATE POLICY "Allow read access to evidence" ON public.truthlens_evidence FOR SELECT USING (true);
CREATE POLICY "Allow insert access to evidence" ON public.truthlens_evidence FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to results" ON public.truthlens_forensic_results FOR SELECT USING (true);
CREATE POLICY "Allow insert access to results" ON public.truthlens_forensic_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to custody logs" ON public.truthlens_custody_log FOR SELECT USING (true);
CREATE POLICY "Allow insert access to custody logs" ON public.truthlens_custody_log FOR INSERT WITH CHECK (true);

-- Indexes for lightning-fast hash and case lookups
CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON public.truthlens_evidence (sha256_hash);
CREATE INDEX IF NOT EXISTS idx_case_number ON public.truthlens_cases (case_number);
