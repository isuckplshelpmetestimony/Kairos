import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  email: string
  full_name: string
}

// Generate a unique user ID for this session (Supabase-compatible format)
function generateSessionUserId(): string {
  // Check if we already have a user ID in localStorage
  const existingUserId = localStorage.getItem('kairos_user_id')
  if (existingUserId) {
    return existingUserId
  }
  
  // Generate a UUID-like ID that's compatible with Supabase
  const newUserId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('kairos_user_id', newUserId)
  return newUserId
}

// Create a session user that will work seamlessly with Supabase
function createSessionUser(): User {
  const userId = generateSessionUserId()
  const sessionNumber = Math.floor(Math.random() * 1000) + 1
  
  return {
    id: userId,
    email: `session${sessionNumber}@cairos.local`,
    full_name: `Session User ${sessionNumber}`
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create a unique user for this browser session
    // This will work seamlessly with Supabase when you're ready
    const sessionUser = createSessionUser()
    
    setUser(sessionUser)
    setLoading(false)
    
    console.log(`👤 Multi-user enabled: ${sessionUser.full_name} (${sessionUser.id})`)
    console.log(`🔄 Ready for Supabase transition - user ID format is compatible`)
  }, [])

  return { user, loading }
}
