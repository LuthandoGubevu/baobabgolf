import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ChatPage() {
  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Group Chat</h1>
       <Card className="h-[60vh] flex flex-col bg-card/50 backdrop-blur-lg border-white/20">
            <CardHeader>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Interact with other players and spectators in real-time.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto">
                {/* Chat messages will go here */}
                <div className="flex items-start gap-3">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="font-semibold text-sm">Spectator</p>
                        <p>What a shot by The Code Crushers!</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3 flex-row-reverse">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Player" />
                        <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <div className="bg-primary/80 text-primary-foreground p-3 rounded-lg">
                        <p className="font-semibold text-sm">You (Player)</p>
                        <p>Thanks! We're feeling good today.</p>
                    </div>
                </div>
                 <div className="text-center text-xs text-muted-foreground py-2">
                    --- A new spectator joined the chat ---
                </div>
            </CardContent>
            <div className="p-4 border-t border-white/20">
                <div className="relative">
                    <Input placeholder="Type a message..." className="pr-12 bg-background/50 border-white/30" />
                    <Button size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
       </Card>
    </div>
  );
}
