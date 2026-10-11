# Endpoints المطلوبة في الـ Backend للواجهة الرئيسية (Homepage)

لقد تم ربط الواجهة الأمامية بالكامل ديناميكياً مع الـ Backend لكي لا نعرض بيانات وهمية بعد الآن. لكي يعمل كل شيء بشكل مثالي، يرجى منك إضافة هذه الـ Endpoints والمتحكمات (Controllers) في الـ Backend:

## 1. إحصائيات المنصة (Platform Stats)
- **الرابط (Endpoint)**: `GET /products/platform-stats`
- **الوظيفة**: حساب إجمالي المنتجات، العملاء، المتاجر، ومتوسط التقييم العام.
- **ما يجب أن يُرجعه الـ Backend**:
  ```json
  {
    "status": "success",
    "data": {
      "totalProducts": 250,
      "totalCustomers": 1200,
      "totalShops": 15,
      "avgRating": 4.8
    }
  }
  ```

## 2. الأقسام النشطة (Categories)
- **الرابط (Endpoint)**: `GET /products/categories`
- **الوظيفة**: جلب الأقسام المتوفرة مع حساب عدد المنتجات الموجودة في كل قسم.
- **ما يجب أن يُرجعه الـ Backend**:
  ```json
  {
    "status": "success",
    "data": {
      "categories": [
        { "name": "إلكترونيات", "count": 45, "image": "..." },
        { "name": "ملابس", "count": 120, "image": "..." }
      ]
    }
  }
  ```

## 3. العروض الحصرية (Flash Deals)
- **الرابط (Endpoint)**: `GET /products/deals`
- **الوظيفة**: إرجاع المنتجات التي تحتوي على خصومات `discountPrice` أو حقل `offers` غير فارغ.
- **ما يجب أن يُرجعه الـ Backend**:
  ```json
  {
    "status": "success",
    "data": {
      "products": [ /* قائمة المنتجات */ ]
    }
  }
  ```

## 4. وصل حديثاً (New Arrivals)
- **الرابط (Endpoint)**: `GET /products/new-arrivals?limit=10`
- **الوظيفة**: ترتيب المنتجات حسب تاريخ الإضافة (الأحدث أولاً) `createdAt: -1` مع تحديد العدد (Limit).
- **ما يجب أن يُرجعه الـ Backend**:
  ```json
  {
    "status": "success",
    "data": {
      "products": [ /* قائمة المنتجات الأحدث */ ]
    }
  }
  ```

## 5. الأكثر مبيعاً (Best Sellers)
- **الرابط (Endpoint)**: `GET /products/best-sellers?limit=10`
- **الوظيفة**: ترتيب المنتجات حسب عدد المبيعات `salesCount: -1`.
- **ما يجب أن يُرجعه الـ Backend**:
  ```json
  {
    "status": "success",
    "data": {
      "products": [ /* قائمة المنتجات الأكثر مبيعاً */ ]
    }
  }
  ```

---
**ملاحظة هامة:** حالياً قمت بوضع Fallbacks في `productsService` بحيث أن الموقع لن يتعطل إذا لم تكن هذه الـ Endpoints موجودة بعد (سيرجع قوائم فارغة أو أرقام 0)، وبمجرد أن تنشئها في الـ Backend، ستظهر البيانات الحقيقية مباشرة وبشكل سحري! ✨
