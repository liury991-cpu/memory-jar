-- Memory Jar Database Schema for Supabase

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT,
    source_type TEXT,  -- link, code, text
    name TEXT,
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    douyin_video_id TEXT,
    title TEXT NOT NULL,
    author TEXT,
    author_id TEXT,
    duration_seconds INTEGER,
    description TEXT,
    cover_url TEXT,
    video_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'downloading' CHECK (status IN ('downloading', 'transcribing', 'processing', 'done', 'failed'))
);

-- Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
    raw_text TEXT,
    srt_content TEXT,
    language TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses table (AI analysis results)
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
    summary TEXT,
    category TEXT,
    tags JSONB,
    key_info JSONB,
    related_keywords JSONB,
    llm_raw_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync tasks table
CREATE TABLE IF NOT EXISTS sync_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'downloading', 'transcribing', 'analyzing', 'done', 'failed')),
    progress INTEGER DEFAULT 0,
    stage_detail TEXT,
    total_videos INTEGER DEFAULT 0,
    processed_videos INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_collection ON videos(collection_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_video ON transcripts(video_id);
CREATE INDEX IF NOT EXISTS idx_analyses_video ON analyses(video_id);
CREATE INDEX IF NOT EXISTS idx_analyses_category ON analyses(category);
CREATE INDEX IF NOT EXISTS idx_analyses_tags ON analyses USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_sync_tasks_status ON sync_tasks(status);

-- Row Level Security (RLS)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for local development
CREATE POLICY "Allow all for collections" ON collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for videos" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transcripts" ON transcripts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for analyses" ON analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sync_tasks" ON sync_tasks FOR ALL USING (true) WITH CHECK (true);
