'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
// import { getAuth, signOut } from "firebase/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // const auth = getAuth();
    // In a real app, you would sign the user out here.
    // signOut(auth).then(() => {
    //   // Sign-out successful.
    //   router.push('/');
    // }).catch((error) => {
    //   // An error happened.
    //   console.error("Logout Error:", error);
    //   router.push('/');
    // });
    
    // For now, we'll just redirect after a short delay.
    const timer = setTimeout(() => {
      router.push('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Logging you out...</p>
    </div>
  );
}
