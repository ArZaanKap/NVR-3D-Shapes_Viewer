import { useState } from 'react';
import { useAuth } from './AuthProvider';

export const NicknameModal = () => {
  const { saveNickname } = useAuth();
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSubmitting(true);
    await saveNickname(nickname.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-6">
          What's your nickname? We'll use this to greet you.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
            autoFocus
            maxLength={20}
          />

          <button
            type="submit"
            disabled={!nickname.trim() || isSubmitting}
            className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};
