/* -----------------------------------------------------------------------------------------------
 * الصفحة الرئيسية (Global Marketplace Home)
 * -----------------------------------------------------------------------------------------------
 * هذه الصفحة تمثل الواجهة الرئيسية للمنصة (مثل Amazon/Noon)، حيث تقوم بـ:
 * 1. جلب البيانات الفعلية من الخادم (المنتجات، والمتاجر النشطة) عبر productsService و vendorService.
 * 2. توفير نظام بحث وفلترة متقدم (حسب القسم، وبحث نصي، وإظهار العروض فقط).
 * 3. عرض العروض المميزة (Flash Deals) برمجياً استناداً إلى حقل offers في المنتجات.
 * 4. واجهة مستخدم سريعة الاستجابة مع دعم الوضع الليلي/النهاري والتوافق التام مع الهاتف.
 * ----------------------------------------------------------------------------------------------- */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { IProduct } from "@/interfaces/IProduct";
import {
  Search,
  UserRound,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Smartphone,
  Gift,
  Crown,
  Star,
  //   Instagram,
  //   Facebook,
  //   Twitter,
  //   Youtube,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Sparkles,
  Store,
  Package,
  CreditCard,
  BadgeCheck,
  LogOut,
  // Package,
} from "lucide-react";
import { GLOBAL_CATEGORIES, GLOBAL_BRANDS } from "@/constants/categories";
import productsService from "@/services/productsService";
import vendorService from "@/services/vendorService";
import cartService from "@/services/cartService";
import Link from "next/link";
import { UserRole } from "@/interfaces/IUserStore";

const brands = [
  "SAMSUNG",
  "Apple",
  "NIKE",
  "adidas",
  "SONY",
  "DELL",
  "LG",
  "PHILIPS",
];

const heroSlides = [
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
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
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

export default function Page() {
  // --- حالة المصادقة (Auth) ---
  const { user, logout } = useAuthStore();
  const [category, setCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [hero, setHero] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [error, setError] = useState(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    totalCustomers: 0,
    totalShops: 0,
    avgRating: 0,
  });
  const [deals, setDeals] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [topShops, setTopShops] = useState<any[]>([]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, statsRes, catsRes, dealsRes, newArrRes, topShopsRes] =
        await Promise.all([
          productsService.getAllProducts(
            search,
            category === "الكل" ? "" : category,
          ),
          productsService.getPlatformStats(),
          productsService.getCategories(),
          productsService.getDealsProducts(),
          productsService.getNewArrivals(10),
          vendorService.getTopShops(10),
        ]);

      setProducts(productsRes);
      setStats(statsRes);

      // If backend doesn't return categories array of objects, fallback to unique strings
      if (catsRes && catsRes.length > 0 && typeof catsRes[0] === "object") {
        setCategories([
          { name: "الكل", count: productsRes.length },
          ...catsRes,
        ]);
      } else {
        const uniqueCats = [
          "الكل",
          ...new Set(productsRes.map((p: any) => p.category)),
        ];
        setCategories(uniqueCats.map((c) => ({ name: c, count: 0 })));
      }

      setDeals(dealsRes);
      setNewArrivals(newArrRes);
      setTopShops(topShopsRes);
    } catch (error: any) {
      console.log(error);
      setError(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  console.log("newArrivals", newArrivals);
  console.log("deals", deals);
  console.log("topShops", topShops);
  console.log("products", products);
  console.log("stats", stats);
  console.log("categories", categories);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Also fetch when search or category changes (for the main products grid if needed)
  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsService.getAllProducts(
          search,
          category === "الكل" ? "" : category,
        );
        setProducts(res);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    // Debounce can be added hereنعم
    const delayDebounceFn = setTimeout(() => {
      if (search || category) searchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: IProduct) => {
      const matchesCategory =
        category === "الكل" || product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search, products]);

  console.log(filteredProducts);

  const addInCart = (product: IProduct) => {
    setCart((current: any) => {
      const existing = current.find((item: any) =>
        item.product._id === product._id && item.product.options?.length > 0
          ? JSON.stringify(item.product.options) ===
            JSON.stringify(product.options)
          : true,
      );

      if (existing) {
        return current.map((item: any) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const addToCart = async (product: IProduct) => {
    setLoading(true);
    try {
      addInCart(product);
      const response = await cartService.addToCart(product._id, 1);
      console.log("succefuly adding to cart");
      setCart(response?.items || response);
    } catch (error: Error | any) {
      console.log(error.message || "failed to add to cart");
      setError(error.message || "failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (action: string, productId: string, options?: any) => {
    setCart((current: any) =>
      current
        .map((item: any) =>
          item.product._id === productId && item.product.options?.length > 0
            ? JSON.stringify(item.product.options) === JSON.stringify(options)
            : true
              ? {
                  ...item,
                  quantity:
                    action === "increase"
                      ? item.quantity + 1
                      : item.quantity - 1,
                }
              : item,
        )
        .filter((item: any) => item.quantity > 0),
    );
  };

  const changeQuantity = async (action: string, productId: string) => {
    setLoading(true);
    try {
      updateQuantity(action, productId);
      const response = await cartService.updateCartItem(action, productId);
      console.log("succefuly updating cart item");
      setCart(response?.items || response);
    } catch (error: any) {
      console.log(error.message || "failed to update cart item");
      setError(error.message || "failed to update cart item");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const cartCount = Array.isArray(cart)
    ? cart.reduce((total: number, item: any) => total + item.quantity, 0)
    : 0;

  const cartTotal = Array.isArray(cart)
    ? cart.reduce(
        (total: number, item: any) =>
          total + (item.product?.price || 0) * item.quantity,
        0,
      )
    : 0;

  const submitNewsletter = () => {
    if (!newsletter.trim()) return;
    setNewsletterDone(true);
    setNewsletter("");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-white text-slate-900">
      {/* ================= ANNOUNCEMENT BAR ================= */}
      <div className="bg-emerald-700 text-white py-2 text-center text-xs font-bold flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-amber-400" />
        استخدم الكود{" "}
        <span className="bg-white text-emerald-800 px-2 py-0.5 rounded text-[10px] mx-1">
          ECOM20
        </span>{" "}
        واحصل على خصم 20% وشحن مجاني!
        <Sparkles size={14} className="text-amber-400" />
      </div>

      {/* ================= TOP BAR ================= */}

      <div className="border-b bg-slate-50">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-2 text-xs text-slate-500">
          <div className="hidden gap-6 md:flex">
            <a href="#" className="hover:text-emerald-700">
              تواصل معنا
            </a>
            <a href="#" className="hover:text-emerald-700">
              مركز المساعدة
            </a>
            <a href="#" className="hover:text-emerald-700">
              تتبع طلبك
            </a>
          </div>

          <div className="mx-auto flex items-center gap-2 font-semibold text-emerald-700 md:mx-0">
            <Truck size={14} />
            توصيل مجاني للطلبات فوق 299 ريال
          </div>

          <div className="hidden md:block">
            العربية <span className="mx-2">|</span> SAR
          </div>
        </div>
      </div>

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-5 py-4">
          {/* Mobile Menu */}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-xl border p-2 md:hidden"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>

          {/* Logo */}

          <a
            href="#"
            className="flex min-w-fit items-center gap-2 text-2xl font-black tracking-tight text-emerald-700"
          >
            <span>EcoMart</span>

            <span className="rounded-xl bg-emerald-700 p-2 text-white shadow-lg">
              <ShoppingCart size={19} />
            </span>
          </a>

          {/* Categories button */}

          <button
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="hidden items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 lg:flex"
          >
            <Menu size={18} />
            الأقسام
          </button>

          {/* Search */}

          <div className="flex flex-1 overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50 transition focus-within:border-emerald-500">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتجات، علامات تجارية، فئات..."
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="hidden border-x bg-transparent px-3 text-sm outline-none md:block"
            >
              <option value="الكل">الكل</option>
              {GLOBAL_CATEGORIES.map((item: any) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>

            <button className="bg-emerald-700 px-5 text-white transition hover:bg-emerald-800">
              <Search size={20} />
            </button>
          </div>

          {/* Actions */}

          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <div className="flex items-center gap-6 border-l border-slate-200 pl-5">
                <Link
                  href={
                    user.role === UserRole.VENDOR
                      ? "/vendor/dashboard"
                      : user.role === UserRole.MANAGER
                        ? "/manager/dashboard"
                        : "/profile"
                  }
                  className="group text-center text-xs text-emerald-600 font-bold"
                >
                  <UserRound
                    size={21}
                    className="mx-auto mb-1 transition group-hover:scale-110"
                  />
                  لوحة التحكم
                </Link>
                <Link
                  href="/profile/orders"
                  className="group text-center text-xs text-slate-600 font-bold hover:text-emerald-700"
                >
                  <Package
                    size={21}
                    className="mx-auto mb-1 transition group-hover:scale-110"
                  />
                  طلباتي
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.reload();
                  }}
                  className="group text-center text-xs text-rose-500 font-bold hover:text-rose-600"
                >
                  <LogOut
                    size={21}
                    className="mx-auto mb-1 transition group-hover:scale-110"
                  />
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition"
                >
                  دخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200 transition shadow-sm"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative text-center text-xs text-slate-600"
            >
              <ShoppingCart
                size={21}
                className="mx-auto mb-1 transition hover:text-emerald-700"
              />
              السلة
              {cartCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[9px] text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Nav */}

        <nav className="hidden border-t lg:block">
          <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-12 px-5 py-3 text-sm font-semibold">
            {[
              ["الرئيسية", "#"],
              ["العروض", "#offers"],
              ["الجديد", "#new"],
              ["الأكثر مبيعاً", "#best"],
              ["العلامات التجارية", "#brands"],
              ["المدونة", "#blog"],
            ].map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={`transition hover:text-emerald-700 ${
                  index === 0 ? "text-emerald-700" : "text-slate-600"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* Mobile Nav */}

        {mobileMenu && (
          <div className="border-t bg-white px-5 py-5 lg:hidden">
            <div className="grid gap-3">
              {[
                "الرئيسية",
                "العروض",
                "الجديد",
                "الأكثر مبيعاً",
                "العلامات التجارية",
                "المدونة",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden bg-gradient-to-l from-emerald-50 via-white to-white">
        <div className="mx-auto grid min-h-[500px] max-w-[1500px] grid-cols-1 items-center gap-10 px-7 py-10 md:grid-cols-2 lg:px-14">
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm">
              <Sparkles size={14} />
              {heroSlides[hero].subtitle}
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.15] tracking-tight text-emerald-950 sm:text-5xl lg:text-7xl">
              {heroSlides[hero].title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              {heroSlides[hero].description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document
                    .getElementById("best")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-xl bg-emerald-700 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                تسوق الآن
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("offers")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-xl border-2 border-emerald-700 px-7 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                استكشف العروض
              </button>
            </div>

            <div className="mt-9 flex items-center gap-8">
              <div>
                <b className="block text-2xl font-black">+10K</b>
                <span className="text-xs text-slate-500">عميل سعيد</span>
              </div>

              <div>
                <b className="block text-2xl font-black">+2.5K</b>
                <span className="text-xs text-slate-500">منتج</span>
              </div>

              <div>
                <b className="block text-2xl font-black">4.9/5</b>
                <span className="text-xs text-slate-500">تقييم العملاء</span>
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2">
            <div className="relative w-full max-w-[650px]">
              <div className="absolute inset-10 rounded-full bg-emerald-200/60 blur-3xl" />

              <img
                src={heroSlides[hero].image}
                alt="Hero"
                className="relative z-10 h-[330px] w-full rounded-[35px] object-cover shadow-2xl sm:h-[400px]"
              />

              <div className="absolute bottom-6 right-6 z-20 rounded-2xl bg-white/95 px-5 py-4 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2">
                  <BadgeCheck size={19} className="text-emerald-600" />

                  <span className="text-xs font-bold">
                    منتجات أصلية ومضمونة
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setHero((hero - 1 + heroSlides.length) % heroSlides.length)
                }
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition hover:scale-105"
              >
                <ChevronRight size={20} />
              </button>

              <button
                onClick={() => setHero((hero + 1) % heroSlides.length)}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition hover:scale-105"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-6">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setHero(index)}
              className={`h-2 rounded-full transition-all ${
                hero === index ? "w-8 bg-emerald-700" : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ================= TRUST FEATURES ================= */}

      <section className="relative z-20 mx-auto -mt-5 max-w-[1400px] px-5">
        <div className="rounded-2xl border bg-white p-4 shadow-xl">
          <div className="grid grid-cols-2 divide-x divide-x-reverse md:grid-cols-4">
            {[
              [Truck, "توصيل سريع", "خلال 24 - 48 ساعة"],
              [ShieldCheck, "دفع آمن", "100% آمن وموثوق"],
              [RotateCcw, "استرجاع سهل", "خلال 14 يوم"],
              [Headphones, "دعم العملاء", "متواجدون لخدمتك"],
            ].map(([Icon, title, text]) => (
              <div
                key={title as string}
                className="flex items-center justify-center gap-3 py-4"
              >
                <Icon size={29} className="text-emerald-600" />

                <div>
                  <b className="block text-sm">{title as string}</b>

                  <span className="text-[11px] text-slate-500">
                    {text as string}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section id="categories" className="mx-auto max-w-[1500px] px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700">
              اكتشف ما يناسبك
            </span>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              تسوق حسب الفئة
            </h2>
          </div>

          <button className="hidden text-sm font-bold text-emerald-700 sm:block">
            استكشف جميع الفئات ←
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {GLOBAL_CATEGORIES.map((item: any) => (
            <button
              key={item.name}
              onClick={() => {
                setCategory(item.name);
                document
                  .getElementById("best")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group rounded-2xl border p-2 text-center transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg ${
                category === item.name
                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                  : "bg-white"
              }`}
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <b className="mt-3 block text-sm">{item.name}</b>

              <span className="text-[11px] text-slate-500">
                {products.filter((p) => p.category === item.name).length} منتج
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= ALL PRODUCTS ================= */}

      <section id="products-grid" className="mx-auto max-w-[1500px] px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700">
              تسوق الآن
            </span>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              جميع المنتجات
            </h2>
          </div>
        </div>

        {(search || (category && category !== "الكل")) && (
          <div className="mb-6 rounded-xl bg-emerald-50 px-5 py-3 text-sm flex items-center justify-between">
            <div>
              نتائج البحث عن:
              <strong className="mr-2 text-emerald-700">
                {search || category}
              </strong>
            </div>
            <button
              onClick={() => {
                setSearch("");
                setCategory("الكل");
              }}
              className="text-emerald-700 font-bold hover:underline text-xs"
            >
              إلغاء الفلتر ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts?.length > 0 ? (
            filteredProducts.map((product: IProduct) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={() => addToCart(product)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed py-20 text-center">
              <Package size={40} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-bold">لا توجد منتجات</h3>

              <p className="mt-1 text-sm text-slate-500">
                جرّب كلمة بحث أو فئة أخرى
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("الكل");
                }}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
              >
                عرض جميع المنتجات
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= FLASH SALE ================= */}

      <section id="offers" className="mx-auto max-w-[1500px] px-5">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-l from-emerald-50 via-white to-emerald-50 p-6 sm:p-8">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="text-xs font-black text-emerald-700">
                عروض لفترة محدودة
              </span>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                عروض اليوم 🔥
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-bold text-emerald-700">
                  سارع قبل نفاد الكمية!
                </span>
              </div>

              <button className="hidden rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white sm:block">
                كل العروض
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {deals?.map((product: IProduct) => (
              <ProductCard
                key={product._id}
                product={product}
                // favorite={favorites.includes(product._id)}
                // onFavorite={() =>
                //     toggleFavorite(product._id)
                // }
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= TOP SHOPS ================= */}

      <section id="best" className="mx-auto max-w-[1500px] px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700">
              اختيارات العملاء
            </span>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              أفضل المتاجر 🌟
            </h2>
          </div>

          <button className="hidden text-sm font-bold text-emerald-700 sm:block">
            عرض جميع المتاجر ←
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {topShops?.length > 0 ? (
            topShops.map((shop: any) => <ShopCard key={shop._id} shop={shop} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed py-10 text-center">
              <h3 className="font-bold text-slate-500">
                جاري تحميل المتاجر...
              </h3>
            </div>
          )}
        </div>
      </section>

      {/* ================= NEW ARRIVALS ================= */}

      <section id="new" className="mx-auto max-w-[1500px] px-5 py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700">
              اكتشف الجديد
            </span>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              وصل حديثاً ✨
            </h2>
          </div>

          <button className="hidden text-sm font-bold text-emerald-700 sm:block">
            عرض جميع المنتجات ←
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {newArrivals?.length > 0 ? (
            newArrivals.map((product: IProduct) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={() => addToCart(product)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed py-10 text-center">
              <h3 className="font-bold text-slate-500">
                لا توجد منتجات جديدة حالياً
              </h3>
            </div>
          )}
        </div>
      </section>

      {/* ================= PROMO CARDS ================= */}

      <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-5 md:grid-cols-3">
        <PromoCard
          icon={<Gift size={38} />}
          title="هدية لأول طلب"
          description="احصل على خصم 10% عند إتمام أول طلب لك."
          button="تسوق الآن"
        />

        <PromoCard
          icon={<Crown size={38} />}
          title="عضوية VIP"
          description="عروض حصرية وشحن مميز ومزايا خاصة للأعضاء."
          button="اشترك الآن"
          dark
        />

        <PromoCard
          icon={<Smartphone size={38} />}
          title="تجربة أسرع"
          description="تصفح منتجاتك المفضلة واستمتع بتجربة شراء سلسة."
          button="اكتشف المزيد"
        />
      </section>

      {/* ================= STATS ================= */}

      <section className="mx-auto max-w-[1500px] px-5 py-16">
        <div className="rounded-[30px] border bg-slate-50 p-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              [`${stats?.totalProducts || "2,500+"}`, "منتج متوفر"],
              [`${stats?.totalCustomers || "10,000+"}`, "عميل سعيد"],
              [`${stats?.totalShops || "350+"}`, "متجر شريك"],
              [`${stats?.avgRating?.toFixed(1) || "4.9"}/5`, "متوسط التقييم"],
            ].map(([number, label]) => (
              <div key={label} className="text-center">
                <b className="text-3xl font-black text-emerald-700">{number}</b>

                <span className="mt-2 block text-sm text-slate-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BRANDS ================= */}

      <section id="brands" className="mx-auto max-w-[1500px] px-5 pb-16">
        <div className="mb-8 text-center">
          <span className="text-xs font-bold text-emerald-700">شركاؤنا</span>

          <h2 className="mt-1 text-2xl font-black">علامات تجارية موثوقة</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-8">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex h-20 items-center justify-center rounded-2xl border bg-white text-sm font-black text-slate-400 transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
            >
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}

      <section className="mx-auto max-w-[1450px] px-5">
        <div className="flex flex-col gap-6 rounded-[28px] bg-emerald-800 px-7 py-9 text-white md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Mail size={21} />

              <span className="text-xs font-bold text-emerald-200">
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
                className="bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-500"
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
              منصة تجارة إلكترونية تجمع المتاجر والمنتجات في تجربة شراء بسيطة
              وسريعة وآمنة.
            </p>

            {/* <div className="mt-5 flex gap-2">
                            {[Facebook, Twitter, Instagram, Youtube].map(
                                (Icon, index) => (
                                    <button
                                        key={index}
                                        className="rounded-full border p-2.5 text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
                                    >
                                        <Icon size={16} />
                                    </button>
                                )
                            )}
                        </div> */}
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
              <b className="block text-lg font-black">{title}</b>

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

      {/* ================= FLOATING SUPPORT ================= */}

      <button
        className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl transition hover:scale-105 hover:bg-emerald-700"
        title="خدمة العملاء"
      >
        <Headphones size={24} />
      </button>

      {/* ================= CART DRAWER ================= */}

      {cartOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <aside className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-black">سلة التسوق</h2>

                <p className="mt-1 text-xs text-slate-500">{cartCount} منتج</p>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full bg-slate-100 p-2"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-emerald-50 p-6 text-emerald-600">
                    <ShoppingCart size={40} />
                  </div>

                  <h3 className="mt-5 font-black">السلة فارغة</h3>

                  <p className="mt-2 text-sm text-slate-500">
                    أضف المنتجات التي تعجبك إلى السلة.
                  </p>

                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-6 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white"
                  >
                    متابعة التسوق
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cart.map((item: any) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 border-b pb-5"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-24 w-24 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-bold">
                          {item.product.name}
                        </h3>

                        <b className="mt-2 block text-emerald-700">
                          {item.product.price} ر.س
                        </b>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() =>
                              changeQuantity("decrease", item.product.id)
                            }
                            className="rounded-lg border p-1"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-6 text-center text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              changeQuantity("increase", item.product.id)
                            }
                            className="rounded-lg border p-1"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t bg-slate-50 px-6 py-6">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">الإجمالي</span>

                  <b className="text-xl text-emerald-700">
                    {cartTotal.toLocaleString()} ر.س
                  </b>
                </div>

                <button
                  onClick={() => alert("هنا تربط عملية Checkout بالـBackend.")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
                >
                  <CreditCard size={18} />
                  إتمام الطلب
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ================= BRANDS CAROUSEL ================= */}
      <section id="brands" className="border-y bg-slate-50 py-10 mt-16">
        <div className="mx-auto max-w-[1500px] px-5">
          <p className="text-center text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">
            علامات تجارية موثوقة
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale transition hover:grayscale-0 hover:opacity-100 duration-500">
            {GLOBAL_BRANDS.map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt="Brand"
                className="h-8 md:h-12 object-contain hover:scale-110 transition duration-300"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  // favorite,
  // onFavorite,
  onAdd,
}: {
  product: IProduct;
  // favorite: boolean;
  // onFavorite: () => void;
  onAdd: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      {/* Favorite */}

      <button
        // onClick={onFavorite}
        className="absolute right-5 top-5 z-10 rounded-full bg-white/95 p-2.5 shadow-md transition hover:scale-105"
        aria-label="إضافة للمفضلة"
      >
        <Heart
          size={17}
          // className={
          //     favorite
          //         ? "fill-current text-emerald-600"
          //         : "text-slate-500"
          // }
        />
      </button>

      {/* Badge */}

      {product.badge && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-emerald-700 px-2.5 py-1.5 text-[10px] font-black text-white shadow">
          {product.badge}
        </span>
      )}

      {/* Image */}

      <div className="overflow-hidden rounded-xl bg-slate-50">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}

      <div className="p-2">
        <span className="text-[10px] font-semibold text-slate-400">
          {product.category}
        </span>

        <h3 className="mt-1 min-h-[44px] text-sm font-bold leading-5">
          {product.name}
        </h3>

        {/* Rating */}

        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star size={13} className="fill-amber-400 text-amber-400" />

          <b>{product.rating?.toFixed(2)}</b>

          <span className="text-slate-400">({product.reviews?.length})</span>
        </div>

        {/* Price */}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <b className="text-lg font-black text-emerald-700">
              {product.price.toLocaleString()} ر.س
            </b>

            {product.discountPrice && (
              <del className="mr-2 text-xs text-slate-400">
                {product.discountPrice.toLocaleString()} ر.س
              </del>
            )}
          </div>

          <button
            onClick={onAdd}
            className="rounded-xl bg-emerald-700 p-2.5 text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-lg"
            aria-label="إضافة للسلة"
          >
            <ShoppingCart size={17} />
          </button>
        </div>

        {/* Stock */}

        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">المتبقي {product.stock} قطعة</span>

          {product.discountPrice && (
            <span className="font-bold text-red-500">
              خصم{" "}
              {(
                ((product.price - product.discountPrice) / product.price) *
                100
              ).toFixed(2)}
              %
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROMO CARD
========================================================= */

function PromoCard({
  icon,
  title,
  description,
  button,
  dark = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[25px] border p-8 ${
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
        className={`mt-7 rounded-xl px-6 py-3 text-sm font-bold ${
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
}

/* =========================================================
   SHOP CARD
========================================================= */

function ShopCard({ shop }: { shop: any }) {
  return (
    <Link href={`/shop/${shop.slug || shop._id}`}>
      <article className="group relative overflow-hidden rounded-2xl border bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm transition duration-500 group-hover:scale-110 group-hover:border-emerald-100">
          {shop.settings?.branding?.logo ? (
            <img
              src={shop.settings.branding.logo}
              alt={shop.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-black text-slate-300">
              {shop.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">
          {shop.name}
        </h3>

        <p className="mt-2 text-xs font-medium text-slate-500 line-clamp-2 min-h-[32px]">
          {shop.description || "متجر مميز يقدم أفضل المنتجات بجودة عالية."}
        </p>

        <div className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-amber-500">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          <span>{shop.rating?.toFixed(1) || "5.0"}</span>
          <span className="text-xs text-slate-400 font-normal">
            ({shop.ratingCount || 0} تقييم)
          </span>
        </div>

        <div className="mt-4 w-full rounded-xl bg-slate-50 py-2 text-xs font-bold text-slate-600 transition group-hover:bg-emerald-50 group-hover:text-emerald-700">
          زيارة المتجر
        </div>
      </article>
    </Link>
  );
}
