'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { JobData, DatabaseStats } from '@/lib/supabase'
import { getDatabaseStatsFromAPI, loadDataWithFallback } from '@/lib/apiDataProcessor'

interface DataContextType {
  stats: DatabaseStats | null
  jobData: JobData[] | null
  loading: boolean
  error: string | null
  isDataLoaded: boolean
  isSampleData: boolean
  progress: { loaded: number; total: number; isComplete: boolean }
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [jobData, setJobData] = useState<JobData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isSampleData, setIsSampleData] = useState(false)
  const [progress, setProgress] = useState({ loaded: 0, total: 0, isComplete: false })

  const loadData = useCallback(async () => {
    if (isDataLoaded) {
      console.log('📊 Data already loaded, skipping...')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setProgress({ loaded: 0, total: 0, isComplete: false })
      console.log('🚀 Loading data using API routes...')
      console.log('⚡ SERVER-SIDE: Using API routes for better performance')

      // Load data with fallback strategy using API routes
      const { data: allJobData, isSample } = await loadDataWithFallback(
        (loaded, total, isComplete, isSampleData) => {
          setProgress({ loaded, total, isComplete })
          setIsSampleData(isSampleData)
        }
      )
      setProgress({ loaded: allJobData?.length || 0, total: allJobData?.length || 0, isComplete: true })
      setIsSampleData(isSample)

      // Check if we got any data
      // Check if we got any data
      if (!allJobData || allJobData.length === 0) {
        throw new Error('No data received from API')
      }

      // Get stats from API (server-side calculation)
      const statsData = await getDatabaseStatsFromAPI()

      setStats(statsData)
      setJobData(allJobData)
      setIsDataLoaded(true)
      setIsSampleData(isSample)
      setProgress({ loaded: allJobData.length, total: allJobData.length, isComplete: true })

      console.log('✅ Data loaded and cached in context (API approach)')
      console.log(`📊 Successfully loaded ${allJobData.length} records (${isSample ? 'sample' : 'full'} data)`)

    } catch (err) {
      console.error('❌ Error loading data from API:', err)

      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          setError('Server timeout - the dataset is very large. Please try again or contact support.')
        } else if (err.message.includes('No data received')) {
          setError('No data found in database. Please check your connection.')
        } else if (err.message.includes('API request failed')) {
          setError('Server error - please try again or contact support.')
        } else {
          setError(`Failed to load data: ${err.message}`)
        }
      } else {
        setError('Failed to load data - unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }, [isDataLoaded])

  const refreshData = async () => {
    setIsDataLoaded(false)
    setStats(null)
    setJobData(null)
    setIsSampleData(false)
    setProgress({ loaded: 0, total: 0, isComplete: false })
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  const value: DataContextType = {
    stats,
    jobData,
    loading,
    error,
    isDataLoaded,
    isSampleData,
    progress,
    refreshData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}