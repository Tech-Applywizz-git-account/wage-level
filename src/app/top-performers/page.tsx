'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { useData } from '@/contexts/DataContext'
import { SponsoredJobsAnalyzer } from '@/lib/dataProcessor'
import { TrendingUp, Award, Building2, Briefcase, Target } from 'lucide-react'

export default function TopPerformers() {
  const { jobData, loading, error, isDataLoaded } = useData()
  const [analyzer, setAnalyzer] = useState<SponsoredJobsAnalyzer | null>(null)

  useEffect(() => {
    if (jobData && isDataLoaded) {
      console.log('📊 Using cached data for Top Performers')
      setAnalyzer(new SponsoredJobsAnalyzer(jobData))
      console.log(`Loaded ${jobData.length} records for top performers analysis`)
    }
  }, [jobData, isDataLoaded])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading all 402k+ records for top performers analysis...</p>
      </div>
    )
  }

  if (error || !analyzer) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <TrendingUp className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Data</p>
        </div>
        <p className="text-gray-600">{error || 'Unable to load data'}</p>
      </div>
    )
  }

  // Get top performers data
  const topCompanies = analyzer.getTopCompanies(50) // Show more companies
  const topRoles = analyzer.getTopRoles(50) // Show more roles
  const topLocations = analyzer.getTopLocations(50) // Show more locations

      // Calculate sponsored job percentages for companies
      const companiesWithSponsorship = topCompanies.map(company => {
        const companyJobs = jobData?.filter(job => job.company === company.company) || []
    const sponsoredJobs = companyJobs.filter(job => job.sponsored_job === 'Yes').length
    const totalJobs = companyJobs.length
    const sponsoredPercentage = totalJobs > 0 ? (sponsoredJobs / totalJobs) * 100 : 0
    
    return {
      ...company,
      sponsoredJobs,
      sponsoredPercentage
    }
  }).sort((a, b) => b.sponsoredPercentage - a.sponsoredPercentage)

  // Calculate sponsored job percentages for roles
  const rolesWithSponsorship = topRoles.map(role => {
    const roleJobs = jobData?.filter(job => job.job_role_name === role.job_role_name) || []
    const sponsoredJobs = roleJobs.filter(job => job.sponsored_job === 'Yes').length
    const totalJobs = roleJobs.length
    const sponsoredPercentage = totalJobs > 0 ? (sponsoredJobs / totalJobs) * 100 : 0
    
    return {
      ...role,
      sponsoredJobs,
      sponsoredPercentage
    }
  }).sort((a, b) => b.sponsoredPercentage - a.sponsoredPercentage)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Performers</h1>
        <p className="text-gray-600">Companies and roles with the highest sponsorship rates across all 402k+ records</p>
      </div>

      {/* Top Sponsored Companies */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-4">
            <Award className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Companies by Sponsorship Rate</h3>
          </div>
          <p className="text-gray-600 mb-6">Companies with the highest percentage of sponsored jobs</p>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={companiesWithSponsorship.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="company" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Sponsorship Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Sponsorship Rate']}
                labelFormatter={(label) => `Company: ${label}`}
              />
              <Bar dataKey="sponsoredPercentage" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Sponsored Roles */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Roles by Sponsorship Rate</h3>
          </div>
          <p className="text-gray-600 mb-6">Job roles with the highest percentage of sponsored positions</p>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={rolesWithSponsorship.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="role" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Sponsorship Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Sponsorship Rate']}
                labelFormatter={(label) => `Role: ${label}`}
              />
              <Bar dataKey="sponsoredPercentage" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Companies by Volume */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-4">
            <Building2 className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Companies by Job Volume</h3>
          </div>
          <p className="text-gray-600 mb-6">Companies with the most job postings</p>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCompanies.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="company" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Roles by Volume */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="h-6 w-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Roles by Job Volume</h3>
          </div>
          <p className="text-gray-600 mb-6">Job roles with the most postings</p>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topRoles.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="role" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Best Sponsorship Rate</p>
              <p className="text-2xl font-bold">
                {companiesWithSponsorship[0]?.sponsoredPercentage.toFixed(1)}%
              </p>
              <p className="text-green-200 text-sm">
                {companiesWithSponsorship[0]?.company}
              </p>
            </div>
            <Award className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Most Active Company</p>
              <p className="text-2xl font-bold">
                {topCompanies[0]?.count.toLocaleString()}
              </p>
              <p className="text-blue-200 text-sm">
                {topCompanies[0]?.company}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Most Popular Role</p>
              <p className="text-2xl font-bold">
                {topRoles[0]?.count.toLocaleString()}
              </p>
              <p className="text-purple-200 text-sm">
                {topRoles[0]?.job_role_name}
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
