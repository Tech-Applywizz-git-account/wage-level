"use client";

import { useEffect, useState } from "react";
import { Building2, FolderTree, Award } from "lucide-react";
import { KPICard } from "./KPICard"; // assuming you already have this
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

const Overview = () => {
  // 🧠 State for all metrics
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [totalDomains, setTotalDomains] = useState<number>(0);
  const [companiesWithSponsorship, setCompaniesWithSponsorship] =
    useState<number>(0);

  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [topCompanies, setTopCompanies] = useState<ChartData[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/overview", { method: "GET" });
        const data = await res.json();

        setTotalCompanies(data.total_companies);
        setTotalDomains(data.total_domains);
        setCompaniesWithSponsorship(data.sponsorship_companies);

        // ✅ Transform latest_jobs → Job[]
        const jobs: Job[] = data.latest_jobs.map((job: any, index: number) => ({
          id: index + 1,
          companyName: job.company || "Unknown",
          companyId: job.company || `id-${index}`,
          domainName: job.domain,
          role: job.role,
          location: job.location,
          postedDate: job.posted,
          jobLink: job.link,
          sponsorship: true, // because these are sponsorship jobs anyway
        }));

        setLatestJobs(jobs);

        // ✅ Transform top_companies → ChartData[]
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
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-64 space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse">
          Loading Overview Dashboard...
        </h1>
        <p className="text-sm text-muted-foreground">
          Gathering latest jobs and sponsorship data
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 border border-primary/10">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Overview Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Track job sponsorship opportunities across companies and domains
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Companies"
          value={totalCompanies}
          icon={Building2}
          trend="+10 this week"
        />
        <KPICard
          title="Total Domains"
          value={totalDomains}
          icon={FolderTree}
          trend="48 tracked"
        />
        <KPICard
          title="Companies with Sponsorship"
          value={companiesWithSponsorship}
          icon={Award}
          trend={`${Math.round((companiesWithSponsorship / totalCompanies) * 100)}% of total`}
        />
      </div>

      {/* Recent Sponsorship Jobs */}
      <div className="space-y-4 bg-card rounded-2xl p-6 border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-primary">
            Recent Sponsorship Jobs
          </h2>
          <p className="text-muted-foreground">
            Latest job postings offering sponsorship
          </p>
        </div>
        <SponsorshipTable jobs={latestJobs.slice(0, 6)} />
      </div>

      {/* Sponsorship Chart */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <SponsorshipChart data={topCompanies} />
      </div>
    </div>
  );
};

export default Overview;
