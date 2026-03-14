import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

// ISO 3166-1 alpha-2 codes for Spanish-speaking countries
const spanishSpeakingCountries = new Set([
  "AR", // Argentina
  "BO", // Bolivia
  "CL", // Chile
  "CO", // Colombia
  "CR", // Costa Rica
  "CU", // Cuba
  "DO", // Dominican Republic
  "EC", // Ecuador
  "SV", // El Salvador
  "GQ", // Equatorial Guinea
  "GT", // Guatemala
  "HN", // Honduras
  "MX", // Mexico
  "NI", // Nicaragua
  "PA", // Panama
  "PY", // Paraguay
  "PE", // Peru
  "PR", // Puerto Rico
  "ES", // Spain
  "UY", // Uruguay
  "VE", // Venezuela
]);

function detectLocale(request: NextRequest): string {
  // 1. User's manual choice (cookie set by language switcher)
  const cookieLocale = request.cookies.get("preferred-locale")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Geo-IP country (Vercel provides this header automatically)
  const country = request.headers.get("x-vercel-ip-country");
  if (country && spanishSpeakingCountries.has(country.toUpperCase())) {
    return "es";
  }

  // 3. Accept-Language header fallback
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  if (acceptLanguage.toLowerCase().includes("es")) {
    return "es";
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const preferredLocale = detectLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
