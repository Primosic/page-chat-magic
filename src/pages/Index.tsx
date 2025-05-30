
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Sparkles } from "lucide-react";
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
      text: 'Olá! Sou seu assistente de IA especializado em Privacidade de Dados. Como posso ajudá-lo hoje?',
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
        text: response.text || response.answer || 'Recebi sua mensagem, mas não tenho certeza de como responder.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao agente de IA. Verifique se o servidor está rodando em localhost:3001",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, estou com dificuldades para me conectar aos meus servidores. Tente novamente mais tarde.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-100/10 to-blue-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Data Privacy AI</h1>
                <p className="text-slate-500 text-sm font-medium">Smart Data And Analytics</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-6">
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Início</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Soluções</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Contato</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Assistente de Privacidade de Dados</h2>
          <p className="text-slate-600 text-lg">Tire suas dúvidas sobre LGPD, GDPR e proteção de dados</p>
        </div>

        {/* Chat Container */}
        <Card className="bg-white/70 backdrop-blur-md border-slate-200/50 shadow-xl rounded-2xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}>
                    {message.isUser ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 opacity-70 ${
                      message.isUser ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200/50 bg-slate-50/50 p-6">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua pergunta sobre privacidade de dados..."
                className="flex-1 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-400"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Desenvolvido por <span className="font-semibold text-slate-600">Smart Data And Analytics</span> • 
            Conformidade com Regulamentações Globais
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
