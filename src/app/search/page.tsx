"use client";

"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { debounce } from 'lodash';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    location: searchParams.get('location') || '',
    specialization: searchParams.get('specialization') || '',
  });

  const fetchLawyers = useCallback(async (location: string, specialization: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (specialization) params.set('specialization', specialization);

    const response = await fetch(`/api/lawyers/search?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      toast({
        title: "Error searching lawyers",
        description: errorData.message || "Could not fetch lawyers.",
        variant: "destructive",
      });
      setLawyers([]);
    } else {
      const data = await response.json();
      setLawyers(data || []);
    }
    setLoading(false);
  }, [toast]);

  const debouncedFetchLawyers = useCallback(debounce(fetchLawyers, 500), [fetchLawyers]);

  useEffect(() => {
    debouncedFetchLawyers(searchQuery.location, searchQuery.specialization);
  }, [searchQuery, debouncedFetchLawyers]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.location) params.set('location', searchQuery.location);
    if (searchQuery.specialization) params.set('specialization', searchQuery.specialization);
    router.push(`/search?${params.toString()}`);
    fetchLawyers(searchQuery.location, searchQuery.specialization);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Find a Lawyer</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Location"
          value={searchQuery.location}
          onChange={(e) => setSearchQuery({ ...searchQuery, location: e.target.value })}
        />
        <Input
          placeholder="Specialization"
          value={searchQuery.specialization}
          onChange={(e) => setSearchQuery({ ...searchQuery, specialization: e.target.value })}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {loading && <div className="text-center">Loading lawyers...</div>}

      {!loading && lawyers.length === 0 && (
        <div className="text-center text-gray-500">No lawyers found matching your criteria.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer) => (
          <div key={lawyer._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              {lawyer.photoUrl && (
                <Image
                  src={`/api/images/${lawyer.photoUrl}`}
                  alt={lawyer.fullName || "Lawyer Photo"}
                  width={80}
                  height={80}
                  className="rounded-full object-cover mr-4"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{lawyer.fullName || "N/A"}</h2>
                <p className="text-gray-600">{lawyer.specialties}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-2">Experience: {lawyer.experience} years</p>
            <p className="text-gray-700 mb-2">Fees: ${lawyer.fees}/hr</p>
            {lawyer.verified && (
              <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Verified</span>
            )}
            <Link href={`/profile/${lawyer._id}`}>
              <Button variant="outline" className="mt-4 w-full">View Profile</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
