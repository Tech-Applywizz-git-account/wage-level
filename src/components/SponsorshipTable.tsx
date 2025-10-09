import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

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

interface SponsorshipTableProps {
  jobs: Job[];
}

export const SponsorshipTable = ({ jobs }: SponsorshipTableProps) => {
  return (
    <Card className="overflow-hidden animate-slide-up border-primary/10">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary/5 to-accent/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Company
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Domain
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Posted
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-accent/5 transition-smooth group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {job.companyName}
                      </span>
                      {job.sponsorship && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full inline-flex w-fit mt-1">
                          Sponsorship
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">
                    {job.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {job.domainName}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {job.location}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(job.postedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth group-hover:scale-105"
                    asChild
                  >
                    <a
                      href={job.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View Job
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
