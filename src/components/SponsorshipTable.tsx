"use client";

import { MapPin, Clock, Star, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { H1BWageData } from "../lib/types/job";

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
  h1bWageData?: H1BWageData;
}

interface SponsorshipTableProps {
  jobs: Job[];
}

export const SponsorshipTable = ({ jobs }: SponsorshipTableProps) => {
  // Helper to get wage level from H1B data
  const getWageLevel = (wageData?: H1BWageData): number => {
    if (!wageData) return 3; // Default to Level 3

    const { wage_level_1, wage_level_2, wage_level_3, wage_level_4, prevailing_wage } = wageData;

    if (!prevailing_wage) return 3;

    const wage = parseFloat(prevailing_wage.toString());
    const level1 = parseFloat(wage_level_1?.toString() || '0');
    const level2 = parseFloat(wage_level_2?.toString() || '0');
    const level3 = parseFloat(wage_level_3?.toString() || '0');
    const level4 = parseFloat(wage_level_4?.toString() || '0');

    if (wage >= level4) return 4;
    if (wage >= level3) return 3;
    if (wage >= level2) return 2;
    return 1;
  };

  // Helper to render stars based on wage level
  const renderStars = (level: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= level
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300"
              }`}
          />
        ))}
      </div>
    );
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // Helper to extract years of experience from role title
  const getYearsExperience = (role: string): string => {
    // Common patterns: "5-6 Years", "5+ Years", "Senior (5+ years)"
    const patterns = [
      /(\d+)-(\d+)\s*years?/i,
      /(\d+)\+?\s*years?/i,
    ];

    for (const pattern of patterns) {
      const match = role.match(pattern);
      if (match) {
        if (match[2]) {
          return `${match[1]}-${match[2]} Years`;
        }
        return `${match[1]}+ Years`;
      }
    }

    // Default based on seniority keywords
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('senior') || lowerRole.includes('sr.')) return '5-6 Years';
    if (lowerRole.includes('lead') || lowerRole.includes('principal')) return '7+ Years';
    if (lowerRole.includes('junior') || lowerRole.includes('jr.')) return '0-2 Years';
    if (lowerRole.includes('mid')) return '3-5 Years';

    return '3-5 Years'; // Default
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const wageLevel = getWageLevel(job.h1bWageData);
        const yearsExp = getYearsExperience(job.role);

        return (
          <Card
            key={`${job.companyId}-${job.id}`}
            className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400 break-words">
                      {job.companyName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase()}
                    </div>
                  </div>
                </div>
                {/* Human Verified Badge */}
                <div className="mt-3 flex items-center justify-center gap-2 bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Human Verified
                </div>
              </div>

              {/* Middle: Job Details */}
              <div className="flex-1 space-y-3">
                {/* Company Name */}
                <h2 className="text-2xl font-bold text-foreground">
                  {job.companyName}
                </h2>

                {/* Job Role */}
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground min-w-[100px]">Job Role</span>
                  <span className="text-foreground">:</span>
                  <span className="text-foreground">{job.role}</span>
                </div>

                {/* Job Type (from job_role_name) */}
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground min-w-[100px]">Job Type</span>
                  <span className="text-foreground">:</span>
                  <span className="text-foreground">{job.domainName}</span>
                </div>

                {/* Date Posted */}
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground min-w-[100px]">Date Posted</span>
                  <span className="text-foreground">:</span>
                  <span className="text-foreground">{formatDate(job.postedDate)}</span>
                </div>

                {/* Location and Experience */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{yearsExp}</span>
                  </div>
                </div>
              </div>

              {/* Right: Wage Level and Apply Button */}
              <div className="flex flex-col items-center justify-between gap-4 lg:min-w-[180px]">
                {/* Wage Level Badge */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-xl p-6 text-center shadow-lg w-full">
                  {renderStars(wageLevel)}
                  <div className="text-4xl font-bold mt-2">Lv {wageLevel}</div>
                  <div className="text-sm mt-1 opacity-90">Wage Level</div>
                </div>

                {/* Apply Now Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <a
                    href={job.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};