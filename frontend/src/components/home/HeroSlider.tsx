"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BadgeCheck, ChevronRight, ChevronLeft } from "lucide-react";

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    title: "خصومات تصل إلى 50%",
    subtitle: "على آلاف المنتجات المختارة",
    description:
      "اكتشف أفضل العروض والأسعار الحصرية مع توصيل سريع وآمن إلى باب منزلك.",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200",
  },
  {
    title: "كل ما تحتاجه في مكان واحد",
    subtitle: "تجربة تسوق أسهل وأسرع",
    description:
      "من الإلكترونيات والأزياء إلى المنزل والرياضة، كل شيء أصبح أقرب إليك.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
  },
  {
    title: "اكتشف الجديد",
    subtitle: "منتجات وصلت حديثاً",
    description:
      "كن أول من يكتشف أحدث المنتجات والعلامات التجارية بأسعار مميزة.",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200",
  },
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = DEFAULT_SLIDES[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-emerald-50 via-white to-white">
      <div className="mx-auto grid min-h-[500px] max-w-[1500px] grid-cols-1 items-center gap-10 px-7 py-10 md:grid-cols-2 lg:px-14">
        {/* Left Column: Text & CTA */}
        <div className="order-2 md:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm">
            <Sparkles size={14} />
            {slide.subtitle}
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.15] tracking-tight text-emerald-950 sm:text-5xl lg:text-7xl">
            {slide.title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            {slide.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() =>
                document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-xl bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
            >
              تسوق الآن
            </button>

            <button
              onClick={() =>
                document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-xl border-2 border-emerald-700 px-7 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              استكشف العروض
            </button>
          </div>

          <div className="mt-9 flex items-center gap-8">
            <div>
              <b className="block text-2xl font-black text-slate-900">+10K</b>
              <span className="text-xs text-slate-500">عميل سعيد</span>
            </div>

            <div>
              <b className="block text-2xl font-black text-slate-900">+2.5K</b>
              <span className="text-xs text-slate-500">منتج</span>
            </div>

            <div>
              <b className="block text-2xl font-black text-slate-900">4.9/5</b>
              <span className="text-xs text-slate-500">تقييم العملاء</span>
            </div>
          </div>
        </div>

        {/* Right Column: Image & Carousel Controls */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative w-full max-w-[650px]">
            <div className="absolute inset-10 rounded-full bg-emerald-200/60 blur-3xl" />

            <img
              src={slide.image}
              alt={slide.title}
              className="relative z-10 h-[330px] w-full rounded-[35px] object-cover shadow-2xl sm:h-[400px] transition duration-700"
            />

            <div className="absolute bottom-6 right-6 z-20 rounded-2xl bg-white/95 px-5 py-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2">
                <BadgeCheck size={19} className="text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">منتجات أصلية ومضمونة</span>
              </div>
            </div>

            <button
              onClick={() =>
                setCurrentSlide((currentSlide - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length)
              }
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition hover:scale-105 text-slate-700"
              aria-label="السابق"
            >
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => setCurrentSlide((currentSlide + 1) % DEFAULT_SLIDES.length)}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition hover:scale-105 text-slate-700"
              aria-label="التالي"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 pb-6">
        {DEFAULT_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Slide ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? "w-8 bg-emerald-700" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
