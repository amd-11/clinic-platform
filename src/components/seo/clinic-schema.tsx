import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { services, siteConfig } from "@/lib/site-data";
import { siteUrlOrLocal } from "@/lib/site-url";

/**
 * Structured data (schema.org Dentist) so Google can show the address,
 * opening hours and services directly in search results.
 *
 * Ratings and reviews are deliberately NOT marked up: the demo reviews are
 * fictional, and fabricated rating markup would mislead search engines.
 */
export async function ClinicSchema({ locale }: { locale: Locale }) {
  const [t, tServices] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "services.items" }),
  ]);
  const base = siteUrlOrLocal();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": `${base}/#clinic`,
    name: siteConfig.name,
    url: base,
    image: `${base}/opengraph-image`,
    telephone: siteConfig.phone,
    priceRange: "$$",
    currenciesAccepted: "AMD",
    address: {
      "@type": "PostalAddress",
      streetAddress: t("addressValue"),
      addressLocality: "Yerevan",
      addressCountry: "AM",
    },
    geo: { "@type": "GeoCoordinates", latitude: 40.1843, longitude: 44.516 },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "16:00",
      },
    ],
    sameAs: ["https://www.instagram.com/dr.biayna"],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/booking`,
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      result: { "@type": "Reservation", name: "Dental appointment" },
    },
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: tServices(`${service.id}.title`) },
      price: service.priceFrom,
      priceCurrency: "AMD",
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Values come from our own translations and config, never from user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
