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
import { Search, Building2 } from 'lucide-react'

export default function CompanyAnalysis() {
  const { jobData, loading, error, isDataLoaded } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [analyzer, setAnalyzer] = useState<SponsoredJobsAnalyzer | null>(null)
  
  // Job details table state
  const [companyFilters, setCompanyFilters] = useState({
    sponsorship: 'All',
    role: 'All'
  })
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1)
  const [companyPageSize, setCompanyPageSize] = useState(25)
  const [companySortField, setCompanySortField] = useState<string>('')
  const [companySortDirection, setCompanySortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (jobData && isDataLoaded) {
      console.log('📊 Using cached data for Company Analysis')
      setAnalyzer(new SponsoredJobsAnalyzer(jobData))
      console.log(`Loaded ${jobData.length} records for company analysis`)
    }
  }, [jobData, isDataLoaded])

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company)
  }

  const getFilteredCompanies = () => {
    if (!analyzer) return []
    
    const topCompanies = analyzer.getTopCompanies(1000) // Get all companies, not just top 50
    if (!searchTerm) return topCompanies
    
    return topCompanies.filter(company => 
      company.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getCompanyAnalysis = () => {
    if (!analyzer || !selectedCompany) return null
    return analyzer.getCompanyAnalysis(selectedCompany)
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

  // Get filtered job data for selected company
  const getFilteredCompanyJobs = () => {
    if (!jobData || !selectedCompany) return []
    
    let filtered = jobData.filter(job => job.company === selectedCompany)
    
    // Apply sponsorship filter
    if (companyFilters.sponsorship !== 'All') {
      filtered = filtered.filter(job => job.sponsored_job === companyFilters.sponsorship)
    }
    
    // Apply role filter
    if (companyFilters.role !== 'All') {
      filtered = filtered.filter(job => job.job_role_name === companyFilters.role)
    }
    
    return filtered
  }

  const filteredCompanyJobs = getFilteredCompanyJobs()
  
  // Apply sorting
  const sortedCompanyJobs = [...filteredCompanyJobs].sort((a, b) => {
    if (!companySortField) return 0
    
    let aValue = a[companySortField as keyof typeof a]
    let bValue = b[companySortField as keyof typeof b]
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''
    
    // Convert to strings for comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (companySortDirection === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
  
  const companyTotalPages = Math.ceil(sortedCompanyJobs.length / companyPageSize)
  const paginatedCompanyJobs = sortedCompanyJobs.slice(
    (companyCurrentPage - 1) * companyPageSize,
    companyCurrentPage * companyPageSize
  )

  // Get unique sponsorship values from the data
  const getUniqueSponsorshipValues = () => {
    if (!jobData) return []
    const uniqueValues = [...new Set(jobData.map(job => job.sponsored_job).filter(Boolean))]
    return uniqueValues.sort()
  }

  const sponsorshipOptions = getUniqueSponsorshipValues()

  // Handle column sorting
  const handleCompanySort = (field: string) => {
    if (companySortField === field) {
      setCompanySortDirection(companySortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setCompanySortField(field)
      setCompanySortDirection('asc')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading all 402k+ records for company analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Building2 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Data</p>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  const filteredCompanies = getFilteredCompanies()
  const companyAnalysis = getCompanyAnalysis()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Analysis</h1>
        <p className="text-gray-600">Analyze companies and their job posting patterns across all 402k+ records</p>
      </div>

      {/* Search and Company Selection */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
            </div>
          </div>
        </div>

        {/* Company List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Company to Analyze</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredCompanies.map((company) => (
              <button
                key={company.company}
                onClick={() => handleCompanySelect(company.company)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  selectedCompany === company.company
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{company.company}</div>
                <div className="text-sm text-gray-500">{company.count.toLocaleString()} jobs</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Company Analysis Results */}
      {companyAnalysis && (
        <div className="space-y-8">
          {/* Company Overview */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{companyAnalysis.companyName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-purple-100 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold">{companyAnalysis.totalJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Sponsored</p>
                <p className="text-2xl font-bold">{companyAnalysis.sponsoredJobs.toLocaleString()}</p>
                <p className="text-purple-200 text-sm">{companyAnalysis.sponsoredPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Non-Sponsored</p>
                <p className="text-2xl font-bold">{companyAnalysis.nonSponsoredJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Does Not Mention</p>
                <p className="text-2xl font-bold">{companyAnalysis.doesNotMention.toLocaleString()}</p>
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
                      { name: 'Sponsored', value: companyAnalysis.sponsoredJobs, color: '#10B981' },
                      { name: 'Non-Sponsored', value: companyAnalysis.nonSponsoredJobs, color: '#EF4444' },
                      { name: 'Does Not Mention', value: companyAnalysis.doesNotMention, color: '#6B7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Sponsored', value: companyAnalysis.sponsoredJobs, color: '#10B981' },
                      { name: 'Non-Sponsored', value: companyAnalysis.nonSponsoredJobs, color: '#EF4444' },
                      { name: 'Does Not Mention', value: companyAnalysis.doesNotMention, color: '#6B7280' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Roles for this Company */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Job Roles</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyAnalysis.topRoles.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="role" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyAnalysis.topLocations.slice(0, 10)}>
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
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Job Details Table - Matching Streamlit App */}
          <div className="bg-white rounded-lg border p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details for {selectedCompany}</h3>
            
            {/* Filter Options */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Filter Jobs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Sponsorship Status:
                  </label>
                  <select
                    value={companyFilters.sponsorship}
                    onChange={(e) => setCompanyFilters(prev => ({ ...prev, sponsorship: e.target.value }))}
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
                    Filter by Job Role:
                  </label>
                  <select
                    value={companyFilters.role}
                    onChange={(e) => setCompanyFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="All">All</option>
                    {companyAnalysis.topRoles.map((role, index) => (
                      <option key={index} value={role.role}>{role.role}</option>
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
                  value={companyPageSize}
                  onChange={(e) => {
                    setCompanyPageSize(Number(e.target.value))
                    setCompanyCurrentPage(1)
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
                  Showing {sortedCompanyJobs.length.toLocaleString()} jobs for {selectedCompany} (filtered)
                </div>
            </div>

            {/* Pagination Controls */}
            {companyTotalPages > 1 && (
              <div className="mb-4 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCompanyCurrentPage(1)}
                  disabled={companyCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏮️ First
                </button>
                <button
                  onClick={() => setCompanyCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={companyCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⬅️ Previous
                </button>
                <span className="px-4 py-1 text-sm font-medium">
                  Page {companyCurrentPage} of {companyTotalPages}
                </span>
                <button
                  onClick={() => setCompanyCurrentPage(prev => Math.min(companyTotalPages, prev + 1))}
                  disabled={companyCurrentPage === companyTotalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ➡️
                </button>
                <button
                  onClick={() => setCompanyCurrentPage(companyTotalPages)}
                  disabled={companyCurrentPage === companyTotalPages}
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
                      onClick={() => handleCompanySort('title')}
                    >
                      <div className="flex items-center">
                        Title
                        {companySortField === 'title' && (
                          <span className="ml-1">
                            {companySortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleCompanySort('job_role_name')}
                    >
                      <div className="flex items-center">
                        Job Role
                        {companySortField === 'job_role_name' && (
                          <span className="ml-1">
                            {companySortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleCompanySort('location')}
                    >
                      <div className="flex items-center">
                        Location
                        {companySortField === 'location' && (
                          <span className="ml-1">
                            {companySortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleCompanySort('job_description')}
                    >
                      <div className="flex items-center">
                        Description
                        {companySortField === 'job_description' && (
                          <span className="ml-1">
                            {companySortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleCompanySort('date_posted')}
                    >
                      <div className="flex items-center">
                        Date Posted
                        {companySortField === 'date_posted' && (
                          <span className="ml-1">
                            {companySortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleCompanySort('sponsored_job')}
                    >
                      <div className="flex items-center">
                        Sponsored
                        {companySortField === 'sponsored_job' && (
                          <span className="ml-1">
                            {companySortDirection === 'asc' ? '↑' : '↓'}
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
                  {paginatedCompanyJobs.map((job, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.job_role_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.location}
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
                  const csv = convertToCSV(sortedCompanyJobs)
                  downloadCSV(csv, `${selectedCompany?.replace(/\s+/g, '_').replace('&', 'and') || 'company'}_jobs.csv`)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Download {selectedCompany} Jobs as CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedCompany && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Company to Analyze</h3>
          <p className="text-gray-600">Choose a company from the list above to see detailed analysis</p>
        </div>
      )}

    </div>
  )
}
