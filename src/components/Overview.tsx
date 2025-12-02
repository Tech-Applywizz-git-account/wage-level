"use client";

import { useEffect, useState } from "react";
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
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalDomains, setTotalDomains] = useState(0);
  const [companiesWithSponsorship, setCompaniesWithSponsorship] = useState(0);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [topCompanies, setTopCompanies] = useState<ChartData[]>([]);
  const [jobPostsTodayCount, setJobPostsTodayCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("today");
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Fetch overview data
        const res = await fetch("/api/overview");
        const data = await res.json();

        setTotalCompanies(data.total_companies);
        setTotalDomains(data.total_domains);
        setCompaniesWithSponsorship(data.sponsorship_companies);

        // Fetch job posts count for selected date
        const dateParam = selectedDate === "today" ? "today" : selectedDate;
        const jobPostsRes = await fetch(`/api/job-posts-today?date=${dateParam}`);
        const jobPostsData = await jobPostsRes.json();
        setJobPostsTodayCount(jobPostsData.job_posts_today || 0);

        const jobs: Job[] = data.latest_jobs.map((job: any, i: number) => ({
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

        const chartData: ChartData[] = data.top_companies.map((item: any) => ({
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
  }, [selectedDate]); // Re-fetch when selectedDate changes

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
        />
        <KPICard 
          title="Total Domains" 
          value={totalDomains} 
          icon={FolderTree} 
        />
        <KPICard
          title="Jobs added last week"
          value={companiesWithSponsorship}
          icon={Award}
        />
      </div>

      {/* 📌 Recent Sponsorship Jobs */}
      <div className="space-y-3 sm:space-y-4 bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-1 text-primary">
            Recent Sponsorship Jobs
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Latest job postings offering sponsorship
          </p>
        </div>
        <SponsorshipTable jobs={latestJobs.slice(0, 6)} />
      </div>

      {/* 📈 Sponsorship Chart */}
      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border shadow-sm">
        <SponsorshipChart data={topCompanies} />
      </div>
    </div>
  );
};

export default Overview;