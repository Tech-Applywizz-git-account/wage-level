'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useData } from '@/contexts/DataContext'
import { SponsoredJobsAnalyzer } from '@/lib/dataProcessor'
import { JobData } from '@/lib/supabase'
import { Search, Briefcase } from 'lucide-react'


export default function RoleAnalysis() {
  const { jobData, loading, error, isDataLoaded } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [analyzer, setAnalyzer] = useState<SponsoredJobsAnalyzer | null>(null)
  
  // Job details table state
  const [roleFilters, setRoleFilters] = useState({
    sponsorship: 'All',
    company: 'All'
  })
  const [roleCurrentPage, setRoleCurrentPage] = useState(1)
  const [rolePageSize, setRolePageSize] = useState(25)
  const [roleSortField, setRoleSortField] = useState<string>('')
  const [roleSortDirection, setRoleSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (jobData && isDataLoaded) {
      console.log('📊 Using cached data for Role Analysis')
      setAnalyzer(new SponsoredJobsAnalyzer(jobData))
      console.log(`Loaded ${jobData.length} records for role analysis`)
    }
  }, [jobData, isDataLoaded])

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
  }

  const getFilteredRoles = () => {
    if (!analyzer) return []
    
    const topRoles = analyzer.getTopRoles(1000) // Get all roles, not just top 50
    if (!searchTerm) return topRoles
    
    return topRoles.filter(role => 
      role.job_role_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getRoleAnalysis = () => {
    if (!analyzer || !selectedRole) return null
    return analyzer.getRoleAnalysis(selectedRole)
  }

  // Helper functions for job details table
  const convertToCSV = (data: JobData[]) => {
    if (!data.length) return ''
    const headers = Object.keys(data[0]) as (keyof JobData)[]
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')
    return csvContent
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Get filtered job data for selected role
  const getFilteredRoleJobs = () => {
    if (!jobData || !selectedRole) return []
    
    let filtered = jobData.filter(job => job.job_role_name === selectedRole)
    
    // Apply sponsorship filter
    if (roleFilters.sponsorship !== 'All') {
      filtered = filtered.filter(job => job.sponsored_job === roleFilters.sponsorship)
    }
    
    // Apply company filter
    if (roleFilters.company !== 'All') {
      filtered = filtered.filter(job => job.company === roleFilters.company)
    }
    
    return filtered
  }

  const filteredRoleJobs = getFilteredRoleJobs()
  
  // Apply sorting
  const sortedRoleJobs = [...filteredRoleJobs].sort((a, b) => {
    if (!roleSortField) return 0
    
    let aValue = a[roleSortField as keyof typeof a]
    let bValue = b[roleSortField as keyof typeof b]
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''
    
    // Convert to strings for comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (roleSortDirection === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
  
  const roleTotalPages = Math.ceil(sortedRoleJobs.length / rolePageSize)
  const paginatedRoleJobs = sortedRoleJobs.slice(
    (roleCurrentPage - 1) * rolePageSize,
    roleCurrentPage * rolePageSize
  )

  // Get unique sponsorship values from the data
  const getUniqueSponsorshipValues = () => {
    if (!jobData) return []
    const uniqueValues = [...new Set(jobData.map(job => job.sponsored_job).filter(Boolean))]
    return uniqueValues.sort()
  }

  const sponsorshipOptions = getUniqueSponsorshipValues()

  // Handle column sorting
  const handleRoleSort = (field: string) => {
    if (roleSortField === field) {
      setRoleSortDirection(roleSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setRoleSortField(field)
      setRoleSortDirection('asc')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading all 402k+ records for role analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Briefcase className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Data</p>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  const filteredRoles = getFilteredRoles()
  const roleAnalysis = getRoleAnalysis()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Analysis</h1>
        <p className="text-gray-600">Analyze job roles and their sponsorship patterns across all 402k+ records</p>
      </div>

      {/* Search and Role Selection */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search job roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
            </div>
          </div>
        </div>

        {/* Role List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Role to Analyze</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredRoles.map((role) => (
              <button
                key={role.job_role_name}
                onClick={() => handleRoleSelect(role.job_role_name)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  selectedRole === role.job_role_name
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{role.job_role_name}</div>
                <div className="text-sm text-gray-500">{role.count.toLocaleString()} jobs</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Analysis Results */}
      {roleAnalysis && (
        <div className="space-y-8">
          {/* Role Overview */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{roleAnalysis.roleName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold">{roleAnalysis.totalJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Sponsored</p>
                <p className="text-2xl font-bold">{roleAnalysis.sponsoredJobs.toLocaleString()}</p>
                <p className="text-blue-200 text-sm">{roleAnalysis.sponsoredPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Non-Sponsored</p>
                <p className="text-2xl font-bold">{roleAnalysis.nonSponsoredJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Does Not Mention</p>
                <p className="text-2xl font-bold">{roleAnalysis.doesNotMention.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sponsorship Distribution */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsorship Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Sponsored', value: roleAnalysis.sponsoredJobs, color: '#10B981' },
                      { name: 'Non-Sponsored', value: roleAnalysis.nonSponsoredJobs, color: '#EF4444' },
                      { name: 'Does Not Mention', value: roleAnalysis.doesNotMention, color: '#6B7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Sponsored', value: roleAnalysis.sponsoredJobs, color: '#10B981' },
                      { name: 'Non-Sponsored', value: roleAnalysis.nonSponsoredJobs, color: '#EF4444' },
                      { name: 'Does Not Mention', value: roleAnalysis.doesNotMention, color: '#6B7280' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Companies for this Role */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleAnalysis.topCompanies.slice(0, 10)}>
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

          {/* Top Locations */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleAnalysis.topLocations.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="location" 
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

          {/* Job Details Table - Matching Streamlit App */}
          <div className="bg-white rounded-lg border p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details for {selectedRole}</h3>
            
            {/* Filter Options */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Filter Jobs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Sponsorship Status:
                  </label>
                  <select
                    value={roleFilters.sponsorship}
                    onChange={(e) => setRoleFilters(prev => ({ ...prev, sponsorship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="All">All</option>
                    {sponsorshipOptions.map((value, index) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Company:
                  </label>
                  <select
                    value={roleFilters.company}
                    onChange={(e) => setRoleFilters(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="All">All</option>
                    {roleAnalysis.topCompanies.map((company, index) => (
                      <option key={index} value={company.company}>{company.company}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Settings */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Rows per page:</label>
                <select
                  value={rolePageSize}
                  onChange={(e) => {
                    setRolePageSize(Number(e.target.value))
                    setRoleCurrentPage(1)
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                </select>
              </div>
                <div className="text-sm text-gray-600">
                  Showing {sortedRoleJobs.length.toLocaleString()} jobs for {selectedRole} (filtered)
                </div>
            </div>

            {/* Pagination Controls */}
            {roleTotalPages > 1 && (
              <div className="mb-4 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setRoleCurrentPage(1)}
                  disabled={roleCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏮️ First
                </button>
                <button
                  onClick={() => setRoleCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={roleCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⬅️ Previous
                </button>
                <span className="px-4 py-1 text-sm font-medium">
                  Page {roleCurrentPage} of {roleTotalPages}
                </span>
                <button
                  onClick={() => setRoleCurrentPage(prev => Math.min(roleTotalPages, prev + 1))}
                  disabled={roleCurrentPage === roleTotalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ➡️
                </button>
                <button
                  onClick={() => setRoleCurrentPage(roleTotalPages)}
                  disabled={roleCurrentPage === roleTotalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last ⏭️
                </button>
              </div>
            )}

            {/* Job Details Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('title')}
                    >
                      <div className="flex items-center">
                        Title
                        {roleSortField === 'title' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('company')}
                    >
                      <div className="flex items-center">
                        Company
                        {roleSortField === 'company' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('location')}
                    >
                      <div className="flex items-center">
                        Location
                        {roleSortField === 'location' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('job_role_name')}
                    >
                      <div className="flex items-center">
                        Job Role
                        {roleSortField === 'job_role_name' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('job_description')}
                    >
                      <div className="flex items-center">
                        Description
                        {roleSortField === 'job_description' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('date_posted')}
                    >
                      <div className="flex items-center">
                        Date Posted
                        {roleSortField === 'date_posted' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleRoleSort('sponsored_job')}
                    >
                      <div className="flex items-center">
                        Sponsored
                        {roleSortField === 'sponsored_job' && (
                          <span className="ml-1">
                            {roleSortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRoleJobs.map((job, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.job_role_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {job.job_description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.sponsored_job === 'Yes' ? 'bg-green-100 text-green-800' :
                          job.sponsored_job === 'No' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.sponsored_job}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.url ? (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            🔗 Job Link
                          </a>
                        ) : job.website ? (
                          <a
                            href={job.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            🔗 Company Site
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Download Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  const csv = convertToCSV(sortedRoleJobs)
                  downloadCSV(csv, `${selectedRole?.replace(/\s+/g, '_') || 'role'}_jobs.csv`)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Download {selectedRole} Jobs as CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedRole && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role to Analyze</h3>
          <p className="text-gray-600">Choose a job role from the list above to see detailed analysis</p>
        </div>
      )}

    </div>
  )
}
