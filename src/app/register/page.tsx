'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/icons"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image";

const formSchema = z.object({
  teamName: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  player1: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  player2: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  player3: z.string().min(2, { message: "Player name must be at least 2 characters." }),
  player4: z.string().min(2, { message: "Player name must be at least 2 characters." }),
});

export default function RegisterPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      player1: "",
      player2: "",
      player3: "",
      player4: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Registration Submitted!",
      description: `Team "${values.teamName}" has been successfully registered.`,
    })
    form.reset();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
       <Image
        src="https://placehold.co/1920x1080.png"
        alt="A golf ball on a tee"
        data-ai-hint="golf ball"
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
          <div className="flex justify-center mb-4">
            <Logo className="h-10 w-auto text-primary-foreground"/>
          </div>
          <CardTitle className="text-center text-3xl font-bold font-headline">Register Your Team</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Fill out the form below to enter your team of four into the tournament.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Eagles" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="player1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player 1 Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="player2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player 2 Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="player3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player 3 Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="player4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player 4 Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Register Team
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
