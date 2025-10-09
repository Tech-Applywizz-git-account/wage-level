"use client";

import { useEffect, useState } from "react";
import { CompanyCard } from "@/components/CompanyCard";

interface Company {
  id: string;
  name: string;
  sponsored_jobs: number;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();

        // Map API response into CompanyCard format
        const mapped = data.map((item: any) => ({
          id: item.company,
          name: item.company,
          sponsored_jobs: item.sponsored_jobs,
        }));

        setCompanies(mapped);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto text-center text-muted-foreground">
        Loading companies...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">All Companies</h1>
        <p className="text-muted-foreground">
          Browse {companies.length} companies offering job opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            id={company.id}
            name={company.name}
            sponsored_jobs={company.sponsored_jobs}
          />
        ))}
      </div>
    </div>
  );
};

export default CompaniesPage;
