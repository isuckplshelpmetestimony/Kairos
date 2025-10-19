import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single instance to avoid multiple GoTrueClient warnings
let supabaseInstance: any = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Disable session persistence to avoid conflicts
        autoRefreshToken: false
      }
    })
  }
  return supabaseInstance
})()

// Helper functions for tracking
export async function createAppraisalRecord(userId: string, address: string, municipality: string, province: string) {
  try {
    const { data, error } = await supabase
      .from('appraisals')
      .insert({
        user_id: userId,
        property_address: address,
        municipality,
        province,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating appraisal record:', error)
      // For demo purposes, return a mock appraisal ID for any Supabase error
      console.log('🎭 Demo Mode: Supabase error detected, using mock appraisal ID for demo:', error.message || error)
      return {
        id: `mock-${Date.now()}`,
        user_id: userId,
        property_address: address,
        municipality,
        province,
        started_at: new Date().toISOString(),
        status: 'started'
      }
    }

    return data
  } catch (err) {
    console.error('Exception creating appraisal record:', err)
    // Return mock data for demo purposes
    console.log('🎭 Demo Mode: Exception caught, using mock appraisal ID for demo')
    return {
      id: `mock-${Date.now()}`,
      user_id: userId,
      property_address: address,
      municipality,
      province,
      started_at: new Date().toISOString(),
      status: 'started'
    }
  }
}

export async function updateAppraisalRecord(
  appraisalId: string, 
  updates: {
    status?: 'completed' | 'failed'
    completed_at?: string
    properties_found?: number
    duration_minutes?: number
    error_type?: string
    error_message?: string
  }
) {
  // Handle mock appraisal IDs (for demo purposes when Supabase is not available)
  if (appraisalId && typeof appraisalId === 'string' && (appraisalId.startsWith('mock-') || appraisalId.startsWith('fallback-'))) {
    console.log('🎭 Demo Mode: Mock appraisal update:', appraisalId, updates)
    return { id: appraisalId, ...updates }
  }

  try {
    const { data, error } = await supabase
      .from('appraisals')
      .update(updates)
      .eq('id', appraisalId)
      .select()
      .single()

    if (error) {
      console.error('Error updating appraisal record:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Exception updating appraisal record:', err)
    return null
  }
}

export async function trackEvent(
  userId: string,
  eventType: string,
  eventDescription?: string,
  metadata?: any
) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_description: eventDescription,
      metadata
    })

  if (error) {
    console.error('Error tracking event:', error)
    return null
  }

  return data
}
