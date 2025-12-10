# راهنمای پیاده‌سازی ارسال پیام واتساپ در Next.js

## 📁 ساختار پروژه

```
my-whatsapp-app/
├── app/
│   ├── page.tsx                 # صفحه اصلی با فرم
│   ├── layout.tsx              # لایوت اصلی
│   └── api/
│       └── send-message/
│           └── route.ts        # API Route برای ارسال پیام
├── components/
│   └── WhatsAppForm.tsx        # کامپوننت فرم
├── lib/
│   └── whatsapp.ts             # توابع کمکی واتساپ
├── types/
│   └── whatsapp.ts             # تایپ‌های TypeScript
└── .env.local                  # متغیرهای محیطی
```

---

## 🚀 مرحله 1: نصب Next.js

```bash
npx create-next-app@latest whatsapp-sender
cd whatsapp-sender
npm install axios
```

هنگام نصب، این گزینه‌ها را انتخاب کنید:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src directory (optional)

---

## 🔧 مرحله 2: تنظیم متغیرهای محیطی

**فایل: `.env.local`**

```env
WAHA_API_URL=http://localhost:3000
WAHA_API_KEY=b8b6eece088d438c9d810774cbe934f8
NEXT_PUBLIC_DEFAULT_SESSION=Milad
```

---

## 📝 مرحله 3: تعریف تایپ‌ها

**فایل: `types/whatsapp.ts`**

```typescript
export interface SendMessageRequest {
  chatId: string;
  text: string;
  session: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface WhatsAppFormData {
  phoneNumber: string;
  session: string;
  message: string;
}
```

---

## 🛠️ مرحله 4: توابع کمکی

**فایل: `lib/whatsapp.ts`**

```typescript
import axios from 'axios';
import { SendMessageRequest, SendMessageResponse } from '@/types/whatsapp';

const WAHA_API_URL = process.env.WAHA_API_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';

/**
 * فرمت کردن شماره تلفن به فرمت واتساپ
 */
export function formatPhoneNumber(phone: string): string {
  // حذف کاراکترهای غیرضروری
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // اضافه کردن @c.us در صورت نبودن
  if (!cleaned.includes('@')) {
    return `${cleaned}@c.us`;
  }
  
  return cleaned;
}

/**
 * ارسال پیام به واتساپ
 */
export async function sendWhatsAppMessage(
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await axios.post(
      `${WAHA_API_URL}/api/sendText`,
      {
        chatId: formatPhoneNumber(data.chatId),
        text: data.text,
        session: data.session,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': WAHA_API_KEY,
        },
      }
    );

    return {
      success: true,
      message: 'پیام با موفقیت ارسال شد',
      data: response.data,
    };
  } catch (error: any) {
    console.error('خطا در ارسال پیام:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در ارسال پیام',
      data: null,
    };
  }
}

/**
 * اعتبارسنجی شماره تلفن
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}
```

---

## 🎨 مرحله 5: کامپوننت فرم (Client Component)

**فایل: `components/WhatsAppForm.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { WhatsAppFormData } from '@/types/whatsapp';

export default function WhatsAppForm() {
  const [formData, setFormData] = useState<WhatsAppFormData>({
    phoneNumber: '',
    session: process.env.NEXT_PUBLIC_DEFAULT_SESSION || 'Milad',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse({ type: null, message: '' });

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResponse({
          type: 'success',
          message: '✅ پیام با موفقیت ارسال شد!',
        });
        // پاک کردن فیلد پیام
        setFormData({ ...formData, message: '' });
      } else {
        setResponse({
          type: 'error',
          message: `❌ خطا: ${data.message}`,
        });
      }
    } catch (error) {
      setResponse({
        type: 'error',
        message: '❌ خطا در اتصال به سرور',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* لوگو */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full text-4xl mb-4">
            📱
          </div>
          <h1 className="text-3xl font-bold text-green-600">
            ارسال پیام واتساپ
          </h1>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* شماره تلفن */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              شماره تلفن
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="96877722112"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              شماره با کد کشور (بدون + یا @c.us)
            </p>
          </div>

          {/* نام سشن */}
          <div>
            <label
              htmlFor="session"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              نام سشن
            </label>
            <input
              type="text"
              id="session"
              name="session"
              value={formData.session}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {/* پیام */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              پیام
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="پیام خود را اینجا بنویسید..."
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition resize-none"
            />
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                در حال ارسال...
              </>
            ) : (
              'ارسال پیام'
            )}
          </button>
        </form>

        {/* نمایش پاسخ */}
        {response.type && (
          <div
            className={`mt-5 p-4 rounded-lg ${
              response.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {response.message}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔌 مرحله 6: API Route (Server-Side)

**فایل: `app/api/send-message/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, validatePhoneNumber } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, session } = body;

    // اعتبارسنجی ورودی‌ها
    if (!phoneNumber || !message || !session) {
      return NextResponse.json(
        {
          success: false,
          message: 'تمام فیلدها الزامی هستند',
        },
        { status: 400 }
      );
    }

    // اعتبارسنجی شماره تلفن
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: 'شماره تلفن نامعتبر است',
        },
        { status: 400 }
      );
    }

    // ارسال پیام
    const result = await sendWhatsAppMessage({
      chatId: phoneNumber,
      text: message,
      session: session,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('خطا در API Route:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'خطای داخلی سرور',
      },
      { status: 500 }
    );
  }
}
```

---

## 📄 مرحله 7: صفحه اصلی

**فایل: `app/page.tsx`**

```typescript
import WhatsAppForm from '@/components/WhatsAppForm';

export default function Home() {
  return <WhatsAppForm />;
}
```

**فایل: `app/layout.tsx`** (اگر نیاز به تغییر دارد)

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ارسال پیام واتساپ',
  description: 'ارسال پیام به واتساپ با WAHA API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## 🎯 مرحله 8: اجرای پروژه

```bash
# نصب وابستگی‌ها
npm install

# اجرا در حالت توسعه
npm run dev

# باز کردن در مرورگر
# http://localhost:3001
```

---

## 🔐 امنیت و بهترین روش‌ها

### 1. محافظت از API Key
```typescript
// NEVER expose API key in client-side code
// همیشه API key را در server-side نگه دارید
// استفاده از .env.local برای متغیرهای محرمانه
```

### 2. Rate Limiting
```typescript
// app/api/send-message/route.ts
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 10, 'CACHE_TOKEN'); // 10 requests per minute
    // ... rest of code
  } catch {
    return NextResponse.json(
      { success: false, message: 'تعداد درخواست‌ها بیش از حد مجاز' },
      { status: 429 }
    );
  }
}
```

### 3. CORS Configuration
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST' },
        ],
      },
    ];
  },
};
```

---

## 🧪 تست کردن

### تست دستی
1. مطمئن شوید WAHA API در حال اجرا است (`localhost:3000`)
2. Next.js را اجرا کنید (`npm run dev`)
3. فرم را پر کنید و ارسال کنید

### تست با cURL
```bash
curl -X POST http://localhost:3001/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "96877722112",
    "session": "Milad",
    "message": "سلام از Next.js!"
  }'
```

---

## 🚀 دیپلوی (Deployment)

### Vercel
```bash
# نصب Vercel CLI
npm i -g vercel

# دیپلوی
vercel

# تنظیم متغیرهای محیطی در Vercel Dashboard
# WAHA_API_URL
# WAHA_API_KEY
# NEXT_PUBLIC_DEFAULT_SESSION
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

---

## 📚 ویژگی‌های اضافی (پیشنهادی)

### 1. ارسال تصویر
```typescript
// lib/whatsapp.ts
export async function sendWhatsAppImage(
  chatId: string,
  imageUrl: string,
  caption?: string,
  session: string = 'default'
) {
  const response = await axios.post(
    `${WAHA_API_URL}/api/sendImage`,
    {
      chatId: formatPhoneNumber(chatId),
      file: { url: imageUrl },
      caption: caption,
      session: session,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': WAHA_API_KEY,
      },
    }
  );
  return response.data;
}
```

### 2. دریافت پیام‌ها (Webhook)
```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  
  if (data.event === 'message') {
    const message = data.payload;
    console.log('پیام دریافت شد:', message);
    
    // پردازش پیام
    // ذخیره در دیتابیس، پاسخ خودکار و ...
  }
  
  return NextResponse.json({ status: 'ok' });
}
```

### 3. ذخیره پیام‌ها در دیتابیس (Prisma)
```bash
npm install @prisma/client prisma
npx prisma init
```

```prisma
// prisma/schema.prisma
model Message {
  id        String   @id @default(cuid())
  chatId    String
  text      String
  session   String
  status    String
  createdAt DateTime @default(now())
}
```

---

## 🐛 رفع مشکلات رایج

### مشکل CORS
اگر از دامنه دیگری درخواست می‌زنید، WAHA API باید CORS را فعال کند.

### خطای 401 Unauthorized
- مطمئن شوید `WAHA_API_KEY` صحیح است
- بررسی کنید header `X-Api-Key` ارسال می‌شود

### خطای 404
- مطمئن شوید WAHA API در حال اجرا است
- آدرس API را چک کنید (`http://localhost:3000`)

---

## 📖 منابع

- [Next.js Documentation](https://nextjs.org/docs)
- [WAHA API Documentation](https://waha.devlike.pro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ چک‌لیست نهایی

- [ ] نصب Next.js و وابستگی‌ها
- [ ] ایجاد فایل `.env.local`
- [ ] ساخت تایپ‌ها در `types/whatsapp.ts`
- [ ] پیاده‌سازی توابع کمکی در `lib/whatsapp.ts`
- [ ] ساخت کامپوننت فرم `WhatsAppForm.tsx`
- [ ] ایجاد API Route در `app/api/send-message/route.ts`
- [ ] تست کردن برنامه
- [ ] دیپلوی

---

**موفق باشید! 🚀**
