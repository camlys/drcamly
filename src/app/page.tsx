import React from 'react';
import Departments from '@/components/departments';
import DoctorSearch from '@/components/doctor-search';
import Hero from '@/components/hero';
import PatientResources from '@/components/patient-resources';
import Testimonials from '@/components/testimonials';

export default function Home() {
  return (
    <>
      <Hero />
      <Departments />
      <DoctorSearch />
      <PatientResources />
      <Testimonials />
    </>
  );
}
