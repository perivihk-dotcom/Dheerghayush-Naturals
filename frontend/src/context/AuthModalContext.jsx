import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }) => {
  const [showAuth, setShowAuth] = useState(false);

  const openAuthModal = () => setShowAuth(true);
  const closeAuthModal = () => setShowAuth(false);

  return (
    <AuthModalContext.Provider value={{ showAuth, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
};
