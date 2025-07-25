'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getAuth, signOut } from "firebase/auth";
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth(app);
    signOut(auth).then(() => {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/');
    }).catch((error) => {
      console.error("Logout Error:", error);
      toast({ title: "Logout Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      router.push('/');
    });
  }, [router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Logging you out...</p>
    </div>
  );
}
