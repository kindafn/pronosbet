import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/chat/AuthForm';
import { ChatLayout } from '@/components/chat/ChatLayout';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <ChatLayout />;
};

export default Index;
