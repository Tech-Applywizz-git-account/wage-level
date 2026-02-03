import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserCountry } from "@/lib/session";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get parameters
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || "today";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Calculate dates
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 7);
    const formattedLastWeekStart = lastWeekStart.toISOString().split("T")[0];

    // Determine filtering mode
    let isLastWeek = dateParam === "last_week";
    const targetDate = dateParam === "today"
      ? now.toISOString().split("T")[0]
      : dateParam;

    // Get country (async)
    const countryPromise = getUserCountry(req);

    // Build jobs query based on filter type
    let latestJobsPromise;
    if (isLastWeek) {
      // Query for last 7 days range (≥ last week start date)
      latestJobsPromise = supabase
        .from("job_jobrole_sponsored")
        .select("company, job_role_name, title, location, date_posted, url", { count: "exact" })
        .gte("date_posted", formattedLastWeekStart)
        .order("date_posted", { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);
    } else {
      // Query for specific date
      latestJobsPromise = supabase
        .from("job_jobrole_sponsored")
        .select("company, job_role_name, title, location, date_posted, url", { count: "exact" })
        .eq("date_posted", targetDate)
        .order("date_posted", { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);
    }

    // Execute ALL queries in PARALLEL for maximum speed
    const [
      country,
      totalCompaniesResult,
      totalDomainsResult,
      sponsorshipCompaniesResult,
      latestJobsResult,
      topCompaniesResult
    ] = await Promise.all([
      countryPromise,

      // Total Companies
      supabase
        .from("job_jobrole_sponsored")
        .select("*", { count: "exact", head: true }),

      // Total Domains
      supabase
        .from("unique_job_role_names")
        .select("*", { count: "exact", head: true }),

      // Sponsorship Companies (last week)
      supabase
        .from("job_jobrole_sponsored")
        .select("*", { count: "exact", head: true })
        .eq("sponsored_job", "Yes")
        .gte("date_posted", formattedLastWeekStart),

      // Latest Jobs (with dynamic filtering)
      latestJobsPromise,

      // Top Companies
      supabase
        .from("companies_by_sponsored_jobs")
        .select("*")
        .order("sponsored_count", { ascending: false })
        .limit(10)
    ]);

    // Check for errors
    if (totalCompaniesResult.error) throw totalCompaniesResult.error;
    if (totalDomainsResult.error) throw totalDomainsResult.error;
    if (sponsorshipCompaniesResult.error) throw sponsorshipCompaniesResult.error;
    if (latestJobsResult.error) throw latestJobsResult.error;
    if (topCompaniesResult.error) throw topCompaniesResult.error;

    // Transform data
    const latest_jobs = (latestJobsResult.data || []).map((job) => ({
      company: job.company,
      role: job.title,
      domain: job.job_role_name,
      location: job.location,
      posted: job.date_posted,
      link: job.url,
    }));

    // Return response
    return NextResponse.json({
      total_companies: totalCompaniesResult.count ?? 0,
      total_domains: totalDomainsResult.count ?? 0,
      sponsorship_companies: sponsorshipCompaniesResult.count ?? 0,
      latest_jobs,
      latest_jobs_pagination: {
        page,
        limit,
        total: latestJobsResult.count ?? 0,
        totalPages: Math.ceil((latestJobsResult.count ?? 0) / limit),
        hasNext: offset + limit < (latestJobsResult.count ?? 0),
        hasPrev: page > 1,
      },
      top_companies: topCompaniesResult.data || [],
      // Return filter mode for UI
      filter_mode: isLastWeek ? "last_week" : "specific_date",
    });
  } catch (error: any) {
    console.error("Error in /api/overview route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
