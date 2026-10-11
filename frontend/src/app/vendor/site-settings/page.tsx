"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  Package,
  Phone,
  Plus,
  Save,
  Settings2,
  Store,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/useAuthStore";
import productsService from "@/services/productsService";
import { StoreSettings } from "@/interfaces/ISettings";
import { currency, IProduct, OrderMethod, Shop } from "@/interfaces/IProduct";
import vendorService from "@/services/vendorService";

/* -------------------------------------------------------------------------
 * إعدادات موقع البائع — كل الحالة في مكان واحد.
 * اربطها مع الـ backend عبر:
 *   - جلب:  GET  /api/seller/settings   → setSettings(data)
 *   - حفظ:  PUT  /api/seller/settings   ← settings
 * ---------------------------------------------------------------------- */




function StoreSettingsPage() {
  const { shop, user } = useAuthStore()
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<IProduct[]>([])

  const initialSettings = {
    name: shop?.name || "متجري",
    slug: shop?.slug || "",
    tagline: shop?.tagline || "إلكترونيات وإكسسوارات أصلية بضمان حقيقي",
    description:
      shop?.description || "نوفّر منتجات مختارة بعناية مع ضمان رسمي، شحن سريع لكل الولايات، وخدمة عملاء تجيبك في دقائق.",
    settings: {
      branding: {
        logo: shop?.settings.branding.logo || "",
        coverImage: shop?.settings.branding.coverImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
        showTestimonials: shop?.settings.branding.showTestimonials || true,
        showFaqs: shop?.settings.branding.showFaqs || true,
        showStatistics: shop?.settings.branding.showStatistics || true,
      },
      contactInfo: {
        phoneNumber: shop?.settings.contactInfo.phoneNumber || "+213 555 00 11 22",
        whatsappNumber: shop?.settings.contactInfo.whatsappNumber || "+213 555 00 11 22",
        email: shop?.settings.contactInfo.email || "contact@elite-store.dz",
        storeAddress: shop?.settings.contactInfo.storeAddress || "الجزائر العاصمة، الجزائر",
        workingHours: shop?.settings.contactInfo.workingHours || "السبت – الخميس، 09:00 → 19:00",
        facebookProfile: shop?.settings.contactInfo.facebookProfile || "",
        instagramProfile: shop?.settings.contactInfo.instagramProfile || "",
      },
    },
    googleMapsLink: shop?.googleMapsLink || "",
    currency: shop?.currency || currency.SAR,
    orderMethod: (Array.isArray(shop?.orderMethod) ? shop?.orderMethod[0] : shop?.orderMethod) || OrderMethod.BOTH,
    isActive: shop?.isActive || true,
    products: shop?.products || [],
    faqs: shop?.faqs || [],
    shippingNote: shop?.shippingNote || "",
  };

  const [settings, setSettings] = useState<StoreSettings>(initialSettings);



  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await productsService.getShopProducts(shop?._id || "")
      setProducts(response)
      setSettings((prev) => ({
        ...prev,
        products: response && Array.isArray(response) && response.map((product: IProduct) => ({
          id: product._id,
          name: product.name,
          price: product.price.toString(),
          category: product.category,
          image: product.images[0],
          inStock: product.stock > 0,
          shop: shop?._id || "",
          slug: product.slug,
          description: product.description,
          isActive: product.isActive,
          salesCount: product.salesCount,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          faqs: product.faqs,
        })),
      }))
    } catch (err: Error | any) {
      console.log(err)
      setError("حدث خطأ في جلب المنتجات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [shop])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await vendorService.updateSettings(shop._id, settings)
      console.log(response, "succesufully saved settings")
      setSettings(response)
      setSavedAt(new Date().toISOString())
      setTimeout(() => setSavedAt(null), 3000)
    } catch (err: Error | any) {
      console.log(err.message || "حدث خطأ أثناء حفظ الإعدادات")
      setError(err.message || "حدث خطأ أثناء حفظ الإعدادات")
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="space-y-8 max-w-5xl mx-auto dir-rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
            <Settings2 className="w-8 h-8 text-emerald-700" /> إعدادات المتجر
          </h1>
          <p className="text-slate-500 font-medium">/shop/{settings.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={settings.isActive ? "default" : "secondary"}
            className={settings.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}
          >
            {settings.isActive ? "المتجر مفعل" : "المتجر معطل"}
          </Badge>
          <Button asChild variant="outline" size="sm" className="gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700">
            <Link href={`/shop/${settings.slug}`}>
              معاينة المتجر
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <Tabs defaultValue="general" dir="rtl">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
            <TabsTrigger value="general" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Store className="h-4 w-4" /> عام
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ImageIcon className="h-4 w-4" /> المظهر
            </TabsTrigger>
            {/* <TabsTrigger value="products" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Package className="h-4 w-4" /> المنتجات
            </TabsTrigger> */}
            <TabsTrigger value="contact" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Phone className="h-4 w-4" /> التواصل
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="h-4 w-4" /> الدفع والشحن
            </TabsTrigger>
          </TabsList>

          {/* عام */}
          <TabsContent value="general" className="space-y-6">
            <Panel title="معلومات المتجر" description="الاسم والوصف الظاهر للزوار في أعلى الصفحة.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="اسم المتجر">
                  <Input
                    value={settings.name}
                    onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
                <Field label="الرابط المختصر (slug)" hint="يُستعمل في رابط موقعك">
                  <Input
                    dir="ltr"
                    value={settings.slug}
                    onChange={(e) => setSettings((prev) => ({ ...prev, slug: e.target.value }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
              </div>
              <Field label="الجملة التعريفية">
                <Input
                  value={settings.tagline}
                  onChange={(e) => setSettings((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                />
              </Field>
              <Field label="وصف المتجر">
                <Textarea
                  rows={4}
                  value={settings.description}
                  onChange={(e) => setSettings((prev) => ({ ...prev, description: e.target.value }))}
                  className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                />
              </Field>
            </Panel>

            <Panel title="حالة الموقع" description="أوقف الموقع مؤقتاً عند الحاجة.">
              <ToggleRow
                label="الموقع مفتوح للزوار"
                description="عند الإيقاف تظهر رسالة الصيانة بدل المحتوى."
                checked={settings.isActive}
                onCheckedChange={(v) => setSettings((prev) => ({ ...prev, isActive: v }))}
              />
            </Panel>
          </TabsContent>

          {/* المظهر */}
          <TabsContent value="appearance" className="space-y-6">
            <Panel title="الشعار والغلاف" description="روابط الصور المستعملة في واجهة المتجر.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="رابط الشعار">
                  <Input
                    dir="ltr"
                    placeholder="https://..."
                    value={settings.settings.branding.logo}
                    onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, branding: { ...prev.settings.branding, logo: e.target.value } } }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
                <Field label="رابط صورة الغلاف">
                  <Input
                    dir="ltr"
                    placeholder="https://..."
                    value={settings.settings.branding.coverImage}
                    onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, branding: { ...prev.settings.branding, coverImage: e.target.value } } }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
              </div>
              {settings.settings.branding.coverImage && (
                <img
                  src={settings.settings.branding.coverImage}
                  alt="معاينة الغلاف"
                  className="h-40 w-full rounded-xl border border-slate-200 object-cover"
                />
              )}
            </Panel>

            <Panel title="التصميم" description="اختر لون الهوية وطريقة عرض المنتجات.">
              <ToggleRow
                label="إظهار قسم التقييمات"
                checked={settings.settings.branding.showTestimonials}
                onCheckedChange={(v) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, branding: { ...prev.settings.branding, showTestimonials: v } } }))}
              />
              <ToggleRow
                label="إظهار الأسئلة الشائعة"
                checked={settings.settings.branding.showFaqs}
                onCheckedChange={(v) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, branding: { ...prev.settings.branding, showFaqs: v } } }))}
              />
              <ToggleRow
                label="إظهار شريط الإحصائيات"
                checked={settings.settings.branding.showStatistics}
                onCheckedChange={(v) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, branding: { ...prev.settings.branding, showStatistics: v } } }))}
              />
            </Panel>
          </TabsContent>

          {/* التواصل */}
          <TabsContent value="contact" className="space-y-6">
            <Panel title="وسائل التواصل" description="تظهر في قسم التواصل وفي رأس الصفحة.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="رقم الهاتف">
                  <Input dir="ltr" value={settings.settings.contactInfo.phoneNumber} onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, phoneNumber: e.target.value } } }))} className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900" />
                </Field>
                <Field label="رقم واتساب">
                  <Input
                    dir="ltr"
                    value={settings.settings.contactInfo.whatsappNumber}
                    onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, whatsappNumber: e.target.value } } }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
                <Field label="البريد الإلكتروني">
                  <Input dir="ltr" value={settings.settings.contactInfo.email} onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, email: e.target.value } } }))} className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900" />
                </Field>
                <Field label="أوقات العمل">
                  <Input
                    value={settings.settings.contactInfo.workingHours}
                    onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, workingHours: e.target.value } } }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
              </div>
              <Field label="العنوان">
                <Input value={settings.settings.contactInfo.storeAddress} onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, storeAddress: e.target.value } } }))} className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900" />
              </Field>
            </Panel>

            <Panel title="الشبكات الاجتماعية" description="اتركها فارغة لإخفاء الأيقونة.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="فيسبوك">
                  <Input
                    dir="ltr"
                    placeholder="https://facebook.com/..."
                    value={settings.settings.contactInfo.facebookProfile}
                    onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, facebookProfile: e.target.value } } }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
                <Field label="إنستغرام">
                  <Input
                    dir="ltr"
                    placeholder="https://instagram.com/..."
                    value={settings.settings.contactInfo.instagramProfile}
                    onChange={(e) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, contactInfo: { ...prev.settings.contactInfo, instagramProfile: e.target.value } } }))}
                    className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                  />
                </Field>
              </div>
            </Panel>
          </TabsContent>

          {/* الدفع والشحن */}
          <TabsContent value="payment" className="space-y-6">
            <Panel title="طرق الدفع" description="فعّل الطرق التي تقبلها من زبائنك.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="العملة">
                  <Select value={settings.currency} onValueChange={(v) => setSettings((prev) => ({ ...prev, settings: { ...prev.settings, currency: v } }))}>
                    <SelectTrigger className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي</SelectItem>
                      <SelectItem value="AED">درهم اماراتي</SelectItem>
                      <SelectItem value="USD">دولار أمريكي</SelectItem>
                      <SelectItem value="EUR">أورو</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Separator className="bg-slate-200" />
              <Field label="طرق الدفع المدعومة">
                <Select
                  value={(typeof settings.orderMethod === 'string' ? settings.orderMethod : (Array.isArray(settings.orderMethod) ? settings.orderMethod[0] : "BOTH")) || "BOTH"}
                  onValueChange={(v) => {
                    setSettings((prev) => ({
                      ...prev,
                      orderMethod: v as any
                    }));
                  }}
                >
                  <SelectTrigger className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">الدفع عند الاستلام (كاش) فقط</SelectItem>
                    <SelectItem value="CARD">الدفع بالبطاقة فقط</SelectItem>
                    <SelectItem value="BOTH">كلا الطريقتين</SelectItem>
                    <SelectItem value="NONE">بدون دفع</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Panel>

            <Panel title="الشحن" description="معلومات التوصيل الظاهرة للزبون.">
              <Field label="ملاحظة الشحن">
                <Textarea
                  rows={3}
                  value={settings.shippingNote}
                  onChange={(e) => setSettings((prev) => ({ ...prev, shippingNote: e.target.value }))}
                  className="border-slate-200 focus-visible:ring-emerald-500 bg-white text-slate-900"
                />
              </Field>
            </Panel>
          </TabsContent>
        </Tabs>

        {/* شريط الحفظ */}
        <div className="sticky bottom-4 mt-8 z-40">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-lg">
            <span className="text-sm font-medium text-slate-600">
              {savedAt ? `تم الحفظ على الساعة ${savedAt}` : "لديك تغييرات غير محفوظة"}
            </span>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 hover:bg-slate-50 text-slate-700"
                onClick={() => {
                  setSettings(initialSettings);
                  setSavedAt(null);
                }}
              >
                إلغاء التغييرات
              </Button>
              <Button type="submit" disabled={saving} className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800 transition-colors">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div >
  );
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500 font-medium">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 font-medium">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
      <span>
        <span className="block text-base font-bold text-slate-900">{label}</span>
        {description && <span className="block text-sm text-slate-500 mt-1">{description}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}


export default StoreSettingsPage;