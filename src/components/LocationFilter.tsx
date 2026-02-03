"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, X } from "lucide-react";
import { LocationOption, StateOption, LocationFilterState } from "@/lib/types/job";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LocationFilterProps {
    onFilterChange: (filters: LocationFilterState) => void;
    initialFilters?: LocationFilterState;
}

export const LocationFilter = ({ onFilterChange, initialFilters }: LocationFilterProps) => {
    const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
    const [selectedCities, setSelectedCities] = useState<string[]>(initialFilters?.selectedCities || []);
    const [selectedStates, setSelectedStates] = useState<string[]>(initialFilters?.selectedStates || []);
    const [isRemote, setIsRemote] = useState(initialFilters?.isRemote || false);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [states, setStates] = useState<StateOption[]>([]);
    const [showAllCities, setShowAllCities] = useState(false);
    const [showAllStates, setShowAllStates] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch location data
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch("/api/locations");
                const data = await res.json();
                setCities(data.cities || []);
                setStates(data.states || []);
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    // Filter cities based on search query
    const filteredCities = useMemo(() => {
        if (!searchQuery) return cities;

        const query = searchQuery.toLowerCase();
        return cities.filter(
            (city) =>
                city.name.toLowerCase().includes(query) ||
                city.state.toLowerCase().includes(query) ||
                city.stateCode.toLowerCase().includes(query)
        );
    }, [cities, searchQuery]);

    // Popular cities (top 10 by job count)
    const popularCities = useMemo(() => {
        return [...cities].sort((a, b) => b.jobCount - a.jobCount).slice(0, 10);
    }, [cities]);

    // Top states (top 10 by job count)
    const topStates = useMemo(() => {
        return [...states].sort((a, b) => b.jobCount - a.jobCount).slice(0, 10);
    }, [states]);

    // Emit filter changes
    useEffect(() => {
        onFilterChange({
            selectedCities,
            selectedStates,
            isRemote,
            searchQuery,
        });
    }, [selectedCities, selectedStates, isRemote, searchQuery, onFilterChange]);

    const handleCityToggle = (cityId: string) => {
        setSelectedCities((prev) =>
            prev.includes(cityId)
                ? prev.filter((id) => id !== cityId)
                : [...prev, cityId]
        );
    };

    const handleStateToggle = (stateCode: string) => {
        setSelectedStates((prev) =>
            prev.includes(stateCode)
                ? prev.filter((code) => code !== stateCode)
                : [...prev, stateCode]
        );
    };

    const handleRemoveCity = (cityId: string) => {
        setSelectedCities((prev) => prev.filter((id) => id !== cityId));
    };

    const handleRemoveState = (stateCode: string) => {
        setSelectedStates((prev) => prev.filter((code) => code !== stateCode));
    };

    const handleClearAll = () => {
        setSelectedCities([]);
        setSelectedStates([]);
        setIsRemote(false);
        setSearchQuery("");
    };

    const totalFiltersActive = selectedCities.length + selectedStates.length + (isRemote ? 1 : 0);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Location</h3>
                    {totalFiltersActive > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {totalFiltersActive}
                        </Badge>
                    )}
                </div>
                {totalFiltersActive > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-xs text-gray-600 hover:text-gray-900"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search city or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Active Filters */}
            {totalFiltersActive > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                        {isRemote && (
                            <Badge
                                variant="secondary"
                                className="flex items-center gap-1 cursor-pointer"
                                onClick={() => setIsRemote(false)}
                            >
                                Remote
                                <X className="h-3 w-3" />
                            </Badge>
                        )}
                        {selectedCities.map((cityId) => {
                            const city = cities.find((c) => c.id === cityId);
                            return city ? (
                                <Badge
                                    key={cityId}
                                    variant="secondary"
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => handleRemoveCity(cityId)}
                                >
                                    {city.name}, {city.stateCode}
                                    <X className="h-3 w-3" />
                                </Badge>
                            ) : null;
                        })}
                        {selectedStates.map((stateCode) => {
                            const state = states.find((s) => s.code === stateCode);
                            return state ? (
                                <Badge
                                    key={stateCode}
                                    variant="secondary"
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => handleRemoveState(stateCode)}
                                >
                                    {state.name}
                                    <X className="h-3 w-3" />
                                </Badge>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Remote Checkbox */}
            <div className="flex items-center space-x-2 py-2 border-b border-gray-200">
                <Checkbox
                    id="remote"
                    checked={isRemote}
                    onCheckedChange={(checked) => setIsRemote(checked as boolean)}
                />
                <label
                    htmlFor="remote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    Remote ({cities.filter((c) => c.name === "Remote").reduce((acc, c) => acc + c.jobCount, 0)})
                </label>
            </div>

            {/* Popular Cities */}
            {!searchQuery && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Popular Cities</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(showAllCities ? cities : popularCities).map((city) => (
                            <div key={city.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={city.id}
                                    checked={selectedCities.includes(city.id)}
                                    onCheckedChange={() => handleCityToggle(city.id)}
                                />
                                <label
                                    htmlFor={city.id}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                >
                                    {city.name}, {city.stateCode} ({city.jobCount})
                                </label>
                            </div>
                        ))}
                    </div>
                    {!showAllCities && cities.length > 10 && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => setShowAllCities(true)}
                            className="text-primary p-0"
                        >
                            + Show all cities ({cities.length})
                        </Button>
                    )}
                </div>
            )}

            {/* Search Results */}
            {searchQuery && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                        Search Results ({filteredCities.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                                <div key={city.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`search-${city.id}`}
                                        checked={selectedCities.includes(city.id)}
                                        onCheckedChange={() => handleCityToggle(city.id)}
                                    />
                                    <label
                                        htmlFor={`search-${city.id}`}
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                    >
                                        {city.name}, {city.stateCode} ({city.jobCount})
                                    </label>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No cities found</p>
                        )}
                    </div>
                </div>
            )}

            {/* States */}
            {!searchQuery && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">States</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(showAllStates ? states : topStates).map((state) => (
                            <div key={state.code} className="flex items-center space-x-2">
                                <Checkbox
                                    id={state.code}
                                    checked={selectedStates.includes(state.code)}
                                    onCheckedChange={() => handleStateToggle(state.code)}
                                />
                                <label
                                    htmlFor={state.code}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                >
                                    {state.name} ({state.jobCount})
                                </label>
                            </div>
                        ))}
                    </div>
                    {!showAllStates && states.length > 10 && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => setShowAllStates(true)}
                            className="text-primary p-0"
                        >
                            + Show all states ({states.length})
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
