import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase.js';

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const idTokenResult = await getIdTokenResult(user, true);
        setIsAdmin(idTokenResult?.claims?.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
        console.error('Failed to load auth claims', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ currentUser, loading, isAdmin }),
    [currentUser, loading, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
