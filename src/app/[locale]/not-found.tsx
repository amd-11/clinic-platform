import { ArrowLeft, CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 size-[32rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div className="relative">
        <Link href="/" className="mx-auto mb-10 flex justify-center">
          <Logo />
        </Link>
        <p className="font-display text-[6rem] leading-none font-semibold text-primary/25 sm:text-[9rem]">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{t("description")}</p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            <ArrowLeft className="size-4" aria-hidden />
            {t("home")}
          </ButtonLink>
          <ButtonLink href="/booking" variant="secondary" size="lg">
            <CalendarDays className="size-4" aria-hidden />
            {t("book")}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
