"use client";

import { useEffect, useState } from "react";
import { DomainCard } from "@/components/DomainCard";
import { Button } from "@/components/ui/button";

interface Domain {
  id: string; // here this will be role itself
  name: string;
  category: "tech" | "non-tech";
}

const Domains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filter, setFilter] = useState<"all" | "tech" | "non-tech">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch("/api/domain");
        const data = await res.json();

        // 🧠 Map API data to Domain structure using role as ID
        const mapped = data.map((item: any) => ({
          id: item.role, // use the role itself as the ID
          name: item.role,
          category: item.isTech ? "tech" : "non-tech",
        }));

        setDomains(mapped);
      } catch (err) {
        console.error("Error fetching domains:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const filteredDomains = domains.filter((domain) => {
    if (filter === "all") return true;
    return domain.category === filter;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-muted-foreground">
        Loading domains...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Domains</h1>
          <p className="text-muted-foreground">
            Explore {domains.length} unique domains across tech and non-tech
            sectors
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "tech" ? "default" : "outline"}
            onClick={() => setFilter("tech")}
          >
            Tech
          </Button>
          <Button
            variant={filter === "non-tech" ? "default" : "outline"}
            onClick={() => setFilter("non-tech")}
          >
            Non-Tech
          </Button>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDomains.map((domain) => (
          <DomainCard
            key={domain.id}
            id={encodeURIComponent(domain.id)} // ✅ encode role for URL safety
            name={domain.name}
            icon="" // not using icon
            category={domain.category}
          />
        ))}
      </div>
    </div>
  );
};

export default Domains;
