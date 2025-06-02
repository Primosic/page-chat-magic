import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { LockIcon, UserIcon, AlertCircleIcon } from 'lucide-react';

interface LoginState {
  attempts: number;
  lastAttemptTime: number | null;
  isLocked: boolean;
  lockoutEndTime: number | null;
  loginAttempts?: Array<{ timestamp: number; username: string; success: boolean }>;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('00:00');
  const navigate = useNavigate();
  
  // Gerenciamento de tentativas de login
  const [loginState, setLoginState] = useState<LoginState>(() => {
    const savedState = localStorage.getItem('loginState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      attempts: 0,
      lastAttemptTime: null,
      isLocked: false,
      lockoutEndTime: null,
      loginAttempts: []
    };
  });

  // Checar se o bloqueio ainda é válido quando a página carrega
  useEffect(() => {
    if (loginState.isLocked && loginState.lockoutEndTime) {
      const now = Date.now();
      if (now > loginState.lockoutEndTime) {
        // Desbloquear e resetar tentativas se o tempo de bloqueio já passou
        setLoginState(prev => ({
          ...prev,
          attempts: 0,
          isLocked: false,
          lockoutEndTime: null
        }));
        localStorage.setItem('loginState', JSON.stringify({
          ...loginState,
          attempts: 0,
          isLocked: false,
          lockoutEndTime: null
        }));
      } else {
        // Calcular e exibir o tempo restante inicial
        const initialRemainingMs = Math.max(0, loginState.lockoutEndTime - Date.now());
        const initialMinutes = Math.floor(initialRemainingMs / 60000);
        const initialSeconds = Math.floor((initialRemainingMs % 60000) / 1000);
        setRemainingTime(
          `${initialMinutes.toString().padStart(2, '0')}:${initialSeconds.toString().padStart(2, '0')}`
        );
        
        // Atualizar o timer de bloqueio a cada segundo
        const timer = setInterval(() => {
          const currentTime = Date.now();
          if (currentTime > (loginState.lockoutEndTime || 0)) {
            setLoginState(prev => ({
              ...prev,
              attempts: 0,
              isLocked: false,
              lockoutEndTime: null
            }));
            localStorage.setItem('loginState', JSON.stringify({
              ...loginState,
              attempts: 0,
              isLocked: false,
              lockoutEndTime: null
            }));
            setRemainingTime('00:00');
            clearInterval(timer);
          } else {
            // Atualizar contador regressivo
            const remainingMs = Math.max(0, loginState.lockoutEndTime - currentTime);
            const minutes = Math.floor(remainingMs / 60000);
            const seconds = Math.floor((remainingMs % 60000) / 1000);
            setRemainingTime(
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
          }
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [loginState.isLocked, loginState.lockoutEndTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se a conta está bloqueada
    if (loginState.isLocked) {
      const remainingTime = Math.ceil((loginState.lockoutEndTime as number - Date.now()) / 60000); // em minutos
      setError(`Conta bloqueada devido a múltiplas tentativas incorretas. 
                Entre em contato com SDNA em corporate@sdnadigital.com ou tente novamente em ${remainingTime} minutos.`);
      return;
    }

    // Remover espaços extras e converter para minúsculas para evitar problemas comuns
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim().toLowerCase();
    const expectedUsername = 'privacidade'.toLowerCase();
    const expectedPassword = 'dpp@2025'.toLowerCase();
    
    // Registrar tentativa de login (sem senha por segurança)
    const loginAttempt = {
      timestamp: Date.now(),
      username: trimmedUsername,
      success: trimmedUsername === expectedUsername && trimmedPassword === expectedPassword
    };
    
    // Adicionar ao histórico de tentativas (limitando a 10 registros)
    const loginAttempts = Array.isArray(loginState.loginAttempts) ? 
      [loginAttempt, ...loginState.loginAttempts].slice(0, 10) : 
      [loginAttempt];
    
    if (trimmedUsername === expectedUsername && trimmedPassword === expectedPassword) {
      // Login bem-sucedido
      // Limpar contagem de tentativas e adicionar registro do login bem-sucedido
      const newLoginState = {
        attempts: 0,
        lastAttemptTime: null,
        isLocked: false,
        lockoutEndTime: null,
        loginAttempts: loginAttempts
      };
      
      setLoginState(newLoginState);
      localStorage.setItem('loginState', JSON.stringify(newLoginState));
      
      // Salvar estado de autenticação
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirecionar para o chat
      navigate('/');
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao Chat DPP",
      });
    } else {
      // Incrementar contagem de tentativas e verificar bloqueio
      const newAttempts = loginState.attempts + 1;
      const now = Date.now();
      
      if (newAttempts >= 5) {
        // Bloquear conta por 15 minutos
        const lockoutEndTime = now + (15 * 60 * 1000); // 15 minutos em milissegundos
        
        const newState = {
          attempts: newAttempts,
          lastAttemptTime: now,
          isLocked: true,
          lockoutEndTime: lockoutEndTime,
          loginAttempts: loginAttempts
        };
        
        setLoginState(newState);
        localStorage.setItem('loginState', JSON.stringify(newState));
        
        setError(`Conta bloqueada devido a múltiplas tentativas incorretas. 
                  Entre em contato com SDNA em corporate@sdnadigital.com ou tente novamente em 15 minutos.`);
                  
        toast({
          title: "Conta bloqueada",
          description: "Múltiplas tentativas incorretas. Tente novamente em 15 minutos.",
          variant: "destructive",
        });
      } else {
        // Atualizar contagem de tentativas
        const newState = {
          attempts: newAttempts,
          lastAttemptTime: now,
          isLocked: false,
          lockoutEndTime: null,
          loginAttempts: loginAttempts
        };
        
        setLoginState(newState);
        localStorage.setItem('loginState', JSON.stringify(newState));
        
        setError(`Credenciais inválidas. Tentativa ${newAttempts} de 5.`);
      }
    }
  };
  
  // A função formatRemainingTime foi substituída pelo estado remainingTime que é atualizado a cada segundo

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-md w-full px-4">
        <Card className="border-gray-700 bg-gray-800 text-white">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <img 
              src="/images/1-min-3.png" 
              alt="SDNA Logo" 
              className="h-14 w-auto mb-4" 
            />
            <CardTitle className="text-2xl text-center">Data Privacy Platform</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Insira suas credenciais para acessar o assistente de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="username"
                      placeholder="Usuário"
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loginState.isLocked}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha"
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loginState.isLocked}
                    />
                  </div>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="bg-red-900 border-red-800 text-white">
                    <AlertCircleIcon className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {loginState.isLocked && (
                  <div className="text-center text-red-400">
                    <p>Tente novamente em: {remainingTime}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={loginState.isLocked || !username || !password}
                >
                  Entrar
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} Smart Data and Analytics</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
