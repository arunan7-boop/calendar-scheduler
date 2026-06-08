import { useState, useEffect } from 'react';
import { getStoredToken, clearToken } from '../utils/tokenStorage';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      try {
        // Decode JWT to get user info (basic decoding, no verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (err) {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return { user, isLoading, logout };
}
