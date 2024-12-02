import { ChatRoom } from './components/ChatRoom';
import { Toaster } from 'react-hot-toast';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div className="h-screen bg-gray-100">
      <Toaster position="top-right" />
      {isAuthenticated ? (
        <ChatRoom onLogout={logout} />
      ) : (
        <AuthModal onAuthSuccess={login} />
      )}
    </div>
  );
}

export default App;