"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ShoppingCart, CreditCard, Check, Headphones } from "lucide-react";

export const HomeFooter: React.FC = () => {
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  const submitNewsletter = () => {
    if (!newsletter.trim()) return;
    setNewsletterDone(true);
    setNewsletter("");
  };

  return (
    <>
      {/* ================= NEWSLETTER ================= */}
      <section className="mx-auto max-w-[1450px] px-5 mt-16">
        <div className="flex flex-col gap-6 rounded-[28px] bg-emerald-800 px-7 py-9 text-white md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Mail size={21} />
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                NEWSLETTER
              </span>
            </div>
            <h3 className="text-2xl font-black">لا تفوّت أي عرض</h3>
            <p className="mt-2 text-sm text-emerald-100">
              اشترك ليصلك الجديد والعروض الحصرية أولاً.
            </p>
          </div>

          {newsletterDone ? (
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-6 py-4 text-sm font-bold">
              <Check size={20} />
              تم الاشتراك بنجاح، شكراً لك!
            </div>
          ) : (
            <div className="flex w-full max-w-lg overflow-hidden rounded-xl bg-white">
              <input
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="min-w-0 flex-1 px-5 text-sm text-slate-900 outline-none"
              />
              <button
                onClick={submitNewsletter}
                className="bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-500 transition"
              >
                اشترك
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-2xl font-black text-emerald-700">
              EcoMart
              <span className="rounded-lg bg-emerald-700 p-1.5 text-white">
                <ShoppingCart size={17} />
              </span>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-8 text-slate-500">
              منصة تجارة إلكترونية متعددة التجار تجمع أفضل المتاجر والمنتجات في تجربة شراء بسيطة وسريعة وآمنة بأعلى معايير الجودة.
            </p>
          </div>

          {[
            [
              "المتجر",
              "الأقسام",
              "العروض",
              "الجديد",
              "الأكثر مبيعاً",
              "العلامات التجارية",
            ],
            [
              "خدماتنا",
              "توصيل سريع",
              "دفع آمن",
              "استرجاع مجاني",
              "ضمان الجودة",
              "خدمة العملاء",
            ],
            [
              "عن EcoMart",
              "من نحن",
              "المدونة",
              "الشركاء",
              "الوظائف",
              "سياسة الخصوصية",
            ],
          ].map(([title, ...links]) => (
            <div key={title}>
              <b className="block text-lg font-black text-slate-800">{title}</b>
              {links.map((link) => (
                <a
                  href="#"
                  key={link}
                  className="mt-3 block text-sm text-slate-500 transition hover:text-emerald-700"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-5 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
            <span>© 2026 EcoMart. جميع الحقوق محفوظة.</span>

            <span className="flex items-center gap-2">
              <Mail size={14} />
              support@ecomart.example
            </span>

            <span className="flex items-center gap-3">
              <CreditCard size={16} />
              Visa · Mastercard · Mada · Apple Pay
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Support Button */}
      <button
        className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl transition hover:scale-105 hover:bg-emerald-700"
        title="خدمة العملاء"
        aria-label="خدمة العملاء"
      >
        <Headphones size={24} />
      </button>
    </>
  );
};

export default HomeFooter;
