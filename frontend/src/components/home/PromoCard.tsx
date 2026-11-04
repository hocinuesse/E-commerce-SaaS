"use client";

import React from "react";

interface PromoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  dark?: boolean;
}

export const PromoCard: React.FC<PromoCardProps> = ({
  icon,
  title,
  description,
  button,
  dark = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[25px] border p-8 transition hover:shadow-lg ${
        dark
          ? "border-emerald-800 bg-emerald-800 text-white"
          : "border-emerald-100 bg-emerald-50 text-emerald-950"
      }`}
    >
      <div className={`mb-6 ${dark ? "text-white" : "text-emerald-600"}`}>
        {icon}
      </div>

      <h3 className="text-2xl font-black">{title}</h3>

      <p
        className={`mt-3 max-w-sm text-sm leading-7 ${
          dark ? "text-emerald-100" : "text-slate-600"
        }`}
      >
        {description}
      </p>

      <button
        className={`mt-7 rounded-xl px-6 py-3 text-sm font-bold transition ${
          dark
            ? "bg-white text-emerald-800 hover:bg-emerald-50"
            : "bg-emerald-700 text-white hover:bg-emerald-800"
        }`}
      >
        {button}
      </button>

      <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
};

export default PromoCard;
