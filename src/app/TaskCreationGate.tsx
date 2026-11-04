import { useAuth } from '@/features/auth/useAuth';
import { AuthDialog } from '@/features/auth/AuthDialog';
import { TaskFormPage } from '@/features/tasks/TaskFormPage';
import { useNavigate } from 'react-router-dom';

export function TaskCreationGate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return <TaskFormPage />;

  return (
    <AuthDialog
      onAuthenticated={() => navigate('/new', { replace: true })}
      onClose={() => navigate('/', { replace: true })}
      open
    />
  );
}
