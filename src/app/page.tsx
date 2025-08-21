import AppointmentForm from '@/components/appointment-form';
import Departments from '@/components/departments';
import DoctorSearch from '@/components/doctor-search';
import Footer from '@/components/footer';
import Header from '@/components/header';
import Hero from '@/components/hero';
import PatientResources from '@/components/patient-resources';
import Testimonials from '@/components/testimonials';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Departments />
        <DoctorSearch />
        <PatientResources />
        <Testimonials />
        <AppointmentForm />
      </main>
      <Footer />
    </div>
  );
}
