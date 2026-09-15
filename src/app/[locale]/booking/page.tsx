import { ArrowLeft, Phone } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DatabaseUnavailableError, getDb } from "@/db";
import { Link } from "@/i18n/navigation";
import { getBookingCatalog, type BookingCatalog } from "@/lib/booking/catalog";
import { BOOKING_DAYS_AHEAD, addDays, bookingDateRange } from "@/lib/booking/time";
import { siteConfig } from "@/lib/site-data";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/booking">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "booking.meta" });
  return { title: t("title"), description: t("description") };
}

function firstParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function BookingPage({ params, searchParams }: PageProps<"/[locale]/booking">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  // Availability changes every minute — always render on request
  await connection();

  const query = await searchParams;
  const t = await getTranslations("booking");

  let catalog: BookingCatalog | null = null;
  try {
    catalog = await getBookingCatalog(await getDb());
  } catch (error) {
    if (!(error instanceof DatabaseUnavailableError)) {
      console.error("[booking] failed to load catalog", error);
    }
  }

  const { first } = bookingDateRange();
  const days = Array.from({ length: BOOKING_DAYS_AHEAD }, (_, index) => addDays(first, index));

  return (
    <>
      <Header />
      <main className="min-h-dvh pt-28 pb-20 sm:pt-32">
        <Container>
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("back")}
          </Link>

          {catalog ? (
            <BookingWizard
              catalog={catalog}
              days={days}
              initialServiceId={firstParam(query.service)}
              initialDoctorId={firstParam(query.doctor)}
            />
          ) : (
            <div className="mx-auto max-w-lg rounded-3xl border border-border bg-surface p-10 text-center">
              <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
              <p className="mt-4 text-muted">
                {t("errors.unavailable", { phone: siteConfig.phone })}
              </p>
              <ButtonLink href={siteConfig.phoneHref} size="lg" className="mt-8">
                <Phone className="size-4" aria-hidden />
                {siteConfig.phone}
              </ButtonLink>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
