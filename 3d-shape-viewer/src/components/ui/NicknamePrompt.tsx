import { useState } from 'react';

interface NicknamePromptProps {
  onSubmit: (nickname: string) => void;
}

export const NicknamePrompt = ({ onSubmit }: NicknamePromptProps) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    if (trimmed.length > 20) {
      setError('Nickname must be 20 characters or less');
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          What's your nickname?
        </h2>
        <p className="text-slate-500 text-center mb-6">
          We'll use this to greet you when you visit!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              placeholder="Enter your nickname..."
              className={`
                w-full px-4 py-3.5 rounded-xl border-2 text-lg font-medium
                placeholder:text-slate-300 focus:outline-none transition-all
                ${error
                  ? 'border-red-300 focus:border-red-400 bg-red-50'
                  : 'border-slate-200 focus:border-blue-400 bg-slate-50 focus:bg-white'
                }
              `}
              autoFocus
              maxLength={20}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={nickname.trim().length < 2}
            className={`
              w-full py-3.5 rounded-xl font-semibold text-lg transition-all
              ${nickname.trim().length >= 2
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </form>

        {/* Fun hint */}
        <p className="text-xs text-slate-400 text-center mt-4">
          You can use your real name or a fun nickname!
        </p>
      </div>
    </div>
  );
};
