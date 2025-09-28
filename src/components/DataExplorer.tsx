'use client'

import { useEffect, useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { SponsoredJobsAnalyzer } from '@/lib/dataProcessor'
import { JobData } from '@/lib/supabase'
import { Search, Filter, ChevronLeft, ChevronRight, Database, Eye } from 'lucide-react'

export default function DataExplorer() {
  const { jobData, loading, error, isDataLoaded } = useData()
  const [analyzer, setAnalyzer] = useState<SponsoredJobsAnalyzer | null>(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    company: '',
    role: '',
    location: '',
    sponsored: 'All'
  })
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filteredData, setFilteredData] = useState<JobData[]>([])
  
  // Dropdown options
  const [companyOptions, setCompanyOptions] = useState<string[]>([])
  const [roleOptions, setRoleOptions] = useState<string[]>([])
  const [locationOptions, setLocationOptions] = useState<string[]>([])
  
  // Search states for dropdowns
  const [companySearch, setCompanySearch] = useState('')
  const [roleSearch, setRoleSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')

  useEffect(() => {
    if (jobData && isDataLoaded) {
      console.log('📊 Using cached data for Data Explorer')
      setAnalyzer(new SponsoredJobsAnalyzer(jobData))
      console.log(`Loaded ${jobData.length} records for data explorer`)
      
      // Populate dropdown options
      const companies = [...new Set(jobData.map(job => job.company).filter(Boolean))].sort()
      const roles = [...new Set(jobData.map(job => job.job_role_name).filter(Boolean))].sort()
      const locations = [...new Set(jobData.map(job => job.location).filter(Boolean))].sort()
      
      setCompanyOptions(companies)
      setRoleOptions(roles)
      setLocationOptions(locations)
    }
  }, [jobData, isDataLoaded])

  useEffect(() => {
    if (analyzer) {
      const result = analyzer.getFilteredData({
        ...filters,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      })
      setFilteredData(result.data)
      setTotalRecords(result.total)
    }
  }, [analyzer, filters, currentPage, pageSize])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      company: '',
      role: '',
      location: '',
      sponsored: 'All'
    })
    setCurrentPage(1)
    setCompanySearch('')
    setRoleSearch('')
    setLocationSearch('')
  }

  // Filter dropdown options based on search
  const getFilteredOptions = (options: string[], search: string) => {
    if (!search) return options.slice(0, 100) // Limit to first 100 for performance
    return options.filter(option => 
      option.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 100)
  }

  const totalPages = Math.ceil(totalRecords / pageSize)

  // Get unique sponsorship values from the data
  const getUniqueSponsorshipValues = () => {
    if (!jobData) return []
    const uniqueValues = [...new Set(jobData.map(job => job.sponsored_job).filter(Boolean))]
    return uniqueValues.sort()
  }

  const sponsorshipOptions = getUniqueSponsorshipValues()

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading all 402k+ records for data explorer...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <Database className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Data</p>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Explorer</h1>
        <p className="text-gray-600">Explore and filter all 402k+ job records from your Supabase database</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              {companySearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredOptions(companyOptions, companySearch).map((company) => (
                    <button
                      key={company}
                      onClick={() => {
                        handleFilterChange('company', company)
                        setCompanySearch('')
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                    >
                      {company}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filters.company && (
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500">Selected: {filters.company}</span>
                <button
                  onClick={() => handleFilterChange('company', '')}
                  className="ml-2 text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Job Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              {roleSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredOptions(roleOptions, roleSearch).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        handleFilterChange('role', role)
                        setRoleSearch('')
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filters.role && (
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500">Selected: {filters.role}</span>
                <button
                  onClick={() => handleFilterChange('role', '')}
                  className="ml-2 text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Location Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search locations..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              {locationSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredOptions(locationOptions, locationSearch).map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        handleFilterChange('location', location)
                        setLocationSearch('')
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filters.location && (
              <div className="mt-1 flex items-center">
                <span className="text-xs text-gray-500">Selected: {filters.location}</span>
                <button
                  onClick={() => handleFilterChange('location', '')}
                  className="ml-2 text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Sponsorship Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sponsorship Status
            </label>
            <select
              value={filters.sponsored}
              onChange={(e) => handleFilterChange('sponsored', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="All">All</option>
              {sponsorshipOptions.map((value, index) => (
                <option key={index} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear All Filters
          </button>
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {totalRecords.toLocaleString()} records
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsored
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.company || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.job_role_name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.sponsored_job === 'Yes' 
                        ? 'bg-green-100 text-green-800'
                        : job.sponsored_job === 'No'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.sponsored_job || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Job
                      </a>
                    ) : job.website ? (
                      <a
                        href={job.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Company Site
                      </a>
                    ) : (
                      <span className="text-gray-400 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalRecords)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalRecords.toLocaleString()}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
