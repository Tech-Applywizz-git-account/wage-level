'use client'

import { useEffect, useState } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { useData } from '@/contexts/DataContext'
import { 
  Briefcase, 
  Building2, 
  Database,
  Target
} from 'lucide-react'


export default function Overview() {
  const { stats, loading, error, isDataLoaded, isSampleData, progress } = useData()
  const [loadingProgress, setLoadingProgress] = useState<string>('')

  useEffect(() => {
    if (isDataLoaded && stats) {
      const dataType = isSampleData ? 'sample' : 'full'
      setLoadingProgress(`✅ ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data loaded! Found ${stats.totalJobs.toLocaleString()} records`)
      setTimeout(() => setLoadingProgress(''), 3000)
    } else if (loading) {
      if (progress.total > 0) {
        const percentage = Math.round((progress.loaded / progress.total) * 100)
        setLoadingProgress(`Loading data... ${progress.loaded.toLocaleString()} / ${progress.total.toLocaleString()} records (${percentage}%)`)
      } else {
        setLoadingProgress('Loading data from server... This may take a few minutes')
      }
    }
  }, [isDataLoaded, stats, loading, isSampleData, progress])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading database statistics...</p>
        {loadingProgress && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">{loadingProgress}</p>
            <p className="text-blue-600 text-sm mt-2">
              Using server-side API for better performance
            </p>
            {progress.total > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.round((progress.loaded / progress.total) * 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Database className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Data</p>
        </div>
        <p className="text-gray-600">{error || 'Unable to load statistics'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const sponsoredData = [
    { name: 'Sponsored', value: stats.sponsoredJobs, color: '#10B981' },
    { name: 'Non-Sponsored', value: stats.nonSponsoredJobs, color: '#EF4444' },
    { name: 'Does Not Mention', value: stats.doesNotMention, color: '#6B7280' }
  ]

  const totalJobs = stats.totalJobs
  const sponsoredPercentage = totalJobs > 0 ? (stats.sponsoredJobs / totalJobs) * 100 : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Overview</h1>
            <p className="text-gray-600">Complete analysis of all 402k+ job records from your Supabase database</p>
          </div>
          <div className="flex items-center space-x-4">
            {loadingProgress && !loading && (
              <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                {loadingProgress}
              </div>
            )}
            <div className={`text-sm px-2 py-1 rounded ${
              isSampleData 
                ? 'text-orange-600 bg-orange-100' 
                : 'text-blue-600 bg-blue-100'
            }`}>
              {isSampleData ? '📊 Sample Dataset (10k)' : '📊 Full Dataset (402k+)'}
            </div>
            {isDataLoaded && (
              <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                💾 Data Cached
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold">{totalJobs.toLocaleString()}</p>
            </div>
            <Database className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Sponsored Jobs</p>
              <p className="text-3xl font-bold">{stats.sponsoredJobs.toLocaleString()}</p>
              <p className="text-green-200 text-sm">{sponsoredPercentage.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Companies</p>
              <p className="text-3xl font-bold">{stats.uniqueCompanies.toLocaleString()}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Job Roles</p>
              <p className="text-3xl font-bold">{stats.uniqueRoles.toLocaleString()}</p>
            </div>
            <Briefcase className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sponsored Jobs Pie Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsored Jobs Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sponsoredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sponsoredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Companies Bar Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Companies</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topCompanies.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="company" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Job Roles */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Job Roles</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.topRoles.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="job_role_name" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Database Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Live Database Connection</h3>
              <p className="text-sm text-green-700">
                Connected to Supabase with {totalJobs.toLocaleString()} records
              </p>
            </div>
          </div>
              <div className="text-right">
                <div className="text-sm font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                  📊 Full Dataset (402k+)
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {isDataLoaded ? 'Cached & Ready' : 'Loading...'}
                </p>
              </div>
        </div>
      </div>
    </div>
  )
}
