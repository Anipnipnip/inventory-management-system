import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Thin wrapper around useContext so components write `useAuth()`
// instead of importing AuthContext directly everywhere, and get a
// clear error if used outside the provider by mistake.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
