import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface User {
  id: string
  email: string
  full_name: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For demo purposes, we'll use a hardcoded demo user
    // In production, this would integrate with Supabase Auth
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000001', // Temporary demo user ID
      email: 'demo@example.com',
      full_name: 'Demo User'
    }
    
    setUser(demoUser)
    setLoading(false)
  }, [])

  return { user, loading }
}
