import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";
import { navItems, siteConfig } from "@/lib/site-data";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const contact = useTranslations("contact");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold">{t("navigation")}</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-muted">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {nav(item.id)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold">{t("contacts")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>{contact("addressValue")}</li>
            <li>
              <a href={siteConfig.phoneHref} className="transition-colors hover:text-foreground">
                {siteConfig.phone}
              </a>
            </li>
            <li>{contact("hoursWeekdays")}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("rights", { year })}</p>
          <p>{t("demo")}</p>
          <p>
            {t("developer")}:{" "}
            <a
              href={siteConfig.developer.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary"
            >
              {siteConfig.developer.name}
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
