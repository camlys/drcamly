
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockMessages, ChatConversation, ChatMessage } from '@/lib/data';
import { Send, Search, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ChatInterface() {
    const { authState } = useAuth();
    const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messageEndRef = useRef<HTMLDivElement>(null);

    const currentUser = authState.userType === 'doctor' ? { id: 'doc1', name: 'Dr. Evelyn Reed' } : { id: 'pat1', name: 'John Doe' };

    useEffect(() => {
        if (selectedConversation) {
            // In a real app, you would fetch messages for the conversation
            setMessages(mockMessages.filter(m => m.conversationId === selectedConversation.id));
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !selectedConversation) return;

        const newMsg: ChatMessage = {
            id: `msg${Date.now()}`,
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => [...prev, newMsg]);
        
        // Also update the conversation's last message for immediate feedback
        setConversations(prev => prev.map(c => 
            c.id === selectedConversation.id ? { ...c, lastMessage: newMessage } : c
        ));

        setNewMessage('');
    };
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    }

    const filteredConversations = conversations.filter(c =>
        c.participants.find(p => p.id !== currentUser.id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectConversation = (conversation: ChatConversation) => {
        setSelectedConversation(conversation);
        // Mark messages as read
        setMessages(prev => prev.map(m => m.senderId !== currentUser.id ? { ...m, read: true } : m));
        // Reset unread count in the UI
        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-background border-t">
            <aside className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Conversations</h2>
                    <div className="relative mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {filteredConversations.map(convo => {
                        const otherParticipant = convo.participants.find(p => p.id !== currentUser.id);
                        if (!otherParticipant) return null;
                        return (
                            <div
                                key={convo.id}
                                className={cn(
                                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted",
                                  selectedConversation?.id === convo.id && 'bg-muted'
                                )}
                                onClick={() => handleSelectConversation(convo)}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${otherParticipant.id}`} />
                                        <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                                    </Avatar>
                                    {otherParticipant.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{otherParticipant.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                </div>
                                {convo.unreadCount > 0 && <Badge className="bg-primary text-primary-foreground">{convo.unreadCount}</Badge>}
                            </div>
                        )
                    })}
                </ScrollArea>
            </aside>
            <main className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <header className="p-4 border-b flex items-center gap-3">
                             <div className="relative">
                                <Avatar>
                                    <AvatarImage src={`https://i.pravatar.cc/40?u=${selectedConversation.participants.find(p=>p.id !== currentUser.id)?.id}`} />
                                    <AvatarFallback>{getInitials(selectedConversation.participants.find(p=>p.id !== currentUser.id)?.name || '')}</AvatarFallback>
                                </Avatar>
                                {selectedConversation.participants.find(p => p.id !== currentUser.id)?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">{selectedConversation.participants.find(p => p.id !== currentUser.id)?.name}</h2>
                                <p className="text-xs text-muted-foreground">{selectedConversation.participants.find(p => p.id !== currentUser.id)?.online ? 'Online' : 'Offline'}</p>
                            </div>
                        </header>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex items-end gap-2",
                                            msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "rounded-lg px-4 py-2 max-w-xs lg:max-w-md relative group",
                                                msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            )}
                                        >
                                            <p>{msg.text}</p>
                                            {msg.senderId === currentUser.id && (
                                                <div className="absolute -bottom-4 right-1 flex items-center">
                                                    {msg.read ? <CheckCheck className="h-4 w-4 text-blue-500" /> : <Check className="h-4 w-4 text-muted-foreground" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messageEndRef} />
                            </div>
                        </ScrollArea>
                        <footer className="p-4 border-t">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage} size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Select a conversation to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
}
