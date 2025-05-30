
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const query = async (data: { question: string }) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/prediction/af3926a4-1e41-4be9-b066-a8deb1f8125f",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error querying agent:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await query({ question: inputValue });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || response.answer || 'I received your message, but I\'m not sure how to respond.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the AI agent. Please make sure the server is running on localhost:3001",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting to my servers right now. Please try again later.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Digital Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-cyan-400/30 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 border border-teal-400/20 rounded-full animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-cyan-500/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Data Privacy AI</h1>
              <p className="text-cyan-300 text-sm">Smart Data And Analytics</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-6 text-cyan-300">
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span className="hover:text-white cursor-pointer transition-colors">Solutions</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <div className="relative z-10 max-w-4xl mx-auto p-6 h-[calc(100vh-120px)] flex flex-col">
        {/* Chat Messages */}
        <Card className="flex-1 bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-3 max-w-[70%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.isUser ? (
                      <User className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                      : 'bg-slate-700/70 text-gray-100 border border-slate-600/50'
                  } shadow-lg backdrop-blur-sm`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-cyan-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-700/70 border border-slate-600/50 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-slate-600/50">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white border-0 px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-4 text-gray-400 text-sm">
          <p>Powered by Smart Data And Analytics • Global Regulations Compliance</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
