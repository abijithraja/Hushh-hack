# SkillGig Frontend

A Next.js application for building skills and earning reputation through collaborative gigs.

## 🚀 Features

### Landing Page
- Modern, gradient-based design
- Google Sign-in integration (UI ready)
- Tagline: "Build Skills. Earn Reputation."

### Authentication
- Login page with loading states
- User profile management
- Session handling with localStorage

### Navigation
- Responsive navbar with mobile menu
- Active route highlighting
- Quick access to all main features

### Pages

#### 🏠 Home (Gig Feed)
- Browse all available gigs
- Filter by status (Open, In Progress, Completed)
- Interactive gig cards with "I Can Help" button
- Skill tags and SkillPoints display

#### ✍️ Post Gig
- Form with validation
- Fields: Title, Description, Skills, SkillPoints
- Error handling and success messages
- Automatic redirect after posting

#### 📋 My Gigs
- Tabbed interface
- "Posted by Me" section
- "Accepted by Me" section
- Empty states for better UX

#### 👤 Profile (SkillScore Dashboard)
- Total SkillScore display
- Skill breakdown with visual bars
- Completed gigs count
- Average rating
- Recent activity timeline
- Proof of Work cards showcase

#### 🏆 Leaderboard
- Top 10 users ranking
- Medal icons for top 3
- Department filtering
- Platform statistics

#### 🎨 Proof of Work Cards
- Beautiful gradient design
- Star rating display
- Verification ID
- Share functionality
- Skill and points display

#### 🔒 Admin Dashboard
- Password protected (demo: admin123)
- Real-time metrics:
  - Total users
  - Total gigs
  - Completed gigs
  - Proof cards generated
- Recent activity feed
- Platform statistics
- Quick action buttons

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: Next.js App Router

## 📁 Project Structure

```
gig-frontend/
├── app/
│   ├── admin/         # Admin dashboard
│   ├── home/          # Gig feed
│   ├── leaderboard/   # Rankings
│   ├── login/         # Authentication
│   ├── my-gigs/       # User's gigs
│   ├── post/          # Post new gig
│   ├── profile/       # User profile & SkillScore
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/
│   ├── EmptyState.tsx
│   ├── GigCard.tsx
│   ├── LeaderboardItem.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   └── ProofCard.tsx
└── types/
    └── index.ts       # TypeScript types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/lumicore-team/gig-frontend.git
cd gig-frontend
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 🎨 Features Implemented

### ✅ UI/UX
- Responsive design (mobile-friendly)
- Loading states
- Error states
- Empty states
- Form validation
- Smooth transitions
- Color-coded status indicators

### ✅ Pages
- Landing page with auth
- Gig feed with filters
- Post gig form
- My gigs (posted & accepted)
- Profile dashboard
- Leaderboard
- Admin metrics
- Proof of work cards

### ✅ Components
- Reusable card components
- Navigation bar
- Loading spinner
- Empty state placeholder
- Leaderboard items
- Proof cards

## 🔮 Future Enhancements

- Backend API integration
- Real Google OAuth
- WebSocket for real-time updates
- Notification system
- Advanced search and filters
- User avatars
- File uploads
- Comments and messaging
- Payment integration

## 📝 Dummy Data

The app currently uses dummy data for demonstration. All data is stored in component state and localStorage for persistence across sessions.

## 🎯 Demo Routes

- `/` - Landing page
- `/home` - Main gig feed
- `/post` - Create new gig
- `/my-gigs` - Your gigs
- `/profile` - Your profile
- `/leaderboard` - Rankings
- `/admin` - Admin dashboard (password: admin123)

## 🤝 Contributing

This is a hackathon project. For contributions, please create a pull request.

## 📄 License

MIT License
