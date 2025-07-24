'use client';
import {Suspense} from 'react'
import RegisterForm from './RegisterForm'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function RegisterPageContents() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    if (role !== 'scorekeeper' && role !== 'spectator') {
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
                <Card className="w-full max-w-lg bg-card/50 backdrop-blur-lg border-white/20 z-10 text-center">
                    <CardHeader>
                        <CardTitle>Please start from the beginning</CardTitle>
                         <CardDescription>
                            To sign up, please go to our sign up page.
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button asChild>
                         <Link href="/auth/signup">Go to Sign Up</Link>
                       </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <RegisterForm role={role} />;
}


export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterPageContents />
        </Suspense>
    )
}
