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

// The cached parishioner ID belongs to whoever last registered or looked up a profile
// on this browser, so it must not outlive a change of signed-in user.
const clearCachedParishioner = (): void => {
  localStorage.removeItem('parishionerId');
  localStorage.removeItem('parishionerEmail');
};

export const setStoredUser = (user: User, accessToken: string): void => {
  clearCachedParishioner();
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('token', accessToken); // For backward compatibility
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  clearCachedParishioner();
};

export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('accessToken') || localStorage.getItem('token'));
};
