"use client";

import { useEffect, useState } from "react";
import { DomainCard } from "@/components/DomainCard";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Domain {
  id: string; // role itself
  name: string;
  category: "tech" | "non-tech";
}

const Domains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [filter, setFilter] = useState<"all" | "tech" | "non-tech">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch("/api/domain");
        const data = await res.json();

        const mapped = data.map((item: any) => ({
          id: item.role,
          name: item.role,
          category: item.isTech ? "tech" : "non-tech",
        }));

        setDomains(mapped);
        setFilteredDomains(mapped);
      } catch (err) {
        console.error("Error fetching domains:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  // 🧠 Filter + Search combined
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const newList = domains.filter((domain) => {
      const matchesFilter = filter === "all" || domain.category === filter;
      const matchesSearch = domain.name.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });

    const timer = setTimeout(() => {
      setFilteredDomains(newList);
    }, 150); // debounce for smoother UX

    return () => clearTimeout(timer);
  }, [searchTerm, filter, domains]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-muted-foreground">
        Loading domains...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header + Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">All Domains</h1>
          <p className="text-muted-foreground">
            Explore {filteredDomains.length} unique domains across tech and
            non-tech sectors
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 justify-center">
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
      </div>

      {/* Domain Cards Grid */}
      {filteredDomains.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all"
          key={searchTerm + filter}
        >
          {filteredDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              id={encodeURIComponent(domain.id)}
              name={domain.name}
              icon="" // not using icons
              category={domain.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No domains found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default Domains;
