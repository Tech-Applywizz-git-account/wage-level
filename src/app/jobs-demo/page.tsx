"use client";

import { useState, useEffect } from "react";
import { LocationFilter } from "@/components/LocationFilter";
import { SponsorshipTable } from "@/components/SponsorshipTable";
import { LocationFilterState } from "@/lib/types/job";
import { generateMockH1BData } from "@/lib/h1b-utils";
import { Card } from "@/components/ui/card";

// Sample jobs data with H1B information
const SAMPLE_JOBS = [
    {
        id: 1,
        companyName: "Google",
        companyId: "google",
        domainName: "Technology",
        role: "Senior Software Engineer",
        location: "San Francisco, CA",
        postedDate: "2026-02-01",
        jobLink: "https://careers.google.com/jobs",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Senior Software Engineer", "San Francisco, CA"),
    },
    {
        id: 2,
        companyName: "Microsoft",
        companyId: "microsoft",
        domainName: "Technology",
        role: "Data Scientist",
        location: "Seattle, WA",
        postedDate: "2026-02-02",
        jobLink: "https://careers.microsoft.com/jobs",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Data Scientist", "Seattle, WA"),
    },
    {
        id: 3,
        companyName: "Amazon",
        companyId: "amazon",
        domainName: "E-commerce",
        role: "Software Development Engineer",
        location: "Seattle, WA",
        postedDate: "2026-02-01",
        jobLink: "https://amazon.jobs",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Software Development Engineer", "Seattle, WA"),
    },
    {
        id: 4,
        companyName: "Meta",
        companyId: "meta",
        domainName: "Social Media",
        role: "Frontend Engineer",
        location: "New York, NY",
        postedDate: "2026-01-31",
        jobLink: "https://www.metacareers.com/jobs",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Frontend Engineer", "New York, NY"),
    },
    {
        id: 5,
        companyName: "Apple",
        companyId: "apple",
        domainName: "Technology",
        role: "Machine Learning Engineer",
        location: "San Francisco, CA",
        postedDate: "2026-01-30",
        jobLink: "https://jobs.apple.com",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Machine Learning Engineer", "San Francisco, CA"),
    },
    {
        id: 6,
        companyName: "Netflix",
        companyId: "netflix",
        domainName: "Entertainment",
        role: "Full Stack Developer",
        location: "Los Angeles, CA",
        postedDate: "2026-01-29",
        jobLink: "https://jobs.netflix.com",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Full Stack Developer", "Los Angeles, CA"),
    },
    {
        id: 7,
        companyName: "Tesla",
        companyId: "tesla",
        domainName: "Automotive",
        role: "Software Engineer",
        location: "Austin, TX",
        postedDate: "2026-02-02",
        jobLink: "https://www.tesla.com/careers",
        sponsorship: true,
        h1bWageData: generateMockH1BData("Software Engineer", "Austin, TX"),
    },
    {
        id: 8,
        companyName: "Salesforce",
        companyId: "salesforce",
        domainName: "SaaS",
        role: "DevOps Engineer",
        location: "Remote, US",
        postedDate: "2026-02-01",
        jobLink: "https://www.salesforce.com/company/careers",
        sponsorship: true,
        h1bWageData: generateMockH1BData("DevOps Engineer", "Remote, US"),
    },
];

export default function JobsPage() {
    const [locationFilters, setLocationFilters] = useState<LocationFilterState>({
        selectedCities: [],
        selectedStates: [],
        isRemote: false,
        searchQuery: "",
    });
    const [filteredJobs, setFilteredJobs] = useState(SAMPLE_JOBS);
    const [loading, setLoading] = useState(false);

    // Apply filters to jobs
    useEffect(() => {
        setLoading(true);

        // Simulate API delay
        const timer = setTimeout(() => {
            let filtered = [...SAMPLE_JOBS];

            // Filter by cities
            if (locationFilters.selectedCities.length > 0) {
                filtered = filtered.filter((job) => {
                    const jobLocation = job.location.toLowerCase();
                    return locationFilters.selectedCities.some((cityId) => {
                        const cityName = cityId.split("-")[0]; // e.g., "san" from "san-francisco-ca"
                        return jobLocation.includes(cityName);
                    });
                });
            }

            // Filter by states
            if (locationFilters.selectedStates.length > 0) {
                filtered = filtered.filter((job) => {
                    const locationParts = job.location.split(",");
                    if (locationParts.length >= 2) {
                        const state = locationParts[1].trim();
                        return locationFilters.selectedStates.some(
                            (stateCode) => state.includes(stateCode) || state === stateCode
                        );
                    }
                    return false;
                });
            }

            // Filter for remote
            if (locationFilters.isRemote) {
                filtered = filtered.filter((job) =>
                    job.location.toLowerCase().includes("remote")
                );
            }

            setFilteredJobs(filtered);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [locationFilters]);

    const handleLocationFilterChange = (filters: LocationFilterState) => {
        setLocationFilters(filters);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    H1B Sponsorship Jobs
                </h1>
                <p className="text-muted-foreground">
                    Browse jobs with H1B sponsorship and filter by location
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Location Filter */}
                <aside className="lg:col-span-1">
                    <Card className="p-6 sticky top-6">
                        <LocationFilter
                            onFilterChange={handleLocationFilterChange}
                            initialFilters={locationFilters}
                        />
                    </Card>
                </aside>

                {/* Main Content - Jobs List */}
                <main className="lg:col-span-3">
                    <div className="space-y-4">
                        {/* Results Header */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {loading ? (
                                    <span className="animate-pulse">Filtering jobs...</span>
                                ) : (
                                    <>
                                        Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs
                                        {(locationFilters.selectedCities.length > 0 ||
                                            locationFilters.selectedStates.length > 0 ||
                                            locationFilters.isRemote) && (
                                                <span> matching your filters</span>
                                            )}
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Jobs Table */}
                        {filteredJobs.length > 0 ? (
                            <SponsorshipTable jobs={filteredJobs} />
                        ) : (
                            <Card className="p-12 text-center">
                                <div className="space-y-3">
                                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold">No jobs found</h3>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                        Try adjusting your filters or search for different locations to find more job opportunities.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            {/* Feature Highlights */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold">H1B Wage Levels</h4>
                        </div>
                        <p className="text-sm text-gray-700">
                            See the H1B wage classification for each job based on experience level and location
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold">Location Filter</h4>
                        </div>
                        <p className="text-sm text-gray-700">
                            Filter jobs by city, state, or remote opportunities with real-time job counts
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold">Prevailing Wages</h4>
                        </div>
                        <p className="text-sm text-gray-700">
                            View DOL prevailing wage ranges for each position and location combination
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
