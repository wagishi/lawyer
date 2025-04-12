import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import LawyerCard from '@/components/lawyer/LawyerCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Filter } from 'lucide-react';

const LawyerSearch = () => {
  const [location, setLocation] = useState('');
  const [practiceArea, setPracticeArea] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (practiceArea) params.append('specialization', practiceArea);
    if (experienceLevel) params.append('experienceLevel', experienceLevel);
    
    navigate(`/find-lawyers?${params.toString()}`);
  };

  const { data: lawyers, isLoading } = useQuery({
    queryKey: ['/api/lawyers'],
    refetchOnWindowFocus: false,
  });

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
          Find the Right Lawyer
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Search our extensive database of legal professionals filtered by practice area, location, and experience level.
        </p>
        
        {/* Search Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-12">
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
        </div>
        
        {/* Lawyer Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="col-span-3 text-center py-10">Loading lawyers...</p>
          ) : lawyers && lawyers.length > 0 ? (
            lawyers.slice(0, 3).map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))
          ) : (
            <p className="col-span-3 text-center py-10">No lawyers found. Please try a different search.</p>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/find-lawyers" className="inline-block bg-white text-primary border border-primary rounded-md px-6 py-3 hover:bg-primary hover:text-white transition duration-300">
            View All Lawyers
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LawyerSearch;
