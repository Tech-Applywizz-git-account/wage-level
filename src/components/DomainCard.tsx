"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { ArrowRight } from "lucide-react";

interface DomainCardProps {
  id: string;
  name: string;
  icon?: string;
  category: string; // "tech" or "non-tech"
}

export const DomainCard = ({ id, name, icon, category }: DomainCardProps) => {
  return (
    <Link href={`/role-analysis/${encodeURIComponent(id)}`} className="block">
      <Card className="p-6 hover:shadow-hover transition-transform hover:-translate-y-1 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          {/* icon */}
          <div className="text-4xl">{icon ? icon : "💼"}</div>

          {/* Category badge */}
          <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
            {category === "tech" ? "Tech" : "Non-Tech"}
          </span>
        </div>

        {/* Role name */}
        <h3 className="font-medium text-lg mb-2">{name}</h3>

        {/* Hover "View jobs" effect */}
        <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View jobs
          <ArrowRight className="h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
};
