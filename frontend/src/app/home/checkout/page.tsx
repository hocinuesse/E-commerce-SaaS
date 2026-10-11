"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import cartService from "@/services/cartService";
import orderService from "@/services/orderService";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Truck,
  Wallet,
  Check,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [shopOrderMethod, setShopOrderMethod] = useState<'COD' | 'CARD' | 'BOTH' | 'CONFLICT'>('BOTH');
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    wilaya: "",
    baladiya: "",
    addressDetail: "",
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await cartService.getCart();
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          router.push("/home/cart");
          return;
        }

        // 1. استخراج طرق الدفع المتاحة لكل متجر في السلة
        let allowedMethods = ["COD", "CARD"]; // نبدأ بافتراض أن كلاهما متاح

        cartData.items.forEach((item: any) => {
          const shopMethod = item.product?.shop?.orderMethod || "BOTH";

          if (shopMethod === "COD") {
            // إذا كان هذا المتجر يقبل كاش فقط، نحذف خيار البطاقة من المتاح
            allowedMethods = allowedMethods.filter(m => m !== "CARD");
          } else if (shopMethod === "CARD") {
            // إذا كان يقبل بطاقة فقط، نحذف خيار الكاش من المتاح
            allowedMethods = allowedMethods.filter(m => m !== "COD");
          }
        });

        // 2. التحقق من وجود تعارض
        if (allowedMethods.length === 0) {
          // حالة التعارض: متجر يقبل كاش فقط ومتجر آخر يقبل بطاقة فقط في نفس السلة
          setError("عذراً، توجد منتجات في سلتك من متاجر تختلف في طرق الدفع المدعومة (بعضها لا يقبل إلا الدفع عند الاستلام والآخر بالبطاقة فقط). يرجى تقسيم طلبك.");
          setShopOrderMethod("CONFLICT");
        } else if (allowedMethods.includes("COD") && allowedMethods.includes("CARD")) {
          setShopOrderMethod("BOTH");
          setPaymentMethod("COD");
        } else if (allowedMethods.includes("COD")) {
          setShopOrderMethod("COD");
          setPaymentMethod("COD");
        } else {
          setShopOrderMethod("CARD");
          setPaymentMethod("CARD");
        }

        setCart(cartData);
      } catch (err: Error | any) {
        setError("حدث خطأ أثناء تحميل السلة");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (
        !formData.fullName ||
        !formData.phone ||
        !formData.wilaya ||
        !formData.baladiya
      ) {
        setError("يرجى تعبئة جميع الحقول المطلوبة للتوصيل");
        return;
      }
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.createOrder({
        shippingAddress: formData,
        paymentMethod: paymentMethod,
      });
      console.log("succesfuly order created");

      router.push(`/orders/success?orderId=${res.order._id}`);
    } catch (err: Error | any) {
      console.log(err.message, "error");

      setError(
        err.message ||
        "فشل في تسجيل الطلب، يرجى المحاولة لاحقاً",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "التوصيل", icon: <MapPin className="w-5 h-5" /> },
    { id: 2, name: "الدفع", icon: <CreditCard className="w-5 h-5" /> },
    { id: 3, name: "تأكيد الطلب", icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground dir-rtl pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Wizard Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-white text-center mb-8">
            إتمام الطلب بأمان
          </h1>

          <div className="relative flex justify-between max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full"></div>
            <div
              className="absolute top-1/2 right-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((s, i) => {
              const isActive = step >= s.id;
              const isCurrent = step === s.id;
              return (
                <div
                  key={s.id}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? "bg-primary border-slate-950 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-800 border-slate-950 text-slate-500"}`}
                  >
                    {s.icon}
                  </div>
                  <span
                    className={`text-xs font-bold ${isActive ? "text-primary" : "text-slate-500"}`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-4xl mx-auto rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto items-start">
          {/* Main Wizard Area */}
          <div className="flex-1 w-full">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6 md:p-8 rounded-3xl border border-white/5"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Truck className="text-primary w-6 h-6" /> تفاصيل التوصيل
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-colors"
                        placeholder="حسين أحمد"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-colors dir-ltr text-right"
                        placeholder="0550 00 00 00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        الولاية / المدينة{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="wilaya"
                        value={formData.wilaya}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-colors"
                        placeholder="الجزائر العاصمة"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        البلدية <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="baladiya"
                        value={formData.baladiya}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-colors"
                        placeholder="باب الزوار"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        العنوان التفصيلي وملاحظات التوصيل
                      </label>
                      <textarea
                        name="addressDetail"
                        rows={3}
                        value={formData.addressDetail}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:border-primary outline-none transition-colors resize-none"
                        placeholder="مثال: الحي الجامعي، العمارة ب، الطابق الثاني..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    {shopOrderMethod !== "CONFLICT" && (
                      <button
                        onClick={handleNextStep}
                        className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-bold hover:scale-105 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-300 flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95"
                      >
                        متابعة للدفع <ArrowRight className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6 md:p-8 rounded-3xl border border-white/5"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Wallet className="text-primary w-6 h-6" /> اختر طريقة الدفع
                  </h2>
                  <div className="space-y-4">
                    {shopOrderMethod !== "CARD" && (
                      <label
                        className={`block cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${paymentMethod === "COD" ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-white/10 bg-white/5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "COD" ? "border-primary bg-primary" : "border-slate-500"}`}
                          >
                            {paymentMethod === "COD" && (
                              <Check className="w-4 h-4 text-slate-950 font-bold" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg">
                              الدفع عند الاستلام (COD)
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                              قم بالدفع نقداً لمندوب التوصيل عند استلام طلبك.
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                            💵
                          </div>
                        </div>
                      </label>
                    )}

                    {shopOrderMethod !== "COD" && (
                      <label
                        className={`block cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${paymentMethod === "CARD" ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-white/10 bg-white/5 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "CARD" ? "border-primary bg-primary" : "border-slate-500"}`}
                          >
                            {paymentMethod === "CARD" && (
                              <Check className="w-4 h-4 text-slate-950 font-bold" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg">
                              البطاقة الذهبية / CIB
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                              ادفع إلكترونياً بأمان تام عبر بوابتنا المعتمدة.
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                            <CreditCard className="w-6 h-6" />
                          </div>
                        </div>

                        {/* Mock Card form appears if selected */}
                        <AnimatePresence>
                          {paymentMethod === "CARD" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-white/10"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <input
                                    type="text"
                                    placeholder="رقم البطاقة"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary outline-none dir-ltr"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="تاريخ الانتهاء MM/YY"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary outline-none dir-ltr"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    placeholder="CVC"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary outline-none dir-ltr"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </label>
                    )}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-white/5 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-bold hover:scale-105 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all duration-300 flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95"
                    >
                      مراجعة الطلب <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6 md:p-8 rounded-3xl border border-white/5"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-primary w-6 h-6" /> مراجعة
                    وتأكيد
                  </h2>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
                    <h3 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-3">
                      بيانات الشحن
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">الاسم:</span>{" "}
                        <span className="text-white font-semibold">
                          {formData.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">الهاتف:</span>{" "}
                        <span className="text-white font-semibold" dir="ltr">
                          {formData.phone}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">العنوان:</span>{" "}
                        <span className="text-white font-semibold">
                          {formData.wilaya}، {formData.baladiya}{" "}
                          {formData.addressDetail &&
                            `(${formData.addressDetail})`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-8">
                    <h3 className="font-bold text-slate-300 border-b border-white/10 pb-2 mb-3">
                      طريقة الدفع
                    </h3>
                    <p className="text-white font-semibold">
                      {paymentMethod === "COD"
                        ? "الدفع عند الاستلام"
                        : "البطاقة الذهبية / CIB"}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      disabled={submitting}
                      onClick={() => setStep(2)}
                      className="bg-white/5 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 hover:scale-105 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      رجوع
                    </button>
                    <button
                      disabled={submitting}
                      onClick={handleSubmitOrder}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-300 flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
                    >
                      {submitting
                        ? "جاري المعالجة..."
                        : "تأكيد الطلب النهائي 🚀"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Checkout Order Summary Sticky */}
          <div className="w-full lg:w-[350px] shrink-0 sticky top-28">
            <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden">
              <h2 className="text-lg font-black text-white mb-4 border-b border-white/10 pb-4">
                ملخص الطلب
              </h2>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-4">
                {cart?.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      {item.product?.images?.[0] && (
                        <img
                          src={`/${item.product.images[0]}`}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-200 line-clamp-1">
                        {item.product?.name}
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          الكمية: {item.quantity}
                        </span>
                        <span className="font-bold text-emerald-400">
                          {(item.price * item.quantity).toLocaleString()} د.ج
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>المجموع الفرعي</span>
                  <span className="text-white font-bold">
                    {cart?.totalPrice.toLocaleString()} د.ج
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>التوصيل</span>
                  <span className="text-emerald-400 font-bold">مجاناً</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-white">الإجمالي</span>
                  <span className="text-2xl font-black text-primary">
                    {cart?.totalPrice.toLocaleString()} د.ج
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> اتصال مشفر
              وآمن 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
