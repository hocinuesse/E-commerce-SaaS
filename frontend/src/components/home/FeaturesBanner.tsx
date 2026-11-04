"use client";

import React from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

export const FeaturesBanner: React.FC = () => {
  const features = [
    { icon: Truck, title: "توصيل سريع", text: "خلال 24 - 48 ساعة" },
    { icon: ShieldCheck, title: "دفع آمن", text: "100% آمن وموثوق" },
    { icon: RotateCcw, title: "استرجاع سهل", text: "خلال 14 يوم" },
    { icon: Headphones, title: "دعم العملاء", text: "متواجدون لخدمتك 24/7" },
  ];

  return (
    <section className="relative z-20 mx-auto -mt-5 max-w-[1400px] px-5">
      <div className="rounded-2xl border bg-white p-4 shadow-xl">
        <div className="grid grid-cols-2 divide-x divide-x-reverse md:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center justify-center gap-3 py-4"
            >
              <Icon size={29} className="text-emerald-600" />
              <div>
                <b className="block text-sm text-slate-800">{title}</b>
                <span className="text-[11px] text-slate-500">{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
