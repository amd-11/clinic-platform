import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Contact } from "@/components/sections/contact";
import { Doctors } from "@/components/sections/doctors";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { Process } from "@/components/sections/process";
import { Reviews } from "@/components/sections/reviews";
import { Services } from "@/components/sections/services";
import { ClinicSchema } from "@/components/seo/clinic-schema";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  // The layout already rejected unknown locales with notFound()
  setRequestLocale(locale as Locale);

  return (
    <>
      <ClinicSchema locale={locale as Locale} />
      <Header />
      <main>
        <Hero />
        <Services />
        <Process />
        <Doctors />
        <Pricing />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
