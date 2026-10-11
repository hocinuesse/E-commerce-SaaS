"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Clock,
  // Facebook,
  // Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Stars,
  Store,
  Truck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import vendorService from "@/services/vendorService";
import { Shop, IProduct, OrderMethod, currency, ShopStatus } from "@/interfaces/IProduct";
import { useParams } from "next/navigation";
import shopMessagesService from "@/services/shopMessages";


const navItems = [
  { id: "products", label: "المنتجات" },
  { id: "services", label: "الخدمات" },
  { id: "reviews", label: "التقييمات" },
  { id: "faq", label: "أسئلة شائعة" },
  { id: "contact", label: "التواصل" },
];

function InteractiveStars({ rating, setRating }: { rating: number, setRating: (val: number) => void }) {
  return (
    <div className="flex items-center gap-1 dir-ltr w-fit mx-auto sm:mx-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="focus:outline-none hover:scale-110 transition-transform"
        >
          <Star
            className={`h-7 w-7 transition-colors ${i <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300 hover:text-amber-300"
              }`}
          />
        </button>
      ))}
    </div>
  );
}


function SellerStorefront() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [sent, setSent] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentError, setSentError] = useState<string | null>(null);
  const { slug } = useParams();
  const [contactForm, setContactForm] = useState({ senderName: "", senderPhone: "", message: "" });

  const [reviewForm, setReviewForm] = useState({ name: "", comment: "", rating: 5 });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>([]);

  const fetchShopBySlug = async () => {
    setLoading(true);
    try {
      const response = await vendorService.getShopBySlug(slug as string);
      console.log(response, "succefuly fetch shop by slug");

      setShop(response.shop);
      setProducts(response.products);
      if (response.shop?.reviews) {
        setLocalReviews(response.shop.reviews);
      }
    } catch (err) {
      console.log(err);
      setError("فشل تحميل المتجر");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchShopBySlug();
  }, [slug]);

  const categories = ["الكل", ...new Set(products.map((product) => product.category))];

  const filteredProducts = activeCategory === "الكل"
    ? products
    : products.filter((product) => product.category === activeCategory);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(shop?._id, "shop id");
    console.log(contactForm, "contact form");

    try {
      const response = await shopMessagesService.sendMessage({ ...contactForm, shopId: shop?._id || "" });
      console.log(response, "succefuly sent message")
      setSent(true);

      setContactForm({ senderName: "", senderPhone: "", message: "" });
    } catch (error) {
      console.log(error);
      setSentError("فشل إرسال رسالتك");
    } finally {
      setTimeout(() => {
        setSent(false);
        setSentError("");
      }, 3000);
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const response = await vendorService.addReview(shop?._id || "", reviewForm);
      console.log(response, "succefuly sent review")
      setReviewSuccess(true);
      setReviewForm({ name: "", comment: "", rating: 5 });
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (error: Error | any) {
      console.log(error.response.data.message || "failed to add review");
      throw new Error(error.response.data.message || "failed to add review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await vendorService.getReviews(shop?._id || "");
      console.log(response, "succefuly fetched reviews");
      setLocalReviews(response);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (shop?._id) {
      fetchReviews();
    }
  }, [shop?._id]);


  const seller: Shop | null = shop;

  if (loading || !seller) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dir-rtl">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="bg-emerald-900 text-white flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold">
              {seller.settings.branding.logo || seller.name.charAt(0).toUpperCase()}
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-bold">{seller.name}</span>
              <span className="block text-xs text-slate-500">متجر موثّق</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-5">
              <a href={`https://wa.me/${seller.settings.contactInfo.whatsappNumber}`}>
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">تواصل الآن</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section id="top" className="relative bg-emerald-950 text-white overflow-hidden">
        <img
          src={seller.settings.branding.coverImage}
          alt={`واجهة ${seller.name}`}
          className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
          loading="eager"
        />
        <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16 md:py-24">
          <div className="max-w-2xl">
            {seller.status === ShopStatus.ACTIVE && (
              <Badge className="mb-4 gap-1.5 border-0 bg-amber-500/90 hover:bg-amber-500 text-white px-3 py-1 text-sm rounded-full">
                <BadgeCheck className="h-4 w-4" />
                بائع موثّق
              </Badge>
            )}
            <h1 className="font-display text-5xl leading-tight font-extrabold text-white md:text-6xl drop-shadow-md">
              {seller.name}
            </h1>
            <p className="mt-4 font-display text-xl text-emerald-50 md:text-2xl drop-shadow-sm">
              {seller.tagline}
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-emerald-100">
              {seller.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-full font-bold px-8">
                <a href="#products">
                  <Package className="h-5 w-5" />
                  تصفّح المنتجات
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-bold px-8 backdrop-blur-sm"
              >
                <a href="#contact">
                  <Phone className="h-5 w-5" />
                  اتصل بالبائع
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      {/* <section className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 md:grid-cols-4">
          {[
            { icon: Star, value: `${seller.rating} / 5`, label: `${seller.reviewsCount} تقييم` },
            {
              icon: Package,
              value: `+${seller.ordersCount.toLocaleString("ar-DZ")}`,
              label: "طلب مكتمل",
            },
            { icon: Users, value: `${seller.yearsActive} سنوات`, label: "من الخبرة" },
            { icon: Clock, value: seller.responseTime, label: "متوسط الرد" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 px-4 py-8">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <stat.icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-display text-xl font-bold text-slate-900">{stat.value}</span>
                <span className="block text-sm font-medium text-slate-500">{stat.label}</span>
              </span>
            </div>
          ))}
        </div>
      </section> */}

      {/* ===== Products ===== */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeading
          eyebrow="الكتالوج"
          title="منتجاتنا"
          subtitle="كل المنتجات أصلية ومتوفرة للشحن الفوري"
        />

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="pr-9 bg-white border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-5 py-2 text-sm font-bold transition-all ${activeCategory === cat
                  ? "border-emerald-600 bg-emerald-700 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="mt-12 text-center text-sm text-slate-500 font-medium">
            لا توجد منتجات مطابقة لبحثك.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* {product.badge && (
                    <Badge className="absolute top-4 right-4 border-0 bg-amber-500 text-white font-bold px-3 py-1 shadow-sm">
                      {product.badge}
                    </Badge>
                  )} */}
                  {!product.stock && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm font-display text-lg font-bold text-slate-900">
                      نفدت الكمية
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                    {/* <Stars rating={product.rating} className="shrink-0" /> */}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500 flex-1">
                    {product.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-xl font-black text-emerald-700">
                        {product.price} {seller.currency}
                      </span>
                      {product.discountPrice ? (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          {product.discountPrice} {seller.currency}
                        </span>
                      ) : null}
                    </span>
                    <Button asChild size="sm" className="gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5">
                      <Link href={`/shop/${slug}/${product._id}`}>
                        <MessageCircle className="h-4 w-4" />
                        اطلب الان
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ===== Services ===== */}
      {/* <section id="services" className="border-y border-slate-200 bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="لماذا نحن"
            title="خدماتنا وضماناتنا"
            subtitle="التزامات واضحة مع كل طلب"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {seller.services.map((service, i) => {
              const icons = [Truck, ShieldCheck, BadgeCheck, MessageCircle];
              const Icon = icons[i % icons.length]!;
              return (
                <div key={service.title} className="bg-slate-50 rounded-3xl border border-slate-100 p-8 text-center sm:text-start transition-all hover:shadow-md">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto sm:mx-0">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* ===== Reviews ===== */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading
          eyebrow="آراء الزبائن"
          title="ماذا يقول عملاؤنا"
          subtitle={`متوسط ${seller.rating || 5} من 5 بناءً على ${localReviews.length || seller.ratingCount || 0} تقييم`}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleReviewSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm h-fit sticky top-24">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-6 text-center sm:text-start">أضف تقييمك للمتجر</h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 text-center sm:text-start">ما هو تقييمك لتجربتك؟</label>
                  <InteractiveStars rating={reviewForm.rating} setRating={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                </div>

                <div>
                  <label htmlFor="shopReviewerName" className="block text-sm font-bold text-slate-900 mb-2">الاسم</label>
                  <Input
                    id="shopReviewerName"
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="الاسم الكريم"
                    className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                  />
                </div>

                <div>
                  <label htmlFor="shopReviewComment" className="block text-sm font-bold text-slate-900 mb-2">رأيك</label>
                  <Textarea
                    id="shopReviewComment"
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="شاركنا رأيك في خدمات المتجر..."
                    className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl resize-none"
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
                <div className="sm:col-span-2 text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">لا توجد تقييمات بعد للمتجر. كن أول من يقيم!</p>
                </div>
              ) : (
                localReviews.map((review, idx) => (
                  <figure key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow h-fit">
                    <Stars rating={review.rating as number} />
                    <blockquote className="mt-4 text-base leading-relaxed text-slate-700 font-medium">
                      {review.comment}
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 font-display text-lg font-bold text-emerald-800">
                        {review.name.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-base font-bold text-slate-900">{review.name}</span>
                        <span className="block text-sm font-medium text-slate-500">{new Date(review.createdAt as Date).toDateString()}</span>
                      </span>
                    </figcaption>
                  </figure>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <SectionHeading eyebrow="مساعدة" title="أسئلة شائعة" subtitle="أجوبة سريعة لأكثر الأسئلة تكراراً" />
          <Accordion type="single" collapsible className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {seller.faqs?.map((item, i) => (
              <AccordionItem key={item.name} value={`item-${i}`} className="border-slate-100 px-6">
                <AccordionTrigger className="text-right font-display text-lg font-bold text-slate-900 py-6 hover:text-emerald-700 hover:no-underline">
                  {item.name}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-slate-600 pb-6">
                  {item.value}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ===== Store FAQs ===== */}
      {seller.faqs && seller.faqs.length > 0 && (
        <section id="faq" className="bg-slate-50 border-t border-slate-200 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="أسئلة شائعة"
              title="الأسئلة المتكررة"
              subtitle="إجابات سريعة على أكثر الأسئلة شيوعاً حول متجرنا وخدماتنا"
            />
            <Accordion type="single" collapsible className="mt-12 space-y-4">
              {seller.faqs.map((faq: any, idx: number) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 overflow-hidden">
                  <AccordionTrigger className="text-base font-bold text-slate-800 hover:text-emerald-700 py-5 hover:no-underline">
                    {faq.name}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-600 font-medium leading-relaxed pb-5">
                    {faq.value}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* ===== Contact ===== */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeading
          eyebrow="التواصل"
          title="تواصل مع البائع"
          subtitle="اترك رسالتك وسنعاود الاتصال بك في أقرب وقت"
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2 p-8 lg:col-span-2">
            {[
              { icon: Phone, label: "الهاتف", value: seller.settings.contactInfo.phoneNumber, href: `tel:${seller.settings.contactInfo.phoneNumber}` },
              {
                icon: MessageCircle,
                label: "واتساب",
                value: seller.settings.contactInfo.whatsappNumber,
                href: `https://wa.me/${seller.settings.contactInfo.whatsappNumber?.replace(/[^0-9]/g, "")}`,
              },
              {
                icon: Mail,
                label: "البريد الإلكتروني",
                value: seller.settings.contactInfo.email,
                href: `mailto:${seller.settings.contactInfo.email}`,
              },
              { icon: MapPin, label: "العنوان", value: seller.settings.contactInfo.storeAddress },
              { icon: Clock, label: "أوقات العمل", value: seller.settings.contactInfo.workingHours },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-4 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <row.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-500">{row.label}</span>
                  {row.href ? (
                    <a
                      href={row.href}
                      className="block truncate text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                      dir="auto"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="block text-base font-bold text-slate-900" dir="auto">
                      {row.value}
                    </span>
                  )}
                </span>
              </div>
            ))}

            <div className="flex gap-3 pt-6 px-3">
              {seller.settings.contactInfo.facebookProfile && (
                <Button asChild size="icon" variant="outline" aria-label="فيسبوك" className="rounded-full border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50">
                  <a href={seller.settings.contactInfo.facebookProfile}>
                    {/* <Facebook className="h-4 w-4" /> */}
                  </a>
                </Button>
              )}
              {seller.settings.contactInfo.instagramProfile && (
                <Button asChild size="icon" variant="outline" aria-label="إنستغرام" className="rounded-full border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50">
                  <a href={seller.settings.contactInfo.instagramProfile}>
                    {/* <Instagram className="h-4 w-4" /> */}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6 p-8 lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-900">
                  الاسم الكامل
                </label>
                <Input
                  id="name"
                  required
                  value={contactForm.senderName}
                  onChange={(e) => setContactForm({ ...contactForm, senderName: e.target.value })}
                  placeholder="مثال: محمد أمين"
                  className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-bold text-slate-900">
                  رقم الهاتف
                </label>
                <Input
                  id="phone"
                  required
                  value={contactForm.senderPhone}
                  onChange={(e) => setContactForm({ ...contactForm, senderPhone: e.target.value })}
                  placeholder="+213 ..."
                  dir="ltr"
                  className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-bold text-slate-900">
                رسالتك
              </label>
              <Textarea
                id="message"
                required
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="اكتب استفسارك أو تفاصيل طلبك..."
                className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button type="submit" size="lg" className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white px-8 font-bold">
                إرسال الرسالة
              </Button>
              {sent && (
                <span className="text-sm font-bold text-emerald-600">
                  تم إرسال رسالتك، سنتواصل معك قريباً.
                </span>
              )}
              {sentError && (
                <span className="text-sm font-bold text-red-600">
                  {sentError}
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-white border-t border-slate-200 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900 font-display text-xl font-bold text-white">
              {seller.settings.branding.logo || seller.name.charAt(0).toUpperCase()}
            </span>
            <span>
              <span className="block font-display text-lg font-bold text-slate-900">{seller.name}</span>
              <span className="block text-sm text-slate-500 font-medium">{seller.settings.contactInfo.storeAddress}</span>
            </span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm font-bold text-slate-600">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="hover:text-emerald-700 transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="border-t border-slate-100 py-6 text-center text-sm font-medium text-slate-400">
          © {new Date().getFullYear()} {seller.name}. كل الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="text-sm font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full">{eyebrow}</span>
      <h2 className="mt-4 font-display text-4xl font-extrabold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-3 text-base font-medium text-slate-500">{subtitle}</p>}
    </div>
  );
}

export default SellerStorefront;