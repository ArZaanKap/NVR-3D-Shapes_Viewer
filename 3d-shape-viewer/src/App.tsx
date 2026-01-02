import { useState, useEffect } from 'react';
import { Workspace } from './components/Workspace';
import { NicknamePrompt } from './components/ui/NicknamePrompt';

const NICKNAME_KEY = 'shape-builder-nickname';

const Header = ({ nickname }: { nickname: string }) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-800 leading-tight">
            Shape Builder
          </h1>
          <p className="text-[10px] text-slate-400">11+ Exam Prep</p>
        </div>
      </div>

      {/* User greeting */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-slate-50 border border-slate-200">
        <span className="text-sm font-medium text-slate-600">
          Hi, <span className="text-blue-600">{nickname}</span>!
        </span>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
      </div>
    </header>
  );
};

function App() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [started, setStarted] = useState(false);

  // Load nickname from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(NICKNAME_KEY);
    if (stored) {
      setNickname(stored);
    }
    setIsLoading(false);
  }, []);

  const handleNicknameSubmit = (name: string) => {
    localStorage.setItem(NICKNAME_KEY, name);
    setNickname(name);
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show nickname prompt if no nickname is set
  if (!nickname) {
    return (
      <div className="h-screen bg-slate-50">
        <NicknamePrompt onSubmit={handleNicknameSubmit} />
      </div>
    );
  }

  // Show landing page
  if (!started) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          {/* Greeting */}
          <p className="text-lg text-blue-600 font-semibold mb-2">
            Welcome back, {nickname}!
          </p>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Shape Builder
          </h1>
          <p className="text-slate-500 text-lg mb-10">
            Build and visualise 3D shapes for your 11+ exam preparation
          </p>

          {/* Start button */}
          <button
            onClick={() => setStarted(true)}
            className="px-10 py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
          >
            Start Building
          </button>

          {/* Hint */}
          <p className="text-sm text-slate-400 mt-8">
            Drag shapes from the panel and build 3D structures
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header nickname={nickname} />
      <Workspace />
    </div>
  );
}

export default App;
