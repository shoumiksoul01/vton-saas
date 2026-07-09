<div align="center">

<h1>🧥 TryOn.ai</h1>

<p><strong>AI-powered virtual try-on as a service — built for Bangladeshi e-commerce</strong></p>

<p>
  <a href="https://vton-saas-zeta.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Visit%20Site-4F46E5?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://tryon-saas-backend.onrender.com/health"><img src="https://img.shields.io/badge/API%20Status-Online-22c55e?style=for-the-badge&logo=fastapi" alt="API Status" /></a>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
</p>

<p>
  <a href="https://vton-saas-zeta.vercel.app"><strong>Live Platform</strong></a> ·
  <a href="https://vton-saas-zeta.vercel.app/test-shop.html"><strong>Live Widget Demo</strong></a> ·
  <a href="https://tryon-saas-backend.onrender.com/health"><strong>API Health</strong></a>
</p>

</div>

---

## 🌟 What is TryOn.ai?

TryOn.ai is a **B2B SaaS platform** that lets clothing shops in Bangladesh add a virtual try-on experience to their websites — with a single line of code.

Shop owners sign up, receive a unique API key, and embed a `<script>` tag on their product pages. Customers can then upload a photo of themselves and instantly see what any garment looks like on them — powered by state-of-the-art AI.

**No ML expertise required. No app to build. Just one script tag.**

---

## ✨ Features

| Feature | Starter | Pro |
|---|---|---|
| Monthly try-ons | 50 | Unlimited |
| AI model | IDM-VTON (open-source) | fashn.ai tryon-v1.6 |
| Output quality | Standard | High-res, no watermark |
| Skin tone analysis | ✅ | ✅ |
| Color palette suggestions | ✅ | ✅ |
| Price | Free | ৳2,500/month |

**Additional capabilities:**
- 🔑 Per-shop API key issuance with usage tracking
- 🎨 Automatic skin tone detection (Spring / Summer / Autumn / Winter)
- 🌈 Personalized 6-color palette recommendations after every try-on
- 📊 Usage logs per shop via Supabase
- 🧩 Embeddable JS widget — works on any website, no framework required
- 🔄 Auto-deploy pipeline — push to `main`, both frontend and backend redeploy automatically

---

## 🚀 Live Demo

| URL | Description |
|---|---|
| [vton-saas-zeta.vercel.app](https://vton-saas-zeta.vercel.app) | Landing page + signup |
| [vton-saas-zeta.vercel.app/test-shop.html](https://vton-saas-zeta.vercel.app/test-shop.html) | Mock shop with embedded widget (Starter/IDM-VTON) |
| [tryon-saas-backend.onrender.com/health](https://tryon-saas-backend.onrender.com/health) | Backend health check |

---

## 🧩 Widget Integration

Add virtual try-on to **any website** with two snippets:

```html
<!-- 1. Load the widget -->
<script
  src="https://vton-saas-zeta.vercel.app/widget.js"
  data-api-key="YOUR_SHOP_API_KEY"
  data-api-url="https://tryon-saas-backend.onrender.com"
  async>
</script>

<!-- 2. Add a button on any product -->
<button
  class="tryon-trigger"
  data-garment-image="/images/white-shirt.jpg"
  data-garment-desc="a white cotton shirt">
  👕 Try It On
</button>
```

That's it. The widget injects a full-screen modal, handles photo upload, calls the AI, and renders the result — including skin tone analysis — with zero additional configuration.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Customer's Browser                        │
│  ┌─────────────────┐         ┌──────────────────────────┐   │
│  │  Shop Website   │  loads  │  TryOn.ai widget.js      │   │
│  │  (any stack)    │────────▶│  Modal UI + upload flow  │   │
│  └─────────────────┘         └──────────────┬───────────┘   │
└─────────────────────────────────────────────│────────────────┘
                                              │ POST /tryon
                              ┌───────────────▼───────────────┐
                              │   FastAPI Backend (Render)    │
                              │  ┌─────────────────────────┐  │
                              │  │  Supabase Auth + Logs   │  │
                              │  │  API Key Validation     │  │
                              │  │  Usage Tracking         │  │
                              │  └────────────┬────────────┘  │
                              │               │                │
                              │    Starter ───┤─── Pro        │
                              │       │       │      │         │
                              │       ▼       │      ▼         │
                              │  IDM-VTON     │  fashn.ai     │
                              │  (HF Spaces)  │  tryon-v1.6   │
                              │               │                │
                              │  ┌────────────▼────────────┐  │
                              │  │  skin_tone.py           │  │
                              │  │  OpenCV + k-means       │  │
                              │  │  Seasonal classification│  │
                              │  └─────────────────────────┘  │
                              └───────────────────────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │  TryOn.ai Frontend (Vercel)   │
                              │  Next.js + Tailwind           │
                              │  Landing / Auth / Dashboard   │
                              └───────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, Tailwind CSS, TypeScript |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database + Auth** | Supabase (PostgreSQL) |
| **AI — Starter** | IDM-VTON via Hugging Face Spaces (`gradio_client`) |
| **AI — Pro** | fashn.ai `tryon-v1.6` model via REST API |
| **Skin Tone** | OpenCV, scikit-learn (k-means clustering) |
| **Widget** | Vanilla JavaScript (no framework required) |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **CI/CD** | Push to `main` → auto-redeploy both services |

---

## 📁 Project Structure

```
vton-saas/
├── backend/
│   ├── main.py              # /health, /tryon, /auth/signup, /auth/login
│   ├── skin_tone.py         # OpenCV k-means skin tone + seasonal classification
│   └── requirements.txt     # FastAPI, gradio_client, Pillow, opencv, scikit-learn
└── frontend/
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   ├── dashboard/page.tsx # API key, usage stats
    │   └── demo/page.tsx
    ├── lib/
    │   ├── api.ts            # signUp, logIn, tryOn, warmupBackend
    │   └── supabase.ts
    └── public/
        ├── widget.js         # Embeddable widget — drop-in for any site
        ├── test-shop.html    # Live mock shop demo
        └── garments/         # Sample garment images
```

---

## 🎨 Skin Tone Feature

After every try-on, TryOn.ai automatically detects the customer's skin tone and suggests a personalized color palette:

1. **Detect** — OpenCV crops the upper third of the uploaded photo (face/neck region)
2. **Cluster** — k-means (k=3) finds the dominant skin pixel cluster in HSV space
3. **Classify** — hue warmth + brightness maps to one of 4 seasonal types:

| Season | Undertone | Characteristics |
|---|---|---|
| 🌸 Spring | Warm | Light, clear, warm hues |
| ☁️ Summer | Cool | Light, muted, cool hues |
| 🍂 Autumn | Warm | Deep, rich, warm hues |
| ❄️ Winter | Cool | Deep, high-contrast, cool hues |

4. **Suggest** — 6 named hex color swatches render below the try-on result in the widget

> Accuracy note: treat as color-theory guidance rather than clinical measurement — results can shift with lighting and camera quality.

---

## 🔌 Backend API

**Base URL:** `https://tryon-saas-backend.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/auth/signup` | Register a new shop, returns `api_key` |
| `POST` | `/auth/login` | Login, returns `api_key` + plan |
| `POST` | `/tryon` | Run virtual try-on (requires `x-api-key` header) |

**`POST /tryon` request:**
```json
{
  "person_image": "data:image/png;base64,...",
  "garment_image": "data:image/png;base64,...",
  "garment_desc": "a white cotton shirt"
}
```

**`POST /tryon` response:**
```json
{
  "result_image": "data:image/png;base64,...",
  "skin_tone": {
    "season": "Autumn",
    "undertone": "Warm",
    "detected_hex": "#C68642",
    "suggested_palette": [
      { "name": "Burnt Sienna", "hex": "#E97451" },
      { "name": "Olive Green", "hex": "#6B7C3F" }
    ]
  }
}
```

---

## 🗄️ Database Schema

```sql
-- Shops table
CREATE TABLE shops (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text UNIQUE NOT NULL,
  shop_name    text NOT NULL,
  plan         text DEFAULT 'starter',  -- 'starter' | 'pro'
  api_key      text UNIQUE NOT NULL,
  usage_count  int DEFAULT 0,
  usage_limit  int DEFAULT 50,          -- null = unlimited (Pro)
  created_at   timestamptz DEFAULT now()
);

-- Try-on logs
CREATE TABLE tryon_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid REFERENCES shops(id),
  created_at timestamptz DEFAULT now(),
  plan_used  text,
  success    boolean
);
```

---

## ⚙️ Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- [Hugging Face](https://huggingface.co) account (for IDM-VTON)

### 1. Clone the repo

```bash
git clone https://github.com/shoumiksoul01/vton-saas.git
cd vton-saas
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_secret_key
FASHNAI_API_KEY=your_fashnai_key
```

Start the backend:
```bash
uvicorn main:app --reload --port 8001
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8001
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:8001`.

---

## 🚢 Deployment

Both services auto-deploy on every push to `main`.

| Service | Platform | Config |
|---|---|---|
| Frontend | Vercel | Root dir: `frontend`, Framework: Next.js |
| Backend | Render | Root dir: `backend`, Start: `uvicorn main:app --host 0.0.0.0 --port $PORT` |

Set the environment variables listed above in each platform's dashboard.

---

## 🗺️ Roadmap

- [x] Core try-on API (IDM-VTON + fashn.ai)
- [x] Per-shop API keys + usage tracking
- [x] Embeddable JS widget
- [x] Skin tone detection + color palette suggestions
- [x] Dashboard with API key display
- [ ] SSLCommerz payment integration (৳2,500/month Pro)
- [ ] Garment catalog management from dashboard
- [ ] Usage analytics charts
- [ ] Watermark on Starter tier output
- [ ] Webhook support for try-on events
- [ ] Mobile-optimized widget

---

## 👤 Author

**Sk. Shoumik Haque**
Final-year B.Sc. Software Engineering student at Daffodil International University, Dhaka

- GitHub: [@shoumiksoul01](https://github.com/shoumiksoul01)
- LinkedIn: [sheikh-shoumik-haque](https://linkedin.com/in/sheikh-shoumik-haque)
- Portfolio: [shoumiksoul01.github.io](https://shoumiksoul01.github.io)

---

## ⚠️ Disclaimer

The IDM-VTON model runs on Hugging Face ZeroGPU — occasional rate limits apply and reset every ~24 hours. The fashn.ai Pro integration uses paid API credits. Neither AI model stores uploaded images beyond the duration of a single API request.

---

<div align="center">
<p>Built with ❤️ for the Bangladeshi e-commerce ecosystem</p>
<p>⭐ Star this repo if you find it useful!</p>
</div>
