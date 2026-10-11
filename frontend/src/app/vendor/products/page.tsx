"use client";

import productsService from "@/services/productsService";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { IProduct, CreateProductInput } from "@/interfaces/IProduct";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Edit2, Trash2, Package, Tag, TrendingUp,
  AlertCircle, X, Check, SearchX, UploadCloud
} from "lucide-react";
import axios from "axios";
import { GLOBAL_CATEGORIES } from "@/constants/categories";

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  // States للتعامل مع عدة صور للمنتج
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    price: 0,
    discountPrice: undefined,
    stock: 0,
    category: "",
    description: "",
    tagline: "",
    longDescription: "",
    specs: [],
    highlights: [],
    options: [],
    images: [],
    faqs: [],
    offers: [],
  });
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [optionInputValues, setOptionInputValues] = useState<{ [key: number]: string }>({});

  const fetchProducts = async () => {
    if (!user?.shopId) return;
    setLoading(true);
    setError(null);
    try {
      const productsData = await productsService.getShopProducts(user?.shopId);
      setProducts(productsData.products || []);
    } catch (err: any) {
      setError(err.message || "failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.shopId) fetchProducts();
  }, [user?.shopId]);

  const handelOpenModal = () => {
    setEditingProduct(null);
    setSelectedFiles([]);
    setImagePreviews([]);
    setOptionInputValues({});
    setFormData({
      name: "", price: 0, discountPrice: undefined, stock: 0,
      category: "", description: "", tagline: "", longDescription: "",
      specs: [], highlights: [], options: [], images: [], faqs: [],
    });
    setIsOpenModal(true);
  };

  const handelOpenEditModal = (product: IProduct) => {
    setEditingProduct(product);
    setSelectedFiles([]);
    setOptionInputValues({});
    const existingImages = product.images || [];
    setImagePreviews(existingImages);
    setFormData({
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice ?? undefined,
      stock: product.stock,
      category: product.category,
      description: product.description,
      tagline: product.tagline || "",
      longDescription: product.longDescription || "",
      specs: product.specs || [],
      highlights: product.highlights || [],
      options: product.options || [],
      images: existingImages,
      faqs: product.faqs || [],
    });
    setIsOpenModal(true);
  };

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));

    const existingImagesCount = formData.images?.length || 0;

    if (indexToRemove < existingImagesCount) {
      setFormData(prev => ({
        ...prev,
        images: prev.images?.filter((_, index) => index !== indexToRemove)
      }));
    } else {
      const fileIndexToRemove = indexToRemove - existingImagesCount;
      setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndexToRemove));
    }
  };

  const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpjl5q5ef";
    const presetName = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME || "ymndhnsz";

    const uploadPromises = files.map(file => {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", presetName);

      return axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        data
      );
    });

    const responses = await Promise.all(uploadPromises);
    return responses.map(res => res.data.secure_url);
  };

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSubmit(true);
    try {
      let updatedImages = [...(formData.images || [])];

      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadMultipleToCloudinary(selectedFiles);
        updatedImages = [...updatedImages, ...uploadedUrls];
      }

      const finalPayload = {
        ...formData,
        images: updatedImages,
        shopId: user?.shopId,
      };

      if (editingProduct) {
        await productsService.updateProduct(editingProduct._id, finalPayload);
      } else {
        await productsService.addProduct(finalPayload);
      }

      setIsOpenModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || "failed to submit form");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handelDeleteProduct = async (productId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await productsService.deleteProduct(productId);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || "فشلت عملية حذف المنتج");
    }
  };

  // Handlers for dynamic arrays
  
  // --- FAQs Handlers ---
  const handleAddFaq = () => {
    setFormData({ ...formData, faqs: [...(formData.faqs || []), { name: "", value: "" }] });
  };
  const handleUpdateFaq = (index: number, field: 'name' | 'value', val: string) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs[index][field] = val;
    setFormData({ ...formData, faqs: newFaqs });
  };
  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs.splice(index, 1);
    setFormData({ ...formData, faqs: newFaqs });
  };

  // --- Offers Handlers ---
  const handleAddOffer = () => {
    setFormData({ ...formData, offers: [...(formData.offers || []), { name: "", value: "" }] });
  };
  const handleUpdateOffer = (index: number, field: 'name' | 'value' | 'endsAt', val: string) => {
    const newOffers = [...(formData.offers || [])] as any[];
    newOffers[index][field] = val;
    setFormData({ ...formData, offers: newOffers });
  };
  const handleRemoveOffer = (index: number) => {
    const newOffers = [...(formData.offers || [])];
    newOffers.splice(index, 1);
    setFormData({ ...formData, offers: newOffers });
  };

  const handleAddSpec = () => {
    setFormData({ ...formData, specs: [...(formData.specs || []), { name: "", value: "" }] });
  };
  const handleUpdateSpec = (index: number, field: 'name' | 'value', val: string) => {
    const newSpecs = [...(formData.specs || [])];
    newSpecs[index][field] = val;
    console.log("newSpecs", newSpecs);
    console.log("formData", formData.specs);

    setFormData({ ...formData, specs: newSpecs });
  };
  const handleRemoveSpec = (index: number) => {
    setFormData({ ...formData, specs: formData?.specs?.filter((_, i) => i !== index) });
  };

  const handleAddHighlight = () => {
    setFormData({ ...formData, highlights: [...(formData.highlights || []), { name: "", value: "" }] });
  };
  const handleUpdateHighlight = (index: number, field: 'name' | 'value', val: string) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights[index][field] = val;
    console.log("newHighlights", newHighlights);
    console.log("formData", formData.highlights);
    setFormData({ ...formData, highlights: newHighlights });
  };
  const handleRemoveHighlight = (index: number) => {
    setFormData({ ...formData, highlights: (formData.highlights || []).filter((_, i) => i !== index) });
  };

  const handleAddOption = () => {
    setFormData({ ...formData, options: [...(formData.options || []), { name: "", values: [] }] });
  };
  const handleUpdateOptionName = (index: number, val: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index].name = val;
    setFormData({ ...formData, options: newOptions });
  };
  const handleAddOptionValue = (index: number, val: string) => {
    if (!val || !val.trim()) return;
    const newOptions = [...(formData.options || [])];
    if (!newOptions[index].values.includes(val.trim())) {
      newOptions[index].values.push(val.trim());
      setFormData({ ...formData, options: newOptions });
    }
  };
  const handleRemoveOptionValue = (optIndex: number, valIndex: number) => {
    const newOptions = [...(formData.options || [])];
    newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex);
    setFormData({ ...formData, options: newOptions });
  };
  const handleRemoveOption = (index: number) => {
    setFormData({ ...formData, options: (formData.options || []).filter((_, i) => i !== index) });
    const newInputs = { ...optionInputValues };
    delete newInputs[index];
    setOptionInputValues(newInputs);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 md:p-8 dir-rtl space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-emerald-700" /> إدارة المنتجات
          </h1>
          <p className="text-slate-500 font-medium">أضف، عدل، وراقب مخزون منتجاتك بسهولة.</p>
        </div>
        <button
          onClick={handelOpenModal}
          className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 hover:bg-emerald-800 transition-all duration-300"
        >
          <Plus className="w-5 h-5" /> إضافة منتج جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200 transition-all duration-300 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700"><Package className="w-7 h-7" /></div>
          <div><p className="text-sm text-slate-500 font-bold mb-1">إجمالي المنتجات</p><p className="text-2xl font-black text-slate-900">{products.length}</p></div>
        </div>
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 hover:border-teal-200 transition-all duration-300 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700"><Tag className="w-7 h-7" /></div>
          <div><p className="text-sm text-slate-500 font-bold mb-1">متوسط السعر</p><p className="text-2xl font-black text-slate-900">{products.length ? Math.round(products.reduce((a, b) => a + b.price, 0) / products.length).toLocaleString() : 0} د.ج</p></div>
        </div>
        <div className="bg-white shadow-sm p-6 rounded-3xl border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200 transition-all duration-300 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700"><TrendingUp className="w-7 h-7" /></div>
          <div><p className="text-sm text-slate-500 font-bold mb-1">إجمالي المخزون</p><p className="text-2xl font-black text-slate-900">{products.reduce((a, b) => a + b.stock, 0)} وحدة</p></div>
        </div>
      </div>

      {/* Data Table Area */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-12 pl-4 text-sm font-medium focus:border-emerald-500 outline-none transition-colors text-slate-900"
            />
          </div>
          <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-md">
            <Filter className="w-4 h-4" /> تصفية
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4"><SearchX className="w-10 h-10 text-slate-400" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد منتجات</h3>
              <p className="text-slate-500">لم يتم العثور على أي منتجات مطابقة لعملية البحث.</p>
            </div>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-5 whitespace-nowrap">اسم المنتج</th>
                  <th className="p-5 whitespace-nowrap">السعر الأساسي</th>
                  <th className="p-5 whitespace-nowrap">سعر التخفيض</th>
                  <th className="p-5 whitespace-nowrap">المخزون</th>
                  <th className="p-5 whitespace-nowrap">التصنيف</th>
                  <th className="p-5 whitespace-nowrap text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-emerald-50/30 transition-all duration-300 group border-b border-slate-50 hover:border-emerald-100">
                    <td className="p-5 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <span className="line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-5 font-black text-slate-700">{product.price.toLocaleString()} د.ج</td>
                    <td className="p-5 font-black text-emerald-600">{product.discountPrice ? `${product.discountPrice.toLocaleString()} د.ج` : '-'}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                        {product.stock} وحدة
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
                        {product.category || "عام"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => handelOpenEditModal(product)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:scale-110 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md" title="تعديل">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handelDeleteProduct(product._id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:scale-110 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpenModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {editingProduct ? <Edit2 className="w-5 h-5 text-emerald-700" /> : <Plus className="w-5 h-5 text-emerald-700" />}
                  {editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
                </h2>
                <button onClick={() => setIsOpenModal(false)} className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form id="productForm" onSubmit={handelSubmit} className="space-y-8">

                  {/* قسم صور المنتج المتعددة */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">صور المنتج <span className="text-rose-500">*</span></label>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                      {/* عرض الصور المعاينة */}
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                          <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-colors"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* زر إضافة صور جديدة */}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer group shadow-sm hover:shadow-md">
                        <div className="p-2 bg-white group-hover:bg-emerald-100 rounded-xl text-slate-400 group-hover:text-emerald-700 transition-all duration-300 group-hover:scale-110">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-800 transition-colors">إضافة صور</span>
                        <input type="file" accept="image/*" multiple onChange={handleImagesSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* الأساسيات */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنتج <span className="text-rose-500">*</span></label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900" placeholder="مثال: حذاء رياضي نايك" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">الشعار (Tagline) <span className="text-rose-500">*</span></label>
                      <input type="text" required value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900" placeholder="مثال: مريح جداً ومناسب للاستخدام اليومي" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">السعر الأساسي (د.ج) <span className="text-rose-500">*</span></label>
                      <input type="number" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900 dir-ltr text-right" placeholder="0" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">سعر التخفيض (اختياري)</label>
                      <input type="number" min="0" value={formData.discountPrice || ''} onChange={e => setFormData({ ...formData, discountPrice: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900 dir-ltr text-right" placeholder="السعر بعد الخصم" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">الكمية المتوفرة (المخزون) <span className="text-rose-500">*</span></label>
                      <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900 dir-ltr text-right" placeholder="0" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">التصنيف <span className="text-rose-500">*</span></label>
                      <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900">
                        <option value="" disabled>اختر التصنيف...</option>
                        {GLOBAL_CATEGORIES.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* الوصف */}
                  <div className="space-y-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">وصف قصير <span className="text-rose-500">*</span></label>
                      <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900 resize-none" placeholder="وصف موجز للمنتج..."></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">وصف تفصيلي (Long Description) <span className="text-rose-500">*</span></label>
                      <textarea required rows={5} value={formData.longDescription} onChange={e => setFormData({ ...formData, longDescription: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none transition-colors text-slate-900 resize-none" placeholder="اكتب وصفاً جذاباً وتفصيلياً لمنتجك يبرز أهم مميزاته..."></textarea>
                    </div>
                  </div>

                  {/* المواصفات والميزات */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">

                    {/* المواصفات Specs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-bold text-slate-700">المواصفات (Specs) <span className="text-rose-500">*</span></label>
                        <button type="button" onClick={handleAddSpec} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> إضافة</button>
                      </div>
                      <div className="space-y-3">
                        {formData.specs?.length === 0 && <p className="text-xs text-slate-500 text-center py-2 bg-white rounded-lg border border-dashed border-slate-200">لا توجد مواصفات مضافة</p>}
                        {formData.specs?.map((spec, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                            <input required type="text" value={spec.name} onChange={e => handleUpdateSpec(idx, 'name', e.target.value)} placeholder="الاسم (مثال: اللون)" className="w-1/3 bg-transparent text-xs text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 px-1 pb-1" />
                            <input required type="text" value={spec.value} onChange={e => handleUpdateSpec(idx, 'value', e.target.value)} placeholder="القيمة (مثال: أزرق)" className="w-1/2 bg-transparent text-xs text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 px-1 pb-1 flex-1" />
                            <button type="button" onClick={() => handleRemoveSpec(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* الميزات Highlights */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-bold text-slate-700">أبرز الميزات (Highlights)</label>
                        <button type="button" onClick={handleAddHighlight} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> إضافة</button>
                      </div>
                      <div className="space-y-3">
                        {(!formData.highlights || formData.highlights.length === 0) && <p className="text-xs text-slate-500 text-center py-2 bg-white rounded-lg border border-dashed border-slate-200">لا توجد ميزات مضافة</p>}
                        {formData.highlights?.map((highlight, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                            <input type="text" value={highlight.name} onChange={e => handleUpdateHighlight(idx, 'name', e.target.value)} placeholder="الاسم" className="w-1/3 bg-transparent text-xs text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 px-1 pb-1" />
                            <input type="text" value={highlight.value} onChange={e => handleUpdateHighlight(idx, 'value', e.target.value)} placeholder="القيمة" className="w-1/2 bg-transparent text-xs text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 px-1 pb-1 flex-1" />
                            <button type="button" onClick={() => handleRemoveHighlight(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  
                  {/* FAQs */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700">الأسئلة الشائعة (FAQs)</label>
                        <p className="text-xs text-slate-500 mt-1">أضف أسئلة يتكرر طرحها من قبل العملاء مع إجاباتها.</p>
                      </div>
                      <button type="button" onClick={handleAddFaq} className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg"><Plus className="w-3 h-3" /> أضف سؤالاً</button>
                    </div>
                    <div className="space-y-3">
                      {(!formData.faqs || formData.faqs.length === 0) && <p className="text-xs text-slate-500 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">لا توجد أسئلة مضافة</p>}
                      {formData.faqs?.map((faq, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                          <input type="text" value={faq.name} onChange={e => handleUpdateFaq(idx, 'name', e.target.value)} placeholder="السؤال؟" className="w-1/3 bg-transparent text-xs text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 px-1 pb-1" />
                          <input type="text" value={faq.value} onChange={e => handleUpdateFaq(idx, 'value', e.target.value)} placeholder="الإجابة..." className="w-1/2 bg-transparent text-xs text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 px-1 pb-1 flex-1" />
                          <button type="button" onClick={() => handleRemoveFaq(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offers */}
                  <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-bold text-rose-700">عروض المنتج (Offers)</label>
                        <p className="text-xs text-rose-500 mt-1">أضف عروضاً خاصة لهذا المنتج (مثال: اشتري 1 واحصل على 1).</p>
                      </div>
                      <button type="button" onClick={handleAddOffer} className="text-xs text-rose-700 font-bold hover:underline flex items-center gap-1 px-3 py-1.5 bg-rose-100 rounded-lg"><Plus className="w-3 h-3" /> أضف عرضاً</button>
                    </div>
                    <div className="space-y-3">
                      {(!formData.offers || formData.offers.length === 0) && <p className="text-xs text-rose-400 text-center py-4 bg-white rounded-xl border border-dashed border-rose-200">لا توجد عروض مضافة</p>}
                      {formData.offers?.map((offer, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-rose-200">
                          <input type="text" value={offer.name} onChange={e => handleUpdateOffer(idx, 'name', e.target.value)} placeholder="اسم العرض" className="w-1/3 bg-transparent text-xs text-slate-900 outline-none border-b border-rose-200 focus:border-rose-500 px-1 pb-1" />
                          <input type="text" value={offer.value} onChange={e => handleUpdateOffer(idx, 'value', e.target.value)} placeholder="وصف أو قيمة العرض" className="w-1/3 bg-transparent text-xs text-slate-900 outline-none border-b border-rose-200 focus:border-rose-500 px-1 pb-1" />
                          <input type="date" value={offer.endsAt ? new Date(offer.endsAt).toISOString().split('T')[0] : ''} onChange={e => handleUpdateOffer(idx, 'endsAt', e.target.value)} className="w-1/4 bg-transparent text-xs text-slate-900 outline-none border-b border-rose-200 focus:border-rose-500 px-1 pb-1" />
                          <button type="button" onClick={() => handleRemoveOffer(idx)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* الخيارات Options */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700">الخيارات (Options)</label>
                        <p className="text-xs text-slate-500 mt-1">مثل: الألوان أو المقاسات المتاحة للمنتج.</p>
                      </div>
                      <button type="button" onClick={handleAddOption} className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg"><Plus className="w-3 h-3" /> إضافة خيار جديد</button>
                    </div>

                    <div className="space-y-4">
                      {(!formData.options || formData.options.length === 0) && <p className="text-xs text-slate-500 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">لا توجد خيارات مضافة</p>}
                      {formData.options?.map((opt, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3 relative">
                          <button type="button" onClick={() => handleRemoveOption(idx)} className="absolute top-3 left-3 text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">اسم الخيار</label>
                            <input type="text" value={opt.name} onChange={e => handleUpdateOptionName(idx, e.target.value)} placeholder="مثال: اللون أو المقاس" className="w-full md:w-1/2 bg-transparent text-sm text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 pb-1" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">القيم</label>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {opt.values.map((v, vIdx) => (
                                <span key={vIdx} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                  {v}
                                  <button type="button" onClick={() => handleRemoveOptionValue(idx, vIdx)} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={optionInputValues[idx] || ''}
                                onChange={e => setOptionInputValues({ ...optionInputValues, [idx]: e.target.value })}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddOptionValue(idx, optionInputValues[idx]);
                                    setOptionInputValues({ ...optionInputValues, [idx]: '' });
                                  }
                                }}
                                placeholder="اكتب قيمة واضغط Enter أو إضافة"
                                className="flex-1 bg-transparent text-sm text-slate-900 outline-none border-b border-slate-200 focus:border-emerald-500 pb-1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  handleAddOptionValue(idx, optionInputValues[idx]);
                                  setOptionInputValues({ ...optionInputValues, [idx]: '' });
                                }}
                                className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors shrink-0"
                              >
                                إضافة
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </form>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsOpenModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors">
                  إلغاء
                </button>
                <button type="submit" form="productForm" disabled={isLoadingSubmit} className="bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-500/20">
                  {isLoadingSubmit ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Check className="w-5 h-5" />}
                  {editingProduct ? "حفظ التعديلات" : "إضافة المنتج الآن"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}