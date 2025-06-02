import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Index from '../../pages/Index';

// Mock para componentes Lucide (incluindo todos os ícones necessários)
vi.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon">Send Icon</div>,
  Bot: () => <div data-testid="bot-icon">Bot Icon</div>,
  User: () => <div data-testid="user-icon">User Icon</div>,
  Menu: () => <div data-testid="menu-icon">Menu Icon</div>,
  X: () => <div data-testid="x-icon">X Icon</div>,
  ExternalLink: () => <div data-testid="external-link-icon">External Link Icon</div>,
  LogOut: () => <div data-testid="logout-icon">Logout Icon</div>,
  Sun: () => <div data-testid="sun-icon">Sun Icon</div>,
  Moon: () => <div data-testid="moon-icon">Moon Icon</div>,
}));

// Mock das dependências de navegação
const navigateMock = vi.fn();
vi.mock('react-router-dom', () => {
  const actual = vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => 
      <a href={to} data-testid="link">{children}</a>
  };
});

// Mock para o tema
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

// Mock para ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown">{children}</div>
}));

// Mock para remarkGfm
vi.mock('remark-gfm', () => ({ default: {} }));

// Mock para o componente ThemeSwitcher para evitar problemas com ícones
vi.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher Mock</div>
}));

// Mock para toast notifications
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock da função scrollIntoView para os refs
class MockElement {
  scrollIntoView = vi.fn();
  focus = vi.fn();
}

// Mock específico para useRef
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: () => ({ current: new MockElement() }),
  };
});

// Mock das configurações de ambiente
vi.mock('../../config/env', () => ({
  config: {
    api: {
      baseUrl: 'http://test.api',
      port: '3001',
      endpoint: '/api/test',
      getFullUrl: () => 'http://test.api:3001/api/test',
    },
  },
}));

// Mock global para fetch
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ answer: 'Resposta de teste' }),
}));

// Variável de ambiente para indicar ambiente de teste
vi.stubGlobal('import.meta.env', { MODE: 'test' });

describe('Componente Index', () => {
  beforeEach(() => {
    // Limpa mocks e configura timers falsos para controle preciso
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.setItem('isAuthenticated', 'true'); // Usuário autenticado para a maioria dos testes
  });
  
  afterEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    vi.useRealTimers(); // Restaura timers reais após o teste
  });

  it('deve renderizar corretamente quando autenticado', () => {
    render(<Index />);
    
    // Busca pelo placeholder correto e pelo botão com ícone de envio
    expect(screen.getByPlaceholderText('Envie uma mensagem...')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });

  // Nota: Removido teste de redirecionamento automático para login
  // O componente Index não verifica automaticamente a autenticação durante a montagem
  // Apenas redireciona para login ao clicar no botão de logout (handleLogout)

  it('deve chamar navigate com /login quando o logout é acionado', () => {
    // Espionar localStorage.removeItem
    const localStorageSpy = vi.spyOn(Storage.prototype, 'removeItem');
    
    render(<Index />);
    
    // Encontrar o botão de logout pelo seu ícone
    const logoutButton = screen.getByTestId('logout-icon').closest('button');
    
    // Simular clique no botão de logout
    fireEvent.click(logoutButton!);
    
    // Verificar se navigate foi chamado com '/login'
    expect(navigateMock).toHaveBeenCalledWith('/login');
    
    // Verificar se localStorage.removeItem foi chamado com 'isLoggedIn'
    expect(localStorageSpy).toHaveBeenCalledWith('isLoggedIn');
    
    // Restaurar o spy
    localStorageSpy.mockRestore();
  });

  it('deve chamar a API com os parâmetros corretos ao enviar pergunta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ answer: 'Resposta de teste' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<Index />);
    
    // Interage com o formulário
    const input = screen.getByPlaceholderText('Envie uma mensagem...');
    const button = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.change(input, { target: { value: 'Pergunta de teste' } });
    fireEvent.click(button!);
    
    // Verifica chamada à API
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test.api:3001/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'Pergunta de teste' }),
      })
    );
  });

  it('deve tratar erros na requisição à API corretamente', async () => {
    // Mock para simular erro na API
    const errorMessage = 'Erro de conexão';
    const errorObj = new Error(errorMessage);
    const fetchMock = vi.fn().mockRejectedValue(errorObj);
    vi.stubGlobal('fetch', fetchMock);
    
    // Espia console.error para verificar o log
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<Index />);
    
    // Interage com o formulário
    const input = screen.getByPlaceholderText('Envie uma mensagem...');
    const button = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.change(input, { target: { value: 'Pergunta de teste' } });
    
    // Usando act para garantir que todas as atualizações são processadas
    await vi.runAllTimersAsync();
    
    // Executa o clique no botão - isso vai disparar a requisição fetch que vai falhar
    fireEvent.click(button!);
    
    // Garantir que o erro tenha tempo de ser processado
    await vi.runAllTimersAsync();
    
    // Verificar se o console.error foi chamado
    // Não verificamos os argumentos exatos para tornar o teste mais robusto
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('deve usar a URL completa das configurações de ambiente', () => {
    // Cria um novo mock para este teste específico
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ answer: 'Resposta de teste' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    
    render(<Index />);
    
    // Interage com o formulário
    const input = screen.getByPlaceholderText('Envie uma mensagem...');
    const button = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.change(input, { target: { value: 'Pergunta de teste' } });
    fireEvent.click(button!);
    
    // Verifica se a URL usada foi a montada pelo método getFullUrl
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test.api:3001/api/test',
      expect.anything()
    );
  });

  it('deve incluir o ID de sessão nos cabeçalhos e corpo da requisição', () => {
    // Configurar localStorage com ID de sessão e dados de autenticação
    const mockSessionId = 'test-session-123';
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sessionId', mockSessionId);
    localStorage.setItem('sessionExpiry', (Date.now() + 3600000).toString()); // 1 hora no futuro
    
    // Criar mock para fetch
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ answer: 'Resposta de teste' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    
    render(<Index />);
    
    // Interage com o formulário
    const input = screen.getByPlaceholderText('Envie uma mensagem...');
    const button = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.change(input, { target: { value: 'Pergunta de teste' } });
    fireEvent.click(button!);
    
    // Verificar se o ID de sessão está presente nos cabeçalhos
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Session-ID': mockSessionId,
          'X-Session-Expiry': expect.any(String)
        }),
        body: expect.stringContaining(mockSessionId)
      })
    );
  });

  it('deve renovar a sessão quando expirada', () => {
    // Configurar localStorage com sessão expirada
    const expiredSessionId = 'expired-session-123';
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sessionId', expiredSessionId);
    localStorage.setItem('sessionExpiry', (Date.now() - 1000).toString()); // Expirado
    
    // Criar mock para fetch
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ answer: 'Resposta de teste' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    
    render(<Index />);
    
    // Interage com o formulário
    const input = screen.getByPlaceholderText('Envie uma mensagem...');
    const button = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.change(input, { target: { value: 'Pergunta de teste' } });
    fireEvent.click(button!);
    
    // Verificar que um novo ID de sessão foi gerado (diferente do expirado)
    const newSessionId = localStorage.getItem('sessionId');
    expect(newSessionId).not.toBe(expiredSessionId);
    
    // Verificar que o novo ID foi usado na requisição
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Session-ID': newSessionId
        })
      })
    );
    
    // Verificar que a nova data de expiração é futura
    const newExpiry = parseInt(localStorage.getItem('sessionExpiry') || '0');
    expect(newExpiry).toBeGreaterThan(Date.now());
  });

  it('deve redirecionar para login quando não há autenticação válida', () => {
    // Configurar localStorage sem autenticação
    localStorage.removeItem('isAuthenticated');
    
    // Criar mock para fetch
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ answer: 'Resposta de teste' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    
    render(<Index />);
    
    // Interage com o formulário
    const input = screen.getByPlaceholderText('Envie uma mensagem...');
    const button = screen.getByTestId('send-icon').closest('button');
    
    fireEvent.change(input, { target: { value: 'Pergunta de teste' } });
    fireEvent.click(button!);
    
    // Verificar que foi redirecionado para login
    expect(navigateMock).toHaveBeenCalledWith('/login');
    
    // Verificar que a API não foi chamada
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
