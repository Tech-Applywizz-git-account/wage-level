"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsorshipTable } from "@/components/SponsorshipTable";

// 👇 This is the shape SponsorshipTable expects (reuse or import from a types file if you have one)
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

export default function DomainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [jobs, setJobs] = useState<SponsorshipJob[]>([]);
  const [loading, setLoading] = useState(true);

  const roleName = decodeURIComponent(params.id as string);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/domain/${encodeURIComponent(roleName)}`);
        const data = await res.json();

        const mappedJobs: SponsorshipJob[] = (data.jobs || []).map(
          (job: any, index: number) => ({
            id: index + 1,
            companyName: job.company,
            companyId: job.company ?? `company-${index}`,
            domainName: job.domain,
            role: job.role,
            location: job.location,
            postedDate: job.posted,
            jobLink: job.link,
            sponsorship: true, // or derive if needed
          }),
        );

        setJobs(mappedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [roleName]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center text-muted-foreground">
        Loading jobs for {roleName}...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
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
        <h1 className="text-3xl font-bold mb-2">{roleName}</h1>
        <p className="text-muted-foreground">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Jobs Table */}
      {jobs.length > 0 ? (
        <SponsorshipTable jobs={jobs} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No jobs found for this domain.
        </div>
      )}
    </div>
  );
}
