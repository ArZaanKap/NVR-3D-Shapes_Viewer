import { useAuth } from './AuthProvider';

export const UserGreeting = () => {
  const { nickname, signOut } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-700">
        Hello, <span className="font-semibold">{nickname}</span>!
      </span>
      <button
        onClick={signOut}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Sign out
      </button>
    </div>
  );
};
