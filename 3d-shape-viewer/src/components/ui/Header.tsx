import { useAuth } from '../auth/AuthProvider';
import { UserGreeting } from '../auth/UserGreeting';

export const Header = () => {
  const { user, nickname } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">
        3D Shape Viewer
      </h1>
      {user && nickname && <UserGreeting />}
    </header>
  );
};
