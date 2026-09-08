import { getPayload, type Payload } from "payload";
import { locales, type Locale } from "@/lib/site-config";
import { normalizeSearchText } from "@/lib/search-normalization";

const copy: Record<Locale, { title: string; excerpt: string; heading: string; faq: [string, string][] }> = {
  en: { title: "About this starter", excerpt: "Disposable example content showing how a localized block page is assembled.", heading: "Replace this page with your own story", faq: [["Can I delete this page?", "Yes. This page is created only by the optional demo seed."], ["Where is page SEO managed?", "Use the SEO tab on the page document; blocks do not own document metadata."]] },
  fa: { title: "درباره این شروع‌کننده", excerpt: "محتوای نمونه و قابل حذف برای نمایش ساخت یک صفحه بلوکی چندزبانه.", heading: "این صفحه را با داستان خود جایگزین کنید", faq: [["آیا می‌توان این صفحه را حذف کرد؟", "بله. این صفحه فقط با seed اختیاری نمونه ساخته می‌شود."], ["سئوی صفحه کجا مدیریت می‌شود؟", "از زبانه SEO سند صفحه استفاده کنید؛ بلوک‌ها مالک فراداده سند نیستند."]] },
  "ar-ae": { title: "حول هذا القالب", excerpt: "محتوى تجريبي قابل للحذف يوضح إنشاء صفحة متعددة اللغات بالكتل.", heading: "استبدل هذه الصفحة بقصتك", faq: [["هل يمكن حذف هذه الصفحة؟", "نعم. لا تُنشأ هذه الصفحة إلا بواسطة بيانات العرض الاختيارية."], ["أين تتم إدارة تحسين البحث؟", "استخدم تبويب SEO في مستند الصفحة؛ الكتل لا تملك بيانات المستند الوصفية."]] },
};

async function seedAbout(payload: Payload) {
  const found = await payload.find({ collection: "content", limit: 1, overrideAccess: true, where: { key: { equals: "demo-about" } } });
  let id = found.docs[0]?.id;
  for (const locale of locales) {
    const value = copy[locale];
    const data = {
      key: "demo-about", kind: "page" as const, templateKey: "default", isActive: true,
      title: value.title, slug: "about", path: "about", excerpt: value.excerpt,
      translationStatus: "reviewed" as const, workflowStatus: "published" as const,
      searchText: normalizeSearchText(`${value.title} ${value.excerpt}`),
      layout: [
        { blockType: "hero" as const, enabled: true, variant: "simple" as const, eyebrow: "Demo", title: value.title, body: value.excerpt, primaryCTA: {}, secondaryCTA: {}, points: [] },
        { blockType: "faq" as const, enabled: true, variant: "simple" as const, heading: value.heading, items: value.faq.map(([question, answer]) => ({ question, answer })) },
      ],
      seo: { robotsIndex: true, robotsFollow: true }, _status: "published" as const,
    };
    const saved = id ? await payload.update({ collection: "content", id, locale, overrideAccess: true, data }) : await payload.create({ collection: "content", locale, overrideAccess: true, data });
    id = saved.id;
  }
}

Reflect.set(process.env, "NODE_ENV", "production");
const { default: config } = await import("@payload-config");
const payload = await getPayload({ config });
await seedAbout(payload);
payload.logger.info("Optional demo seed complete. Remove the demo-about page when no longer needed.");
process.exit(0);
