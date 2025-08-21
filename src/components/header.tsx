
"use client";

import Link from "next/link";
import { Stethoscope, Menu, LogIn, User, LogOut, Bell, MessageSquare, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { mockNotifications, Notification, mockDoctors, mockPatients } from "@/lib/data";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function NotificationPanel({ notifications, onOpenChange }: { notifications: Notification[], onOpenChange: (open: boolean) => void }) {
    return (
       <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? notifications.map(notif => (
                <DropdownMenuItem key={notif.id} asChild className="cursor-pointer" onClick={() => onOpenChange(false)}>
                    <Link href={notif.link} className="flex items-start gap-3 p-2">
                        <div className="flex-shrink-0 mt-1">
                            {notif.link.includes('chat') ? <MessageSquare className="w-4 h-4 text-primary" /> : <CalendarCheck className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                            <p className={cn("text-sm", !notif.read && "font-semibold")}>{notif.message}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}</p>
                        </div>
                    </Link>
                </DropdownMenuItem>
            )) : (
                <p className="p-4 text-sm text-center text-muted-foreground">No new notifications</p>
            )}
        </DropdownMenuContent>
    );
}


export default function Header() {
  const { authState, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const currentUser = useMemo(() => {
    if (!authState.isAuthenticated) return null;
    if (authState.userType === 'doctor') {
      return mockDoctors.find(d => d.id === 'doc1');
    }
    return mockPatients.find(p => p.id === 'pat1');
  }, [authState]);


  const currentUserNotifications = useMemo(() => {
    if (!authState.isAuthenticated) return [];
    const userId = authState.userType === 'doctor' ? 'doc1' : 'pat1';
    return notifications
        .filter(n => n.userId === userId)
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [authState, notifications]);
  
  const unreadCount = useMemo(() => {
    return currentUserNotifications.filter(n => !n.read).length;
  }, [currentUserNotifications]);

  const handleNotificationsOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
        setNotifications(prev => 
            prev.map(n => ({...n, read: true }))
        );
    }
  }


  const navItems = [
    { label: "Departments", href: "/#departments" },
    { label: "Find a Doctor", href: "/#doctors" },
    { label: "Resources", href: "/#resources" },
    { label: "Testimonials", href: "/#testimonials" },
  ];

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span>Dr.Camly</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          {authState.isAuthenticated && currentUser ? (
            <div className="flex items-center gap-4">
              <DropdownMenu onOpenChange={handleNotificationsOpenChange}>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0">{unreadCount}</Badge>}
                     </Button>
                  </DropdownMenuTrigger>
                  <NotificationPanel notifications={currentUserNotifications} onOpenChange={handleNotificationsOpenChange} />
              </DropdownMenu>

             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                        <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Welcome, {currentUser.name.split(' ')[0]}!</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={authState.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/patient/login">Patient Login</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/doctor/login">Doctor Login</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/patient/signup">Patient Sign Up</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/doctor/signup">Doctor Sign Up</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/booking">Book Appointment</Link>
          </Button>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span>Dr.Camly</span>
              </Link>
              <nav className="grid gap-2">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                {authState.isAuthenticated ? (
                  <>
                     <SheetClose asChild>
                        <Link href={authState.userType === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary">Dashboard</Link>
                     </SheetClose>
                     <SheetClose asChild>
                        <button onClick={handleLogout} className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary text-left w-full">Logout</button>
                     </SheetClose>
                  </>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="login-signup" className="border-b-0">
                      <AccordionTrigger className="px-2 py-1 text-lg font-medium transition-colors hover:text-primary hover:no-underline">
                        Login / Sign Up
                      </AccordionTrigger>
                      <AccordionContent className="pl-6">
                         <SheetClose asChild>
                          <Link href="/patient/login" className="block py-2 text-base font-medium transition-colors hover:text-primary">Patient Login</Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/doctor/login" className="block py-2 text-base font-medium transition-colors hover:text-primary">Doctor Login</Link>
                        </SheetClose>
                         <SheetClose asChild>
                          <Link href="/patient/signup" className="block py-2 text-base font-medium transition-colors hover:text-primary">Patient Sign Up</Link>
                        </SheetClose>
                         <SheetClose asChild>
                          <Link href="/doctor/signup" className="block py-2 text-base font-medium transition-colors hover:text-primary">Doctor Sign Up</Link>
                        </SheetClose>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </nav>
              <SheetClose asChild>
                <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/booking">Book Appointment</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
