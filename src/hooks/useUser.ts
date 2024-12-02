import { useState, useEffect } from 'react';

interface UserData {
  username: string;
  avatarUrl: string;
}

export const useUser = () => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('chatUserData');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userData) {
      localStorage.setItem('chatUserData', JSON.stringify(userData));
    }
  }, [userData]);

  return {
    userData,
    setUserData,
    isAuthenticated: !!userData
  };
};