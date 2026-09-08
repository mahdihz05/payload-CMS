import Link from "next/link";

export default function NotFound() {
  return (
    <main className="internal-main">
      <section className="internal-hero state-page">
        <div className="container state-card">
          <span className="state-code">404</span>
          <h1>صفحه پیدا نشد · Page not found · الصفحة غير موجودة</h1>
          <p>نشانی واردشده معتبر نیست یا این محتوا هنوز در زبان انتخابی منتشر نشده است.</p>
          <Link className="reference-button primary" href="/fa">بازگشت به خانه</Link>
        </div>
      </section>
    </main>
  );
}
