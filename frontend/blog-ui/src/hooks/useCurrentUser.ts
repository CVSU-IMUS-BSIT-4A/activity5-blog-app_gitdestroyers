import { useState, useEffect } from 'react';
import { getUser, getCurrentUserIdFromToken, setAuthToken } from '../api';

interface User {
  id: number;
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  created_at?: string;
}

interface UseCurrentUserReturn {
  currentUser: User | null;
  userId: number | null;
  loading: boolean;
  error: string | null;
  loadCurrentUser: () => Promise<void>;
  handleLogout: () => void;
}

/**
 * Hook to manage current user state and operations
 * Handles loading user data, logout functionality, and user state management
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getCurrentUserIdFromToken();

  async function loadCurrentUser() {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const userData = await getUser(userId);
      setCurrentUser(userData);
    } catch (error) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setAuthToken(null);
    setCurrentUser(null);
    window.location.href = '/auth';
  }

  // Load user data when userId changes
  useEffect(() => {
    loadCurrentUser();
  }, [userId]);

  return {
    currentUser,
    userId,
    loading,
    error,
    loadCurrentUser,
    handleLogout,
  };
}
