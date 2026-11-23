import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { faqsQuery } from "@/lib/queries";

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQuery()),
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة – متجر الغيث" },
      { name: "description", content: "إجابات عن التوصيل والدفع والضمان والاستبدال في متجر متجر الغيث." },
      { property: "og:title", content: "الأسئلة الشائعة – متجر الغيث" },
      { property: "og:description", content: "كل ما تحتاج معرفته عن الطلب والتوصيل والضمان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data } = useSuspenseQuery(faqsQuery());
  return (
    <>
      <PageHeader title="الأسئلة الشائعة" subtitle="لم تجد إجابتك؟ تواصل معنا وسنسعد بمساعدتك." crumbs={[{ label: "الأسئلة الشائعة" }]} />
      <div className="container-x max-w-3xl py-12">
        <Accordion type="single" collapsible className="space-y-3">
          {data.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="rounded-2xl border bg-card px-5">
              <AccordionTrigger className="text-start text-base font-semibold hover:no-underline">{f.question}</AccordionTrigger>
              <AccordionContent className="leading-8 text-muted-foreground">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 rounded-2xl bg-navy p-8 text-center text-navy-foreground">
          <p className="text-lg font-semibold">ما زال لديك سؤال؟</p>
          <Button asChild className="mt-4 rounded-full bg-gold text-gold-foreground hover:bg-gold/90"><Link to="/contact">تواصل معنا</Link></Button>
        </div>
      </div>
    </>
  );
}
