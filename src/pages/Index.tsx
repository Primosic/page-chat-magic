
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/env';
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
    // Verifica se está em ambiente de teste antes de chamar scrollIntoView
    // No ambiente de teste, import.meta.env.MODE será 'test'
    if (messagesEndRef.current && messagesEndRef.current.scrollIntoView && import.meta.env.MODE !== 'test') {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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
    // Remover todos os dados relacionados a autenticação e sessão
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionExpiry');
    
    // Manter o loginState para controle de tentativas de login
    // mas remover qualquer informação sensível de sessão
    const loginState = JSON.parse(localStorage.getItem('loginState') || '{}');
    if (loginState && loginState.loginAttempts) {
      // Limpar dados sensíveis mas manter contagem de tentativas
      const sanitizedLoginState = {
        ...loginState,
        // Remover histórico detalhado de tentativas para proteger privacidade
        loginAttempts: []
      };
      localStorage.setItem('loginState', JSON.stringify(sanitizedLoginState));
    }
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    navigate('/login');
  };

  // Verificar se a sessão expirou e renovar se necessário
  const checkSessionValidity = (): string => {
    const sessionId = localStorage.getItem('sessionId');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      navigate('/login');
      return '';
    }
    
    const now = Date.now();
    
    // Se a sessão expirou ou não existe expiração, renovar a sessão
    if (!sessionExpiry || now >= parseInt(sessionExpiry)) {
      return renewSession();
    }
    
    // Se não existe ID de sessão, criar um novo
    if (!sessionId) {
      return generateSessionIdSecure();
    }
    
    return sessionId;
  };
  
  // Renovar a sessão com novo ID e timestamp
  const renewSession = (): string => {
    const newSessionId = generateSessionIdSecure();
    const newExpiry = Date.now() + (8 * 60 * 60 * 1000); // 8 horas
    
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('sessionExpiry', newExpiry.toString());
    
    return newSessionId;
  };
  
  // Função para gerar ID de sessão criptograficamente seguro
  const generateSessionIdSecure = (): string => {
    // Usar window.crypto para geração criptograficamente segura
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    
    // Converter para string hexadecimal
    const randomHex = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Adicionar timestamp para garantir unicidade
    const timestamp = new Date().getTime();
    
    const newSessionId = `${timestamp}-${randomHex}`;
    localStorage.setItem('sessionId', newSessionId);
    return newSessionId;
  };
  
  const query = async (data: { question: string }) => {
    try {
      // Verificar validade da sessão antes de cada requisição
      const sessionId = checkSessionValidity();
      
      // Se não há sessão válida, interromper a requisição
      if (!sessionId) {
        throw new Error('Sessão inválida ou expirada');
      }
      
      const apiUrl = config.api.getFullUrl();
      
      // Preparar o body da requisição para logging e envio
      const requestBody = {
        ...data,
        sessionId // Incluir ID de sessão no corpo da requisição
      };
      
      // Headers para a requisição
      const headers = {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
        "X-Session-Expiry": localStorage.getItem('sessionExpiry') || ''
      };
      
      // Log detalhado da requisição para depuração
      console.log('=== DETALHES DA REQUISIÇÃO ===');
      console.log(`URL: ${apiUrl}`);
      console.log('Headers:', headers);
      console.log('Body:', requestBody);
      
      // Usa a URL da API definida nas configurações de ambiente
      const response = await fetch(
        apiUrl,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(requestBody),
          mode: 'cors',
          credentials: 'same-origin' // Altera para 'include' se o backend suporta cookies cross-origin
        }
      );
      
      // Log detalhado da resposta para depuração
      console.log('=== DETALHES DA RESPOSTA ===');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Headers:', Object.fromEntries([...response.headers.entries()]));
      
      // Verificar se a resposta foi bem sucedida
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Não foi possível ler o corpo da resposta');
        console.error('Corpo da resposta de erro:', errorText);
        throw new Error(`Erro na comunicação com a API: ${response.status} ${response.statusText}`);
      }
      
      // Ler a resposta como texto para garantir que conseguimos processar o conteúdo
      // independentemente do formato
      const textResponse = await response.text();
      console.log('=== RESPOSTA BRUTA DA API ===');
      console.log(textResponse);
      
      // Verificar se temos uma resposta com conteúdo
      if (!textResponse || !textResponse.trim()) {
        console.warn('Resposta da API está vazia');
        return { text: 'A resposta da API está vazia. Por favor, tente novamente.' };
      }
      
      // Primeiro, verificar se a resposta parece ser um JSON
      const trimmedResponse = textResponse.trim();
      const looksLikeJson = (
        (trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) || 
        (trimmedResponse.startsWith('[') && trimmedResponse.endsWith(']'))
      );
      
      // Se parece ser JSON, tenta fazer o parse
      if (looksLikeJson) {
        try {
          const jsonResult = JSON.parse(trimmedResponse);
          console.log('Resposta processada como JSON:', jsonResult);
          return jsonResult;
        } catch (error) {
          console.warn('Resposta parece JSON, mas parse falhou:', error);
          // Continua para tratamento como texto
        }
      }
      
      // Se chegou aqui, a resposta não é um JSON válido
      // Tratar como texto plano e retornar em formato compatível
      console.log('Tratando resposta como texto plano');
      
      // Verifica se a resposta não é HTML ou outro formato não desejado
      const isHtml = trimmedResponse.includes('<html') || 
                    trimmedResponse.includes('<!DOCTYPE') || 
                    (trimmedResponse.includes('<') && trimmedResponse.includes('</'));
      
      if (isHtml) {
        console.warn('Resposta parece ser HTML, isso pode indicar um erro');
        return { text: 'A API retornou HTML em vez do formato esperado. Verifique a configuração do servidor.' };
      }
      
      // Limita o tamanho da resposta para não sobrecarregar a interface
      const maxLength = 2000;
      const truncatedResponse = trimmedResponse.length > maxLength
        ? trimmedResponse.substring(0, maxLength) + '... (texto truncado)'
        : trimmedResponse;
      
      return { text: truncatedResponse };
    } catch (error) {
      console.error('Error querying agent:', error);
      
      // Se o erro for de sessão, redirecionar para login
      if (error.message === 'Sessão inválida ou expirada') {
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive",
        });
        navigate('/login');
      }
      
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
      console.log('Resposta processada da API:', JSON.stringify(response));
      
      // Determinar o texto da resposta com base no formato retornado
      let responseText = 'Recebi sua mensagem, mas não tenho certeza de como responder.';
      
      if (typeof response === 'string') {
        // Caso a resposta seja uma string direta
        responseText = response;
      } else if (response && typeof response === 'object') {
        // Testar diversas propriedades possíveis em ordem de prioridade
        responseText = response.text || response.answer || response.message || 
                      response.content || response.response || response.result;
        
        // Se ainda não encontrou, mas temos uma propriedade que parece ser o texto principal
        if (!responseText) {
          const possibleTextProps = Object.keys(response).filter(key => 
            typeof response[key] === 'string' && 
            response[key].length > 10 && 
            !key.includes('id') && 
            !key.includes('time')
          );
          
          if (possibleTextProps.length > 0) {
            responseText = response[possibleTextProps[0]];
          }
        }
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Determinar a mensagem de erro específica
      const errorDetails = error.message || 'Erro desconhecido';
      
      toast({
        title: "Erro de Conexão",
        description: `Não foi possível conectar ao agente de IA em ${config.api.getFullUrl()}. Erro: ${errorDetails}`,
        variant: "destructive",
      });
      
      // Criar mensagem de erro mais específica para o usuário
      let errorText = 'Desculpe, estou com dificuldades para me conectar aos servidores.';
      
      // Se for um erro de rede, oferecer sugestões mais úteis
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorText += ' Verifique sua conexão com a internet ou se o servidor está online.';
      } else if (error.message.includes('Erro na comunicação com a API')) {
        errorText += ` Código de erro: ${error.message.split(':')[1] || 'desconhecido'}.`;
      }
      
      errorText += ' Por favor, tente novamente mais tarde.';
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
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
