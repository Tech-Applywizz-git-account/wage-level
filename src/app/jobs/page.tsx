"use client";

import { useState, useEffect } from "react";
import { LocationFilter } from "@/components/LocationFilter";
import { SponsorshipTable } from "@/components/SponsorshipTable";
import { LocationFilterState } from "@/lib/types/job";
import { Card } from "@/components/ui/card";

export default function JobsPage() {
    const [locationFilters, setLocationFilters] = useState<LocationFilterState>({
        selectedCities: [],
        selectedStates: [],
        isRemote: false,
        searchQuery: "",
    });
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch jobs when filters change
    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();

                if (locationFilters.selectedCities.length > 0) {
                    params.set("cities", locationFilters.selectedCities.join(","));
                }
                if (locationFilters.selectedStates.length > 0) {
                    params.set("states", locationFilters.selectedStates.join(","));
                }
                if (locationFilters.isRemote) {
                    params.set("remote", "true");
                }

                const res = await fetch(`/api/jobs?${params.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch jobs");

                const data = await res.json();
                setJobs(data.jobs || []);
            } catch (err: any) {
                console.error("Error fetching jobs:", err);
                setError(err.message || "Failed to load jobs");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
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
                                    <span className="animate-pulse">Loading jobs...</span>
                                ) : error ? (
                                    <span className="text-red-500">Error: {error}</span>
                                ) : (
                                    <>
                                        Showing <span className="font-semibold text-foreground">{jobs.length}</span> jobs
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
                        {loading ? (
                            <Card className="p-12">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                                </div>
                            </Card>
                        ) : error ? (
                            <Card className="p-12 text-center">
                                <div className="space-y-3">
                                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-red-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold">Failed to load jobs</h3>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                </div>
                            </Card>
                        ) : jobs.length > 0 ? (
                            <SponsorshipTable jobs={jobs} />
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <h4 className="font-semibold">Real-time Data</h4>
                        </div>
                        <p className="text-sm text-gray-700">
                            Browse jobs directly from our Supabase database with live updates
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
