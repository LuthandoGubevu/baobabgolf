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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

// Base schema for common fields
const baseSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
  terms: z.boolean().default(false).refine(val => val === true, "You must accept the terms."),
});

// Schema for Scorekeeper
const scorekeeperSchema = baseSchema.extend({
  role: z.literal("scorekeeper"),
  fullName: z.string().min(2, "Your full name must be at least 2 characters."),
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  playerB: z.string().min(2, "Player B's name must be at least 2 characters."),
  playerC: z.string().min(2, "Player C's name must be at least 2 characters."),
  playerD: z.string().min(2, "Player D's name must be at least 2 characters."),
});

// Schema for Spectator
const spectatorSchema = baseSchema.extend({
  role: z.literal("spectator"),
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
});

// Combined schema using discriminatedUnion
const formSchema = z.discriminatedUnion("role", [
  scorekeeperSchema,
  spectatorSchema,
]).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "spectator", // Default role
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const selectedRole = form.watch("role");

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
           toast({ title: "Registration Failed", description: "This email is already in use. Please log in instead.", variant: "destructive"});
           router.push('/auth/login');
           return;
        } else {
          throw error;
        }
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
          // Scorekeeper is Player A
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
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
      </div>
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-lg border-white/20 z-10">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold font-headline">Join Baobab Golf</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fill out the form below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Register as</FormLabel>
                    <Select onValueChange={(value) => {
                        field.onChange(value);
                        // Reset form values when role changes to avoid validation errors on hidden fields
                        form.reset({
                            ...form.getValues(),
                            role: value as 'spectator' | 'scorekeeper',
                            // Keep common values
                            email: form.getValues().email,
                            password: form.getValues().password,
                            confirmPassword: form.getValues().confirmPassword,
                            terms: form.getValues().terms,
                            // Reset conditional values
                            fullName: '',
                            teamName: '',
                            playerB: '',
                            playerC: '',
                            playerD: '',
                        });
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="spectator">Spectator</SelectItem>
                        <SelectItem value="scorekeeper">Scorekeeper</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedRole === 'scorekeeper' ? "Your Full Name (Player A)" : "Full Name"}</FormLabel>
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

              {selectedRole === 'scorekeeper' && (
                <>
                  <FormField control={form.control} name="teamName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl><Input placeholder="e.g., The Eagles" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm font-medium text-white -mb-2">Enter the Other 3 Player Names</p>
                  
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

               <p className="pt-2 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
