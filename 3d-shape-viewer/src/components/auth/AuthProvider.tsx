import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, getUserNickname, setUserNickname, signInWithGoogle, signOutUser } from '../../services/firebase';

interface AuthContextType {
  user: User | null;
  nickname: string | null;
  loading: boolean;
  needsNickname: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveNickname: (nickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsNickname, setNeedsNickname] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Check if user has a nickname
        const existingNickname = await getUserNickname(firebaseUser.uid);
        if (existingNickname) {
          setNickname(existingNickname);
          setNeedsNickname(false);
        } else {
          setNeedsNickname(true);
        }
      } else {
        setNickname(null);
        setNeedsNickname(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setNickname(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const saveNickname = async (newNickname: string) => {
    if (!user) return;

    try {
      await setUserNickname(user.uid, newNickname);
      setNickname(newNickname);
      setNeedsNickname(false);
    } catch (error) {
      console.error('Save nickname error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        nickname,
        loading,
        needsNickname,
        signIn,
        signOut,
        saveNickname,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
