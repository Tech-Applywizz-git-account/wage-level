'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, AuthUser, checkUserPermissions } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isLead: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper computed values
  const isAdmin = user?.role === 'admin'
  const isLead = user?.role === 'lead' || user?.role === 'admin'

  useEffect(() => {
    let isMounted = true
    
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
          setLoading(false)
        } else {
          setSession(initialSession)
          if (initialSession?.user) {
            const authUser = await checkUserPermissions(initialSession.user)
            if (isMounted) {
              setUser(authUser)
              setLoading(false)
            }
          } else {
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Error in getSession:', err)
        if (isMounted) {
          setError('Failed to initialize authentication')
          setLoading(false)
        }
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (!isMounted) return
        
        setSession(session)
        setError(null)

        if (session?.user) {
          // Only set loading to false after user permissions are checked
          const authUser = await checkUserPermissions(session.user)
          if (isMounted) {
            setUser(authUser)
            setLoading(false)
          }
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return { error: error.message }
      }

      // User and session will be set by the onAuthStateChange listener
      // Don't set loading to false here as onAuthStateChange will handle it
      return {}
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setLoading(false)
      return { error: errorMessage }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        setLoading(false)
        console.error('Error signing out:', error)
      }
      
      // User and session will be cleared by the onAuthStateChange listener
      // Don't set loading to false here as onAuthStateChange will handle it
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      setLoading(false)
      console.error('Error in signOut:', err)
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
    isLead,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}