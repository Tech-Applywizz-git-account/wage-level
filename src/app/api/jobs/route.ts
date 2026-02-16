import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateMockH1BData } from "@/lib/h1b-utils";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function extractCityId(location: string): string | null {
    if (!location) return null;
    const match = location.match(/^([^,]+),\s*([A-Z]{2})$/i);
    if (match) {
        const city = match[1].trim();
        const state = match[2].toUpperCase();
        return `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
    }
    if (location.toLowerCase().includes("remote")) {
        return "remote";
    }
    return null;
}

function extractStateCode(location: string): string | null {
    if (!location) return null;
    const match = location.match(/,\s*([A-Z]{2})$/i);
    return match ? match[1].toUpperCase() : null;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get filter parameters
        const citiesParam = searchParams.get("cities");
        const statesParam = searchParams.get("states");
        const isRemote = searchParams.get("remote") === "true";
        const limit = parseInt(searchParams.get("limit") || "50");

        const cities = citiesParam ? citiesParam.split(",") : [];
        const states = statesParam ? statesParam.split(",") : [];

        // Start with base query
        const query = supabase
            .from("job_jobrole_sponsored")
            .select("id, company, title, job_role_name, location, date_posted, url, sponsored_job");

        // Fetch all jobs first, then filter in memory
        // (Supabase doesn't support complex location filtering in SQL)
        const { data: allJobs, error } = await query
            .not("location", "is", null)
            .order("date_posted", { ascending: false, nullsFirst: false })
            .limit(1000); // Fetch more to filter from

        if (error) throw error;

        // Filter jobs based on location criteria
        let filteredJobs = allJobs || [];

        if (cities.length > 0 || states.length > 0 || isRemote) {
            filteredJobs = filteredJobs.filter((job) => {
                const cityId = extractCityId(job.location);
                const stateCode = extractStateCode(job.location);

                // Check remote filter
                if (isRemote && cityId === "remote") return true;

                // Check city filter
                if (cities.length > 0 && cityId && cities.includes(cityId)) return true;

                // Check state filter
                if (states.length > 0 && stateCode && states.includes(stateCode)) return true;

                // If no filters match and filters are active, exclude
                return cities.length === 0 && states.length === 0 && !isRemote;
            });
        }

        // Limit results
        filteredJobs = filteredJobs.slice(0, limit);

        // Transform to match SponsorshipTable format and add H1B data
        const jobs = filteredJobs.map((job, index) => ({
            id: job.id || index + 1,
            companyName: job.company,
            companyId: job.company?.toLowerCase().replace(/\s+/g, "-") || `company-${index}`,
            domainName: job.job_role_name || "Unknown",
            role: job.title || job.job_role_name || "Unknown Role",
            location: job.location || "Unknown",
            postedDate: job.date_posted || new Date().toISOString().split("T")[0],
            jobLink: job.url || "#",
            sponsorship: job.sponsored_job === "Yes",
            // Generate mock H1B data for now (replace with pre-calculated data later)
            h1bWageData: generateMockH1BData(
                job.title || job.job_role_name || "Software Engineer",
                job.location || "Unknown"
            ),
        }));

        return NextResponse.json({
            jobs,
            count: jobs.length,
            total: filteredJobs.length,
            filters: {
                cities,
                states,
                isRemote,
            },
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
