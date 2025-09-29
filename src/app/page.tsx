'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Overview from '@/components/Overview'
import RoleAnalysis from '@/components/RoleAnalysis'
import CompanyAnalysis from '@/components/CompanyAnalysis'
import TopPerformers from '@/components/TopPerformers'
import DataExplorer from '@/components/DataExplorer'
import AdminControls from '@/components/AdminControls'
import LoginPage from '@/components/LoginPage'

export default function Home() {
  const [currentView, setCurrentView] = useState('overview')
  const { user, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview />
      case 'role-analysis':
        return <RoleAnalysis />
      case 'company-analysis':
        return <CompanyAnalysis />
      case 'top-performers':
        return <TopPerformers />
      case 'data-explorer':
        return <DataExplorer />
      case 'admin-controls':
        return <AdminControls />
      default:
        return <Overview />
    }
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  )
}