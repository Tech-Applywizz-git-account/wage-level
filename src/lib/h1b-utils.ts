import { H1BWageData } from "./types/job";

// Utility function to generate H1B wage data for a job
export async function calculateH1BWageData(
    jobTitle: string,
    location: string,
    description?: string
): Promise<H1BWageData | null> {
    try {
        const response = await fetch("/api/h1b/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jobTitle,
                location,
                description,
            }),
        });

        if (!response.ok) {
            console.error("Failed to calculate H1B data");
            return null;
        }

        const data = await response.json();

        return {
            level: data.wageLevel,
            levelName: data.wageLevelName,
            onetCode: data.onetCode,
            msaName: data.msaName,
            wageMin: data.currentLevel.min,
            wageMax: data.currentLevel.max,
            dataSource: data.dataSource,
            lastUpdated: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error calculating H1B wage data:", error);
        return null;
    }
}

// Generate mock H1B data for testing (when API is not available)
export function generateMockH1BData(
    jobTitle: string,
    location: string
): H1BWageData {
    // Simple mock logic based on job title
    const title = jobTitle.toLowerCase();
    let level: "I" | "II" | "III" | "IV" = "II";

    if (title.includes("senior") || title.includes("lead") || title.includes("principal")) {
        level = "III";
    } else if (title.includes("staff") || title.includes("architect") || title.includes("director")) {
        level = "IV";
    } else if (title.includes("junior") || title.includes("entry")) {
        level = "I";
    }

    const levelNames = {
        I: "Entry" as const,
        II: "Qualified" as const,
        III: "Experienced" as const,
        IV: "Expert" as const,
    };

    const wageRanges = {
        I: { min: 65000, max: 85000 },
        II: { min: 85000, max: 115000 },
        III: { min: 115000, max: 155000 },
        IV: { min: 155000, max: 200000 },
    };

    return {
        level,
        levelName: levelNames[level],
        onetCode: "15-1252.00",
        msaName: location + " Metropolitan Area",
        wageMin: wageRanges[level].min,
        wageMax: wageRanges[level].max,
        dataSource: "Mock Data (Testing)",
        lastUpdated: new Date().toISOString(),
    };
}

// Parse location string to extract city and state
export function parseLocation(location: string): { city: string; state: string } | null {
    const parts = location.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
        return {
            city: parts[0],
            state: parts[1],
        };
    }
    return null;
}

// Format currency for display
export function formatCurrency(amount: number): string {
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
}

// Format wage range
export function formatWageRange(min: number, max: number): string {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}
