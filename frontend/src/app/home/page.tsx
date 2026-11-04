"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { IProduct } from "@/interfaces/IProduct";
import { Gift, Crown, Smartphone, Package } from "lucide-react";
import productsService from "@/services/productsService";
import vendorService from "@/services/vendorService";
import cartService from "@/services/cartService";

// Modular Sub-components
import HomeHeader from "@/components/home/HomeHeader";
import HeroSlider from "@/components/home/HeroSlider";
import FeaturesBanner from "@/components/home/FeaturesBanner";
import CategoriesSection from "@/components/home/CategoriesSection";
import FlashDealsSection from "@/components/home/FlashDealsSection";
import TopShopsSection from "@/components/home/TopShopsSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import ProductCard from "@/components/home/ProductCard";
import PromoCard from "@/components/home/PromoCard";
import StatsSection from "@/components/home/StatsSection";
import BrandsSection from "@/components/home/BrandsSection";
import CartDrawer from "@/components/home/CartDrawer";
import HomeFooter from "@/components/home/HomeFooter";

export default function HomePage() {
  const { user, logout } = useAuthStore();
  const [category, setCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Platform Data
  const [products, setProducts] = useState<IProduct[]>([]);
  const [deals, setDeals] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [topShops, setTopShops] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    totalCustomers: 0,
    totalShops: 0,
    avgRating: 0,
  });

  // Initial Data Fetching
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, statsRes, dealsRes, newArrRes, topShopsRes] =
        await Promise.all([
          productsService.getAllProducts(search, category === "الكل" ? "" : category),
          productsService.getPlatformStats(),
          productsService.getDealsProducts(),
          productsService.getNewArrivals(10),
          vendorService.getTopShops(10),
        ]);

      setProducts(productsRes || []);
      setStats(statsRes || {});
      setDeals(dealsRes || []);
      setNewArrivals(newArrRes || []);
      setTopShops(topShopsRes || []);
    } catch (err: any) {
      console.error("Failed to fetch initial home data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debounced search / category filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search || category) {
        setLoading(true);
        try {
          const res = await productsService.getAllProducts(
            search,
            category === "الكل" ? "" : category
          );
          setProducts(res || []);
        } catch (err) {
          console.error("Error filtering products:", err);
        } finally {
          setLoading(false);
        }
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  // Memoized filter for local immediate response
  const filteredProducts = useMemo(() => {
    return products.filter((product: IProduct) => {
      const matchesCategory =
        category === "الكل" || product.category === category;
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, search, products]);

  // Cart Handlers
  const handleAddToCart = async (product: IProduct) => {
    try {
      // Optimistic state update
      setCart((current) => {
        const existing = current.find(
          (item) => (item.product?._id || item.product?.id) === product._id
        );
        if (existing) {
          return current.map((item) =>
            (item.product?._id || item.product?.id) === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...current, { product, quantity: 1 }];
      });

      const response = await cartService.addToCart(product._id, 1);
      if (response?.items) {
        setCart(response.items);
      }
    } catch (err: any) {
      console.error("Failed to add product to cart:", err);
    }
  };

  const handleChangeQuantity = async (
    action: "increase" | "decrease",
    productId: string
  ) => {
    try {
      setCart((current) =>
        current
          .map((item) => {
            const id = item.product?._id || item.product?.id;
            if (id === productId) {
              return {
                ...item,
                quantity: action === "increase" ? item.quantity + 1 : item.quantity - 1,
              };
            }
            return item;
          })
          .filter((item) => item.quantity > 0)
      );

      const response = await cartService.updateCartItem(action, productId);
      if (response?.items) {
        setCart(response.items);
      }
    } catch (err: any) {
      console.error("Failed to update cart quantity:", err);
    }
  };

  const cartCount = Array.isArray(cart)
    ? cart.reduce((total: number, item: any) => total + (item.quantity || 1), 0)
    : 0;

  const cartTotal = Array.isArray(cart)
    ? cart.reduce(
        (total: number, item: any) =>
          total + (item.product?.discountPrice || item.product?.price || 0) * (item.quantity || 1),
        0
      )
    : 0;

  return (
    <main dir="rtl" className="min-h-screen bg-white text-slate-900 font-sans">
      {/* 1. Navbar & Header */}
      <HomeHeader
        user={user}
        onLogout={() => {
          logout();
          window.location.reload();
        }}
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* 2. Hero Slider */}
      <HeroSlider />

      {/* 3. Trust & Features Banner */}
      <FeaturesBanner />

      {/* 4. Categories Grid */}
      <CategoriesSection
        selectedCategory={category}
        onSelectCategory={setCategory}
        products={products}
      />

      {/* 5. Main Catalog / Search Results */}
      <section id="products-grid" className="mx-auto max-w-[1500px] px-5 py-12">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700">تسوق الآن</span>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl text-slate-900">
              جميع المنتجات
            </h2>
          </div>
        </div>

        {/* Filter Indicator */}
        {(search || (category && category !== "الكل")) && (
          <div className="mb-6 rounded-xl bg-emerald-50 px-5 py-3 text-sm flex items-center justify-between border border-emerald-100">
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: IProduct) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={() => handleAddToCart(product)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed py-20 text-center">
              <Package size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-4 font-bold text-slate-700">لا توجد منتجات</h3>
              <p className="mt-1 text-sm text-slate-500">
                جرّب كلمة بحث أو فئة أخرى
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("الكل");
                }}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition"
              >
                عرض جميع المنتجات
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. Flash Deals */}
      <FlashDealsSection
        deals={deals}
        onAddToCart={handleAddToCart}
      />

      {/* 7. Top Rated Shops */}
      <TopShopsSection shops={topShops} />

      {/* 8. New Arrivals */}
      <NewArrivalsSection
        products={newArrivals}
        onAddToCart={handleAddToCart}
      />

      {/* 9. Promotional Cards */}
      <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-5 my-12 md:grid-cols-3">
        <PromoCard
          icon={<Gift size={38} />}
          title="هدية لأول طلب"
          description="احصل على خصم 10% عند إتمام أول طلب لك عبر المنصة."
          button="تسوق الآن"
        />

        <PromoCard
          icon={<Crown size={38} />}
          title="عضوية التجار المميزين"
          description="انضم إلى نخبة البائعين واحصل على أدوات تسويقية وتحليلات متقدمة."
          button="ابدأ البيع الآن"
          dark
        />

        <PromoCard
          icon={<Smartphone size={38} />}
          title="تطبيق الجوال قريباً"
          description="استمتع بتجربة تسوق أسرع وإشعارات فورية بعروضك المفضلة."
          button="اكتشف المزيد"
        />
      </section>

      {/* 10. Platform Statistics */}
      <StatsSection stats={stats} />

      {/* 11. Trusted Brands */}
      <BrandsSection />

      {/* 12. Footer & Floating Support */}
      <HomeFooter />

      {/* 13. Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onChangeQuantity={handleChangeQuantity}
      />
    </main>
  );
}
