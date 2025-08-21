import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";

const resources = [
  {
    title: "Understanding Cardiovascular Health",
    content: "Maintaining a healthy heart is crucial for overall well-being. This involves a balanced diet, regular exercise, and avoiding smoking. Regular check-ups can help detect potential issues early."
  },
  {
    title: "Tips for a Healthy Nervous System",
    content: "Your nervous system benefits from mental stimulation, a healthy diet rich in omega-3s, and adequate sleep. Managing stress through mindfulness and meditation can also have a positive impact."
  },
  {
    title: "Children's Health and Vaccination Guide",
    content: "Vaccinations are a safe and effective way to protect your child from serious diseases. Following the recommended immunization schedule is vital for their health and the community's."
  },
  {
    title: "Managing Common Orthopedic Injuries",
    content: "For minor sprains and strains, the R.I.C.E. method (Rest, Ice, Compression, Elevation) is often recommended. For more severe injuries, it's important to seek professional medical advice."
  }
];

export default function PatientResources() {
  return (
    <section id="resources" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">Patient Resources</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Knowledge is Power</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Access our library of patient resources for information on health conditions, treatments, and wellness.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12">
          <Accordion type="single" collapsible className="w-full">
            {resources.map((resource, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg text-left hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0" />
                    {resource.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-11">
                  {resource.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
