import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, FileText, MessageSquare, Clock, 
  Upload, Download, Plus, Trash2, Share2, 
  Star, Calendar, Users, UserPlus, ArrowRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ChatInterface from '@/components/chat/ChatInterface';

const Dashboard = () => {
  const { toast } = useToast();
  
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
    refetchOnWindowFocus: false,
    enabled: !!user,
  });
  
  // Fetch shared documents
  const { data: sharedDocuments, isLoading: sharedDocumentsLoading } = useQuery({
    queryKey: ['/api/documents/shared'],
    refetchOnWindowFocus: false,
    enabled: !!user,
  });
  
  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadingFile(true);
    
    try {
      // For demonstration purposes, we'll create a mock file URL
      const fileUrl = URL.createObjectURL(file);
      
      // In a real app, you would upload to a server using FormData
      await apiRequest('POST', '/api/documents', {
        title: file.name,
        description: 'Uploaded from dashboard',
        fileUrl: fileUrl,
        fileType: file.type,
        fileSize: file.size,
        isShared: false,
        sharedWith: []
      });
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
      // Invalidate the documents query to refetch
      // This would be done with queryClient.invalidateQueries in a real implementation
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };
  
  // Handle file delete
  const handleDeleteFile = async (documentId: number) => {
    try {
      await apiRequest('DELETE', `/api/documents/${documentId}`, undefined);
      
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      
      // Invalidate the documents query to refetch
      // This would be done with queryClient.invalidateQueries in a real implementation
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };
  
  // If user is not logged in
  if (!userLoading && !user) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">
          Please Log In to Access Your Dashboard
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          You need to be logged in to view your dashboard. Please log in or create an account to continue.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-6">
        {userLoading ? (
          <div className="mb-10 flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        ) : user ? (
          <div className="mb-10 flex items-center gap-4">
            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Welcome, {user.firstName}!</h1>
              <p className="text-gray-600">{user.userType === 'lawyer' ? 'Lawyer Dashboard' : 'Client Dashboard'}</p>
            </div>
          </div>
        ) : null}
        
        <Tabs defaultValue="overview" className="mb-10">
          <TabsList className="mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>AI Chat</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {user?.userType === 'lawyer' ? (
              <LawyerOverview user={user} isLoading={userLoading} />
            ) : (
              <ClientOverview user={user} isLoading={userLoading} />
            )}
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>My Documents</span>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button size="sm" className="flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </Button>
                    </label>
                  </CardTitle>
                  <CardDescription>
                    Manage your legal documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : documents && documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Share" onClick={() => {
                              toast({
                                title: "Share Document",
                                description: "Sharing functionality would open here",
                              });
                            }}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete"
                              onClick={() => handleDeleteFile(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-4">You don't have any documents yet</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          <span>Upload Document</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Shared With Me</CardTitle>
                  <CardDescription>
                    Documents shared by others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sharedDocumentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : sharedDocuments && sharedDocuments.length > 0 ? (
                    <div className="space-y-4">
                      {sharedDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-accent" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-gray-500">Shared by: User #{doc.userId}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Share2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No documents have been shared with you yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Communicate with clients or lawyers
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Messages Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Start a conversation with a {user?.userType === 'lawyer' ? 'client' : 'lawyer'} to see messages here.
                  </p>
                  <Button asChild>
                    <Link href={user?.userType === 'lawyer' ? '/dashboard/clients' : '/find-lawyers'}>
                      {user?.userType === 'lawyer' ? 'View My Clients' : 'Find a Lawyer'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai-chat">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ChatInterface fullSize={true} />
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Chats</CardTitle>
                    <CardDescription>
                      Your recent AI consultations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No recent chat history</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/ai-consultation">
                        Full AI Consultation
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Lawyer-specific overview component
const LawyerOverview = ({ user, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <InfoCard
          title="Total Clients"
          value="0"
          icon={<Users className="h-5 w-5" />}
          description="Active clients"
          color="blue"
        />
        
        <InfoCard
          title="New Inquiries"
          value="0"
          icon={<UserPlus className="h-5 w-5" />}
          description="Potential clients"
          color="green"
        />
        
        <InfoCard
          title="Active Cases"
          value="0"
          icon={<FileText className="h-5 w-5" />}
          description="In progress"
          color="orange"
        />
        
        <InfoCard
          title="Client Rating"
          value="N/A"
          icon={<Star className="h-5 w-5" />}
          description="No reviews yet"
          color="yellow"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your scheduled meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-1">No upcoming appointments</p>
              <p className="text-sm text-gray-400">
                Clients will be able to schedule consultations with you
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>
              Enhance your visibility to potential clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-2">
                A complete profile increases your chances of being discovered by clients.
              </p>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-200 text-green-700">
                      Basic Info
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-700">
                      100%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div className="w-full bg-green-500"></div>
                </div>
                
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-700">
                      Expertise Details
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-700">
                      100%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div className="w-full bg-blue-500"></div>
                </div>
                
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-gray-200 text-gray-700">
                      Client Reviews
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-700">
                      0%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div className="w-0 bg-gray-500"></div>
                </div>
              </div>
              
              <Button className="w-full" asChild>
                <Link href="/profile">
                  <span className="flex items-center justify-center">
                    Update Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Client-specific overview component
const ClientOverview = ({ user, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <InfoCard
          title="My Lawyers"
          value="0"
          icon={<Users className="h-5 w-5" />}
          description="Connected attorneys"
          color="blue"
        />
        
        <InfoCard
          title="Active Cases"
          value="0"
          icon={<FileText className="h-5 w-5" />}
          description="In progress"
          color="orange"
        />
        
        <InfoCard
          title="Documents"
          value="0"
          icon={<FileText className="h-5 w-5" />}
          description="Legal files"
          color="indigo"
        />
        
        <InfoCard
          title="Consultations"
          value="0"
          icon={<MessageSquare className="h-5 w-5" />}
          description="With attorneys"
          color="purple"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Find a Lawyer</CardTitle>
            <CardDescription>
              Connect with legal professionals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Browse our database of qualified attorneys specializing in various practice areas.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/find-lawyers?specialization=Family Law">
                <a className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <p className="font-medium">Family Law</p>
                  <p className="text-xs text-gray-500">Divorce, custody, adoption</p>
                </a>
              </Link>
              
              <Link href="/find-lawyers?specialization=Corporate Law">
                <a className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <p className="font-medium">Corporate Law</p>
                  <p className="text-xs text-gray-500">Business, contracts, compliance</p>
                </a>
              </Link>
              
              <Link href="/find-lawyers?specialization=Real Estate">
                <a className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <p className="font-medium">Real Estate</p>
                  <p className="text-xs text-gray-500">Property, leases, disputes</p>
                </a>
              </Link>
              
              <Link href="/find-lawyers">
                <a className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <p className="font-medium">View All</p>
                  <p className="text-xs text-gray-500">Browse all practice areas</p>
                </a>
              </Link>
            </div>
            
            <Button className="w-full" asChild>
              <Link href="/find-lawyers">
                <span className="flex items-center justify-center">
                  Find a Lawyer <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Legal Assistant</CardTitle>
            <CardDescription>
              Get preliminary legal guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Our AI assistant can help with basic legal questions and point you in the right direction.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium mb-2">Example questions you can ask:</p>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• What are my rights as a tenant?</li>
                <li>• How do I form an LLC?</li>
                <li>• What should I do after a car accident?</li>
                <li>• How does child custody work in divorce?</li>
              </ul>
            </div>
            
            <Button className="w-full" asChild>
              <Link href="/ai-consultation">
                <span className="flex items-center justify-center">
                  Start AI Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Reusable info card component
const InfoCard = ({ title, value, icon, description, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    yellow: "bg-yellow-50 text-yellow-700",
    indigo: "bg-indigo-50 text-indigo-700",
    purple: "bg-purple-50 text-purple-700",
  };
  
  const bgColor = colorMap[color] || "bg-gray-50 text-gray-700";
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`rounded-full p-2 ${bgColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
