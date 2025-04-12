import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, Briefcase, GraduationCap, Phone, Mail, 
  Calendar, Languages, Award, FileText, Users, Star
} from 'lucide-react';

const LawyerProfile = () => {
  const { id } = useParams();
  
  const { data: lawyer, isLoading, error } = useQuery({
    queryKey: [`/api/lawyers/${id}`],
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-32 h-32 rounded-full mb-4" />
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
            
            <Skeleton className="h-10 w-full mb-4" />
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <p className="text-gray-600 mb-6">We couldn't find this lawyer's profile. The lawyer may not exist or there was an error loading their information.</p>
        <Link href="/find-lawyers">
          <a className="bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300">
            Return to Lawyer Search
          </a>
        </Link>
      </div>
    );
  }

  // Generate a random rating and review count for demo purposes
  const rating = (3 + Math.random() * 2).toFixed(1);
  const reviewCount = Math.floor(20 + Math.random() * 100);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar with profile info */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <img 
                  src={lawyer.profile.profilePicture || `https://ui-avatars.com/api/?name=${lawyer.firstName}+${lawyer.lastName}&background=2D5BA9&color=fff&size=200`} 
                  alt={`${lawyer.firstName} ${lawyer.lastName}`} 
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <h1 className="text-2xl font-serif font-bold">{lawyer.firstName} {lawyer.lastName}</h1>
                <p className="text-accent font-medium mb-2">{lawyer.profile.specialization}</p>
                
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(parseFloat(rating)) ? 'fill-yellow-400' : ''}`} />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm ml-1">({reviewCount} reviews)</span>
                </div>
                
                <Button className="w-full mb-2">Contact Lawyer</Button>
                <Button variant="outline" className="w-full">Schedule Consultation</Button>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>{lawyer.profile.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>{lawyer.profile.yearsOfExperience} years of experience</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>{lawyer.profile.lawSchool}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>Contact for phone number</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>{lawyer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                    <span>{lawyer.profile.availability}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="font-bold mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {lawyer.profile.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-100">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <h3 className="font-bold text-primary text-xl">${lawyer.profile.hourlyRate}/hour</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">About Me</h2>
              <p className="text-gray-700 whitespace-pre-line">{lawyer.profile.biography}</p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="expertise">
            <TabsList className="w-full">
              <TabsTrigger value="expertise" className="flex-1">Expertise</TabsTrigger>
              <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
              <TabsTrigger value="awards" className="flex-1">Awards</TabsTrigger>
              <TabsTrigger value="associations" className="flex-1">Associations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expertise">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 text-lg">Areas of Expertise</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {lawyer.profile.expertise.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="education">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 text-lg">Education</h3>
                  <div className="space-y-4">
                    {lawyer.profile.education && Object.entries(lawyer.profile.education).map(([key, value]) => (
                      <div key={key} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <GraduationCap className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold">{value.degree}</h4>
                            <p>{value.institution}</p>
                            <p className="text-sm text-gray-600">{value.year}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="awards">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 text-lg">Awards & Recognitions</h3>
                  {lawyer.profile.awards && lawyer.profile.awards.length > 0 ? (
                    <div className="space-y-4">
                      {lawyer.profile.awards.map((award, index) => (
                        <div key={index} className="flex items-start">
                          <Award className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                          <span>{award}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No awards listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="associations">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 text-lg">Professional Associations</h3>
                  {lawyer.profile.professionalAssociations && lawyer.profile.professionalAssociations.length > 0 ? (
                    <div className="space-y-4">
                      {lawyer.profile.professionalAssociations.map((association, index) => (
                        <div key={index} className="flex items-start">
                          <Users className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                          <span>{association}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No professional associations listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h3 className="font-bold mb-4 text-xl">Publications</h3>
            {lawyer.profile.publications && lawyer.profile.publications.length > 0 ? (
              <div className="space-y-4">
                {lawyer.profile.publications.map((publication, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                        <span>{publication}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No publications listed</p>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/find-lawyers">
              <a className="text-accent hover:text-blue-700 font-semibold">
                ← Back to Lawyer Search
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
