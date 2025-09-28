import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '1000')
    const sample = searchParams.get('sample') === 'true'
    
    console.log(`📊 API: Fetching ${sample ? 'sample' : 'page'} data - page ${page}, size ${pageSize}`)
    
    if (sample) {
      // For sample data, limit to 10k records
      const { data, error } = await supabase
        .from('job_jobrole_sponsored')
        .select('*')
        .range(0, 9999)
        .order('id', { ascending: true })
        .limit(10000)
      
      if (error) {
        console.error('❌ API Error fetching sample data:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      console.log(`✅ API: Sample data fetched - ${data?.length || 0} records`)
      return NextResponse.json({ 
        data: data || [], 
        total: data?.length || 0,
        isSample: true 
      })
    }
    
    // Regular pagination
    const { data, error } = await supabase
      .from('job_jobrole_sponsored')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('id', { ascending: true })
    
    if (error) {
      console.error(`❌ API Error fetching page ${page}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`✅ API: Page ${page} fetched - ${data?.length || 0} records`)
    return NextResponse.json({ 
      data: data || [], 
      page,
      pageSize,
      hasMore: data?.length === pageSize
    })
    
  } catch (error) {
    console.error('❌ API Critical error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Get database statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'stats') {
      console.log('📊 API: Fetching database statistics...')
      
      // Get count first
      const { count, error: countError } = await supabase
        .from('job_jobrole_sponsored')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('❌ API Error getting count:', countError)
        return NextResponse.json({ error: countError.message }, { status: 500 })
      }
      
      // Get sample data for statistics
      const { data: sampleData, error: sampleError } = await supabase
        .from('job_jobrole_sponsored')
        .select('sponsored_job, company, job_role_name, location')
        .limit(10000)
        .order('id', { ascending: true })
      
      if (sampleError) {
        console.error('❌ API Error getting sample data:', sampleError)
        return NextResponse.json({ error: sampleError.message }, { status: 500 })
      }
      
      // Calculate stats from sample
      const totalJobs = count || 0
      const sponsoredJobs = sampleData?.filter(job => job.sponsored_job === 'Yes').length || 0
      const nonSponsoredJobs = sampleData?.filter(job => job.sponsored_job === 'No').length || 0
      const doesNotMention = sampleData?.filter(job => job.sponsored_job === 'Does not mention').length || 0
      
      // Get unique counts from sample
      const uniqueCompanies = new Set(sampleData?.map(job => job.company).filter(Boolean)).size
      const uniqueRoles = new Set(sampleData?.map(job => job.job_role_name).filter(Boolean)).size
      const uniqueLocations = new Set(sampleData?.map(job => job.location).filter(Boolean)).size
      
      // Get top companies from sample
      const companyCounts = sampleData?.reduce((acc, job) => {
        if (job.company && job.company.trim() !== '') {
          acc[job.company] = (acc[job.company] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}
      
      const topCompanies = Object.entries(companyCounts)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      
      // Get top roles from sample
      const roleCounts = sampleData?.reduce((acc, job) => {
        if (job.job_role_name && job.job_role_name.trim() !== '') {
          acc[job.job_role_name] = (acc[job.job_role_name] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}
      
      const topRoles = Object.entries(roleCounts)
        .map(([job_role_name, count]) => ({ job_role_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      
      // Get top locations from sample
      const locationCounts = sampleData?.reduce((acc, job) => {
        if (job.location && job.location.trim() !== '') {
          acc[job.location] = (acc[job.location] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}
      
      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      
      const stats = {
        totalJobs,
        sponsoredJobs: Math.round((sponsoredJobs / (sampleData?.length || 1)) * totalJobs),
        nonSponsoredJobs: Math.round((nonSponsoredJobs / (sampleData?.length || 1)) * totalJobs),
        doesNotMention: Math.round((doesNotMention / (sampleData?.length || 1)) * totalJobs),
        uniqueCompanies,
        uniqueRoles,
        uniqueLocations,
        topCompanies,
        topRoles,
        topLocations,
        isSampleStats: true,
        sampleSize: sampleData?.length || 0
      }
      
      console.log('✅ API: Statistics calculated successfully')
      return NextResponse.json(stats)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ API Critical error in POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
