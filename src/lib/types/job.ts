// Job and H1B related type definitions

export interface H1BWageData {
    level?: "I" | "II" | "III" | "IV";
    levelName?: "Entry" | "Qualified" | "Experienced" | "Expert";
    onetCode?: string;
    msaName?: string;
    wageMin?: number;
    wageMax?: number;
    dataSource?: string;
    lastUpdated?: string;
    // Database fields
    wage_level_1?: number | string;
    wage_level_2?: number | string;
    wage_level_3?: number | string;
    wage_level_4?: number | string;
    prevailing_wage?: number | string;
}

export interface JobLocation {
    city: string;
    state: string;
    stateCode: string;
    cityId: string;
    msaCode?: string;
    isRemote: boolean;
}

export interface Job {
    id: number;
    companyName: string;
    companyId: string;
    domainName: string;
    role: string;
    location: string;
    postedDate: string;
    jobLink: string;
    sponsorship: boolean;
    // New H1B fields
    h1bWageData?: H1BWageData;
    locationData?: JobLocation;
    experienceYears?: number;
}

export interface LocationOption {
    id: string;
    name: string;
    state: string;
    stateCode: string;
    msaCode?: string;
    msaName?: string;
    jobCount: number;
}

export interface StateOption {
    code: string;
    name: string;
    jobCount: number;
}

export interface LocationFilterState {
    selectedCities: string[];
    selectedStates: string[];
    isRemote: boolean;
    searchQuery: string;
}

export interface WageLevelInfo {
    level: "I" | "II" | "III" | "IV";
    name: string;
    experience: string;
    percentile: string;
    description: string;
    color: string;
    bgColor: string;
}

export const WAGE_LEVEL_INFO: Record<string, WageLevelInfo> = {
    I: {
        level: "I",
        name: "Entry",
        experience: "0-2 years",
        percentile: "17th",
        description: "Basic understanding, routine tasks under close supervision",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
    },
    II: {
        level: "II",
        name: "Qualified",
        experience: "2-5 years",
        percentile: "34th",
        description: "Moderate tasks with limited judgment",
        color: "text-blue-700",
        bgColor: "bg-blue-100 border-blue-300",
    },
    III: {
        level: "III",
        name: "Experienced",
        experience: "5-8 years",
        percentile: "50th (Median)",
        description: "Comprehensive understanding, exercises independent judgment",
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
    },
    IV: {
        level: "IV",
        name: "Expert",
        experience: "8+ years",
        percentile: "67th",
        description: "Advanced expertise, manages complex projects",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
    },
};
