'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;
          setRole(userRole);

          if (requiredRole && userRole !== requiredRole) {
            // If the user is on a page that requires a different role, redirect them.
            const destination = userRole === 'scorekeeper' ? '/scorekeeper' : '/spectator';
            router.push(destination);
          } else {
             setLoading(false);
          }
        } else {
            // No user role found, likely an incomplete registration.
            // Don't log them out, redirect to finish signup unless they are already there.
            if (!pathname.startsWith('/auth/signup')) {
                 router.push('/auth/signup');
            } else {
                 setLoading(false);
            }
        }
      } else {
        setUser(null);
        setRole(null);
        if (requiredRole) {
            // If the page requires a role and the user is not logged in, redirect to login.
            router.push('/auth/login');
        } else {
            setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [auth, router, requiredRole, pathname]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
