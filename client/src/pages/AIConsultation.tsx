import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ChatInterface from '@/components/chat/ChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, Brain, Bot, MessageSquare, 
  AlertCircle, BookOpen, Scale, FileText 
} from 'lucide-react';

const AIConsultation = () => {
  const [legalIssue, setLegalIssue] = useState('');
  const { toast } = useToast();
  
  const lawyerRecommendationMutation = useMutation({
    mutationFn: async (legalIssue: string) => {
      const response = await apiRequest('POST', '/api/ai/lawyer-recommendations', { legalIssue });
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendations Generated",
        description: "We've analyzed your legal issue and provided recommendations.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleGetRecommendations = () => {
    if (!legalIssue.trim()) {
      toast({
        title: "Error",
        description: "Please describe your legal issue first.",
        variant: "destructive"
      });
      return;
    }
    
    lawyerRecommendationMutation.mutate(legalIssue);
  };
  
  const { data: resources } = useQuery({
    queryKey: ['/api/resources'],
    refetchOnWindowFocus: false,
  });

  const commonLegalQuestions = [
    "What should I do after a car accident?",
    "How do I file for divorce in my state?",
    "Can I dispute a copyright claim against my content?",
    "What are my rights as a tenant if my landlord isn't making repairs?",
    "How do I create a basic will?",
    "What should I do if I receive an IRS audit notice?"
  ];
  
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            AI Legal Consultation
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Get preliminary legal guidance through our AI assistant. Please note that this tool provides general 
            information only and is not a substitute for professional legal advice.
          </p>
        </div>
        
        <Tabs defaultValue="chat" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat with AI</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span>Lawyer Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Legal Resources</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <ChatInterface fullSize={true} />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-serif font-bold text-lg mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 text-accent mr-2" />
                      Important Notice
                    </h3>
                    <p className="text-sm text-gray-600">
                      This AI assistant provides general legal information only. It is not a substitute for professional 
                      legal advice, and no attorney-client relationship is created by using this service.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-serif font-bold text-lg mb-4">
                      Common Legal Questions
                    </h3>
                    <ul className="space-y-2">
                      {commonLegalQuestions.map((question, index) => (
                        <li key={index} className="text-sm">
                          <Button 
                            variant="link" 
                            className="text-left text-accent p-0 h-auto font-normal"
                            onClick={() => {
                              // This would ideally set the chat input, but for simplicity
                              // we just show a toast
                              toast({
                                title: "Question Selected",
                                description: "You selected: " + question,
                              });
                            }}
                          >
                            {question}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif font-bold text-xl mb-4">
                      Describe Your Legal Issue
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Provide details about your legal situation, and our AI will analyze what type of legal expertise you need.
                    </p>
                    <Textarea
                      value={legalIssue}
                      onChange={(e) => setLegalIssue(e.target.value)}
                      placeholder="For example: I'm starting a small business and need help with contracts and entity formation..."
                      className="mb-4 min-h-[200px]"
                    />
                    <Button 
                      onClick={handleGetRecommendations}
                      disabled={lawyerRecommendationMutation.isPending}
                      className="w-full"
                    >
                      {lawyerRecommendationMutation.isPending ? "Analyzing..." : "Get Recommendations"}
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-serif font-bold text-xl mb-4">
                      AI Recommendations
                    </h3>
                    
                    {lawyerRecommendationMutation.data ? (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-bold text-accent mb-2">Recommended Specializations</h4>
                          <ul className="space-y-2">
                            {lawyerRecommendationMutation.data.specializations.map((spec, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-accent mr-2 flex-shrink-0 mt-0.5" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-accent mb-2">Questions to Ask Your Lawyer</h4>
                          <ul className="space-y-2">
                            {lawyerRecommendationMutation.data.relevantQuestions.map((question, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-5 h-5 bg-primary rounded-full text-white flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => window.location.href = '/find-lawyers'}
                        >
                          Find Lawyers in These Areas
                        </Button>
                      </div>
                    ) : lawyerRecommendationMutation.isPending ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <Brain className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" />
                          <p>Analyzing your legal issue...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-gray-500">
                        <div>
                          <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Describe your legal issue to get specialized recommendations</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif font-bold text-xl mb-6">
                  Legal Resources & Guides
                </h3>
                
                {resources && resources.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {resources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start">
                            <FileText className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-bold mb-1">{resource.title}</h4>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{resource.content}</p>
                              <div className="flex items-center">
                                <span className="text-xs bg-blue-100 text-primary px-2 py-0.5 rounded-full">
                                  {resource.category}
                                </span>
                                {resource.tags && resource.tags.length > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    {resource.tags.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-10">
                    No resources available at the moment. Please check back later.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIConsultation;
