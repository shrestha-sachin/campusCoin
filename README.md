# CampusCoin 🪙

> Hyper-personalized financial intelligence for college students. Built for HackIllinois.

**71% of college students face financial hardship.** Existing budgeting apps are built for salaried adults — not students juggling campus jobs, internship lump sums, semesterly tuition bills, and financial aid disbursements. CampusCoin is a predictive financial engine built explicitly for the student lifecycle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite + Tailwind CSS + Recharts + React Router v6 |
| **Backend** | Modal (Python FastAPI as ASGI app) |
| **AI** | Google Gemini `gemini-2.0-flash-exp` via Modal |
| **Banking** | Capital One Nessie API (mock bank data) |
| **Memory** | Supermemory API (persistent student context) |
| **Storage** | Modal Dict (serverless KV store) |

---

## Features

- **180-Day Financial Runway** — day-by-day balance projection accounting for campus jobs, internships, and irregular expenses
- **AI Analysis** — Gemini-powered financial health scoring with emergency detection
- **What-If Scenarios** — toggle income streams and expenses live to see how decisions affect your runway
- **AI Strategist Chat** — conversational financial advisor with full context of your numbers
- **Capital One Nessie Integration** — live balance sync from mock bank API
- **Supermemory** — your financial profile persists across sessions

---

## Deploy

### 1. Set Modal Secrets

```bash
modal secret create campuscoin-secrets \
  GEMINI_KEY=your_gemini_api_key \
  NESSIE_KEY=your_nessie_api_key \
  SUPERMEMORY_KEY=your_supermemory_api_key
```

### 2. Deploy Backend to Modal

```bash
cd backend
pip install modal
modal deploy modal_app.py
# Copy the printed URL — looks like:
# https://YOUR_WORKSPACE--campuscoin-fastapi-app.modal.run
```

### 3. Run Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env and paste your Modal URL as VITE_MODAL_URL
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Deploy Frontend to Firebase (GitHub Actions)

The frontend is deployed to Firebase Hosting on push to `main`. For the **live site to call your Modal backend** (not localhost), set the API URL at build time:

1. In **GitHub** → your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add a repository secret: **`VITE_MODAL_URL`**
3. Set its value to your Modal app URL, e.g. `https://YOUR_WORKSPACE--campuscoin-fastapi-app.modal.run` (no trailing slash)

The workflow uses this when running `npm run build`, so login and all API requests from the Firebase-hosted app go to your Modal backend.

---

## Project Structure

```
campuscoin/
├── backend/
│   ├── modal_app.py          # Modal ASGI app + FastAPI factory
│   ├── models.py             # Pydantic data models
│   ├── requirements.txt
│   └── services/
│       ├── gemini.py         # /api/ai — analyze + chat endpoints
│       ├── nessie.py         # /api/nessie — Capital One mock bank
│       ├── supermemory.py    # /api/memory — persistent memory
│       ├── runway.py         # /api/runway — 180-day projection
│       └── profile.py        # /api/profile — Modal Dict KV store
└── frontend/
    └── src/
        ├── store.js           # React Context + global state + demo data
        ├── api.js             # All fetch calls to Modal backend
        ├── pages/
        │   ├── Dashboard.jsx  # Overview: balance, runway, AI insight
        │   ├── Manage.jsx     # Income & expense management + what-if
        │   ├── Strategist.jsx # AI chat interface
        │   └── Settings.jsx   # Profile + Supermemory sync
        └── components/        # Reusable UI components
```

---

## Data Schema

All layers share this structure (Pydantic on backend, plain JS on frontend):

```json
{
  "profile": {
    "user_id": "string",
    "name": "string",
    "university": "string",
    "major": "string",
    "graduation_date": "YYYY-MM-DD",
    "financial_goals": ["string"],
    "current_balance": 0.00,
    "nessie_account_id": "string or null"
  },
  "income_streams": [{
    "id": "uuid",
    "type": "campus_job | internship | stipend | family | other",
    "label": "string",
    "hourly_rate": 0.00,
    "weekly_hours": 0.0,
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "is_lump_sum": false,
    "lump_sum_amount": null,
    "is_active": true
  }],
  "expenses": [{
    "id": "uuid",
    "type": "fixed | variable",
    "label": "string",
    "amount": 0.00,
    "frequency": "monthly | semesterly | weekly | one-time",
    "due_date": "YYYY-MM-DD",
    "is_active": true
  }]
}
```

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/runway/calculate` | POST | 180-day balance projection |
| `/api/ai/analyze` | POST | Gemini financial analysis |
| `/api/ai/chat` | POST | Conversational AI with context |
| `/api/nessie/balance/{id}` | GET | Live account balance |
| `/api/nessie/transactions/{id}` | GET | Transaction history |
| `/api/nessie/accounts` | GET | List all accounts |
| `/api/memory/store` | POST | Persist profile to Supermemory |
| `/api/memory/recall/{user_id}` | GET | Retrieve memory by user |
| `/api/profile/{user_id}` | GET | Load saved profile |
| `/api/profile/{user_id}` | POST | Save profile to Modal Dict |

---

## Design System

- **Background**: Google Off-White (`#f0f0f0`)
- **Cards**: Pure White (`#ffffff`) with subtle Material elevation shadows
- **Accent**: Google Blue (`#4285f4`) and Google Green (`#34a853`)
- **Fonts**: Google Sans, Google Sans Mono, and Google Sans Text
- **Aesthetic**: Clean, modern Google Material-inspired light mode

---

*Built with ❤️ at HackIllinois*
