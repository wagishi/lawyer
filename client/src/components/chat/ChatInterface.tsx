import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

interface ChatInterfaceProps {
  fullSize?: boolean;
}

const ChatInterface = ({ fullSize = true }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ isUser: boolean; message: string }>>([
    { isUser: false, message: "Hello! I'm LegalAssist AI. How can I help you with your legal questions today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const { toast } = useToast();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
    <Card className={`${fullSize ? 'w-full h-full max-w-3xl mx-auto' : 'w-full'} shadow-md overflow-hidden`}>
      <CardHeader className="bg-white border-b p-4">
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
      </CardHeader>
      
      <CardContent 
        className={`${fullSize ? 'h-[500px]' : 'h-[300px]'} overflow-y-auto p-4 bg-gray-50`}
        ref={chatContainerRef}
      >
        <div className="space-y-4">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex items-start ${chat.isUser ? 'justify-end' : ''}`}>
              {!chat.isUser && (
                <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`${chat.isUser ? 'bg-primary text-white' : 'bg-white'} rounded-lg ${chat.isUser ? 'rounded-tr-none' : 'rounded-tl-none'} p-3 max-w-[80%] shadow-sm`}>
                <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
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
              <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center w-full">
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
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
      
      <div className="px-4 pb-4 bg-white">
        <p className="text-xs text-gray-500">
          Note: This AI provides general information only, not legal advice. Consult with a lawyer for specific advice.
        </p>
      </div>
    </Card>
  );
};

export default ChatInterface;
