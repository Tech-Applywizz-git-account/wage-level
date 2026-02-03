import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function extractCityState(location: string): { city: string; state: string; stateCode: string } | null {
    if (!location) return null;

    // Handle formats like "San Francisco, CA" or "New York, NY"
    const match = location.match(/^([^,]+),\s*([A-Z]{2})$/i);
    if (match) {
        return {
            city: match[1].trim(),
            state: getStateName(match[2].toUpperCase()),
            stateCode: match[2].toUpperCase(),
        };
    }

    // Handle "Remote" or variations
    if (location.toLowerCase().includes("remote")) {
        return {
            city: "Remote",
            state: "Various",
            stateCode: "US",
        };
    }

    return null;
}

function getStateName(code: string): string {
    const stateMap: Record<string, string> = {
        "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
        "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
        "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
        "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
        "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
        "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
        "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
        "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
        "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
        "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
        "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
        "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
        "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
    };
    return stateMap[code] || code;
}

function getCityId(city: string, stateCode: string): string {
    return `${city.toLowerCase().replace(/\s+/g, "-")}-${stateCode.toLowerCase()}`;
}

export async function GET(request: NextRequest) {
    try {
        // Fetch all jobs with locations
        const { data: jobs, error } = await supabase
            .from("job_jobrole_sponsored")
            .select("location")
            .not("location", "is", null);

        if (error) throw error;

        // Process locations
        const cityMap = new Map<string, { city: string; state: string; stateCode: string; count: number }>();
        const stateMap = new Map<string, { name: string; count: number }>();

        jobs?.forEach((job) => {
            const parsed = extractCityState(job.location);
            if (!parsed) return;

            const { city, state, stateCode } = parsed;
            const cityId = getCityId(city, stateCode);

            // Count cities
            if (cityMap.has(cityId)) {
                cityMap.get(cityId)!.count++;
            } else {
                cityMap.set(cityId, { city, state, stateCode, count: 1 });
            }

            // Count states
            if (stateCode !== "US") { // Skip generic "US" for remote jobs
                if (stateMap.has(stateCode)) {
                    stateMap.get(stateCode)!.count++;
                } else {
                    stateMap.set(stateCode, { name: state, count: 1 });
                }
            }
        });

        // Convert to arrays and sort by job count
        const cities = Array.from(cityMap.entries())
            .map(([id, data]) => ({
                id,
                name: data.city,
                state: data.state,
                stateCode: data.stateCode,
                msaCode: "", // MSA codes can be added later if needed
                msaName: `${data.city}, ${data.stateCode} Metropolitan Area`,
                jobCount: data.count,
            }))
            .sort((a, b) => b.jobCount - a.jobCount);

        const states = Array.from(stateMap.entries())
            .map(([code, data]) => ({
                code,
                name: data.name,
                jobCount: data.count,
            }))
            .sort((a, b) => b.jobCount - a.jobCount);

        const response = {
            cities,
            states,
            totalCities: cities.length,
            totalStates: states.length,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
