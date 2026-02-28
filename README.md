# CampusCoin 🪙

**Financial intelligence built for the student lifecycle.**

CampusCoin is a personal finance app designed for college students. It helps you see your money over the next 180 days, get AI-powered insights, and make decisions with confidence—whether you’re living on campus jobs, internship stipends, or financial aid.

---

## Why CampusCoin?

Most budgeting tools assume a steady paycheck and monthly bills. Student life is different: campus jobs, lump-sum internship pay, semesterly tuition, and aid disbursements create a unique cash flow. CampusCoin is built around that reality. It projects your balance day by day, flags when you might run short, and connects you to an AI advisor that understands your situation.

---

## What You Can Do

- **See your runway** — A 180-day projection of your balance based on your income and expenses.
- **Get AI analysis** — Health checks and recommendations powered by Gemini, with early warnings when money gets tight.
- **Chat with the Strategist** — Ask questions about your finances and get answers grounded in your real numbers.
- **Run what-if scenarios** — Add or change income and expenses and see how your runway changes.
- **Connect Capital One Nessie** — Optionally sync with mock bank data for a fuller picture.
- **Keep context across sessions** — Your profile and goals are remembered so the AI can stay relevant.

---

## Try It

The app is hosted on Firebase. For the latest deployment link, check the repository’s **About** section or the project’s Firebase Hosting URL.

---

## Tech Overview

| Layer   | Technology |
|--------|------------|
| Frontend | React, Vite, Tailwind CSS, Recharts, React Router |
| Backend  | Modal (Python FastAPI) |
| AI       | Google Gemini via Modal |
| Banking  | Capital One Nessie API (mock) |
| Memory   | Supermemory API |
| Hosting  | Firebase (frontend), Modal (backend) |

---

## For Developers

### Run locally

1. **Backend (Modal)**  
   Deploy the API to Modal and note the URL (see [Deploy](#deploy) below).

2. **Frontend**  
   In `frontend/`, copy `.env.example` to `.env`, set `VITE_MODAL_URL` to your Modal URL, then:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

### Deploy

**Backend (Modal)**

- Create the secret (e.g. `campuscoin-secrets`) with `GEMINI_KEY`, `NESSIE_KEY`, `SUPERMEMORY_KEY`.
- From `backend/`: `python -m modal deploy modal_app.py` and use the printed URL as `VITE_MODAL_URL` for the frontend.

**Frontend (Firebase)**

- Frontend deploys to Firebase Hosting on push to `main` (GitHub Actions).
- For the live site to use your backend, add a GitHub Actions secret **`VITE_MODAL_URL`** set to your Modal app URL (e.g. `https://YOUR_WORKSPACE--campuscoin-fastapi-app.modal.run`).

### Project structure

```
campuscoin/
├── backend/          # Modal + FastAPI (runway, AI, Nessie, profile, memory)
└── frontend/         # React app (dashboard, manage, strategist, settings)
```

### API reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/runway/calculate` | POST | 180-day balance projection |
| `/api/ai/analyze` | POST | Gemini financial analysis |
| `/api/ai/chat` | POST | Conversational AI with context |
| `/api/nessie/*` | GET/POST | Balance, transactions, accounts (Nessie) |
| `/api/memory/store`, `/api/memory/recall/{user_id}` | POST/GET | Supermemory |
| `/api/profile/{user_id}` | GET/POST | Load/save profile |

---

*Built with ❤️ at HackIllinois*
