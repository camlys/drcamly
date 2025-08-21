
"use client";

import Link from "next/link";
import { Stethoscope, Menu, LogIn, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";

export default function Header() {
  const { authState, logout } = useAuth();

  const navItems = [
    { label: "Departments", href: "#departments" },
    { label: "Find a Doctor", href: "#doctors" },
    { label: "Resources", href: "#resources" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span>CamlyCare</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          {authState.isAuthenticated ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Welcome!</DropdownMenuLabel>
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
            <Link href="#appointment">Book Appointment</Link>
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
            <div className="grid gap-4 py-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span>CamlyCare</span>
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
                  <>
                    <SheetClose asChild>
                      <Link href="/patient/login" className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary">Patient Login</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/doctor/login" className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary">Doctor Login</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/patient/signup" className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary">Patient Sign up</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/doctor/signup" className="block px-2 py-1 text-lg font-medium transition-colors hover:text-primary">Doctor Sign up</Link>
                    </SheetClose>
                  </>
                )}
              </nav>
              <SheetClose asChild>
                <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="#appointment">Book Appointment</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
