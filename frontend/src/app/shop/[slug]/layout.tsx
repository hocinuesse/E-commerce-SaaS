import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return {
    title: `${decodedSlug} | متجر EcoMart`,
    description: `تسوق أفضل المنتجات والعروض الحصرية من متجر ${decodedSlug} على منصة EcoMart للتجارة الإلكترونية مع توصيل سريع وضمان أصلي.`,
    openGraph: {
      title: `${decodedSlug} | متجر معتمد على EcoMart`,
      description: `تصفح تشكيلة منتجات متجر ${decodedSlug} مع شحن سريع ودفع آمن عند الاستلام.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${decodedSlug} | EcoMart`,
      description: `منتجات مميزة وعروض حصرية من متجر ${decodedSlug}.`,
    },
  };
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
