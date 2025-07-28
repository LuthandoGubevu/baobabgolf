'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  senderId: string;
  displayName: string;
  role: 'scorekeeper' | 'spectator';
  timestamp: any;
}

export default function SpectatorChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, userRole, fullName } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const roomId = "global";
    const messagesRef = collection(db, "channels", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chat messages: ", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not load chat messages. " + error.message,
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userRole || !fullName) {
      return;
    }

    try {
        await addDoc(collection(db, "channels", "global", "messages"), {
            text: newMessage.trim(),
            senderId: user.uid,
            displayName: fullName,
            role: userRole,
            timestamp: serverTimestamp(),
        });
        setNewMessage('');
    } catch (error) {
        console.error("Error sending message: ", error);
        toast({
            title: "Error",
            description: "Failed to send message.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Public Chat</h1>
       <Card className="h-[70vh] flex flex-col bg-card/50 backdrop-blur-lg border-white/20">
            <CardHeader>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Interact with players and other spectators in real-time.</CardDescription>
            </CardHeader>
             <CardContent className="flex-grow flex flex-col overflow-hidden">
                <ScrollArea className="flex-grow h-full pr-4 -mr-4">
                  <div className="space-y-4">
                    {loading ? (
                       <div className="flex justify-center items-center h-full">
                           <Loader2 className="h-6 w-6 animate-spin" />
                       </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">
                            No messages yet. Be the first to say something!
                        </div>
                    ) : (
                      messages.map(msg => {
                        const isSender = msg.senderId === user?.uid;
                        return (
                          <div key={msg.id} className={`flex items-start gap-3 ${isSender ? 'flex-row-reverse' : ''}`}>
                              <Avatar>
                                  <AvatarFallback>{msg.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${isSender ? 'bg-primary/80 text-primary-foreground' : 'bg-muted/50'}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-sm">{msg.displayName}</p>
                                    <Badge variant={msg.role === 'scorekeeper' ? 'destructive' : 'secondary'} className="text-xs">{msg.role}</Badge>
                                  </div>
                                  <p>{msg.text}</p>
                              </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t border-white/20 mt-auto">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input
                        placeholder="Type a message..."
                        className="pr-12 bg-background/50 border-white/30"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={!user}
                        maxLength={280}
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
       </Card>
    </div>
  );
}
