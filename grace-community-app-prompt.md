# Grace Connect — UI Design Prompt
**Stack-Aware Edition (Next.js App Router + MongoDB Atlas)**

> Paste this into v0, Lovable, Bolt, or any emergent AI design tool.
> All screens, data bindings, and component wiring reflect the real Grace Connect architecture.

---

## Project Overview

Build the complete UI for **Grace Connect**, a full-stack church community web application.

- **Framework:** Next.js 14+ with App Router  
- **Database:** MongoDB Atlas via Mongoose  
- **Auth:** Google OAuth (NextAuth / custom JWT)  
- **State:** React Context — `AuthContext` (user session) + `AdminDataContext` (all content, fetched once on load and cached — navigation is instant)  
- **Background jobs:** Cron for recurring announcements + live YouTube stream polling via `live-stream-poller.tsx`

**Target users:** Church members of all ages (18–75+), campus pastors (admin role), and first-time visitors (guest).

**Platform:** Web-first, responsive. Design at 1280px desktop; provide mobile breakpoints down to 375px.

---

## Visual Identity & Design Language

### Color Palette

| Role | Name | Hex |
|------|------|-----|
| Primary | Deep Slate Blue | `#2C3E6B` |
| Accent | Warm Gold | `#C8971A` |
| Surface | Warm Ivory | `#FAF8F4` |
| Card | Soft White | `#FFFFFF` |
| Text Primary | Charcoal | `#1E1E1E` |
| Text Secondary | Warm Gray | `#6B6560` |
| Success | Sage Green | `#4A7C59` |
| Warning | Muted Amber | `#D97706` |
| Divider | Pale Linen | `#E8E3DC` |

### Typography

- **Display / Hero:** Playfair Display — page titles, scripture quotes, hero headings  
- **Body / UI:** Inter — all interface text, labels, inputs  
- **Meta / Timestamps:** Inter Mono — admin table IDs, timestamps

### Design Principles

- Border radius: `16px` cards, `12px` inputs, `24px` primary buttons, `8px` chips  
- Card shadow: `0 2px 12px rgba(0,0,0,0.07)`  
- Gradient on hero areas: Slate Blue `#2C3E6B` to `#3D5491`  
- **Signature element:** A 2px Warm Gold horizontal rule appears under the app logo and major page headers — used nowhere else  
- Icons: Lucide React (stroke 1.5px) — already in the Next.js ecosystem  
- Transitions: `150ms ease` on hover/active states; no loading spinners for data from context (it's cached)

---

## Route Map (Matches Real Next.js App Router Structure)

| Screen | Route | Data Source | MongoDB Model |
|--------|-------|-------------|---------------|
| Login | `/login` | `POST /api/auth/login` | `User` |
| Register | `/register` | `POST /api/auth/register` + `GET /api/campuses` | `User` |
| Home Dashboard | `/` | `AdminDataContext` (announcements, events) + `GET /api/prayers` + `GET /api/verses/today` | `PrayerRequest`, `DailyVerse`, `Announcement` |
| Worship Music | `/music` | `AdminDataContext.worshipVideos` | `Media` (type: worship_video) |
| Sermons | `/sermons` | `AdminDataContext.sermons` | `Media` (type: sermon) |
| Sermon Series | `/sermons/series/[id]` | `GET /api/admin/media/sermons?series=[id]` | `Media` |
| Events | `/events` | `AdminDataContext.events` | `Event`, `EventRegistration` |
| Gallery | `/gallery` | `GET /api/gallery/photos` | `Event.googlePhotosUrl` |
| Profile | `/profile` | `AuthContext.user` + `GET /api/users/[id]` | `User` |
| Admin | `/admin/*` | `GET /api/admin/*` | All models |

---

## Screens to Generate

---

### 1. `/login` — Sign In

Centered 480px card on ivory background.

- Grace Connect wordmark + logo, centered top  
- 2px gold rule beneath logo  
- h1 in Playfair Display: "Welcome back"  
- "Continue with Google" — full-width Slate Blue button, Google icon left  
- Divider: or  
- Email + Password inputs (labeled above, never placeholder-only)  
- "Sign In" secondary button  
- "Don't have an account? Register" link  

**Auth flow:** On success, AuthContext sets user from JWT. If `user.status === 'pending'` → redirect to `/register?status=pending`.

---

### 2. `/register` — Registration (Two States)

**State A — Form:**
- Fields: Full Name, Email, Password, Campus (dropdown from `GET /api/campuses`)  
- "Register with Google" primary CTA  
- Submit → `POST /api/auth/register` → creates User with `status: 'pending'`

**State B — Pending Approval** (`?status=pending`):
- Illustration or gentle icon (hourglass, dove)  
- h2: "You're on the list!"  
- Body: "Your campus pastor will review and approve your account. Sign in again once approved."  
- Amber badge: Pending Approval  
- "Sign out" ghost button

---

### 3. `/` — Home Dashboard

**Top Navbar (sticky):**
- Left: Grace Connect logo + wordmark  
- Center (desktop): Home | Music | Sermons | Events | Gallery  
- Right: Logged-in → avatar dropdown (Profile, Admin if admin role, Sign Out). Guest → "Sign In" button  
- **LIVE NOW indicator:** When `live-stream-poller.tsx` detects active YouTube broadcast, inject a pulsing red pill "● LIVE NOW" in the navbar linking to the stream. Dynamic — no page reload. Hide when stream ends.

**Hero Banner:**
- Full-width Slate Blue gradient  
- Logged-in: "Good morning, [First Name] 🙏" (from `AuthContext.user.name`) + "Sunday Service — 10:00 AM · Grace Community Campus"  
- Guest: "Welcome to Grace Connect" + "Join our community" CTA button

**Announcements Carousel** (`AdminDataContext.announcements`):
- Horizontal scroll: 3 cards visible desktop, 1.2 mobile  
- Card: thumbnail, gold category chip, bold title, 1-line preview, date  
- Recurring announcements (auto-populated by `/api/cron/recurring-announcements`) appear in the same list — no special UI treatment

**Prayer Wall Preview** (`GET /api/prayers`):
- "Community Prayer Wall" section header + gold rule  
- 3 most recent PrayerRequest documents  
- Each: avatar, name or "Anonymous", request text (2-line truncate), prayer count, "Praying for them" toggle button  
- "See all prayers" link

**Daily Verse Card** (`GET /api/verses/today`):
- Ivory card with 4px left gold border  
- Scripture in Playfair Display italic  
- Reference in Warm Gold

**Upcoming Events** (`AdminDataContext.events`, next 3):
- Event name, date/time gold chip, campus tag, RSVP button  
- "See all events" link

---

### 4. `/music` — Worship Music

**Data:** `const { worshipVideos } = useAdminData()` — no fetch, instant load.

- Page header "Worship Music" in Playfair Display + gold rule  
- Video grid: 3-col desktop, 2-col tablet, 1-col mobile  
- Each card: YouTube thumbnail, title, duration chip  
- Hover state: scale-up + play button overlay (Slate Blue circle, white triangle)  
- Click → YouTube iframe in dark modal overlay (not new tab), title below player, X to close  
- Empty state: "New worship content coming soon. Check back after Sunday!"

---

### 5. `/sermons` — Sermons

**Data:** `AdminDataContext.sermons`

- Tabs: All Sermons | By Series  
- Filters: This Month | Last 3 Months | By Speaker | By Campus

**All Sermons:** List layout — card per sermon with thumbnail, gold series badge, title (Playfair Display), speaker + date, campus, Watch + Listen buttons.

**By Series / `/sermons/series/[id]`:** Series banner image, title, description, episode count, then chronological episode list.

---

### 6. `/events` — Events

**Data:** `AdminDataContext.events` (cached)

- Tab toggle: List View | Calendar View

**List View:**  
Filter chips: All | This Week | This Month | Campus dropdown.  
Event card: cover image, title, date/time gold chip, location, description, attendee count, RSVP button.  
RSVP flow: click → confirmation modal → `POST /api/admin/events/[id]/register` → button becomes "Going ✓" (Sage Green).

**Calendar View:**  
Month grid. Days with events show a gold dot. Click day → slide-up drawer with event list.

---

### 7. `/gallery` — Photo Gallery

**Data:** `GET /api/gallery/photos` (reads `Event.googlePhotosUrl`)

- Masonry grid, 3-col desktop  
- Thumbnail + event name on hover  
- Click → lightbox modal with full image + event name + date

---

### 8. `/profile` — User Profile

**Data:** `AuthContext.user` + `GET /api/users/[id]`

- Top card: circular avatar (editable), name in Playfair Display, campus badge, member since, role badge  
- Status badge: `pending` → amber "Pending Approval" | `approved` → green "Active Member"  
- Bio / Testimony: editable textarea + Save  
- Campus: read-only  
- Settings accordion: Notifications | Privacy | Change Password | Sign Out (red ghost button)

---

### 9. `/admin/*` — Admin Dashboard

**Access guard:** `role: 'admin'` or `role: 'pastor'` only — all others redirect to `/`

**Sidebar navigation (collapsible on mobile):**  
Dashboard | Users (pending count badge) | Events | Media | Announcements | Prayer Requests | Campuses | Cron Status

**Users — `/admin/users`:**
- Table: Name, Email, Campus, Status chip, Role, Joined date, Actions  
- Pending rows: amber left border accent  
- Actions: Approve | Suspend | Edit Role  
- Approve → `PATCH /api/admin/users/[id]` sets `status: 'approved'`  
- Filter tabs: All | Pending | Approved | Suspended

**Media — `/admin/media/worship-videos` and `/admin/media/sermons`:**
- Table of Media documents by type  
- Add New → modal: Title, YouTube URL (auto-parse video ID), Series, Campus, Tags  
- Edit / Delete inline actions

**Announcements — `/admin/announcements`:**
- List: title, type chip (One-time | Recurring), next scheduled date, active toggle  
- Add New: Title, Body, Image upload, Category, Recurrence rule (none / weekly / monthly), Campus target

**Cron Status panel:**
- Last run time + status for `recurring-announcements` and `youtube/check-live`  
- Manual trigger buttons for local testing

---

## Component Reference

| Component | File | Data |
|-----------|------|------|
| `<LiveBanner />` | `live-stream-poller.tsx` | Polls `/api/youtube/check-live` |
| `<PrayerWall />` | `prayer-wall.tsx` | `GET /api/prayers` |
| `<DailyVerse />` | `daily-verse.tsx` | `GET /api/verses/today` |
| `<AnnouncementCarousel />` | `announcement-carousel.tsx` | `AdminDataContext.announcements` |
| `<EventCard />` | `event-card.tsx` | `AdminDataContext.events[n]` |
| `<VideoModal />` | `video-modal.tsx` | YouTube video ID prop |
| `<RSVPButton />` | `rsvp-button.tsx` | `Event._id`, `AuthContext.user._id` |
| `<PrayerToggle />` | `prayer-toggle.tsx` | `PrayerRequest._id`, count |
| `<StatusBadge />` | `status-badge.tsx` | `user.status`: pending/approved/suspended |
| `<ScriptureCard />` | `scripture-card.tsx` | `DailyVerse.text`, `.reference` |
| `<GoldRule />` | `gold-rule.tsx` | Presentational — 2px `#C8971A` |
| `<SectionHeader />` | `section-header.tsx` | `title`, optional `href` for See All |

---

## Dark Mode

CSS custom property approach — toggle via profile settings:

```css
:root {
  --bg: #FAF8F4;
  --card: #FFFFFF;
  --text: #1E1E1E;
  --text-muted: #6B6560;
  --primary: #2C3E6B;
  --accent: #C8971A;
}
[data-theme="dark"] {
  --bg: #12151E;
  --card: #1C2033;
  --text: #F0EDE8;
  --text-muted: #9E9891;
  --primary: #4A6FBF;
  --accent: #C8971A;
}
```

---

## Accessibility

- Minimum 44x44px tap targets  
- Contrast ratio >= 4.5:1 for body text  
- All icon-only buttons: `aria-label`  
- `prefers-reduced-motion`: disable all transitions  
- Always visible label above form fields — never placeholder-only  
- Modal dialogs: focus trap + Escape to close

---

## Deliverables from AI Tool

1. All 9 screens at 1280px desktop + 375px mobile breakpoint  
2. Full component library (all components in the table above)  
3. Dark mode variants: Home, Admin Users, Sermons  
4. Interactive prototype flows:
   - Guest → Register → Pending Approval screen
   - Member → Home → RSVP to an Event
   - Pastor → Admin → Approve a pending user
5. CSS design tokens (colors, typography, spacing, radius, shadow)  
6. File names follow Next.js App Router: `app/music/page.tsx`, `app/sermons/[id]/page.tsx`, `app/admin/users/page.tsx`, etc.

---

*Grace Connect is the digital home of a real, warm church community — not a SaaS dashboard. The technology should be invisible. The connection is everything.*
