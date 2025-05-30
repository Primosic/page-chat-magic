import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Componente que protege rotas exigindo autenticação
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Verificar se o usuário está logado
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isAuthenticated) {
    // Redirecionar para a página de login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  
  // Renderizar o conteúdo da rota se estiver autenticado
  return <>{children}</>;
};

export default ProtectedRoute;
