import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return {
    title: `تفاصيل المنتج | متجر ${decodedSlug} - EcoMart`,
    description: `اكتشف مواصفات المنتج، التقييمات، والأسعار الحصرية من متجر ${decodedSlug} على منصة EcoMart.`,
    openGraph: {
      title: `تفاصيل المنتج | متجر ${decodedSlug}`,
      description: `منتج عالي الجودة مع شحن سريع وضمان استرجاع.`,
      type: "article",
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
