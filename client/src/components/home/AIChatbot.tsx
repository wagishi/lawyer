import { useState } from 'react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bot, CheckCircle, Expand } from 'lucide-react';

const AIChatbot = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ isUser: boolean; message: string }>>([
    { isUser: false, message: "Hello! I'm LegalAssist AI. How can I help you with your legal questions today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatHistory([...chatHistory, { isUser: true, message }]);
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        sessionId
      });
      
      const data = await response.json();
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { isUser: false, message: data.response }]);
      
      // Save the session ID if this is the first message
      if (!sessionId) {
        setSessionId(data.sessionId);
      }
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Get Instant Legal Guidance with AI
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI-powered chatbot provides preliminary legal information and guidance for common legal questions.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mt-1 mr-3" />
                <div>
                  <h4 className="font-bold">24/7 Availability</h4>
                  <p className="text-gray-600">Get answers to your legal questions anytime, anywhere.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mt-1 mr-3" />
                <div>
                  <h4 className="font-bold">Multiple Practice Areas</h4>
                  <p className="text-gray-600">Coverage across common legal topics and scenarios.</p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mt-1 mr-3" />
                <div>
                  <h4 className="font-bold">Lawyer Referrals</h4>
                  <p className="text-gray-600">Get matched with a real lawyer when you need more help.</p>
                </div>
              </li>
            </ul>
            <Link href="/ai-consultation">
              <a className="inline-block bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-500 transition duration-300">
                Try AI Consultation
              </a>
            </Link>
          </div>
          
          <div className="md:w-1/2 bg-gray-50 rounded-xl shadow-md p-4">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center">
                  <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center text-white mr-3">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">LegalAssist AI</h3>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
                <Link href="/ai-consultation">
                  <a className="text-gray-500 hover:text-gray-700">
                    <Expand className="h-5 w-5" />
                  </a>
                </Link>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-1">
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`flex items-start ${chat.isUser ? 'justify-end' : ''}`}>
                    {!chat.isUser && (
                      <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`${chat.isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'} rounded-lg ${chat.isUser ? 'rounded-tr-none' : 'rounded-tl-none'} p-3 max-w-[80%]`}>
                      <p className="text-sm">{chat.message}</p>
                    </div>
                    {chat.isUser && (
                      <div className="bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                        <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg rounded-tl-none p-3">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3">
                <form onSubmit={handleSubmit} className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Type your legal question..."
                    className="flex-1 rounded-r-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-blue-500 rounded-l-none"
                    disabled={isLoading}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1.5 1.5 0 01-.078 2.218l-6 4.5a1 1 0 01-1.5-.6L9 13V5a1 1 0 011.293-1.707z" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Note: This AI provides general information only, not legal advice. Consult with a lawyer for specific advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChatbot;
