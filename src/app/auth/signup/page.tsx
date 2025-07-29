
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/icons';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['spectator', 'scorekeeper'], { required_error: 'You must select a role.' }),
  name: z.string().optional(),
  player1: z.string().optional(),
  player2: z.string().optional(),
  player3: z.string().optional(),
  player4: z.string().optional(),
}).refine((data) => {
    if (data.role === 'scorekeeper') {
        return !!data.name && !!data.player1 && !!data.player2 && !!data.player3 && !!data.player4;
    }
    return true;
}, { message: "Team details are required for scorekeepers.", path: ["name"] });


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth(app);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: 'spectator', name: '', player1: '', player2: '', player3: '', player4: '' },
  });

  const selectedRole = form.watch('role');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    if (values.role === 'scorekeeper') {
        const teamsRef = collection(db, 'teams');
        const q = query(teamsRef, where("name", "==", values.name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            toast({ title: 'Error', description: 'This team name is already taken.', variant: 'destructive' });
            setLoading(false);
            return;
        }
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      let teamId = null;
      if (values.role === 'scorekeeper') {
        const teamDocRef = await addDoc(collection(db, 'teams'), {
          name: values.name,
          players: [values.player1, values.player2, values.player3, values.player4],
          scorekeeperId: user.uid,
          scores: {},
        });
        teamId = teamDocRef.id;
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: values.email,
        fullName: values.fullName,
        role: values.role,
        ...(teamId && { teamId: teamId }),
      });

      toast({ title: 'Account Created!', description: 'Welcome to Baobab Golf!' });

      if (values.role === 'scorekeeper') {
        router.push('/scorekeeper');
      } else {
        router.push('/spectator');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Sign Up Failed',
        description: error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      <Image src="https://placehold.co/1920x1080.png" alt="Golf course" data-ai-hint="golf course" fill className="object-cover" />
      <div className="absolute inset-0 bg-background/90" />
      <Card className="z-10 w-full max-w-2xl bg-card/50 backdrop-blur-lg border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="h-10 w-auto" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Create an Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join the Baobab Golf challenge today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select Your Role</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="spectator" /></FormControl><FormLabel>Spectator</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="scorekeeper" /></FormControl><FormLabel>Scorekeeper</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {selectedRole === 'scorekeeper' && (
                <div className="space-y-4 rounded-md border border-border p-4">
                  <h3 className="font-semibold">Team Information</h3>
                   <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="The Eagles" {...field} /></FormControl><FormMessage /></FormItem>
                   )} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="player1" render={({ field }) => (<FormItem><FormLabel>Player 1</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="player2" render={({ field }) => (<FormItem><FormLabel>Player 2</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="player3" render={({ field }) => (<FormItem><FormLabel>Player 3</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="player4" render={({ field }) => (<FormItem><FormLabel>Player 4</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl></FormItem>)} />
                   </div>
                   <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" className="p-0" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
