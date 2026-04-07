import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Video {
  id: string
  collection_id: string | null
  douyin_video_id: string | null
  title: string
  author: string | null
  author_id: string | null
  duration_seconds: number | null
  description: string | null
  cover_url: string | null
  video_url: string | null
  published_at: string | null
  created_at: string
  status: 'downloading' | 'transcribing' | 'processing' | 'done' | 'failed'
}

export interface Transcript {
  id: string
  video_id: string
  raw_text: string | null
  srt_content: string | null
  language: string | null
  created_at: string
}

export interface Analysis {
  id: string
  video_id: string
  summary: string | null
  category: string | null
  tags: string[] | null
  key_info: Record<string, unknown> | null
  related_keywords: string[] | null
  created_at: string
}

export interface Collection {
  id: string
  source_url: string | null
  source_type: string | null
  name: string | null
  video_count: number
  created_at: string
}

export interface SyncTask {
  id: string
  collection_id: string | null
  status: string
  progress: number
  stage_detail: string | null
  total_videos: number
  processed_videos: number
  error_message: string | null
  created_at: string
}

export interface VideoWithDetails extends Video {
  transcript?: Transcript | null
  analysis?: Analysis | null
}
