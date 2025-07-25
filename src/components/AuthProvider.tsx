'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  userRole: 'scorekeeper' | 'spectator' | null;
  teamId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicPaths = ['/auth/login', '/auth/signup', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'scorekeeper' | 'spectator' | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role as 'scorekeeper' | 'spectator';
          setUserRole(role);
          if (role === 'scorekeeper') {
              setTeamId(userData.teamId);
          }
        } else {
            // User exists in Auth but not in Firestore, likely an error state
            setUserRole(null);
            setTeamId(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setTeamId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (loading) return;

    const pathIsPublic = publicPaths.includes(pathname);

    if (!user && !pathIsPublic) {
      router.push('/auth/login');
      return;
    }

    if (user && userRole) {
      if (pathname.startsWith('/scorekeeper') && userRole !== 'scorekeeper') {
        router.push('/spectator');
      } else if (pathname.startsWith('/spectator') && userRole !== 'spectator') {
        router.push('/scorekeeper');
      } else if (pathIsPublic && pathname !== '/') {
        // Logged-in user on a public page (login/signup), redirect them
        router.push(userRole === 'scorekeeper' ? '/scorekeeper' : '/spectator');
      }
    }

  }, [user, userRole, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userRole, teamId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
