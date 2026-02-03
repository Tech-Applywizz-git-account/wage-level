"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search, MapPin, FolderTree, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { SponsorshipTable } from "../../../components/SponsorshipTable";

interface SponsorshipJob {
  id: number;
  companyName: string;
  companyId: string;
  domainName: string;
  role: string;
  location: string;
  postedDate: string;
  jobLink: string;
  sponsorship: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [jobs, setJobs] = useState<SponsorshipJob[]>([]);
  const [allJobs, setAllJobs] = useState<SponsorshipJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Search/Filter states
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDomain, setSearchDomain] = useState("");
  const [searchWageLevel, setSearchWageLevel] = useState("");

  // Client-side pagination for filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const companyName = decodeURIComponent(params.id as string);
  const hasActiveFilters = searchLocation || searchDomain || searchWageLevel;

  // Fetch jobs from API
  const fetchJobs = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/company/${encodeURIComponent(companyName)}?page=${page}&limit=${jobsPerPage}`
      );
      const data = await res.json();

      const mappedJobs: SponsorshipJob[] = (data.jobs || []).map(
        (job: any, index: number) => ({
          id: (page - 1) * jobsPerPage + index + 1,
          companyName: job.company,
          companyId: job.company ?? `company-${index}`,
          domainName: job.domain,
          role: job.role,
          location: job.location,
          postedDate: job.posted,
          jobLink: job.link,
          sponsorship: true,
        }),
      );

      setJobs(mappedJobs);
      if (data.pagination) {
        setPagination(data.pagination);
      }

      // Store all jobs for filtering (fetch all on first load)
      if (page === 1 && !hasActiveFilters) {
        setAllJobs(mappedJobs);
      }
    } catch (err) {
      console.error("Error fetching company jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs(1);
  }, [companyName]);

  // Handle page change (server-side pagination when no filters)
  const handlePageChange = (newPage: number) => {
    if (!hasActiveFilters) {
      fetchJobs(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPage(newPage);
    }
  };

  // Client-side filtering
  const filteredJobs = hasActiveFilters
    ? allJobs.filter((job) => {
      const locationMatch = searchLocation
        ? job.location.toLowerCase().includes(searchLocation.toLowerCase())
        : true;

      const domainMatch = searchDomain
        ? job.domainName.toLowerCase().includes(searchDomain.toLowerCase()) ||
        job.role.toLowerCase().includes(searchDomain.toLowerCase())
        : true;

      const wageMatch = searchWageLevel
        ? job.role.toLowerCase().includes(searchWageLevel.toLowerCase()) ||
        job.location.toLowerCase().includes(searchWageLevel.toLowerCase())
        : true;

      return locationMatch && domainMatch && wageMatch;
    })
    : jobs;

  // Client-side pagination for filtered results
  const totalPages = hasActiveFilters
    ? Math.ceil(filteredJobs.length / jobsPerPage)
    : pagination.totalPages;

  const displayJobs = hasActiveFilters
    ? filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
    : jobs;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchLocation, searchDomain, searchWageLevel]);

  // Clear all filters
  const clearFilters = () => {
    setSearchLocation("");
    setSearchDomain("");
    setSearchWageLevel("");
    setCurrentPage(1);
    fetchJobs(1);
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading jobs for {companyName}...</p>
        </div>
      </div>
    );
  }

  const currentPageNum = hasActiveFilters ? currentPage : pagination.page;
  const startIndex = (currentPageNum - 1) * jobsPerPage;
  const endIndex = Math.min(startIndex + jobsPerPage, hasActiveFilters ? filteredJobs.length : pagination.total);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
        <p className="text-muted-foreground">
          {hasActiveFilters ? filteredJobs.length : pagination.total} job{pagination.total !== 1 ? "s" : ""} {hasActiveFilters ? "matching filters" : "available"}
        </p>
      </div>

      {/* Search/Filter Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Filter Jobs
          </h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </label>
            <Input
              type="text"
              placeholder="Search by location..."
              value={searchLocation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchLocation(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-primary" />
              Domain
            </label>
            <Input
              type="text"
              placeholder="Search by domain..."
              value={searchDomain}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchDomain(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Wage Level / Keywords
            </label>
            <Input
              type="text"
              placeholder="Search by keywords..."
              value={searchWageLevel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchWageLevel(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchLocation && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <MapPin className="h-3 w-3" />
                {searchLocation}
                <button onClick={() => setSearchLocation("")} className="ml-1 hover:text-primary/80">×</button>
              </span>
            )}
            {searchDomain && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <FolderTree className="h-3 w-3" />
                {searchDomain}
                <button onClick={() => setSearchDomain("")} className="ml-1 hover:text-primary/80">×</button>
              </span>
            )}
            {searchWageLevel && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <DollarSign className="h-3 w-3" />
                {searchWageLevel}
                <button onClick={() => setSearchWageLevel("")} className="ml-1 hover:text-primary/80">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Jobs Table */}
      {displayJobs.length > 0 ? (
        <>
          <SponsorshipTable jobs={displayJobs} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {hasActiveFilters ? filteredJobs.length : pagination.total} jobs
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageNum - 1)}
                  disabled={currentPageNum === 1 || loading}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPageNum + 1)}
                  disabled={currentPageNum === totalPages || loading}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-2">
            {hasActiveFilters ? "No jobs match your search criteria" : "No jobs found for this company"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
