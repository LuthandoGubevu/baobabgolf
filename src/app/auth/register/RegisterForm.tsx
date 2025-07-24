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
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

type RegisterFormProps = {
    role: 'scorekeeper' | 'spectator';
}

const scorekeeperSchema = z.object({
  role: z.literal("scorekeeper"),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  terms: z.boolean().default(false).refine(val => val === true, "You must accept the terms."),
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  playerB: z.string().min(2, "Player name must be at least 2 characters."),
  playerC: z.string().min(2, "Player name must be at least 2 characters."),
  playerD: z.string().min(2, "Player name must be at least 2 characters."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const spectatorSchema = z.object({
  role: z.literal("spectator"),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  terms: z.boolean().default(false).refine(val => val === true, "You must accept the terms."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const schemaMap = {
    scorekeeper: scorekeeperSchema,
    spectator: spectatorSchema
}

export default function RegisterForm({ role }: RegisterFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();
  const formSchema = schemaMap[role];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: role,
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
       ...(role === 'scorekeeper' && {
        teamName: '',
        playerB: '',
        playerC: '',
        playerD: '',
      }),
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check for unique team name if scorekeeper
      if (values.role === 'scorekeeper') {
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
          try {
            // Attempt to sign in to see if it's a partially registered user
            userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const userDocQuery = query(collection(db, "users"), where("uid", "==", userCredential.user.uid));
            const userDocSnapshot = await getDocs(userDocQuery);
            
            // If user doc exists, they are fully registered.
            if (!userDocSnapshot.empty) {
              toast({ title: "Error", description: "This email is already registered. Please log in.", variant: "destructive" });
              router.push('/auth/login');
              return;
            }
            // If user doc doesn't exist, it's a partially registered user, so we can proceed.
          } catch (signInError: any) {
             toast({ title: "Registration Failed", description: "This email is already in use or the password you entered is incorrect.", variant: "destructive"});
             return;
          }
        } else {
          throw error;
        }
      }

      if (!userCredential) {
          toast({ title: "Registration Failed", description: "Could not create or verify user.", variant: "destructive"});
          return;
      }

      const user = userCredential.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        role: values.role,
        fullName: values.fullName,
      });

      if (values.role === 'scorekeeper') {
        const teamRef = await addDoc(collection(db, "teams"), {
          teamName: values.teamName,
          players: [values.fullName, values.playerB, values.playerC, values.playerD],
          scorekeeperId: user.uid,
          scores: {},
        });
        // Update user doc with teamId
         await setDoc(doc(db, "users", user.uid), { teamId: teamRef.id }, { merge: true });
        router.push('/scorekeeper');
      } else { // Spectator
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
