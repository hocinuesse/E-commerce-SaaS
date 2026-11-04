/**
 * ==========================================================
 *  سكريبت البيانات الوهمية (Seed Script)
 *  يقوم بإنشاء مستخدمين، متاجر، منتجات، تقييمات، طلبات
 *  بحيث يظهر الموقع كامل و حيّ
 * ==========================================================
 *  التشغيل: npx ts-node-dev src/seed.ts
 * ==========================================================
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import userModel from "./models/userModel";
import shopModel from "./models/shopModel";
import productModel from "./models/productModel";
import orderModel from "./models/orderModel";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("🔴 MONGO_URI is not defined");
  process.exit(1);
}

// ============== كلمة السر الموحدة ==============
const DEFAULT_PASSWORD = "Test@1234";

// ============== بيانات المستخدمين ==============
const usersData = [
  // -------- Admin --------
  {
    name: "أدمن المنصة",
    email: "admin@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0550000001",
    role: "admin",
  },
  // -------- Vendors --------
  {
    name: "محمد بوحلاب",
    email: "vendor1@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0660000001",
    role: "vendor",
    vendorInfo: { storeName: "تقنية بلس", commercialRegister: "CR-001", isVerified: true },
  },
  {
    name: "أمين مراد",
    email: "vendor2@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0660000002",
    role: "vendor",
    vendorInfo: { storeName: "عالم الموضة", commercialRegister: "CR-002", isVerified: true },
  },
  {
    name: "ياسين خليل",
    email: "vendor3@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0660000003",
    role: "vendor",
    vendorInfo: { storeName: "بيت الرياضة", commercialRegister: "CR-003", isVerified: true },
  },
  {
    name: "نور الدين حمادي",
    email: "vendor4@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0660000004",
    role: "vendor",
    vendorInfo: { storeName: "مطبخ الشيف", commercialRegister: "CR-004", isVerified: true },
  },
  // -------- Clients --------
  {
    name: "خالد بن عيسى",
    email: "client1@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0770000001",
    role: "client",
  },
  {
    name: "فاطمة الزهراء",
    email: "client2@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0770000002",
    role: "client",
  },
  {
    name: "سارة محمدي",
    email: "client3@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0770000003",
    role: "client",
  },
  {
    name: "عبد الرحمن قاسمي",
    email: "client4@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0770000004",
    role: "client",
  },
  {
    name: "ليلى بوزيان",
    email: "client5@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0770000005",
    role: "client",
  },
];

// ============== بيانات المتاجر ==============
const shopsData = [
  {
    name: "تقنية بلس",
    slug: "tech-plus",
    tagline: "أحدث المنتجات التقنية بأفضل الأسعار",
    description: "متجر متخصص في الإلكترونيات والأجهزة الذكية، نوفر أحدث الهواتف واللابتوبات والإكسسوارات التقنية بأسعار تنافسية مع ضمان وخدمة ما بعد البيع.",
    currency: "SAR",
    faqs: [
      { name: "ما هي سياسة الإرجاع؟", value: "يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الشراء بشرط أن يكون بحالته الأصلية." },
      { name: "هل التوصيل مجاني؟", value: "نعم، التوصيل مجاني لجميع الطلبات فوق 5000 دج." },
      { name: "هل المنتجات أصلية؟", value: "نعم، جميع منتجاتنا أصلية 100% مع ضمان رسمي." },
    ],
    settings: {
      branding: {
        logo: "https://img.icons8.com/3d-fluency/94/laptop.png",
        showTestimonials: true,
        showFaqs: true,
        showStatistics: true,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
      },
      contactInfo: {
        whatsappNumber: "+213550000001",
        instagramProfile: "https://instagram.com/techplus_dz",
        facebookProfile: "https://facebook.com/techplus.dz",
        storeAddress: "شارع ديدوش مراد، الجزائر العاصمة",
        phoneNumber: "0550000001",
        email: "contact@techplus.dz",
        workingHours: "09:00 - 21:00 كل يوم",
      },
    },
    googleMapsLink: "https://maps.google.com/?q=36.7538,3.0588",
    orderMethod: "BOTH",
    rating: 4.7,
    ratingCount: 45,
    viewCount: 1250,
    isActive: true,
    status: "ACTIVE",
    shippingNote: "التوصيل خلال 2-4 أيام عمل لجميع الولايات.",
    reviews: [
      { name: "خالد", comment: "متجر ممتاز وخدمة سريعة!", rating: 5, createdAt: new Date("2026-08-15") },
      { name: "فاطمة", comment: "المنتجات أصلية والتوصيل سريع", rating: 4, createdAt: new Date("2026-09-01") },
      { name: "أحمد", comment: "تعامل راقي وأسعار معقولة", rating: 5, createdAt: new Date("2026-09-20") },
    ],
  },
  {
    name: "عالم الموضة",
    slug: "fashion-world",
    tagline: "أناقتك تبدأ من هنا",
    description: "متجر متخصص في الأزياء الرجالية والنسائية، نقدم أحدث الماركات العالمية مع خدمة توصيل سريعة وضمان الجودة.",
    currency: "SAR",
    faqs: [
      { name: "كيف أختار المقاس المناسب؟", value: "نوفر جدول مقاسات مفصل في كل منتج، كما يمكنك التواصل معنا للمساعدة." },
      { name: "هل يمكنني استبدال المنتج؟", value: "نعم، يمكنك الاستبدال خلال 7 أيام من الاستلام." },
    ],
    settings: {
      branding: {
        logo: "https://img.icons8.com/3d-fluency/94/clothes.png",
        showTestimonials: true,
        showFaqs: true,
        showStatistics: true,
        coverImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200",
      },
      contactInfo: {
        whatsappNumber: "+213660000002",
        instagramProfile: "https://instagram.com/fashion_world_dz",
        facebookProfile: "https://facebook.com/fashionworld.dz",
        storeAddress: "حي الأمير عبد القادر، وهران",
        phoneNumber: "0660000002",
        email: "info@fashionworld.dz",
        workingHours: "10:00 - 22:00 كل يوم",
      },
    },
    googleMapsLink: "https://maps.google.com/?q=35.6969,−0.6331",
    orderMethod: "COD",
    rating: 4.5,
    ratingCount: 32,
    viewCount: 980,
    isActive: true,
    status: "ACTIVE",
    shippingNote: "التوصيل خلال 3-5 أيام عمل. التغليف فاخر ومضمون.",
    reviews: [
      { name: "سارة", comment: "ملابس أنيقة وجودة عالية!", rating: 5, createdAt: new Date("2026-07-10") },
      { name: "ليلى", comment: "الأسعار ممتازة مقارنة بالسوق", rating: 4, createdAt: new Date("2026-08-22") },
    ],
  },
  {
    name: "بيت الرياضة",
    slug: "sport-house",
    tagline: "كل ما تحتاجه للرياضة في مكان واحد",
    description: "متجر رياضي شامل يوفر ملابس وأحذية ومعدات رياضية من أفضل الماركات العالمية مثل Nike و Adidas و Puma.",
    currency: "SAR",
    faqs: [
      { name: "هل المنتجات أصلية؟", value: "نعم، نحن وكيل معتمد لعدة ماركات عالمية." },
      { name: "ما مدة الضمان؟", value: "ضمان 6 أشهر على جميع المنتجات ضد عيوب التصنيع." },
    ],
    settings: {
      branding: {
        logo: "https://img.icons8.com/3d-fluency/94/football.png",
        showTestimonials: true,
        showFaqs: true,
        showStatistics: false,
        coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200",
      },
      contactInfo: {
        whatsappNumber: "+213660000003",
        instagramProfile: "https://instagram.com/sport_house_dz",
        storeAddress: "طريق قسنطينة، سطيف",
        phoneNumber: "0660000003",
        email: "shop@sporthouse.dz",
        workingHours: "08:00 - 20:00 من السبت إلى الخميس",
      },
    },
    googleMapsLink: "https://maps.google.com/?q=36.1898,5.4108",
    orderMethod: "BOTH",
    rating: 4.3,
    ratingCount: 28,
    viewCount: 750,
    isActive: true,
    status: "ACTIVE",
    shippingNote: "توصيل سريع خلال 2-3 أيام.",
    reviews: [
      { name: "عبد الرحمن", comment: "أفضل متجر رياضي في الجزائر!", rating: 5, createdAt: new Date("2026-09-05") },
      { name: "كريم", comment: "منتجات ممتازة وأسعار معقولة", rating: 4, createdAt: new Date("2026-09-15") },
    ],
  },
  {
    name: "مطبخ الشيف",
    slug: "chef-kitchen",
    tagline: "أدوات المطبخ الاحترافية",
    description: "متجر متخصص في أدوات المطبخ والأجهزة المنزلية، نوفر كل ما تحتاجه لمطبخ عصري ومجهز بالكامل.",
    currency: "SAR",
    faqs: [
      { name: "هل تتوفرون على قطع الغيار؟", value: "نعم، نوفر قطع غيار لجميع الأجهزة المباعة لدينا." },
      { name: "هل يوجد تقسيط؟", value: "نعم، نوفر خيار التقسيط بدون فوائد على المشتريات فوق 10000 دج." },
    ],
    settings: {
      branding: {
        logo: "https://img.icons8.com/3d-fluency/94/chef-hat.png",
        showTestimonials: true,
        showFaqs: true,
        showStatistics: true,
        coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200",
      },
      contactInfo: {
        whatsappNumber: "+213660000004",
        instagramProfile: "https://instagram.com/chef_kitchen_dz",
        facebookProfile: "https://facebook.com/chefkitchen.dz",
        storeAddress: "شارع بلوزداد، الجزائر العاصمة",
        phoneNumber: "0660000004",
        email: "hello@chefkitchen.dz",
        workingHours: "09:00 - 19:00 من السبت إلى الخميس",
      },
    },
    googleMapsLink: "https://maps.google.com/?q=36.7649,3.0453",
    orderMethod: "COD",
    rating: 4.6,
    ratingCount: 19,
    viewCount: 520,
    isActive: true,
    status: "ACTIVE",
    shippingNote: "التوصيل خلال 3-6 أيام عمل حسب الولاية.",
    reviews: [
      { name: "أم أحمد", comment: "أدوات مطبخ ممتازة وجودة عالية!", rating: 5, createdAt: new Date("2026-08-01") },
    ],
  },
];

// ============== بيانات المنتجات ==============
// سيتم ربطها بالمتاجر عند التنفيذ
const productsPerShop = [
  // ======= متجر تقنية بلس (إلكترونيات) =======
  [
    {
      name: "هاتف سامسونج Galaxy S24 Ultra",
      tagline: "أقوى هاتف ذكي من سامسونج",
      description: "هاتف Galaxy S24 Ultra بكاميرا 200MP وشاشة AMOLED 6.8 بوصة ومعالج Snapdragon 8 Gen 3",
      longDescription: "يتميز هاتف Samsung Galaxy S24 Ultra بتصميم فاخر من التيتانيوم، شاشة Dynamic AMOLED 2X بحجم 6.8 بوصة، كاميرا رئيسية بدقة 200 ميجابكسل مع ذكاء اصطناعي متقدم، معالج Snapdragon 8 Gen 3، بطارية 5000 مللي أمبير، وقلم S Pen مدمج. يدعم الهاتف تقنية Galaxy AI لترجمة المكالمات وتحرير الصور بالذكاء الاصطناعي.",
      price: 145000,
      category: "إلكترونيات",
      discountPrice: 129900,
      images: ["https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-0.jpg"],
      stock: 25,
      badge: "الأكثر مبيعاً",
      rating: 4.8,
      ratingCount: 56,
      salesCount: 120,
      options: [
        { name: "اللون", values: ["أسود تيتانيوم", "رمادي تيتانيوم", "بنفسجي تيتانيوم"] },
        { name: "السعة", values: ["256GB", "512GB", "1TB"] },
      ],
      specs: [
        { name: "الشاشة", value: "6.8 بوصة Dynamic AMOLED 2X" },
        { name: "المعالج", value: "Snapdragon 8 Gen 3" },
        { name: "الرام", value: "12 جيجا" },
        { name: "البطارية", value: "5000 مللي أمبير" },
        { name: "الكاميرا", value: "200MP + 50MP + 12MP + 10MP" },
      ],
      highlights: [
        { name: "Galaxy AI", value: "ترجمة فورية وتحرير ذكي للصور" },
        { name: "S Pen", value: "قلم ذكي مدمج" },
        { name: "شحن سريع", value: "45 واط سلكي + 15 واط لاسلكي" },
      ],
      offers: [
        { name: "خصم خاص", value: "وفّر 15,100 دج على الشراء الآن!", endsAt: new Date("2026-12-31") },
        { name: "هدية مجانية", value: "غطاء حماية أصلي مجاناً", endsAt: new Date("2026-11-15") },
      ],
      reviews: [
        { name: "خالد", rating: 5, comment: "هاتف خرافي! الكاميرا مذهلة والأداء سلس جداً", createdAt: new Date("2026-09-01") },
        { name: "أحمد", rating: 4, comment: "ممتاز لكن السعر مرتفع شوية", createdAt: new Date("2026-09-10") },
        { name: "سارة", rating: 5, comment: "أفضل هاتف اشتريته في حياتي", createdAt: new Date("2026-09-20") },
      ],
    },
    {
      name: "لابتوب MacBook Pro M3",
      tagline: "قوة استثنائية للمحترفين",
      description: "MacBook Pro بمعالج M3 Pro وشاشة Liquid Retina XDR مقاس 14 بوصة",
      longDescription: "أحدث لابتوب من Apple بمعالج M3 Pro القوي، ذاكرة RAM 18GB، شاشة Liquid Retina XDR ساطعة ودقيقة، بطارية تدوم حتى 17 ساعة، ونظام تبريد متطور. مثالي للمبرمجين والمصممين وصناع المحتوى.",
      price: 285000,
      category: "إلكترونيات",
      discountPrice: 265000,
      images: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840"],
      stock: 10,
      badge: "جديد",
      rating: 4.9,
      ratingCount: 23,
      salesCount: 45,
      options: [
        { name: "اللون", values: ["فضي", "رمادي فلكي"] },
        { name: "السعة", values: ["512GB SSD", "1TB SSD"] },
      ],
      specs: [
        { name: "المعالج", value: "Apple M3 Pro" },
        { name: "الشاشة", value: '14.2" Liquid Retina XDR' },
        { name: "الرام", value: "18 جيجا موحدة" },
        { name: "البطارية", value: "حتى 17 ساعة" },
      ],
      highlights: [
        { name: "أداء خارق", value: "معالج M3 Pro بـ 12 نواة" },
        { name: "شاشة مذهلة", value: "سطوع يصل إلى 1600 شمعة" },
      ],
      reviews: [
        { name: "محمد", rating: 5, comment: "أفضل لابتوب للبرمجة والتصميم!", createdAt: new Date("2026-08-25") },
      ],
    },
    {
      name: "سماعات AirPods Pro 2",
      tagline: "صوت نقي وعزل ذكي",
      description: "سماعات Apple AirPods Pro 2 مع شريحة H2 وإلغاء ضوضاء فعّال",
      longDescription: "سماعات لاسلكية بتقنية إلغاء الضوضاء النشط المتقدمة، شريحة H2 الجديدة، صوت مكاني مخصص، مقاومة للعرق والماء (IPX4)، بطارية تدوم حتى 6 ساعات مع علبة الشحن حتى 30 ساعة.",
      price: 35000,
      category: "إلكترونيات",
      images: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=572&hei=572"],
      stock: 50,
      rating: 4.6,
      ratingCount: 89,
      salesCount: 200,
      specs: [
        { name: "الشريحة", value: "Apple H2" },
        { name: "عزل الضوضاء", value: "ANC + Transparency" },
        { name: "البطارية", value: "6 ساعات (30 مع العلبة)" },
        { name: "مقاومة الماء", value: "IPX4" },
      ],
      highlights: [
        { name: "إلغاء ضوضاء", value: "ضعف الأداء مقارنة بالجيل السابق" },
      ],
      reviews: [
        { name: "ليلى", rating: 5, comment: "جودة صوت رائعة والعزل ممتاز", createdAt: new Date("2026-09-05") },
        { name: "عمر", rating: 4, comment: "سماعات ممتازة لكن غالية شوية", createdAt: new Date("2026-09-12") },
      ],
    },
    {
      name: "شاشة Dell UltraSharp 27",
      tagline: "دقة 4K للمحترفين",
      description: "شاشة Dell UltraSharp U2723QE بدقة 4K UHD مقاس 27 بوصة مع USB-C Hub",
      longDescription: "شاشة احترافية بدقة 3840x2160 ودعم 100% sRGB و 98% DCI-P3، منفذ USB-C بقدرة شحن 90W، تقنية IPS Black للألوان الدقيقة. مثالية للمصممين والمونتاجيين.",
      price: 65000,
      category: "إلكترونيات",
      discountPrice: 58000,
      images: ["https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2723qe/media-gallery/monitor-u2723qe-gallery-1.psd"],
      stock: 15,
      badge: "عرض خاص",
      rating: 4.7,
      ratingCount: 18,
      salesCount: 30,
      specs: [
        { name: "الدقة", value: "4K UHD (3840x2160)" },
        { name: "نوع اللوحة", value: "IPS Black" },
        { name: "الحجم", value: "27 بوصة" },
        { name: "USB-C", value: "شحن 90W + DisplayPort" },
      ],
      highlights: [
        { name: "ألوان دقيقة", value: "100% sRGB و 98% DCI-P3" },
      ],
      offers: [
        { name: "توفير", value: "وفّر 7,000 دج!", endsAt: new Date("2026-11-30") },
      ],
      reviews: [
        { name: "كمال", rating: 5, comment: "شاشة ممتازة للتصميم!", createdAt: new Date("2026-09-08") },
      ],
    },
  ],

  // ======= متجر عالم الموضة (ملابس) =======
  [
    {
      name: "جاكيت جلد طبيعي كلاسيكي",
      tagline: "أناقة بلا حدود",
      description: "جاكيت من الجلد الطبيعي بتصميم كلاسيكي أنيق مناسب لجميع المواسم",
      longDescription: "جاكيت مصنوع من أجود أنواع الجلد الطبيعي الإيطالي، بطانة داخلية من القطن 100%، تصميم عصري مع سحّابات معدنية عالية الجودة. مناسب للإطلالات الكاجوال والرسمية.",
      price: 28000,
      category: "ملابس",
      discountPrice: 22000,
      images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"],
      stock: 20,
      badge: "الأكثر طلباً",
      rating: 4.4,
      ratingCount: 34,
      salesCount: 85,
      options: [
        { name: "المقاس", values: ["S", "M", "L", "XL", "XXL"] },
        { name: "اللون", values: ["أسود", "بني غامق", "بني فاتح"] },
      ],
      specs: [
        { name: "الخامة", value: "جلد طبيعي إيطالي" },
        { name: "البطانة", value: "قطن 100%" },
        { name: "السحّابات", value: "معدن YKK" },
      ],
      highlights: [
        { name: "جودة عالية", value: "جلد إيطالي مستورد" },
        { name: "متعدد الاستخدامات", value: "كاجوال ورسمي" },
      ],
      offers: [
        { name: "خصم الشتاء", value: "خصم 6,000 دج لفترة محدودة!", endsAt: new Date("2026-12-15") },
      ],
      reviews: [
        { name: "رامي", rating: 5, comment: "جاكيت فخم جداً والجلد أصلي", createdAt: new Date("2026-08-20") },
        { name: "نادية", rating: 4, comment: "جودة ممتازة لكن المقاس كبير شوية", createdAt: new Date("2026-09-05") },
      ],
    },
    {
      name: "حذاء رياضي Nike Air Max",
      tagline: "راحة وأناقة في كل خطوة",
      description: "حذاء Nike Air Max 270 بتقنية Air Cushion للراحة القصوى",
      longDescription: "حذاء رياضي عصري من Nike بتقنية Air Max 270 التي توفر أقصى درجات الراحة والمرونة، نعل خارجي مطاطي مقاوم للانزلاق، جزء علوي شبكي يسمح بالتهوية.",
      price: 18500,
      category: "ملابس",
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
      stock: 40,
      rating: 4.6,
      ratingCount: 67,
      salesCount: 150,
      options: [
        { name: "المقاس", values: ["40", "41", "42", "43", "44", "45"] },
        { name: "اللون", values: ["أبيض/أسود", "أسود/أحمر", "رمادي/أزرق"] },
      ],
      specs: [
        { name: "التقنية", value: "Air Max 270" },
        { name: "النعل", value: "مطاطي مقاوم للانزلاق" },
        { name: "المادة", value: "نسيج شبكي + جلد صناعي" },
      ],
      reviews: [
        { name: "يوسف", rating: 5, comment: "حذاء مريح جداً ومظهره رائع", createdAt: new Date("2026-09-01") },
      ],
    },
    {
      name: "قميص كتان صيفي",
      tagline: "برودة وأناقة صيفية",
      description: "قميص من الكتان الطبيعي بتصميم عصري مناسب للصيف",
      longDescription: "قميص مصنوع من الكتان الطبيعي 100%، ناعم الملمس ويتيح تهوية ممتازة في الأجواء الحارة. تصميم Slim Fit عصري مع أزرار لؤلؤية.",
      price: 6500,
      category: "ملابس",
      discountPrice: 4900,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"],
      stock: 60,
      rating: 4.3,
      ratingCount: 22,
      salesCount: 75,
      options: [
        { name: "المقاس", values: ["S", "M", "L", "XL"] },
        { name: "اللون", values: ["أبيض", "أزرق فاتح", "بيج", "أخضر زيتي"] },
      ],
      specs: [
        { name: "الخامة", value: "كتان 100%" },
        { name: "القصة", value: "Slim Fit" },
        { name: "الأزرار", value: "لؤلؤية" },
      ],
      offers: [
        { name: "عرض الصيف", value: "خصم 1,600 دج", endsAt: new Date("2026-11-01") },
      ],
      reviews: [
        { name: "إيمان", rating: 4, comment: "قميص جميل والقماش مريح", createdAt: new Date("2026-08-15") },
      ],
    },
  ],

  // ======= متجر بيت الرياضة =======
  [
    {
      name: "حقيبة ظهر رياضية Adidas",
      tagline: "حقيبة عملية لكل مغامرة",
      description: "حقيبة ظهر Adidas Original بتصميم عصري ومساحة واسعة",
      longDescription: "حقيبة ظهر رياضية من Adidas بسعة 25 لتر، مصنوعة من البوليستر المعاد تدويره، جيب أمامي بسحاب، حزام صدر قابل للتعديل، جيب داخلي مبطن للابتوب حتى 15 بوصة.",
      price: 8500,
      category: "رياضة",
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
      stock: 35,
      rating: 4.5,
      ratingCount: 41,
      salesCount: 90,
      options: [
        { name: "اللون", values: ["أسود", "كحلي", "رمادي"] },
      ],
      specs: [
        { name: "السعة", value: "25 لتر" },
        { name: "المادة", value: "بوليستر معاد التدوير" },
        { name: "جيب لابتوب", value: "حتى 15 بوصة" },
      ],
      reviews: [
        { name: "بلال", rating: 5, comment: "حقيبة ممتازة وعملية جداً", createdAt: new Date("2026-09-02") },
      ],
    },
    {
      name: "كرة قدم احترافية Nike",
      tagline: "الكرة الرسمية للمحترفين",
      description: "كرة قدم Nike Flight بتقنية Aerowsculpt للثبات في الهواء",
      longDescription: "كرة قدم احترافية من Nike بتقنية Aerowsculpt المحسّنة للتحكم الأفضل في الهواء، غطاء من البولي يوريثان عالي الجودة، معتمدة من FIFA Quality Pro.",
      price: 12000,
      category: "رياضة",
      discountPrice: 9800,
      images: ["https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600"],
      stock: 30,
      badge: "FIFA Quality",
      rating: 4.7,
      ratingCount: 33,
      salesCount: 60,
      specs: [
        { name: "التقنية", value: "Aerowsculpt" },
        { name: "المادة", value: "بولي يوريثان" },
        { name: "الاعتماد", value: "FIFA Quality Pro" },
        { name: "الحجم", value: "5 (قياسي)" },
      ],
      offers: [
        { name: "عرض الموسم", value: "خصم 2,200 دج!", endsAt: new Date("2026-12-01") },
      ],
      reviews: [
        { name: "أنس", rating: 5, comment: "كرة ممتازة والثبات في الهواء رهيب", createdAt: new Date("2026-09-08") },
        { name: "حمزة", rating: 4, comment: "نوعية ممتازة، أنصح بها", createdAt: new Date("2026-09-18") },
      ],
    },
    {
      name: "حذاء كرة قدم Adidas Predator",
      tagline: "دقة التمرير وقوة التسديد",
      description: "حذاء كرة قدم Adidas Predator Edge بتقنية Zone Skin",
      longDescription: "حذاء احترافي لكرة القدم بتقنية Zone Skin لتحكم أفضل في الكرة، نعل FG للملاعب العشبية، تصميم يوفر ثبات ممتاز وراحة فائقة.",
      price: 22000,
      category: "رياضة",
      images: ["https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600"],
      stock: 20,
      rating: 4.4,
      ratingCount: 15,
      salesCount: 35,
      options: [
        { name: "المقاس", values: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "اللون", values: ["أسود/أحمر", "أبيض/ذهبي"] },
      ],
      specs: [
        { name: "التقنية", value: "Zone Skin" },
        { name: "النعل", value: "FG (ملاعب عشبية)" },
        { name: "الوزن", value: "225 جرام" },
      ],
      reviews: [
        { name: "وليد", rating: 5, comment: "حذاء احترافي ومريح جداً!", createdAt: new Date("2026-09-12") },
      ],
    },
  ],

  // ======= متجر مطبخ الشيف =======
  [
    {
      name: "خلاط كهربائي KitchenAid",
      tagline: "شريك المطبخ المثالي",
      description: "خلاط KitchenAid Artisan بقوة 300 واط و 10 سرعات",
      longDescription: "خلاط احترافي من KitchenAid بسعة 4.8 لتر، محرك بقوة 300 واط مع 10 سرعات، يأتي مع 3 ملحقات أساسية: خطاف العجن، المضرب المسطح، والخفاقة السلكية. متوفر بعدة ألوان جذابة.",
      price: 45000,
      category: "مطبخ",
      discountPrice: 39000,
      images: ["https://images.unsplash.com/photo-1594385208974-2f8bb07b66e0?w=600"],
      stock: 12,
      badge: "الأكثر مبيعاً",
      rating: 4.8,
      ratingCount: 27,
      salesCount: 55,
      options: [
        { name: "اللون", values: ["أحمر إمبراطوري", "أسود أونيكس", "فضي", "أبيض"] },
      ],
      specs: [
        { name: "القوة", value: "300 واط" },
        { name: "السعة", value: "4.8 لتر" },
        { name: "السرعات", value: "10 سرعات" },
        { name: "الملحقات", value: "3 ملحقات أساسية" },
      ],
      highlights: [
        { name: "متعدد الاستخدامات", value: "عجن + خفق + خلط" },
        { name: "ضمان", value: "ضمان 5 سنوات" },
      ],
      offers: [
        { name: "عرض حصري", value: "وفّر 6,000 دج + توصيل مجاني!", endsAt: new Date("2026-11-20") },
      ],
      reviews: [
        { name: "هدى", rating: 5, comment: "خلاط ممتاز ومتين جداً!", createdAt: new Date("2026-08-10") },
        { name: "أم ياسين", rating: 5, comment: "أفضل استثمار في مطبخي", createdAt: new Date("2026-09-01") },
      ],
    },
    {
      name: "طقم قدور ستانلس ستيل 10 قطع",
      tagline: "الجودة التي تدوم",
      description: "طقم أواني طبخ من الستانلس ستيل الثقيل 10 قطع مع أغطية",
      longDescription: "طقم أواني طبخ احترافي من الستانلس ستيل 18/10 بقاعدة ثلاثية الطبقات لتوزيع حرارة متساوي، مقابض معزولة حرارياً، آمن للفرن حتى 260 درجة مئوية، آمن لغسالة الأطباق.",
      price: 32000,
      category: "مطبخ",
      images: ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600"],
      stock: 18,
      rating: 4.5,
      ratingCount: 14,
      salesCount: 40,
      specs: [
        { name: "المادة", value: "ستانلس ستيل 18/10" },
        { name: "القاعدة", value: "ثلاثية الطبقات" },
        { name: "عدد القطع", value: "10 قطع" },
        { name: "آمن للفرن", value: "حتى 260°C" },
      ],
      reviews: [
        { name: "نسرين", rating: 4, comment: "قدور ممتازة والجودة عالية", createdAt: new Date("2026-09-15") },
      ],
    },
    {
      name: "ماكينة قهوة إسبريسو DeLonghi",
      tagline: "قهوة احترافية في منزلك",
      description: "ماكينة DeLonghi Magnifica بطحن آلي وشاشة لمسية",
      longDescription: "ماكينة قهوة أوتوماتيكية بالكامل من DeLonghi بمطحنة مدمجة من 13 درجة، نظام LatteCrema لإعداد الكابتشينو والماكياتو بضغطة زر، شاشة لمسية ملونة، خزان ماء 1.8 لتر.",
      price: 75000,
      category: "مطبخ",
      discountPrice: 67000,
      images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"],
      stock: 8,
      badge: "حصري",
      rating: 4.9,
      ratingCount: 12,
      salesCount: 22,
      options: [
        { name: "اللون", values: ["أسود", "فضي"] },
      ],
      specs: [
        { name: "النوع", value: "أوتوماتيكية بالكامل" },
        { name: "المطحنة", value: "13 درجة طحن" },
        { name: "خزان الماء", value: "1.8 لتر" },
        { name: "الضغط", value: "15 بار" },
      ],
      highlights: [
        { name: "LatteCrema", value: "كابتشينو بضغطة واحدة" },
        { name: "طحن طازج", value: "مطحنة مدمجة" },
      ],
      offers: [
        { name: "عرض القهوة", value: "وفّر 8,000 دج + كيلو قهوة هدية!", endsAt: new Date("2026-12-25") },
      ],
      reviews: [
        { name: "سمير", rating: 5, comment: "أفضل ماكينة قهوة! الإسبريسو رائع", createdAt: new Date("2026-09-10") },
      ],
    },
  ],
];

// ============== Managers ==============
const managersData = [
  {
    name: "أسامة مدير تقنية",
    email: "manager1@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0780000001",
    role: "manager",
    // سيربط بمتجر تقنية بلس
  },
  {
    name: "رشيد مدير الموضة",
    email: "manager2@ecom.dz",
    password: DEFAULT_PASSWORD,
    phone: "0780000002",
    role: "manager",
    // سيربط بمتجر عالم الموضة
  },
];

// ============== Seed Function ==============
async function seed() {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("✅ متصل بقاعدة البيانات");

    // 1. مسح البيانات القديمة
    console.log("🗑️  حذف البيانات القديمة...");
    await userModel.deleteMany({});
    await shopModel.deleteMany({});
    await productModel.deleteMany({});
    await orderModel.deleteMany({});
    console.log("✅ تم حذف البيانات القديمة");

    // 2. إنشاء المستخدمين (بدون الـ Vendors لأنهم يحتاجون shopId لاحقاً)
    console.log("👥 إنشاء المستخدمين...");
    const createdUsers: any[] = [];
    for (const userData of usersData) {
      const user = await userModel.create(userData as any);
      createdUsers.push(user);
      console.log(`   ✅ ${userData.name} (${userData.role}) - ${userData.email}`);
    }

    // فصل المستخدمين حسب الأدوار
    const vendors = createdUsers.filter((u) => u.role === "vendor");
    const clients = createdUsers.filter((u) => u.role === "client");

    // 3. إنشاء المتاجر وربطها بالـ Vendors
    console.log("\n🏪 إنشاء المتاجر...");
    const createdShops: any[] = [];
    for (let i = 0; i < shopsData.length; i++) {
      const shopData = { ...shopsData[i], owner: vendors[i]._id };
      const shop = await shopModel.create(shopData as any);
      createdShops.push(shop);

      // تحديث الـ Vendor بمعلومات المتجر
      await userModel.findByIdAndUpdate(vendors[i]._id, {
        shopId: (shop as any)._id,
        "vendorInfo.storeName": (shop as any).name,
      });

      console.log(`   ✅ ${(shop as any).name} (${(shop as any).slug}) - المالك: ${vendors[i].name}`);
    }

    // 4. إنشاء المديرين وربطهم بالمتاجر
    console.log("\n👔 إنشاء المديرين...");
    for (let i = 0; i < managersData.length; i++) {
      const managerData = {
        ...managersData[i],
        shopId: createdShops[i]._id,
      };
      const manager = await userModel.create(managerData as any);
      console.log(`   ✅ ${(manager as any).name} - ${managersData[i].email} (متجر: ${(createdShops[i] as any).name})`);
    }

    // 5. إنشاء المنتجات
    console.log("\n📦 إنشاء المنتجات...");
    const allProducts: any[] = [];
    for (let i = 0; i < productsPerShop.length; i++) {
      for (const productData of productsPerShop[i]) {
        const product = await productModel.create({
          ...productData,
          shop: createdShops[i]._id,
        });
        allProducts.push(product);
        console.log(`   ✅ ${product.name} (${createdShops[i].name})`);
      }
    }

    // 6. إنشاء طلبات وهمية
    console.log("\n📋 إنشاء الطلبات...");
    const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const wilayas = ["الجزائر", "وهران", "قسنطينة", "سطيف", "باتنة", "عنابة", "بجاية", "تلمسان"];
    const baladiyas = ["باب الوادي", "المرادية", "بئر مراد رايس", "القبة", "حيدرة", "بولوغين", "الحراش"];

    let orderCount = 0;
    for (const client of clients) {
      // كل عميل يطلب 2-3 طلبات
      const numOrders = 2 + Math.floor(Math.random() * 2);
      for (let o = 0; o < numOrders; o++) {
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        const shopForProduct = createdShops.find(
          (s: any) => s._id.toString() === randomProduct.shop.toString()
        );
        const quantity = 1 + Math.floor(Math.random() * 3);
        const price = randomProduct.discountPrice || randomProduct.price;

        await orderModel.create({
          user: client._id,
          shop: randomProduct.shop,
          items: [
            {
              product: randomProduct._id,
              shop: randomProduct.shop,
              quantity,
              price,
            },
          ],
          shippingAddress: {
            fullName: client.name,
            phone: client.phone,
            wilaya: wilayas[Math.floor(Math.random() * wilayas.length)],
            baladiya: baladiyas[Math.floor(Math.random() * baladiyas.length)],
            addressDetail: `شقة ${Math.floor(Math.random() * 20) + 1}، عمارة ${Math.floor(Math.random() * 50) + 1}`,
            shippingType: ["home", "desk", "pickup"][Math.floor(Math.random() * 3)] as any,
          },
          totalAmount: price * quantity,
          status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)] as any,
          paymentMethod: shopForProduct?.orderMethod === "BOTH" ? (Math.random() > 0.5 ? "COD" : "CARD") : shopForProduct?.orderMethod || "COD",
        });

        orderCount++;
      }
    }
    console.log(`   ✅ تم إنشاء ${orderCount} طلب وهمي`);

    // 7. تحديث salesCount للمنتجات بناءً على الطلبات المُسلّمة
    console.log("\n📊 تحديث إحصائيات المبيعات...");
    const deliveredOrders = await orderModel.find({ status: "delivered" } as any);
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        await productModel.findByIdAndUpdate(item.product, {
          $inc: { salesCount: item.quantity },
        });
      }
    }

    // ملخص
    console.log("\n" + "=".repeat(60));
    console.log("🎉 تم تشغيل Seed بنجاح!");
    console.log("=".repeat(60));
    console.log(`👥 المستخدمين: ${usersData.length + managersData.length}`);
    console.log(`🏪 المتاجر: ${shopsData.length}`);
    console.log(`📦 المنتجات: ${allProducts.length}`);
    console.log(`📋 الطلبات: ${orderCount}`);
    console.log("=".repeat(60));

    await mongoose.disconnect();
    console.log("🔌 تم قطع الاتصال بقاعدة البيانات");
    process.exit(0);
  } catch (error) {
    console.error("🔴 خطأ في Seed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
