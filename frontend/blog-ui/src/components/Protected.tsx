import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUserIdFromToken, loadTokenFromStorage } from '../api';

interface ProtectedProps {
  children: React.ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  useEffect(() => {
    loadTokenFromStorage();
  }, []);

  const userId = getCurrentUserIdFromToken();
  
  if (!userId) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

