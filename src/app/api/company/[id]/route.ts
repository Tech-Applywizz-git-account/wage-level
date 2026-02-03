import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚡ ULTRA-FAST: Cache for 5 minutes, serve stale for 10 minutes
export const revalidate = 300;
export const dynamic = 'force-static';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const startTime = Date.now();

  try {
    const { id } = await context.params;
    const companyName = decodeURIComponent(id);

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    console.log(`⚡ Fetching jobs for company: "${companyName}", page ${page}`)

      ;

    // 🚀 OPTIMIZATION: Single query with count
    // Use ilike for case-insensitive matching
    const { data, error, count } = await supabase
      .from("job_jobrole_sponsored")
      .select("company, job_role_name, title, location, date_posted, url", { count: 'exact' })
      .ilike("company", companyName)  // Case-insensitive match
      .order("date_posted", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log(`📊 Query returned ${data?.length || 0} jobs, total count: ${count}`);

    // Format response
    const jobs = (data || []).map((job) => ({
      company: job.company,
      role: job.title,
      domain: job.job_role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.url,
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${jobs.length} jobs in ${duration}ms`);

    return NextResponse.json({
      company: companyName,
      jobs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      _meta: {
        duration: `${duration}ms`,
        cached: false
      }
    }, {
      headers: {
        // 🚀 AGGRESSIVE CACHING
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, max-age=300',
        'CDN-Cache-Control': 'public, s-maxage=600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=600',
      }
    });
  } catch (error: any) {
    console.error("❌ Error in /api/company/[id]:", error);
    return NextResponse.json({
      error: error.message,
      company: '',
      jobs: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    }, { status: 500 });
  }
}
