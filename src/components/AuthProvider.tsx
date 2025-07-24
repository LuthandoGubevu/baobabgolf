'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: ReactNode;
  requiredRole?: 'scorekeeper' | 'spectator';
}

export default function AuthProvider({ children, requiredRole }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);

          if (requiredRole && userData.role !== requiredRole) {
            // Redirect if role is not the one required for the page
            router.push(userData.role === 'scorekeeper' ? '/scorekeeper' : '/spectator');
          } else {
             setLoading(false);
          }
        } else {
            // No user role found, log them out
            await auth.signOut();
            router.push('/auth/login');
        }
      } else {
        setUser(null);
        setRole(null);
        if (requiredRole) {
            router.push('/auth/login');
        } else {
            setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router, requiredRole]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
