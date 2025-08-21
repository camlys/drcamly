
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { mockDoctors } from '@/lib/data';

const specialties = ["All", ...new Set(mockDoctors.map(d => d.specialty))];

export default function DoctorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('All');

  const filteredDoctors = mockDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (specialty === 'All' || doctor.specialty === specialty)
  );

  return (
    <section id="doctors" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-card px-3 py-1 text-sm font-medium">Find a Doctor</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Medical Professionals</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Search for a doctor by name or specialty to find the right care for you.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl mt-12">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
              type="text"
              aria-label="Search by doctor's name"
              placeholder="Search by doctor's name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Select onValueChange={setSpecialty} defaultValue="All">
              <SelectTrigger className="w-full md:w-[240px]" aria-label="Filter by specialty">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <Card key={index} className="text-center transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                     <Image src={`https://placehold.co/100x100.png?text=${doctor.name.split(' ').map(n=>n[0]).join('')}`} alt={`Avatar of ${doctor.name}`} width={100} height={100} data-ai-hint="doctor portrait" />
                  </div>
                </CardHeader>
                <CardContent className="px-2">
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                </CardContent>
                <CardFooter className="justify-center pb-4">
                   <Button asChild variant="outline" className="w-full">
                    <Link href={`/#appointment?doctor=${encodeURIComponent(doctor.id)}`}>Book Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
