import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BrainCircuit, Baby, Bone, Eye, Stethoscope } from 'lucide-react';

const departments = [
  { name: "Cardiology", description: "Expert care for your heart.", icon: Heart },
  { name: "Neurology", description: "Comprehensive brain and nerve care.", icon: BrainCircuit },
  { name: "Pediatrics", description: "Caring for children's health.", icon: Baby },
  { name: "Orthopedics", description: "Treating bones, joints, and muscles.", icon: Bone },
  { name: "Ophthalmology", description: "Advanced care for your vision.", icon: Eye },
  { name: "General Practice", description: "Your primary point of care.", icon: Stethoscope },
];

export default function Departments() {
  return (
    <section id="departments" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">Our Departments</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Specialized Medical Services</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We offer a wide range of departments, each with a team of dedicated specialists to meet your healthcare needs.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pt-12">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Card key={dept.name} className="flex flex-col items-center text-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="p-0">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle>{dept.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                  <p className="text-muted-foreground">{dept.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
