"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <Card className="overflow-hidden animate-slide-up border-primary/10">
      {/* 🖥️ Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
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
                <td className="px-6 py-4 font-semibold">{job.companyName}</td>
                <td className="px-6 py-4">{job.role}</td>
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
                    >
                      View Job <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Collapsible Table */}
      <div className="block sm:hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary/5 to-accent/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Company
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Link
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => {
              const isOpen = expandedRow === job.id;

              return (
                <>
                  <tr
                    key={job.id}
                    className="hover:bg-accent/5 transition-smooth"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {job.companyName}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                        asChild
                      >
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRow(job.id)}
                        className="text-primary flex items-center gap-1 text-sm"
                      >
                        {isOpen ? (
                          <>
                            Hide <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Animated collapsible row */}
                  <tr>
                    <td colSpan={3} className="px-4 pt-0">
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen
                            ? "max-h-40 opacity-100 mt-2"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="bg-muted/30 rounded-md p-3 space-y-1 text-sm">
                          <p>
                            <span className="font-semibold">Role:</span>{" "}
                            {job.role}
                          </p>
                          <p>
                            <span className="font-semibold">Domain:</span>{" "}
                            {job.domainName}
                          </p>
                          <p>
                            <span className="font-semibold">Location:</span>{" "}
                            {job.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Posted{" "}
                            {new Date(job.postedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
