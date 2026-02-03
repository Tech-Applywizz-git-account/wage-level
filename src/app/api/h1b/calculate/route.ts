import { NextRequest, NextResponse } from "next/server";

// O*NET Code Mapping - Top job titles to O*NET SOC codes
const ONET_MAPPING: Record<string, string> = {
    "software engineer": "15-1252.00",
    "software developer": "15-1252.00",
    "full stack developer": "15-1252.00",
    "backend developer": "15-1252.00",
    "frontend developer": "15-1252.00",
    "data engineer": "15-1299.08",
    "data scientist": "15-2051.00",
    "machine learning engineer": "15-2051.01",
    "devops engineer": "15-1299.08",
    "cloud engineer": "15-1299.09",
    "product manager": "11-3021.00",
    "project manager": "11-9199.00",
    "business analyst": "13-1111.00",
    "qa engineer": "15-1253.00",
    "test engineer": "15-1253.00",
    "database administrator": "15-1243.00",
    "network engineer": "15-1244.00",
    "security engineer": "15-1212.00",
    "ui/ux designer": "15-1255.00",
    "web developer": "15-1254.00",
    "mobile developer": "15-1252.00",
    "systems engineer": "15-1299.04",
    "solutions architect": "15-1299.09",
};

// Sample prevailing wage data by MSA and level
// This would typically come from DOL OFLC API or database
const WAGE_DATA: Record<string, any> = {
    "san-francisco-ca": {
        "15-1252.00": {
            I: { min: 85000, max: 105000 },
            II: { min: 105000, max: 135000 },
            III: { min: 135000, max: 175000 },
            IV: { min: 175000, max: 220000 },
        },
    },
    "new-york-ny": {
        "15-1252.00": {
            I: { min: 80000, max: 100000 },
            II: { min: 100000, max: 130000 },
            III: { min: 130000, max: 170000 },
            IV: { min: 170000, max: 210000 },
        },
    },
    "seattle-wa": {
        "15-1252.00": {
            I: { min: 78000, max: 98000 },
            II: { min: 98000, max: 128000 },
            III: { min: 128000, max: 165000 },
            IV: { min: 165000, max: 205000 },
        },
    },
    // Default/fallback for unmapped cities
    default: {
        "15-1252.00": {
            I: { min: 60000, max: 75000 },
            II: { min: 75000, max: 95000 },
            III: { min: 95000, max: 125000 },
            IV: { min: 125000, max: 165000 },
        },
        "15-2051.00": {
            I: { min: 65000, max: 80000 },
            II: { min: 80000, max: 105000 },
            III: { min: 105000, max: 135000 },
            IV: { min: 135000, max: 175000 },
        },
    },
};

function extractExperienceYears(description: string): number {
    const patterns = [
        /(\d+)\+?\s*years?/gi,
        /(\d+)\s*-\s*(\d+)\s*years?/gi,
    ];

    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match) {
            const nums = match[0].match(/\d+/g);
            if (nums) {
                return parseInt(nums[0], 10);
            }
        }
    }

    return 2; // Default to Level II
}

function mapTitleToONET(title: string): string {
    const normalized = title.toLowerCase().trim();

    // Direct match
    if (ONET_MAPPING[normalized]) {
        return ONET_MAPPING[normalized];
    }

    // Fuzzy matching
    for (const [key, code] of Object.entries(ONET_MAPPING)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return code;
        }
    }

    // Default to software engineer
    return "15-1252.00";
}

function determineWageLevel(experienceYears: number): "I" | "II" | "III" | "IV" {
    if (experienceYears <= 2) return "I";
    if (experienceYears <= 5) return "II";
    if (experienceYears <= 8) return "III";
    return "IV";
}

function getCityId(city: string, state: string): string {
    return `${city.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}`;
}

function getWageLevelName(level: "I" | "II" | "III" | "IV"): "Entry" | "Qualified" | "Experienced" | "Expert" {
    const mapping = {
        I: "Entry" as const,
        II: "Qualified" as const,
        III: "Experienced" as const,
        IV: "Expert" as const,
    };
    return mapping[level];
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobTitle, location, experienceYears, description } = body;

        if (!jobTitle || !location) {
            return NextResponse.json(
                { error: "Job title and location are required" },
                { status: 400 }
            );
        }

        // Parse location (format: "City, State" or "City, ST")
        const [city, state] = location.split(",").map((s: string) => s.trim());

        if (!city || !state) {
            return NextResponse.json(
                { error: "Invalid location format. Expected: 'City, State'" },
                { status: 400 }
            );
        }

        // Determine experience years
        const years = experienceYears || (description ? extractExperienceYears(description) : 2);

        // Map job title to O*NET code
        const onetCode = mapTitleToONET(jobTitle);

        // Determine wage level
        const wageLevel = determineWageLevel(years);
        const wageLevelName = getWageLevelName(wageLevel);

        // Get city ID and fetch wage data
        const cityId = getCityId(city, state);
        const cityWageData = WAGE_DATA[cityId] || WAGE_DATA.default;
        const onetWageData = cityWageData[onetCode] || cityWageData["15-1252.00"];
        const wages = onetWageData[wageLevel];

        // Get MSA name (simplified - in production would query database)
        const msaName = `${city}, ${state} Metropolitan Area`;

        // Build response
        const response = {
            wageLevel,
            wageLevelName,
            onetCode,
            msaName,
            prevailingWage: {
                levelI: onetWageData.I,
                levelII: onetWageData.II,
                levelIII: onetWageData.III,
                levelIV: onetWageData.IV,
            },
            currentLevel: {
                min: wages.min,
                max: wages.max,
            },
            dataSource: "DOL OFLC FY2026",
            experienceYears: years,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error calculating H1B data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json(
        { message: "Use POST method to calculate H1B wage levels" },
        { status: 200 }
    );
}
