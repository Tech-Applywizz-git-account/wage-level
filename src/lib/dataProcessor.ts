// Data analysis utilities for job data
import { JobData } from './supabase'

export class SponsoredJobsAnalyzer {
  private data: JobData[] = []

  constructor(data: JobData[]) {
    this.data = data
  }

  // Get overall insights
  getOverallInsights() {
    const total = this.data.length
    const sponsored = this.data.filter(job => job.sponsored_job === 'Yes').length
    const nonSponsored = this.data.filter(job => job.sponsored_job === 'No').length
    const doesNotMention = this.data.filter(job => job.sponsored_job === 'Does not mention').length

    return {
      totalJobs: total,
      sponsoredJobs: sponsored,
      nonSponsoredJobs: nonSponsored,
      doesNotMention: doesNotMention,
      sponsoredPercentage: total > 0 ? (sponsored / total) * 100 : 0,
      nonSponsoredPercentage: total > 0 ? (nonSponsored / total) * 100 : 0,
      doesNotMentionPercentage: total > 0 ? (doesNotMention / total) * 100 : 0
    }
  }

  // Get top companies by job count
  getTopCompanies(limit: number = 10) {
    const companyCounts = this.data.reduce((acc, job) => {
      if (job.company && job.company.trim() !== '') {
        acc[job.company] = (acc[job.company] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Get top job roles
  getTopRoles(limit: number = 10) {
    const roleCounts = this.data.reduce((acc, job) => {
      if (job.job_role_name && job.job_role_name.trim() !== '') {
        acc[job.job_role_name] = (acc[job.job_role_name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(roleCounts)
      .map(([job_role_name, count]) => ({ job_role_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Get top locations
  getTopLocations(limit: number = 10) {
    const locationCounts = this.data.reduce((acc, job) => {
      if (job.location && job.location.trim() !== '') {
        acc[job.location] = (acc[job.location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Get role-specific analysis
  getRoleAnalysis(roleName: string) {
    const roleJobs = this.data.filter(job => 
      job.job_role_name.toLowerCase().includes(roleName.toLowerCase())
    )

    if (roleJobs.length === 0) {
      return null
    }

    const sponsored = roleJobs.filter(job => job.sponsored_job === 'Yes').length
    const nonSponsored = roleJobs.filter(job => job.sponsored_job === 'No').length
    const doesNotMention = roleJobs.filter(job => job.sponsored_job === 'Does not mention').length

    const topCompanies = roleJobs.reduce((acc, job) => {
      if (job.company && job.company.trim() !== '') {
        acc[job.company] = (acc[job.company] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topLocations = roleJobs.reduce((acc, job) => {
      if (job.location && job.location.trim() !== '') {
        acc[job.location] = (acc[job.location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      roleName,
      totalJobs: roleJobs.length,
      sponsoredJobs: sponsored,
      nonSponsoredJobs: nonSponsored,
      doesNotMention: doesNotMention,
      sponsoredPercentage: roleJobs.length > 0 ? (sponsored / roleJobs.length) * 100 : 0,
      topCompanies: Object.entries(topCompanies)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topLocations: Object.entries(topLocations)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  }

  // Get company-specific analysis
  getCompanyAnalysis(companyName: string) {
    const companyJobs = this.data.filter(job => 
      job.company.toLowerCase().includes(companyName.toLowerCase())
    )

    if (companyJobs.length === 0) {
      return null
    }

    const sponsored = companyJobs.filter(job => job.sponsored_job === 'Yes').length
    const nonSponsored = companyJobs.filter(job => job.sponsored_job === 'No').length
    const doesNotMention = companyJobs.filter(job => job.sponsored_job === 'Does not mention').length

    const topRoles = companyJobs.reduce((acc, job) => {
      if (job.job_role_name && job.job_role_name.trim() !== '') {
        acc[job.job_role_name] = (acc[job.job_role_name] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topLocations = companyJobs.reduce((acc, job) => {
      if (job.location && job.location.trim() !== '') {
        acc[job.location] = (acc[job.location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      companyName,
      totalJobs: companyJobs.length,
      sponsoredJobs: sponsored,
      nonSponsoredJobs: nonSponsored,
      doesNotMention: doesNotMention,
      sponsoredPercentage: companyJobs.length > 0 ? (sponsored / companyJobs.length) * 100 : 0,
      topRoles: Object.entries(topRoles)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topLocations: Object.entries(topLocations)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  }

  // Get filtered data for data explorer
  getFilteredData(filters: {
    company?: string
    role?: string
    location?: string
    sponsored?: string
    limit?: number
    offset?: number
  }) {
    let filtered = [...this.data]

    if (filters.company) {
      filtered = filtered.filter(job => 
        job.company.toLowerCase().includes(filters.company!.toLowerCase())
      )
    }

    if (filters.role) {
      filtered = filtered.filter(job => 
        job.job_role_name.toLowerCase().includes(filters.role!.toLowerCase())
      )
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      )
    }

    if (filters.sponsored && filters.sponsored !== 'All') {
      filtered = filtered.filter(job => job.sponsored_job === filters.sponsored)
    }

    const total = filtered.length
    const offset = filters.offset || 0
    const limit = filters.limit || 50

    return {
      data: filtered.slice(offset, offset + limit),
      total,
      hasMore: offset + limit < total
    }
  }
}