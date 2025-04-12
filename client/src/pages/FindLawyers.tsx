import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LawyerCard from '@/components/lawyer/LawyerCard';
import { MapPin, Briefcase, Filter } from 'lucide-react';

const FindLawyers = () => {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<{
    specialization?: string;
    location?: string;
    experienceLevel?: string;
  }>({});
  
  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specialization = params.get('specialization') || undefined;
    const location = params.get('location') || undefined;
    const experienceLevel = params.get('experienceLevel') || undefined;
    
    setSearchParams({ specialization, location, experienceLevel });
  }, [location]);
  
  // Form state
  const [locationInput, setLocationInput] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  
  // Update form state from URL params when they change
  useEffect(() => {
    setLocationInput(searchParams.location || '');
    setPracticeArea(searchParams.specialization || '');
    setExperienceLevel(searchParams.experienceLevel || '');
  }, [searchParams]);
  
  // Fetch lawyers with filters
  const { data: lawyers, isLoading } = useQuery({
    queryKey: ['/api/lawyers', searchParams],
    queryFn: async ({ queryKey }) => {
      const [_, filters] = queryKey;
      const params = new URLSearchParams();
      
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.location) params.append('location', filters.location);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      
      const url = `/api/lawyers${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lawyers');
      }
      
      return response.json();
    },
  });
  
  const [, navigate] = useLocation();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (locationInput) params.append('location', locationInput);
    if (practiceArea) params.append('specialization', practiceArea);
    if (experienceLevel) params.append('experienceLevel', experienceLevel);
    
    navigate(`/find-lawyers?${params.toString()}`);
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
          Find the Right Lawyer for Your Needs
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Search our database of legal professionals filtered by practice area, location, and experience level.
        </p>
        
        {/* Search Form */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="practice-area">
                  Practice Area
                </label>
                <Select value={practiceArea} onValueChange={setPracticeArea}>
                  <SelectTrigger id="practice-area">
                    <SelectValue placeholder="All Practice Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Practice Areas</SelectItem>
                    <SelectItem value="Family Law">Family Law</SelectItem>
                    <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                    <SelectItem value="Criminal Defense">Criminal Defense</SelectItem>
                    <SelectItem value="Estate Planning">Estate Planning</SelectItem>
                    <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                    <SelectItem value="Immigration">Immigration</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                  Location
                </label>
                <Input 
                  type="text" 
                  id="location" 
                  placeholder="City or State" 
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="experience">
                  Experience Level
                </label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Experience</SelectItem>
                    <SelectItem value="junior">1-3 years</SelectItem>
                    <SelectItem value="mid">4-7 years</SelectItem>
                    <SelectItem value="senior">8-15 years</SelectItem>
                    <SelectItem value="expert">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-primary hover:bg-blue-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Search Lawyers
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold mb-2">Search Results</h2>
          {searchParams.specialization || searchParams.location || searchParams.experienceLevel ? (
            <p className="text-gray-600">
              Showing results for 
              {searchParams.specialization ? ` "${searchParams.specialization}"` : ''} 
              {searchParams.location ? ` in "${searchParams.location}"` : ''}
              {searchParams.experienceLevel ? ` with experience level "${searchParams.experienceLevel}"` : ''}
            </p>
          ) : (
            <p className="text-gray-600">Showing all available lawyers</p>
          )}
        </div>
        
        {/* Lawyer Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <Skeleton className="w-16 h-16 rounded-full mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : lawyers && lawyers.length > 0 ? (
            lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-xl font-medium text-gray-600 mb-4">No lawyers found matching your criteria</p>
              <p className="text-gray-500">Try adjusting your search filters or browse all available lawyers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindLawyers;
