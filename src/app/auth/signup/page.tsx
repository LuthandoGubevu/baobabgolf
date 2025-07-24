'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupRoleSelectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
       <Image
        src="/hole-in-one.jpg"
        alt="A golf course background"
        data-ai-hint="golf course"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-background/90" />
      <div className="absolute top-4 left-4 z-10">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
      </div>
      <Card className="w-full max-w-lg bg-card/50 backdrop-blur-lg border-white/20 z-10">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold font-headline">Join Baobab Golf</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Register to become a scorekeeper or spectator.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6">
            <Button 
              className="h-auto flex-col gap-4 py-8"
              onClick={() => router.push('/auth/register')}
            >
                <Users className="h-10 w-10 text-primary" />
                <div className="text-center">
                    <p className="font-semibold text-lg">Get Started</p>
                    <p className="text-xs text-muted-foreground">Create an account to track scores or watch the game.</p>
                </div>
            </Button>
        </CardContent>
         <p className="p-6 pt-0 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Login here
            </Link>
          </p>
      </Card>
    </div>
  );
}
