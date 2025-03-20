import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice';
import authService from '../../services/authService';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
        dispatch(setToken(token));
      } else {
        dispatch(setUser(null));
        dispatch(setToken(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider; 