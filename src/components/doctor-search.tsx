
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Doctor } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      // Check if supabase client is actually configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase.from('doctors').select('id, name, specialty');
        
        if (error) {
          console.error("Error fetching doctors:", error);
          setDoctors([]);
        } else if (data) {
          setDoctors(data);
          const uniqueSpecialties = ["All", ...new Set(data.map(d => d.specialty))];
          setSpecialties(uniqueSpecialties);
        }
      } else {
         setDoctors([]);
      }

      setLoading(false);
    };
    fetchDoctors();
  }, []);


  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (specialty === 'All' || doctor.specialty === specialty)
  );

  const handleBookNow = (doctorId: string) => {
    router.push(`/booking?doctor=${encodeURIComponent(doctorId)}`);
  };

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
            <Select onValueChange={setSpecialty} defaultValue="All" disabled={loading}>
              <SelectTrigger className="w-full md:w-[240px]" aria-label="Filter by specialty">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <Skeleton className="mx-auto w-24 h-24 rounded-full" />
                  </CardHeader>
                  <CardContent className="px-2 space-y-2">
                     <Skeleton className="h-5 w-3/4 mx-auto" />
                     <Skeleton className="h-4 w-1/2 mx-auto" />
                  </CardContent>
                  <CardFooter className="justify-center pb-4">
                     <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))
            ) : (
              filteredDoctors.map((doctor, index) => (
                <Card key={doctor.id} className="text-center transition-all duration-300 hover:shadow-lg">
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
                     <Button variant="outline" className="w-full" onClick={() => handleBookNow(doctor.id)}>
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
            {!loading && filteredDoctors.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">No doctors found. Please ensure your Supabase connection is configured correctly.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
