"use client";

import { useState, type FormEvent } from "react";
import type { Form } from "@/payload-types";
import type { Locale } from "@/lib/types";
import styles from "./cms-form.module.css";

type SubmitState = { type: "idle" | "pending" | "success" | "error"; message: string };
type FormField = NonNullable<Form["fields"]>[number];

const copy = {
  fa: { choose: "انتخاب کنید", submit: "ثبت درخواست", pending: "در حال ثبت...", error: "ثبت فرم انجام نشد. لطفاً دوباره تلاش کنید." },
  en: { choose: "Choose", submit: "Submit", pending: "Submitting...", error: "We could not submit the form. Please try again." },
  "ar-ae": { choose: "اختر", submit: "إرسال", pending: "جارٍ الإرسال...", error: "تعذر إرسال النموذج. يرجى المحاولة مرة أخرى." },
} as const;

const defaultFieldLabels: Record<Locale, Record<string, string>> = {
  fa: { full_name: "نام و نام خانوادگی", phone: "شماره تماس", email: "ایمیل کاری", company: "نام سازمان", company_size: "اندازه سازمان", need_type: "موضوع درخواست", details: "نیاز یا مسئله اصلی", preferred_contact: "روش تماس ترجیحی", users: "تعداد کاربران", sites: "تعداد شعب" },
  en: { full_name: "Full name", phone: "Phone number", email: "Work email", company: "Organization", company_size: "Organization size", need_type: "Request topic", details: "Main requirement or challenge", preferred_contact: "Preferred contact method", users: "Users", sites: "Sites" },
  "ar-ae": { full_name: "الاسم الكامل", phone: "رقم الهاتف", email: "البريد الإلكتروني للعمل", company: "المؤسسة", company_size: "حجم المؤسسة", need_type: "موضوع الطلب", details: "المتطلب أو التحدي الرئيسي", preferred_contact: "طريقة التواصل المفضلة", users: "عدد المستخدمين", sites: "عدد الفروع" },
};

function optionsFor(field: FormField) {
  const values = Array.isArray(field.options) ? field.options.map(String) : [];
  const labels = field.optionLabels;
  return values.map((value, index) => ({
    value,
    label: Array.isArray(labels)
      ? String(labels[index] ?? value)
      : labels && typeof labels === "object" && !Array.isArray(labels)
        ? String((labels as Record<string, unknown>)[value] ?? value)
        : value,
  }));
}

function Field({ field, context, choose, label }: { field: FormField; context: string; choose: string; label: string }) {
  const id = `cms-form-${field.id ?? field.key}`;
  const common = { name: field.key, id, required: field.required || undefined };
  if (field.fieldType === "hidden") return <input type="hidden" name={field.key} value={context} />;
  if (field.fieldType === "textarea") return <textarea {...common} placeholder={field.placeholder ?? undefined} minLength={field.minLength ?? undefined} maxLength={field.maxLength ?? undefined} />;
  if (field.fieldType === "select" || field.fieldType === "multi-select") return <select {...common} multiple={field.fieldType === "multi-select"} defaultValue={field.fieldType === "multi-select" ? [] : ""}><option value="">{choose}</option>{optionsFor(field).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>;
  if (field.fieldType === "radio") return <div className={styles.choices}>{optionsFor(field).map((option, index) => <label key={option.value}><input type="radio" {...common} id={`${id}-${index}`} value={option.value} /><span>{option.label}</span></label>)}</div>;
  if (field.fieldType === "checkbox") return <label className={styles.checkbox}><input type="checkbox" {...common} value="true" /><span>{field.placeholder || label}</span></label>;
  const type = field.fieldType === "phone" ? "tel" : field.fieldType === "datetime" ? "datetime-local" : field.fieldType;
  return <input {...common} type={type} placeholder={field.placeholder ?? undefined} min={field.minValue ?? undefined} max={field.maxValue ?? undefined} minLength={field.minLength ?? undefined} maxLength={field.maxLength ?? undefined} pattern={field.pattern ?? undefined} />;
}

export function CmsForm({ form, locale, heading, intro, eyebrow, context, compact }: { form: Form; locale: Locale; heading?: string; intro?: string; eyebrow?: string; context?: string; compact?: boolean }) {
  const labels = copy[locale];
  const fields = (form.fields ?? []).filter((field) => field.enabled !== false);
  const [state, setState] = useState<SubmitState>({ type: "idle", message: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const values = new FormData(element);
    const data: Record<string, boolean | string | string[]> = {};
    for (const field of fields) {
      if (field.fieldType === "file") continue;
      if (field.fieldType === "checkbox") data[field.key] = values.get(field.key) === "true";
      else if (field.fieldType === "multi-select") data[field.key] = values.getAll(field.key).map(String).filter(Boolean);
      else {
        const value = values.get(field.key);
        if (typeof value === "string" && value.trim()) data[field.key] = value.trim();
      }
    }
    setState({ type: "pending", message: labels.pending });
    try {
      const response = await fetch(`/api/forms/${encodeURIComponent(form.key)}/submissions`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: (() => {
          values.set("locale", locale);
          values.set("data", JSON.stringify(data));
          values.set("consent_given", values.get("consent_given") === "yes" ? "true" : "false");
          values.set("source_url", window.location.href);
          values.set("referrer", document.referrer);
          return values;
        })(),
      });
      const payload = await response.json().catch(() => null) as { data?: { message?: string } } | null;
      if (!response.ok) throw new Error("submission_failed");
      element.reset();
      setState({ type: "success", message: payload?.data?.message ?? form.successMessage });
    } catch {
      setState({ type: "error", message: labels.error });
    }
  }

  return (
    <section className={styles.section} data-cms-form={form.key}>
      <div className="container">
        <div className={`${styles.card} ${compact ? styles.compact : ""}`}>
          <div className={styles.intro}>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <h2>{heading || form.title}</h2>
            {intro || form.description ? <p>{intro || form.description}</p> : null}
          </div>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.grid}>
              {fields.map((field) => {
                const label = !field.label || field.label === field.key ? defaultFieldLabels[locale][field.key] ?? field.key : field.label;
                if (field.fieldType === "hidden") return <Field key={field.id ?? field.key} field={field} context={context ?? ""} choose={labels.choose} label={label} />;
                if (["radio", "checkbox"].includes(field.fieldType)) return (
                  <div className={styles.field} key={field.id ?? field.key}>
                    {field.fieldType === "radio" ? <span>{label}</span> : null}
                    <Field field={field} context={context ?? ""} choose={labels.choose} label={label} />
                    {field.helpText ? <small>{field.helpText}</small> : null}
                  </div>
                );
                return (
                  <label className={field.fieldType === "textarea" ? styles.wide : styles.field} htmlFor={`cms-form-${field.id ?? field.key}`} key={field.id ?? field.key}>
                    <span>{label}</span>
                    <Field field={field} context={context ?? ""} choose={labels.choose} label={label} />
                    {field.helpText ? <small>{field.helpText}</small> : null}
                  </label>
                );
              })}
              <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            {form.requiresPrivacyConsent ? <label className={styles.consent}><input name="consent_given" type="checkbox" value="yes" required /><span>{form.consentLabel}</span></label> : null}
            <div className={styles.actions}>
              <button type="submit" disabled={state.type === "pending"}>{state.type === "pending" ? labels.pending : labels.submit}</button>
              <p className={state.type === "success" ? styles.success : state.type === "error" ? styles.error : ""} role="status" aria-live="polite">{state.message}</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
