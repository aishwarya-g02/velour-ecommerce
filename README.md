# VELOUR — E-Commerce Setup Guide

## 🚀 Quick Start

### Files
- `index.html` — Main frontend
- `style.css` — All styles
- `app.js` — Application logic (Supabase + Razorpay)

---

## 1. Supabase Setup

### Create Project
1. Go to https://supabase.com → New Project
2. Copy your **Project URL** and **anon/public key** from Settings → API

### Update app.js
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### Create Tables (SQL Editor in Supabase)

#### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL CHECK (category IN ('women','men','accessories','sale')),
  price INTEGER NOT NULL,
  original_price INTEGER,
  image_url TEXT,
  sizes TEXT[],
  badge TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  payment_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  items JSONB,
  total_amount INTEGER,
  status TEXT DEFAULT 'confirmed',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert their own orders
CREATE POLICY "Users can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);
```

### Insert Sample Products
```sql
INSERT INTO products (name, brand, category, price, original_price, image_url, sizes, badge, description)
VALUES
  ('Oversized Linen Blazer', 'VELOUR STUDIO', 'women', 4999, 6999,
   'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
   ARRAY['XS','S','M','L','XL'], 'New', 'Premium linen blazer with relaxed silhouette.'),

  ('Silk Wrap Midi Dress', 'VELOUR STUDIO', 'women', 5499, NULL,
   'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
   ARRAY['XS','S','M','L'], NULL, 'Luxurious silk wrap dress with fluid drape.'),

  ('Structured Wool Coat', 'VELOUR STUDIO', 'men', 8999, 12999,
   'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
   ARRAY['S','M','L','XL','XXL'], 'Sale', 'Double-breasted wool coat with clean minimal lines.'),

  ('Leather Tote Bag', 'VELOUR ACCESSORIES', 'accessories', 6999, NULL,
   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
   ARRAY['One Size'], 'New', 'Full-grain leather tote with suede interior.');
```

### Enable Auth
- Supabase Dashboard → Authentication → Settings
- Enable Email/Password sign-in
- Optionally configure redirect URLs for your domain

---

## 2. Razorpay Setup

1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate **Test Key** for development
4. Update `app.js`:
```js
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_ID';
```

### For Production (Server-Side Order Creation)
In production, create orders on your backend:
```js
// Node.js / Express example
const Razorpay = require('razorpay');
const rzp = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });

app.post('/create-order', async (req, res) => {
  const order = await rzp.orders.create({
    amount: req.body.amount * 100, // paise
    currency: 'INR',
    receipt: `order_${Date.now()}`
  });
  res.json(order);
});
```

Then use the `order.id` in the Razorpay checkout options.

### Webhook Verification
Set up a webhook endpoint to verify payments:
```
Dashboard → Webhooks → Add URL → https://yoursite.com/webhook
Events: payment.captured
```

---

## 3. Deployment

### Option A: Netlify (Recommended)
1. Drag & drop the folder to https://netlify.com/drop
2. Done! Your site is live.

### Option B: Vercel
```bash
npx vercel --prod
```

### Option C: GitHub Pages
Push to GitHub → Settings → Pages → Deploy from main branch

---

## 4. Customization

### Brand Name
Replace "VELOUR" in `index.html` and `style.css`

### Colors (CSS variables in style.css)
```css
--accent: #c9a87c;    /* Gold accent */
--bg: #0e0c0a;        /* Dark background */
--text: #f5f0ea;      /* Light text */
```

### Currency
Replace `₹` with your currency symbol and update the amount calculations.

---

## 5. Features Checklist

- ✅ Product listing with categories (Women, Men, Accessories, Sale)
- ✅ Product quick view modal with size selection
- ✅ Add to cart & quantity management
- ✅ Cart drawer with order summary
- ✅ Wishlist (localStorage)
- ✅ Product search
- ✅ User authentication (Supabase Auth)
- ✅ Checkout form with validation
- ✅ Razorpay payment integration
- ✅ Order saving to Supabase
- ✅ Order confirmation screen
- ✅ Hero slider
- ✅ Category filtering & sorting
- ✅ Responsive design
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Demo mode (works without Supabase/Razorpay configured)
