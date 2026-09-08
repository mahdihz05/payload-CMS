import { createRequire } from "node:module";
import { getPayload, type Payload } from "payload";
import { defaultLocale, locales, type Locale } from "@/lib/site-config";
import { normalizeSearchText } from "@/lib/search-normalization";
import type { Content, Form, Navigation } from "@/payload-types";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());
Reflect.set(process.env, "NODE_ENV", "production");

const siteName = process.env.STARTER_SITE_NAME?.trim() || "Payload CMS Starter";

const copy: Record<Locale, {
  homeTitle: string; homeExcerpt: string; eyebrow: string; featuresTitle: string; features: [string, string][]; cta: string; ctaLabel: string;
  contactTitle: string; contactExcerpt: string; formTitle: string; formDescription: string; success: string; consent: string;
}> = {
  en: {
    homeTitle: "Build your next content-driven website", homeExcerpt: "A reusable Payload CMS and Next.js foundation with localized block pages, forms, permissions, previews, and technical SEO.", eyebrow: "Payload CMS Starter", featuresTitle: "A practical foundation", features: [["Block pages", "Compose localized pages from reusable, typed content blocks."], ["Editorial workflow", "Use drafts, versions, previews, scheduled publishing, roles, and audit logs."], ["Technical SEO", "Resolve canonical URLs, robots, social metadata, hreflang, redirects, sitemap, and structured data centrally."]], cta: "Ready to shape this starter into your website?", ctaLabel: "Contact us",
    contactTitle: "Contact", contactExcerpt: "Use this generic form as a starting point, or replace it with your own form in the CMS.", formTitle: "Send a message", formDescription: "Fields, validation, consent, and retention are configured in Payload.", success: "Your message has been received.", consent: "I agree that this information may be stored to respond to my request.",
  },
  fa: {
    homeTitle: "وب‌سایت محتوایی بعدی خود را بسازید", homeExcerpt: "یک پایه بازاستفاده‌پذیر Payload CMS و Next.js برای صفحات بلوکی چندزبانه، فرم‌ها، دسترسی‌ها، پیش‌نمایش و سئوی فنی.", eyebrow: "شروع‌کننده Payload CMS", featuresTitle: "یک پایه کاربردی", features: [["صفحات بلوکی", "صفحات چندزبانه را با بلوک‌های محتوایی تایپ‌شده بسازید."], ["گردش کار محتوا", "از پیش‌نویس، نسخه‌ها، پیش‌نمایش، انتشار زمان‌بندی‌شده، نقش‌ها و گزارش ممیزی استفاده کنید."], ["سئوی فنی", "canonical، robots، شبکه‌های اجتماعی، hreflang، تغییرمسیر، نقشه سایت و داده ساختاریافته را متمرکز مدیریت کنید."]], cta: "برای تبدیل این پایه به وب‌سایت خود آماده‌اید؟", ctaLabel: "تماس با ما",
    contactTitle: "تماس", contactExcerpt: "از این فرم عمومی به‌عنوان نقطه شروع استفاده کنید یا آن را در CMS جایگزین کنید.", formTitle: "ارسال پیام", formDescription: "فیلدها، اعتبارسنجی، رضایت و نگهداری داده در Payload تنظیم می‌شوند.", success: "پیام شما دریافت شد.", consent: "موافقم این اطلاعات برای پاسخ‌گویی به درخواست من نگهداری شود.",
  },
  "ar-ae": {
    homeTitle: "أنشئ موقعك التالي القائم على المحتوى", homeExcerpt: "أساس قابل لإعادة الاستخدام مبني على Payload CMS وNext.js للصفحات متعددة اللغات والنماذج والصلاحيات والمعاينة وتحسين محركات البحث.", eyebrow: "Payload CMS Starter", featuresTitle: "أساس عملي", features: [["صفحات بالكتل", "أنشئ صفحات متعددة اللغات من كتل محتوى قابلة لإعادة الاستخدام."], ["سير عمل تحريري", "استخدم المسودات والإصدارات والمعاينة والنشر المجدول والأدوار وسجل التدقيق."], ["تحسين تقني للبحث", "أدر الروابط الأساسية وrobots والبيانات الاجتماعية وhreflang والتحويلات وخريطة الموقع مركزياً."]], cta: "هل أنت مستعد لتحويل هذا الأساس إلى موقعك؟", ctaLabel: "اتصل بنا",
    contactTitle: "اتصل بنا", contactExcerpt: "استخدم هذا النموذج العام كنقطة بداية أو استبدله بنموذجك في نظام الإدارة.", formTitle: "أرسل رسالة", formDescription: "تُضبط الحقول والتحقق والموافقة والاحتفاظ بالبيانات في Payload.", success: "تم استلام رسالتك.", consent: "أوافق على حفظ هذه المعلومات للرد على طلبي.",
  },
};

async function upsertContactForm(payload: Payload) {
  const found = await payload.find({ collection: "forms", limit: 1, overrideAccess: true, where: { key: { equals: "contact" } } });
  let form: Form | undefined = found.docs[0];
  for (const locale of locales) {
    const value = copy[locale];
    const data = {
      key: "contact", isActive: true, requiresPrivacyConsent: true, retentionMonths: 12,
      title: value.formTitle, description: value.formDescription, successMessage: value.success, consentLabel: value.consent,
      fields: [
        { key: "name", fieldType: "text" as const, required: true, minLength: 2, maxLength: 120, label: locale === "en" ? "Name" : locale === "fa" ? "نام" : "الاسم", enabled: true },
        { key: "email", fieldType: "email" as const, required: true, maxLength: 180, label: locale === "en" ? "Email" : locale === "fa" ? "ایمیل" : "البريد الإلكتروني", enabled: true },
        { key: "message", fieldType: "textarea" as const, required: true, minLength: 10, maxLength: 2000, label: locale === "en" ? "Message" : locale === "fa" ? "پیام" : "الرسالة", enabled: true },
      ].map((field, index) => ({ ...field, ...(form?.fields?.[index]?.id ? { id: form.fields[index].id } : {}) })),
    };
    form = form
      ? await payload.update({ collection: "forms", id: form.id, locale, overrideAccess: true, data })
      : await payload.create({ collection: "forms", locale, overrideAccess: true, data });
  }
  if (!form) throw new Error("Contact form bootstrap failed.");
  return form;
}

function homeLayout(locale: Locale): NonNullable<Content["layout"]> {
  const value = copy[locale];
  return [
    { blockType: "hero", enabled: true, variant: "simple", eyebrow: value.eyebrow, title: value.homeTitle, body: value.homeExcerpt, primaryCTA: { label: value.ctaLabel, url: `/${locale}/contact`, openInNewTab: false }, secondaryCTA: {}, points: [] },
    { blockType: "featureGrid", enabled: true, variant: "cards", heading: value.featuresTitle, intro: value.homeExcerpt, items: value.features.map(([title, description], index) => ({ icon: String(index + 1), title, description })) },
    { blockType: "cta", enabled: true, variant: "split", title: value.cta, body: value.homeExcerpt, primaryCTA: { label: value.ctaLabel, url: `/${locale}/contact`, openInNewTab: false } },
  ];
}

function contactLayout(locale: Locale, form: Form): NonNullable<Content["layout"]> {
  const value = copy[locale];
  return [{ blockType: "form", enabled: true, variant: "default", form: form.id, heading: value.formTitle, intro: value.formDescription, context: "contact-page" }];
}

async function upsertPage(payload: Payload, key: "home" | "contact", form: Form) {
  const found = await payload.find({ collection: "content", limit: 1, overrideAccess: true, where: { key: { equals: key } } });
  let id = found.docs[0]?.id;
  for (const locale of locales) {
    const value = copy[locale];
    const title = key === "home" ? value.homeTitle : value.contactTitle;
    const excerpt = key === "home" ? value.homeExcerpt : value.contactExcerpt;
    const path = key === "home" ? "" : "contact";
    const data = {
      key, kind: "page" as const, templateKey: "default", isActive: true, title, excerpt,
      slug: key, path, layout: key === "home" ? homeLayout(locale) : contactLayout(locale, form),
      translationStatus: "reviewed" as const, workflowStatus: "published" as const,
      searchText: normalizeSearchText(`${title} ${excerpt}`), seo: { robotsIndex: true, robotsFollow: true }, _status: "published" as const,
    };
    const saved = id
      ? await payload.update({ collection: "content", id, locale, overrideAccess: true, data })
      : await payload.create({ collection: "content", locale, overrideAccess: true, data });
    id = saved.id;
  }
}

function preserveRowIDs(items: NonNullable<Navigation["header"]>, existing: Navigation["header"]) {
  return items.map((item, index) => ({ ...item, ...(existing?.[index]?.id ? { id: existing[index].id } : {}) }));
}

async function upsertGlobals(payload: Payload) {
  for (const locale of locales) {
    const value = copy[locale];
    const settings = await payload.findGlobal({ slug: "site-settings", locale, fallbackLocale: false, depth: 0, overrideAccess: true });
    if (!settings.defaultSEODescription || settings.brandName === "Payload CMS Starter") {
      await payload.updateGlobal({ slug: "site-settings", locale, overrideAccess: true, data: { brandName: siteName, defaultSEOTitle: siteName, defaultSEODescription: value.homeExcerpt } });
    }
    const navigation = await payload.findGlobal({ slug: "navigation", locale, fallbackLocale: false, depth: 0, overrideAccess: true });
    if (!(navigation.header?.length)) {
      const items = [
        { title: keyLabel(locale, "home"), path: "", enabled: true },
        { title: keyLabel(locale, "contact"), path: "contact", enabled: true },
      ];
      await payload.updateGlobal({ slug: "navigation", locale, overrideAccess: true, data: { header: preserveRowIDs(items, navigation.header), footer: preserveRowIDs(items, navigation.footer), mobile: preserveRowIDs(items, navigation.mobile) } });
    }
  }
  await payload.findGlobal({ slug: "design-settings", depth: 0, overrideAccess: true });
}

function keyLabel(locale: Locale, key: "home" | "contact") {
  if (key === "contact") return copy[locale].contactTitle;
  return locale === "en" ? "Home" : locale === "fa" ? "خانه" : "الرئيسية";
}

async function createAdmin(payload: Payload) {
  const email = process.env.PAYLOAD_ADMIN_EMAIL;
  const password = process.env.PAYLOAD_ADMIN_PASSWORD;
  if (Boolean(email) !== Boolean(password)) throw new Error("Set both PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD, or neither.");
  if (!email || !password) return;
  if (password.length < 12) throw new Error("PAYLOAD_ADMIN_PASSWORD must contain at least 12 characters.");
  const existing = await payload.find({ collection: "users", limit: 1, overrideAccess: true, where: { email: { equals: email } } });
  if (!existing.docs.length) await payload.create({ collection: "users", overrideAccess: true, data: { email, password, name: "Starter Administrator", role: "admin" } });
}

async function main() {
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });
  await createAdmin(payload);
  const form = await upsertContactForm(payload);
  await upsertPage(payload, "home", form);
  await upsertPage(payload, "contact", form);
  await upsertGlobals(payload);
  payload.logger.info(`Bootstrap complete for ${siteName}; default locale is ${defaultLocale}.`);
  process.exit(0);
}

await main();
