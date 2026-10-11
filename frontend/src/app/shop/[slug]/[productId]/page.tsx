"use client"


import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IProduct, ShopStatus } from "@/interfaces/IProduct";
import { useParams } from "next/navigation";
import productsService from "@/services/productsService";
import vendorService from "@/services/vendorService";
import { Shop } from "@/interfaces/IProduct";
import cartService from "@/services/cartService";
import { ProductOption } from "@/interfaces/IProduct";


function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-4.5 w-4.5" : "h-3.5 w-3.5";
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-slate-300"
            }`}
        />
      ))}
    </span>
  );
}

function InteractiveStars({ rating, setRating }: { rating: number, setRating: (val: number) => void }) {
  return (
    <div className="flex items-center gap-1 dir-ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="focus:outline-none hover:scale-110 transition-transform"
        >
          <Star
            className={`h-6 w-6 transition-colors ${i <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300 hover:text-amber-300"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

function ProductPage() {
  const [product, setProduct] = useState<IProduct>();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { slug, productId } = useParams();
  const [sellerInfo, setSellerInfo] = useState<Shop>();
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([{ name: "", values: [""] }]);

  const [reviewForm, setReviewForm] = useState({ name: "", comment: "", rating: 5 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchShop();
  }, [slug]);

  useEffect(() => {
    if (product?.reviews) {
      setLocalReviews(product.reviews);
    }
  }, [product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const response = await productsService.addReview(productId as string, reviewForm);
      setLocalReviews(prev => [response, ...prev]);
      setReviewSuccess(true);
      setReviewForm({ name: "", comment: "", rating: 5 });
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error: Error | any) {
      console.log(error.message);
      setError(error.message || "failed to add review");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await productsService.getReviews(productId as string);
      setLocalReviews(response);
    } catch (error: Error | any) {
      console.log(error.message);
      setError(error.message || "failed to get reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);


  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsService.getProductById(productId as string);
      setProduct(response);
    } catch (error: Error | any) {
      console.log(error.message);
      setError(error.message || "failed to get product");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchShop = async () => {
    setLoading(true);
    try {
      const response = await vendorService.getShopBySlug(slug as string);
      setSellerInfo(response);
    } catch (error: Error | any) {
      console.log(error.message);
      setError(error.message || "failed to get shop");
    } finally {
      setLoading(false);
    }
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await cartService.addToCart(productId as string, qty, selectedOptions);
      console.log("succeeded", response);

      setSellerInfo(response);
    } catch (error: Error | any) {
      console.log(error.message);
      setError(error.message || "failed to get shop");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectOption = (optionName: string, selectedValue: string) => {
    setSelectedOptions((prevOptions) => {
      const existingIndex = prevOptions.findIndex((opt) => opt.name === optionName);

      if (existingIndex > -1) {
        const updated = [...prevOptions];
        updated[existingIndex] = { name: optionName, values: [selectedValue] };
        return updated;
      }

      return [...prevOptions, { name: optionName, values: [selectedValue] }];
    });
  };

  function Stars({ rating, className = "" }: { rating: number; className?: string }) {
    return (
      <span className={`inline-flex items-center gap-0.5 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
          />
        ))}
      </span>
    );
  }

  const discount = useMemo(() => {
    if (!product?.discountPrice) return 0;
    console.log(product?.discountPrice, "", product?.price);

    return ((product?.price - product?.discountPrice) / product?.price) * 100;

  }, [product?.discountPrice, product?.price]);
  console.log(product?.discountPrice, "", product?.price);

  console.log(discount);



  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-700 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-0" dir="rtl">
      {/* ===== Top bar ===== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
          <Link href={`/shop/${slug}`} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900 font-display text-base font-bold text-white">
              {sellerInfo?.settings?.branding?.logo || sellerInfo?.name?.charAt(0)}
            </span>
            <span className="font-display text-sm font-bold text-slate-900">{sellerInfo?.name}</span>
            {sellerInfo?.status === ShopStatus.ACTIVE && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
          </Link>
          <Link
            href={`/shop/${slug}`}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع للمتجر
          </Link>
        </div>
      </header>

      {/* ===== Breadcrumb ===== */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 py-5 text-xs text-slate-500">
        <Link href={`/shop/${slug}`} className="hover:text-slate-900 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span>{product?.category}</span>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="text-slate-900 font-medium">{product?.name}</span>
      </nav>

      {/* ===== Gallery + Buy box ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm relative aspect-4/3 overflow-hidden p-2">
            <div className="h-full w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src={product?.images?.[activeImage]}
                alt={`${product?.name} — صورة`}
                className="h-full w-full object-cover"
              />
            </div>
            {product?.badge && (
              <Badge className="absolute top-6 right-6 border-0 bg-amber-500 text-white font-bold px-3 py-1 shadow-sm rounded-full">
                {product?.badge}
              </Badge>
            )}
            {discount !== 0 && (
              <Badge className="absolute top-6 left-6 border-0 bg-rose-500 text-white font-bold px-3 py-1 shadow-sm rounded-full">
                {discount}% -
              </Badge>
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product?.images?.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                aria-label={`عرض الصورة ${i + 1}`}
                className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${activeImage === i ? "border-emerald-600 shadow-sm opacity-100" : "border-slate-200 hover:border-emerald-300 opacity-70 hover:opacity-100"
                  }`}
              >
                <img
                  src={img}
                  alt={`${product.name} مصغّرة ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="py-2">
          <span className="text-xs font-bold tracking-wide text-emerald-700 uppercase bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full inline-block">
            {product?.category}
          </span>
          
          {product?.offers && product.offers.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {product.offers.map((offer, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="bg-rose-100 text-rose-600 p-2 rounded-lg shrink-0">
                    <Star className="w-4 h-4 fill-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-800">{offer.name}</h4>
                    <p className="text-xs font-medium text-rose-600 mt-0.5">{offer.value}</p>
                    {offer.endsAt && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                        ينتهي في: {new Date(offer.endsAt).toLocaleDateString('ar-DZ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h1 className="mt-4 font-display text-3xl leading-tight font-extrabold text-slate-900 md:text-4xl">
            {product?.name}
          </h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">{product?.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold flex items-center gap-1 text-slate-900">
              {product?.rating} <Stars rating={product?.rating as number} className="h-4 w-4 fill-amber-500 text-amber-500 inline-block -mt-0.5" />
            </span>
            <span className="text-slate-500 font-medium">({product?.reviewsCount} تقييم)</span>
            <span className="text-slate-500 font-medium">· {product?.salesCount} عملية بيع</span>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl font-black text-emerald-700 tracking-tight">
              {product?.discountPrice ? product?.discountPrice : product?.price} {sellerInfo?.currency}
            </span>
            {product?.discountPrice && (
              <span className="pb-1 text-base font-bold text-slate-400 line-through">
                {product?.price} {sellerInfo?.currency}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm">
            {product && product?.stock > 0 ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-700">
                  متوفر — تبقّى {product?.stock} قطعة
                </span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="font-bold text-rose-600">نفدت الكمية</span>
              </>
            )}
          </div>

          <Separator className="my-7 border-slate-200" />

          <div className="space-y-6">
            {product?.options?.map((option) => {
              const currentSelected = selectedOptions.find((opt) => opt.name === option.name);
              const activeValue = currentSelected?.values[0];

              return (
                <div key={option.name}>
                  <span className="text-sm font-bold text-slate-900">{option.name}</span>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = activeValue === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSelectOption(option.name, value)}
                          className={`rounded-full border px-6 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${isSelected
                            ? "border-emerald-700 bg-emerald-700 text-white shadow-md shadow-emerald-900/10"
                            : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                            }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity */}
          <div className="mt-8">
            <span className="text-sm font-bold text-slate-900">الكمية</span>
            <div className="mt-3 flex items-center gap-5">
              <div className="flex items-center rounded-full border border-slate-200 bg-white shadow-sm p-1">
                <button
                  aria-label="إنقاص"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-display text-base font-bold text-slate-900">{qty}</span>
                <button
                  aria-label="زيادة"
                  onClick={() => setQty((q) => Math.min(product?.stock || 99, q + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm font-medium text-slate-500">
                المجموع:{" "}
                <span className="font-display text-lg font-black text-emerald-700">
                  {product && product?.price * qty}
                </span>
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 shadow-md shadow-emerald-900/10 transition-all hover:shadow-lg hover:-translate-y-0.5"
              onClick={handleOrder}
            >
              <ShoppingCart className="h-5 w-5" />
              اضف الى السلة
            </Button>
            <Button size="lg" variant="outline" className="gap-2 rounded-full border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 font-bold h-12 transition-all hover:-translate-y-0.5" asChild>
              <a href={`tel:${sellerInfo?.settings?.contactInfo?.phoneNumber?.replace(/\s/g, "")}`}>
                <Phone className="h-5 w-5" />
                اتصل بنا
              </a>
            </Button>
          </div>

          {/* Highlights */}
          <ul className="mt-8 grid gap-3">
            {product?.highlights?.map((h) => (
              <li key={h.name} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-slate-600 font-medium leading-relaxed">{h.value}</span>
              </li>
            ))}
          </ul>

          {/* Seller card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow mt-8 flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 font-display text-lg font-bold text-white">
                {sellerInfo?.settings?.branding.logo || sellerInfo?.name?.charAt(0)}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base font-bold text-slate-900">{sellerInfo?.name}</span>
                  {sellerInfo?.status === ShopStatus.ACTIVE && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
                </div>
                <span className="text-xs font-medium text-slate-500">
                  تقييم {sellerInfo?.rating} · متجر موثّق
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full hover:bg-emerald-50 text-emerald-700 font-bold" asChild>
              <Link href={`/shop/${sellerInfo?.slug}`}>
                <Store className="h-4 w-4" />
                المتجر
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Description + Specs ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">وصف المنتج</h2>
          <div className="mt-6 text-slate-600 leading-loose font-medium">
            {product?.longDescription?.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-fit p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-slate-900">المواصفات</h2>
          <dl className="mt-6 divide-y divide-slate-100">
            {product?.specs?.map((spec) => (
              <div key={spec.name} className="flex items-center justify-between gap-4 py-3.5">
                <dt className="text-sm font-medium text-slate-500">{spec.name}</dt>
                <dd className="text-sm font-bold text-slate-900">{spec.value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-sm font-medium text-slate-500">المرجع (SKU)</dt>
              <dd className="text-sm font-bold text-slate-900">{product?._id?.slice(-6).toUpperCase() || 'sku'}</dd>
            </div>
          </dl>
        </div>
      </section>

      
      {/* ===== Product FAQs ===== */}
      {product?.faqs && product.faqs.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 text-center mb-10">الأسئلة الشائعة حول المنتج</h2>
            <div className="space-y-4">
              {product.faqs.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-emerald-500">Q.</span> {faq.name}
                  </h3>
                  <p className="text-slate-600 mt-3 font-medium leading-relaxed mr-7">
                    <strong className="text-emerald-600 mr-1">A.</strong> {faq.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Reviews ===== */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">آراء المشترين</h2>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <span className="font-bold text-slate-900 text-lg flex items-center gap-1">{product?.rating} <Star className="h-5 w-5 fill-amber-500 text-amber-500 -mt-0.5" /></span>
                <span className="font-medium">من {localReviews.length || product?.reviewsCount || 0} تقييم</span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
                <h3 className="font-display text-lg font-bold text-slate-900 mb-4">أضف تقييمك</h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">تقييمك</label>
                    <InteractiveStars rating={reviewForm.rating} setRating={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                  </div>

                  <div>
                    <label htmlFor="reviewerName" className="block text-sm font-bold text-slate-900 mb-2">الاسم</label>
                    <input
                      id="reviewerName"
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                      placeholder="اسمك الكريم"
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-sm outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="reviewComment" className="block text-sm font-bold text-slate-900 mb-2">رأيك في المنتج</label>
                    <textarea
                      id="reviewComment"
                      required
                      rows={4}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="كيف كانت تجربتك مع هذا المنتج؟"
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-sm outline-none transition-colors resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmittingReview} className="w-full h-12 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-md">
                    {isSubmittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
                  </Button>

                  {reviewSuccess && (
                    <p className="text-sm text-emerald-600 font-bold text-center mt-2 bg-emerald-50 p-2 rounded-lg">شكراً لك! تم إضافة تقييمك بنجاح.</p>
                  )}
                </div>
              </form>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                {localReviews.length === 0 ? (
                  <div className="sm:col-span-2 text-center py-10 bg-slate-50 rounded-3xl border border-slate-100">
                    <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
                  </div>
                ) : (
                  localReviews.map((review, idx) => (
                    <figure key={idx} className="bg-slate-50 rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow h-fit">
                      <Stars rating={review.rating} />
                      <blockquote className="mt-4 text-sm leading-relaxed text-slate-700 font-medium">
                        “{review.comment}”
                      </blockquote>
                      <figcaption className="mt-6 flex items-center gap-4 pt-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-display text-lg font-bold text-emerald-800">
                          {review.name.charAt(0)}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{review.name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString("ar-DZ")}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                  )))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Mobile sticky bar ===== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-md md:hidden shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="block font-display text-xl font-black text-emerald-700">
              {product && product?.price * qty}
            </span>
            <span className="text-xs font-medium text-slate-500 line-clamp-1">{product?.name}</span>
          </div>
          <Button className="gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 px-8 shadow-md shadow-emerald-900/10" disabled={!product?.stock} onClick={handleOrder}>
            <ShoppingCart className="h-4 w-4" />
            اطلب الآن
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
