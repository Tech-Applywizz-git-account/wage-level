'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Overview from '@/components/Overview'
import RoleAnalysis from '@/components/RoleAnalysis'
import CompanyAnalysis from '@/components/CompanyAnalysis'
import TopPerformers from '@/components/TopPerformers'
import DataExplorer from '@/components/DataExplorer'

export default function Home() {
  const [currentView, setCurrentView] = useState('overview')

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