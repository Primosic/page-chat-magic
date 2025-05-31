
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Menu, X, ExternalLink, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTheme } from "next-themes";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente de IA especializado do DPP (Data Privacy Platform). Como posso ajudá-lo hoje?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Foca o input após renderizar as mensagens
    inputRef.current?.focus();
  }, [messages]);

  // Foca o input quando a página carrega ou após login bem-sucedido
  useEffect(() => {
    // Pequeno atraso para garantir que o DOM esteja completamente renderizado
    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(focusTimeout);
  }, []);
  
  // Função para lidar com o logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    navigate('/login');
  };

  const query = async (data: { question: string }) => {
    try {
      const response = await fetch(
        "http://177.131.143.123:3001/api/v1/prediction/4ba56f30-d33d-48c0-9156-1e83611f261d",
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

  const handleNewConversation = () => {
    setMessages([
      {
        id: '1',
        text: 'Olá! Sou seu assistente de IA especializado do DPP (Data Privacy Platform). Como posso ajudá-lo hoje?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="h-screen bg-gray-900 dark:bg-gray-900 bg-white text-gray-900 dark:text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col`}>
        {/* Sidebar Header - Always visible */}
        <div className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <img 
              src={theme === 'dark' ? "/images/1-min-3.png" : "/images/logo_2.png"}
              alt="Logo" 
              className="h-8 w-auto" 
            />
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Sidebar Content - Always visible */}
        <nav className="mt-4 px-4 flex-shrink-0">
          <div className="space-y-2">
            <button 
              onClick={handleNewConversation}
              className="w-full text-left px-3 py-2 rounded-lg bg-green-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-green-300 dark:hover:bg-gray-600 transition-colors"
            >
              Nova conversa
            </button>
          </div>
        </nav>
        {/* Empty space to fill sidebar */}
        <div className="flex-grow"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen lg:ml-0 overflow-hidden">
        {/* Header - Always visible */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 h-16 flex items-center px-4 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <img 
              src="/images/simbolo_sdna.png" 
              alt="Logo SDNA" 
              className="h-8 w-auto mr-3" 
            />
            <h1 className="text-xl font-semibold">Data Privacy AI</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitcher />
            <Button
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">U</span>
            </div>
          </div>
        </header>

        {/* Chat Container with fixed height and scrollable */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
          {/* Messages - Scrollable area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser 
                        ? 'bg-purple-600' 
                        : 'bg-green-600'
                    }`}>
                      {message.isUser ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg px-4 py-3 ${
                      message.isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                    } overflow-auto max-h-[70vh]`}>
                      {message.isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      ) : (
                        <div className="markdown-content text-sm">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ node, ...props }) => (
                                <a 
                                  {...props} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-200 underline flex items-center"
                                >
                                  {props.children}
                                  <ExternalLink className="ml-1 w-3 h-3" />
                                </a>
                              ),
                              p: ({ node, ...props }) => (
                                <p className="mb-2 last:mb-0" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="mb-1" {...props} />
                              ),
                              h1: ({ node, ...props }) => (
                                <h1 className="text-lg font-bold mb-2 mt-3" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-md font-bold mb-2 mt-3" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="font-bold mb-1 mt-2" {...props} />
                              ),
                              code: ({ node, className, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && (props.children as string).indexOf('\n') === -1;
                                return isInline ? (
                                  <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-xs text-gray-800 dark:text-gray-200" {...props} />
                                ) : (
                                  <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-md my-2 overflow-x-auto">
                                    <code className="text-xs text-gray-800 dark:text-gray-200" {...props} />
                                  </div>
                                );
                              },
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-2 border-gray-500 pl-3 italic my-2" {...props} />
                              ),
                              hr: ({ node, ...props }) => (
                                <hr className="border-gray-600 my-2" {...props} />
                              ),
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-2">
                                  <table className="border-collapse border border-gray-600 w-full" {...props} />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th className="border border-gray-600 px-2 py-1 bg-gray-800" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="border border-gray-600 px-2 py-1" {...props} />
                              )
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-6">
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Envie uma mensagem..."
                className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                disabled={isLoading}
                onBlur={() => setTimeout(() => inputRef.current?.focus(), 100)} // Refoca se perder o foco
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;
