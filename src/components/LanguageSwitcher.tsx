"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: Locale;
  label: string;
}) {
  const pathname = usePathname();

  const switchLocale = () => {
    const targetLocale = currentLocale === "en" ? "es" : "en";

    // Set cookie so middleware remembers the choice
    document.cookie = `preferred-locale=${targetLocale};path=/;max-age=${60 * 60 * 24 * 365}`;

    // Replace the locale segment in the path
    const newPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
    window.location.href = newPath;
  };

  return (
    <button
      onClick={switchLocale}
      className="font-mono text-sm text-muted hover:text-foreground transition-colors"
    >
      {label}
    </button>
  );
}
