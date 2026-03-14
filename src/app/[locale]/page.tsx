import { getDictionary } from "@/dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import { ScrumMasterGame } from "@/components/ScrumMasterGame";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <section className="mb-10">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{dict.game.title}</h1>
          <LanguageSwitcher
            currentLocale={locale}
            label={dict.languageSwitcher.label}
          />
        </div>
        <p className="text-muted text-lg mb-4">{dict.game.subtitle}</p>
        <p className="text-foreground/60 text-sm leading-relaxed">
          {dict.game.context}
        </p>
      </section>

      <ScrumMasterGame dict={dict.game} />
    </div>
  );
}
