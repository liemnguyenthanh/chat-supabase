import React from 'react';
import { ChatRoom } from './components/ChatRoom';
import { Toaster } from 'react-hot-toast';
import { AuthModal } from './components/auth/AuthModal';
import { AuthProvider, MessageProvider, useAuthContext } from './contexts';

const App = () => {
  return <AuthProvider>
    <AppInner />
  </AuthProvider>
}

const AppInner = () => {
  const { login, logout, isAuthenticated } = useAuthContext();

  return (
    <div className="h-screen bg-gray-100">
      <Toaster position="top-right" />
      {isAuthenticated ? (
        <MessageProvider>
          <ChatRoom onLogout={logout} />
        </MessageProvider>
      ) : (
        <AuthModal onAuthSuccess={login} />
      )}
    </div>
  );
}

export default App;