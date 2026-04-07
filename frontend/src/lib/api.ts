import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'

// Parse share text
export async function parseShareText(shareText: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ share_text: shareText })
  })
  return response.json()
}

// Search videos
export async function searchVideos(query: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/search-videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  return response.json()
}

// Get all videos
export async function getVideos(filters?: { category?: string; tag?: string }) {
  let query = supabase.from('videos').select('*, analyses(*)')

  if (filters?.category) {
    query = query.eq('analyses.category', filters.category)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// Get video by ID
export async function getVideoById(id: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('*, analyses(*), transcripts(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Get sync task status
export async function getSyncTaskStatus(taskId: string) {
  const { data, error } = await supabase
    .from('sync_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) throw error
  return data
}

// Create sync task
export async function createSyncTask(collectionUrl: string) {
  const { data, error } = await supabase
    .from('sync_tasks')
    .insert([{ source_url: collectionUrl, status: 'pending' }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Update sync task
export async function updateSyncTask(taskId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('sync_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}
