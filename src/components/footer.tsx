import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 py-12 md:px-6">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span>CamlyCare</span>
          </Link>
          <p className="text-muted-foreground text-sm">
            Providing exceptional healthcare with compassion and expertise. Your health is our mission.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#departments" className="text-muted-foreground hover:text-primary transition-colors">Departments</Link></li>
            <li><Link href="#doctors" className="text-muted-foreground hover:text-primary transition-colors">Find a Doctor</Link></li>
            <li><Link href="#appointment" className="text-muted-foreground hover:text-primary transition-colors">Book Appointment</Link></li>
            <li><Link href="#resources" className="text-muted-foreground hover:text-primary transition-colors">Patient Resources</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Our Mission</h3>
          <p className="text-muted-foreground text-sm">
            To deliver high-quality, patient-centered healthcare with a commitment to clinical excellence and compassionate service. Founded by the esteemed Dr. Camly.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Contact Us</h3>
          <address className="not-italic text-sm text-muted-foreground space-y-2">
            <p>123 Health St, Medville, MD 12345</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: contact@camlycare.com</p>
          </address>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 md:px-6 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CamlyCare. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
