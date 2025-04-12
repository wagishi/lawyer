import { Link } from 'wouter';
import { Star, StarHalf, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface LawyerCardProps {
  lawyer: any;
}

const LawyerCard = ({ lawyer }: LawyerCardProps) => {
  // Generate random rating for demo purposes - in real app this would come from the lawyer object
  const rating = Math.min(5, 3 + Math.random() * 2).toFixed(1);
  const reviewCount = Math.floor(20 + Math.random() * 100);
  
  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start">
          <img 
            src={lawyer.profile.profilePicture || `https://ui-avatars.com/api/?name=${lawyer.firstName}+${lawyer.lastName}&background=2D5BA9&color=fff`} 
            alt={`${lawyer.firstName} ${lawyer.lastName}`} 
            className="w-16 h-16 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="font-serif font-bold text-lg">
              {lawyer.firstName} {lawyer.lastName}
            </h3>
            <p className="text-accent font-medium">{lawyer.profile.specialization}</p>
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400">
                {renderStars(parseFloat(rating))}
              </div>
              <span className="text-gray-600 text-sm ml-1">({reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <MapPin className="h-4 w-4 text-accent mr-2" />
            <span>{lawyer.profile.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <Briefcase className="h-4 w-4 text-accent mr-2" />
            <span>{lawyer.profile.yearsOfExperience} years experience</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <GraduationCap className="h-4 w-4 text-accent mr-2" />
            <span>{lawyer.profile.lawSchool}</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {lawyer.profile.expertise && lawyer.profile.expertise.slice(0, 3).map((expertise: string, index: number) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-primary text-xs">
              {expertise}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary font-bold">${lawyer.profile.hourlyRate}/hour</span>
          <Link href={`/lawyer/${lawyer.id}`}>
            <a className="text-accent hover:text-blue-700 font-semibold">View Profile</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LawyerCard;
