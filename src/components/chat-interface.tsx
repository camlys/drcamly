
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockMessages, ChatConversation, ChatMessage, mockDoctors, mockPatients } from '@/lib/data';
import { Send, Search, Check, CheckCheck, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ChatInterface() {
    const { authState } = useAuth();
    const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messageEndRef = useRef<HTMLDivElement>(null);

    const currentUser = useMemo(() => {
        if (authState.userType === 'doctor') {
            return mockDoctors.find(d => d.id === 'doc1');
        } else {
            return mockPatients.find(p => p.id === 'pat1');
        }
    }, [authState.userType]);


    useEffect(() => {
        if (selectedConversation) {
            setMessages(mockMessages.filter(m => m.conversationId === selectedConversation.id));
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !selectedConversation || !currentUser) return;

        const newMsg: ChatMessage = {
            id: `msg${Date.now()}`,
            conversationId: selectedConversation.id,
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => [...prev, newMsg]);
        
        setConversations(prev => prev.map(c => 
            c.id === selectedConversation.id ? { ...c, lastMessage: newMessage, lastMessageTimestamp: newMsg.timestamp } : c
        ).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));

        setNewMessage('');
    };
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    }
    
    if (!currentUser) {
        return <div className="flex items-center justify-center h-full"><p>Loading chat...</p></div>;
    }

    const filteredConversations = conversations.filter(c =>
        c.participants.find(p => p.id !== currentUser.id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

    const handleSelectConversation = (conversation: ChatConversation) => {
        setSelectedConversation(conversation);
        setMessages(prev => prev.map(m => m.senderId !== currentUser.id ? { ...m, read: true } : m));
        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
    };

    const ConversationList = (
         <div className="flex flex-col h-full">
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
                                    <AvatarImage src={otherParticipant.avatarUrl} />
                                    <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                                </Avatar>
                                {otherParticipant.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold truncate">{otherParticipant.name}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(convo.lastMessageTimestamp), 'p')}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                    {convo.unreadCount > 0 && <Badge className="bg-primary text-primary-foreground h-5 px-2">{convo.unreadCount}</Badge>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </ScrollArea>
        </div>
    );

    const ChatView = (
        selectedConversation ? (
            <div className="flex flex-col h-full">
                <header className="p-4 border-b flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                        <Avatar>
                            <AvatarImage src={selectedConversation.participants.find(p=>p.id !== currentUser.id)?.avatarUrl} />
                            <AvatarFallback>{getInitials(selectedConversation.participants.find(p=>p.id !== currentUser.id)?.name || '')}</AvatarFallback>
                        </Avatar>
                        {selectedConversation.participants.find(p => p.id !== currentUser.id)?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{selectedConversation.participants.find(p => p.id !== currentUser.id)?.name}</h2>
                        <p className="text-xs text-muted-foreground">{selectedConversation.participants.find(p => p.id !== currentUser.id)?.online ? 'Online' : 'Offline'}</p>
                    </div>
                </header>
                <ScrollArea className="flex-1 bg-secondary/30 p-6">
                    <div className="space-y-6">
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex items-end gap-2",
                                    msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {msg.senderId !== currentUser.id && (
                                     <Avatar className="w-8 h-8">
                                        <AvatarImage src={selectedConversation.participants.find(p=>p.id !== currentUser.id)?.avatarUrl} />
                                        <AvatarFallback>{getInitials(selectedConversation.participants.find(p=>p.id !== currentUser.id)?.name || '')}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        "rounded-lg px-4 py-2 max-w-sm md:max-w-md lg:max-w-lg relative group",
                                        msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-card border'
                                    )}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                    <div className={cn("text-xs mt-1 flex items-center gap-1", msg.senderId === currentUser.id ? "text-primary-foreground/70 justify-end" : "text-muted-foreground justify-start")}>
                                        <span>{format(new Date(msg.timestamp), 'p')}</span>
                                        {msg.senderId === currentUser.id && (
                                            msg.read ? <CheckCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                </ScrollArea>
                <footer className="p-4 border-t bg-card">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button onClick={handleSendMessage} size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </footer>
            </div>
        ) : (
            <div className="flex-col items-center justify-center h-full hidden md:flex text-center p-8">
                <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Welcome to your Inbox</h3>
                <p className="text-muted-foreground mt-2">Select a conversation from the list to start chatting.</p>
            </div>
        )
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-background border-t">
            <aside className={cn("w-full md:w-1/3 lg:w-1/4 border-r flex-col", selectedConversation ? "hidden md:flex" : "flex")}>
                {ConversationList}
            </aside>
            <main className={cn("flex-1 flex-col", selectedConversation ? "flex" : "hidden md:flex")}>
                {ChatView}
            </main>
        </div>
    );
}
