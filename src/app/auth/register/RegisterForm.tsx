'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// Schemas
const scorekeeperSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  playerB: z.string().min(2, "Player name must be at least 2 characters."),
  playerC: z.string().min(2, "Player name must be at least 2 characters."),
  playerD: z.string().min(2, "Player name must be at least 2 characters."),
  terms: z.boolean().default(false).refine(val => val === true, "You must accept the terms."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const spectatorSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  terms: z.boolean().default(false).refine(val => val === true, "You must accept the terms."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Team = { id: string; name: string };

export default function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const auth = getAuth();

  const formSchema = role === 'scorekeeper' ? scorekeeperSchema : spectatorSchema;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      teamName: "",
      playerB: "",
      playerC: "",
      playerD: "",
      terms: false,
    },
  });

  useEffect(() => {
     if (!role) {
      router.push('/auth/signup');
    }
  }, [role, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check for unique team name if scorekeeper
      if (role === 'scorekeeper' && 'teamName' in values) {
          const q = query(collection(db, "teams"), where("teamName", "==", values.teamName));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              toast({ title: "Error", description: "Team name already exists. Please choose another.", variant: "destructive" });
              return;
          }
      }

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          // This might be an incomplete registration. Try to sign in and check for a user document.
          try {
            userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", userCredential.user.uid)));
            if (!userDoc.empty) {
              // User is fully registered.
              toast({ title: "Error", description: "This email is already registered. Please log in.", variant: "destructive" });
              router.push('/auth/login');
              return;
            }
            // If userDoc is empty, it's an incomplete registration, so we proceed.
          } catch (signInError: any) {
             toast({ title: "Registration Failed", description: signInError.message, variant: "destructive"});
             return;
          }
        } else {
          throw error; // Re-throw other auth errors
        }
      }

      if (!userCredential) {
          toast({ title: "Registration Failed", description: "Could not create or verify user.", variant: "destructive"});
          return;
      }

      const user = userCredential.user;

      if (role === 'scorekeeper' && 'teamName' in values && 'playerB' in values && 'playerC' in values && 'playerD' in values) {
        const teamRef = await addDoc(collection(db, "teams"), {
          teamName: values.teamName,
          players: [values.fullName, values.playerB, values.playerC, values.playerD],
          scorekeeperId: user.uid,
          scores: {},
        });
        await setDoc(doc(db, "users", user.uid), {
          role: 'scorekeeper',
          teamId: teamRef.id,
          fullName: values.fullName,
        });
        router.push('/scorekeeper');
      } else if (role === 'spectator') {
        await setDoc(doc(db, "users", user.uid), {
          role: 'spectator',
          fullName: values.fullName,
        });
        router.push('/spectator');
      }
       toast({ title: "Registration Successful!", description: "Welcome to Baobab Golf." });

    } catch (error: any) {
      console.error("Registration Error: ", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  }

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
          <Link href="/auth/signup">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Role Selection
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-lg border-white/20 z-10">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold font-headline">
            Create Your {role === 'scorekeeper' ? 'Scorekeeper' : 'Spectator'} Account
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fill out the form to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="name@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {role === 'scorekeeper' && (
                <>
                  <FormField control={form.control} name="teamName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl><Input placeholder="e.g., The Eagles" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm font-medium text-white">Enter Player Names</p>
                  <p className="text-xs text-muted-foreground -mt-4">You will automatically be registered as Player A.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="playerB" render={({ field }) => (
                        <FormItem><FormLabel>Player B</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                     <FormField control={form.control} name="playerC" render={({ field }) => (
                        <FormItem><FormLabel>Player C</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                     <FormField control={form.control} name="playerD" render={({ field }) => (
                        <FormItem><FormLabel>Player D</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              <FormField control={form.control} name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accept terms and conditions</FormLabel>
                      <FormDescription>You agree to our Terms of Service and Privacy Policy.</FormDescription>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
