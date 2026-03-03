<h1 align="center">🎓 KaiCampus Gigs</h1>

<p align="center">
  <b>A Campus Skill Marketplace</b><br/>
  Transforming unstructured campus talent into a trusted micro-gig economy powered by real-time SkillScores and WhatsApp-native viral growth.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white" />
</p>

---

## 📌 Table of Contents

- [The Problem](#-the-problem-we-solved)
- [What We Built](#-what-we-built)
- [Technical Architecture](#-technical-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Future Upgrades](#-future-upgrades)

---

## ❌ The Problem We Solved

Indian college campuses have:

- **Students who need urgent help** — DSA debugging, PPT design, lab reports, presentation prep
- **Students who have skills** — coding, design, editing, writing

But there is **no structured peer-to-peer discovery system** inside a campus.

> As mentioned in the hackathon brief *(Track 4)*: the talent exists — the marketplace doesn't.

**KaiCampus Gigs** bridges that gap — a **trusted micro-task ecosystem** within a college.

---

## 💡 What We Built

### 🔐 1. Authentication & Profile System

- **Email & Password** sign-in via Supabase Auth
- Rich user profiles with:
  - Department
  - Listed skills
  - **SkillScore** per skill

### 📝 2. Gig Creation

Students can post gigs with:
- Title & description
- Skills required
- Budget / price
- Deadline

Gigs are listed on the home feed for other students to browse and apply.

### 🔄 3. Gig Lifecycle System

```
Open  →  In Progress  →  Completed
```

1. Poster creates a gig
2. Helper clicks **"I Can Help"**
3. Work is completed
4. Poster **rates the helper** (1–5 stars)
5. **SkillScore updates** automatically
6. **Proof of Work card** is generated

### 📊 4. SkillScore System *(Trust Engine)*

Each user accumulates skill-based scores:

| Skill   | Score |
|---------|-------|
| Java    | 75    |
| DSA     | 82    |
| Design  | 60    |

**Update Logic:**
```
NewScore = OldScore + (Rating × 5) + Bonus
```

**Purpose:**
- Builds trust between peers
- Creates healthy competition
- Encourages quality work
- Powers the leaderboard

> This is the **product differentiator** — reputation that travels with the student.

### 🏆 5. Proof of Work Card *(Viral Growth Loop)*

After gig completion, the system generates a shareable card containing:

- Gig summary
- Skills used
- Rating received
- Updated SkillScore
- Unique verification ID
- Shareable link

Designed specifically for **📲 WhatsApp forwarding**.

**Growth Loop:**
```
Share card → Friend clicks → Signs up → Posts gig → Dashboard updates
```

This fulfills the **"Shareable Moment"** + **Mandatory Growth Loop** requirements.

### 📈 6. Live Metrics Dashboard

Real-time tracking of:

| Metric                | Purpose                 |
|-----------------------|-------------------------|
| Total Signups         | User acquisition        |
| Total Gigs Posted     | Platform engagement     |
| Gigs Completed        | Activation measurement  |
| Proof Cards Generated | Viral loop tracking     |
| Referral Conversions  | Growth loop validation  |

> Directly impacts the **50% "Real Users + Activations"** scoring criterion.

---

## 🏗 Technical Architecture

```
User
 ↓
Next.js Frontend (Vercel)
 ↓
Express Backend (Render)
 ↓
Supabase (Auth + Postgres)
```

| Layer      | Technology          | Deployment |
|------------|---------------------|------------|
| Frontend   | Next.js, Tailwind CSS | Vercel   |
| Backend    | Node.js, Express    | Render     |
| Database   | Supabase (Postgres) | Supabase   |
| Auth       | Supabase Auth (Email/Password) | Supabase |

> Simple monolith. No overengineering.

---

## 📁 Project Structure

```
KaiCampus-Gigs/
├── package.json              # Root monorepo config
├── setup-db.js               # Database setup script
├── start-dev.bat             # Windows dev launcher
├── start-dev.ps1             # PowerShell dev launcher
│
├── gig-frontend/             # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── dashboard/        # Main dashboard
│   │   ├── home/             # Home feed
│   │   ├── post/             # Create gig
│   │   ├── solve/[gigId]/    # Solve a gig
│   │   ├── my-gigs/          # User's gigs
│   │   ├── profile/          # Profile & edit
│   │   ├── leaderboard/      # SkillScore leaderboard
│   │   └── admin/            # Admin panel
│   ├── components/           # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── GigCard.tsx
│   │   ├── ProofCard.tsx
│   │   ├── LeaderboardItem.tsx
│   │   ├── NotificationBell.tsx
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # API client & Supabase config
│   └── types/                # TypeScript type definitions
│
├── gig-backend/              # Express Backend
│   ├── server.js             # Entry point
│   ├── lib/
│   │   └── supabase.js       # Supabase client
│   ├── middleware/
│   │   └── auth.js           # Auth middleware
│   └── routes/
│       ├── gigs.js           # Gig CRUD
│       ├── users.js          # User profiles & SkillScore
│       ├── applications.js   # Gig applications
│       ├── leaderboard.js    # Leaderboard data
│       └── complete.js       # Gig completion & proof cards
│
└── *.sql                     # Database migration scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **Supabase** project (with Auth + Postgres)

### 1. Clone the repo
```bash
git clone https://github.com/<your-org>/kaicampus-gigs.git
cd kaicampus-gigs
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Set up environment variables

**Frontend** (`gig-frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend** (`gig-backend/.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=5000
```

### 4. Set up the database
```bash
npm run setup-db
```
Or run the SQL files manually in Supabase SQL Editor (start with `SETUP_DATABASE_V2.sql`).

### 5. Start development
```bash
npm run dev
```
This concurrently starts:
- **Frontend** on `http://localhost:3000`
- **Backend** on `http://localhost:5000`

> **Windows users** can also use `start-dev.bat` or `start-dev.ps1`.

---

## 🔮 Future Upgrades

### 1. � Google OAuth Sign-In

| Aspect   | Details |
|----------|---------|
| **Current** | Email & password authentication |
| **Upgrade** | Google Sign-in for seamless one-tap login. Reduces friction for new users. |
| **Impact** | Faster onboarding, higher signup conversion rates |

### 2. 🤖 AI-Powered Gig Creation (Kai Integration)

| Aspect   | Details |
|----------|---------|
| **Current** | Manual gig posting by students |
| **Upgrade** | Kai API integration to auto-structure posts, extract skills, suggest fair pricing, and estimate completion time |
| **Impact** | Cleaner listings, professional feel, lower effort to post |

### 3. �💰 Escrow-Based Campus Wallet

| Aspect   | Details |
|----------|---------|
| **Current** | No payment gateway |
| **Upgrade** | Campus wallet with escrow model — funds released after rating. Optional campus token rewards. |
| **Impact** | Real money transactions, higher trust, scalable to inter-college level |

### 4. 🤖 AI Smart Matching Engine

| Aspect   | Details |
|----------|---------|
| **Current** | Manual "I Can Help" button |
| **Upgrade** | Kai auto-suggests the best 3 helpers based on SkillScore, department, past ratings, and response time |
| **Impact** | Faster gigs, higher completion rate, better UX |

### 5. 🌐 Inter-College Expansion

| Aspect   | Details |
|----------|---------|
| **Current** | Single campus leaderboard |
| **Upgrade** | Multi-campus system with Top Colleges leaderboard and National SkillScore ranking |
| **Impact** | Competitive growth, organic expansion, stronger community layer |

### 6. 📄 AI Portfolio Builder

| Aspect   | Details |
|----------|---------|
| **Current** | Individual Proof of Work card per gig |
| **Upgrade** | Auto-generate a full portfolio page, PDF export, LinkedIn integration, resume-ready skill summary |
| **Impact** | Students use it beyond campus, long-term retention, real career value |

---

## 🏁 One-Line Pitch

> **KaiCampus Gigs** transforms unstructured campus talent into a trusted micro-gig economy powered by real-time SkillScores and WhatsApp-native viral growth.

---

<p align="center">Built with ❤️ for the Hushh Kai Campus Growth Hackathon</p>