"use client";

import React from "react";

interface StatsSectionProps {
  stats: {
    totalProducts?: number;
    totalCustomers?: number;
    totalShops?: number;
    avgRating?: number;
  };
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const statItems = [
    { number: `${stats?.totalProducts || "2,500+"}`, label: "منتج متوفر" },
    { number: `${stats?.totalCustomers || "10,000+"}`, label: "عميل سعيد" },
    { number: `${stats?.totalShops || "350+"}`, label: "متجر شريك" },
    { number: `${stats?.avgRating?.toFixed(1) || "4.9"}/5`, label: "متوسط التقييم" },
  ];

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-16">
      <div className="rounded-[30px] border bg-slate-50 p-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statItems.map(({ number, label }) => (
            <div key={label} className="text-center">
              <b className="text-3xl font-black text-emerald-700">{number}</b>
              <span className="mt-2 block text-sm text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
