import { localeConfig, locales, type Locale } from "./site-config";

export { defaultLocale, locales, type Locale } from "./site-config";

export const localeMeta = Object.fromEntries(localeConfig.map((item) => [item.code, {
  lang: item.languageTag,
  dir: item.direction,
  label: item.label,
  short: item.shortLabel,
}])) as Record<Locale, { lang: string; dir: "rtl" | "ltr"; label: string; short: string }>;

export const ui = {
  fa: {
    skip: "رفتن به محتوای اصلی",
    menu: "باز کردن منو",
    close: "بستن منو",
    navigation: "منوی اصلی",
    explore: "مشاهده",
    contact: "تماس",
    unavailable: "در حال حاضر امکان دریافت محتوای سایت وجود ندارد.",
    rights: "تمام حقوق محفوظ است.",
  },
  en: {
    skip: "Skip to main content",
    menu: "Open menu",
    close: "Close menu",
    navigation: "Main navigation",
    explore: "Explore",
    contact: "Contact",
    unavailable: "The site content is temporarily unavailable.",
    rights: "All rights reserved.",
  },
  "ar-ae": {
    skip: "انتقل إلى المحتوى الرئيسي",
    menu: "فتح القائمة",
    close: "إغلاق القائمة",
    navigation: "التنقل الرئيسي",
    explore: "عرض",
    contact: "اتصل بنا",
    unavailable: "محتوى الموقع غير متاح مؤقتاً.",
    rights: "جميع الحقوق محفوظة.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
