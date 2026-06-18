import type { User } from '../types';

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User, accessToken: string): void => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('token', accessToken); // For backward compatibility
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('accessToken') || localStorage.getItem('token'));
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'admin' || false;
};

