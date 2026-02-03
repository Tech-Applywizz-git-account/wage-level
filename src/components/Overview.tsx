"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FolderTree, Award, Calendar } from "lucide-react";
import { KPICard } from "./KPICard";
import { SponsorshipTable } from "./SponsorshipTable";
import { SponsorshipChart } from "./SponsorshipChart";

interface Job {
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

interface ChartData {
  company: string;
  count: number;
}

interface DateOption {
  label: string;
  value: string; // Format: YYYY-MM-DD
}

const Overview = () => {
  const router = useRouter();
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalDomains, setTotalDomains] = useState(0);
  const [companiesWithSponsorship, setCompaniesWithSponsorship] = useState(0);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [topCompanies, setTopCompanies] = useState<ChartData[]>([]);
  const [jobPostsTodayCount, setJobPostsTodayCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [loading, setLoading] = useState(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 10;
  // Filter mode state
  const [filterMode, setFilterMode] = useState<"specific_date" | "last_week">("specific_date");

  // Function to get date string in YYYY-MM-DD format
  const getFormattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Function to generate date options (today and previous 7 days)
  const generateDateOptions = () => {
    const options: DateOption[] = [];
    const today = new Date();

    // Add "Today" option
    options.push({
      label: "Today",
      value: "today"
    });

    // Add previous 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = getFormattedDate(date);

      options.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: formattedDate
      });
    }

    setDateOptions(options);
  };

  useEffect(() => {
    generateDateOptions();
  }, []);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);

        // Build API URLs
        const params = new URLSearchParams();
        params.set("date", selectedDate === "today" ? "today" : selectedDate);
        params.set("page", currentPage.toString());
        params.set("limit", jobsPerPage.toString());

        const dateParam = selectedDate === "today" ? "today" : selectedDate;

        // ⚡ PARALLEL API CALLS for faster loading
        const [overviewRes, jobPostsRes] = await Promise.all([
          fetch(`/api/overview?${params.toString()}`),
          fetch(`/api/job-posts-today?date=${dateParam}`)
        ]);

        const [data, jobPostsData] = await Promise.all([
          overviewRes.json(),
          jobPostsRes.json()
        ]);

        // Update state with fetched data
        setTotalCompanies(data.total_companies);
        setTotalDomains(data.total_domains);
        setCompaniesWithSponsorship(data.sponsorship_companies);
        setJobPostsTodayCount(jobPostsData.job_posts_today || 0);

        // Handle latest_jobs with safety check
        const jobs: Job[] = (data.latest_jobs || []).map((job: any, i: number) => ({
          id: i + 1,
          companyName: job.company || "Unknown",
          companyId: job.company || `id-${i}`,
          domainName: job.domain,
          role: job.role,
          location: job.location,
          postedDate: job.posted,
          jobLink: job.link,
          sponsorship: true,
        }));

        setLatestJobs(jobs);

        // Update pagination info
        if (data.latest_jobs_pagination) {
          setTotalPages(data.latest_jobs_pagination.totalPages);
          setTotalJobs(data.latest_jobs_pagination.total);
        }

        const chartData: ChartData[] = (data.top_companies || []).map((item: any) => ({
          company: item.company,
          count: item.sponsored_count,
        }));

        setTopCompanies(chartData);
      } catch (err) {
        console.error("Error fetching overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [selectedDate, currentPage]); // Re-fetch when selectedDate or currentPage changes

  // Reset to page 1 when date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-64 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
          Loading Overview Dashboard...
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Gathering latest jobs and sponsorship data
        </p>
      </div>
    );
  }

  // Get the display date text
  const getDisplayDateText = () => {
    if (selectedDate === "today") {
      return "Jobs posted today";
    } else {
      const date = new Date(selectedDate);
      return `Jobs posted on ${date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* 📌 Overview Dashboard Header Card */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-5 sm:p-6 border border-primary/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          {/* Left side: Title and description */}
          <div className="md:w-1/2">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Overview Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Track job sponsorship opportunities across companies and domains
            </p>
          </div>

          {/* Right side: Jobs Posted Card INSIDE the header */}
          <div className="md:w-1/4">
            <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Jobs Posted</h3>
                </div>

                {/* Date Selector and Count */}
                <div className="flex items-center gap-3">
                  {/* Compact Date Selector */}
                  <div className="relative">
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="appearance-none bg-background border border-input rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent cursor-pointer pr-6"
                    >
                      {dateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-foreground">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Job Count Display */}
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#ff6565' }}>
                      {jobPostsTodayCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDate === "today" ? "today" : "selected date"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Main KPI Cards (3 cards in a row) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <KPICard
          title="Companies with Sponsorship"
          value={totalCompanies}
          icon={Building2}
          clickable={true}
          onClick={() => {
            console.log('Navigating to /company-analysis');
            window.location.href = '/company-analysis';
          }}
        />
        <KPICard
          title="Total Domains"
          value={totalDomains}
          icon={FolderTree}
          clickable={true}
          onClick={() => {
            console.log('Navigating to /role-analysis');
            window.location.href = '/role-analysis';
          }}
        />
        <KPICard
          title="Jobs added last week"
          value={companiesWithSponsorship}
          icon={Award}
          clickable={true}
          onClick={() => {
            // Set filter to show ALL jobs from last week (last 7 days)
            setSelectedDate("last_week");
            setFilterMode("last_week");
            setCurrentPage(1);

            // Smooth scroll to jobs table
            setTimeout(() => {
              const jobsSection = document.querySelector('[data-section="recent-jobs"]');
              jobsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
        />
      </div>


      {/* 📌 Recent Sponsorship Jobs */}
      <div className="space-y-3 sm:space-y-4 bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm" data-section="recent-jobs">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold mb-1 text-primary">
              {filterMode === "last_week" ? "Jobs Posted Last Week" : "Recent Sponsorship Jobs"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filterMode === "last_week"
                ? `All jobs posted in the last 7 days ${totalJobs > 0 ? `(${totalJobs} total)` : ''}`
                : `Latest job postings offering sponsorship ${totalJobs > 0 ? `(${totalJobs} total)` : ''}`
              }
            </p>
          </div>
        </div>

        <SponsorshipTable jobs={latestJobs} />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📈 Sponsorship Chart */}
      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
        <SponsorshipChart data={topCompanies} />
      </div>
    </div>
  );
};

export default Overview;