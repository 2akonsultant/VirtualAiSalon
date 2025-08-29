import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  serviceId?: string;
}

export default function AIChat({ isOpen, onClose, initialMessage, serviceId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add initial AI greeting
      const greeting: Message = {
        role: "assistant",
        content: "Hello! Welcome to Goodness Glamour. Which service are you interested in today?",
        timestamp: new Date().toISOString()
      };
      setMessages([greeting]);

      // If there's an initial message, send it
      if (initialMessage) {
        setInputMessage(initialMessage);
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 500);
      }
    }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        sessionId,
        conversationId
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setConversationId(data.conversationId);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please call us at 9036626642 for immediate assistance.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Connection Error",
        description: "Unable to reach AI assistant. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message || chatMutation.isPending) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Send to AI
    chatMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0" data-testid="dialog-ai-chat">
        {/* Header */}
        <DialogHeader className="bg-primary text-primary-foreground p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center mr-3">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-base font-medium">Beauty Assistant</DialogTitle>
                <p className="text-xs opacity-80">Online now</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="button-close-chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4" data-testid="chat-messages">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.role}-${index}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"
                } rounded-lg p-3`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={chatMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              size="icon"
              className="btn-primary"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
