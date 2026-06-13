# Grace Connect — UI Upgrade Script
## Aesthetic & UX Overhaul: From "AI-generated" to Premium

---

## Philosophy

The existing design system is already excellent (glassmorphism, mesh gradients, Inter, scroll-reveal). The problem isn't the tokens — it's how they're *applied*. AI-generated UIs tend to:
- Distribute padding too uniformly (everything feels equidistant)
- Use the same card style for everything
- Over-use borders and dividers
- Place typography at consistent sizes with no real hierarchy contrast
- Animate everything the same way

These changes apply editorial restraint — knowing when to *not* use a feature is as important as using it.

---

## 1. Typography — Contrast & Rhythm

### Add a Display Font for Hero Headlines

Currently everything uses Inter. Add a second font for display-level headings only.

```tsx
// src/app/providers.tsx
import { Inter, Instrument_Serif } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display'
})

// Add both variables to the html element
```

```css
/* src/index.css — update font variables */
--font-heading: 'Instrument Serif', Georgia, serif;  /* display headings only */
--font-body: 'Inter', -apple-system, sans-serif;     /* everything else */
```

```tsx
// Usage: Hero title, section headings
<h1 className="font-heading text-6xl lg:text-8xl font-normal tracking-tight">
  One <em>Church</em>,{' '}
  <span className="gradient-text">Many Campuses</span>
</h1>
```

> **Why Instrument Serif?** It has a beautiful italic form that pairs with Inter. It's free on Google Fonts. The italic feels spiritual and editorial — not corporate.

### Fix the Type Scale

Replace uniform sizing with deliberate contrast:

```css
/* src/index.css */

/* Hero — much bigger, tight tracking */
.text-display {
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-family: var(--font-heading);
  font-weight: 400;
}

/* Section eyebrow label */
.text-eyebrow {
  font-size: 0.6875rem;    /* 11px */
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  color: hsl(var(--primary));
}

/* Pull quote / feature text */
.text-feature {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  line-height: 1.4;
  font-family: var(--font-heading);
  font-style: italic;
}
```

```tsx
// Usage in every section header:
<p className="text-eyebrow mb-3">Latest Sermons</p>
<h2 className="text-display">Words that move you</h2>
```

---

## 2. Cards — Stop Making Everything the Same

### Three Card Tiers

```tsx
// src/components/ui/card.tsx — add variants

// TIER 1: Flat card (no border, just subtle bg shift)
// Use for: list items, secondary content
<div className="bg-card/60 rounded-2xl p-5">

// TIER 2: Outlined glass card (current style — overused)
// Use for: featured content only
<div className="glass-card p-6 hover-lift transition-all duration-300">

// TIER 3: Cinematic card (image-led, text overlaid)
// Use for: hero featured sermon, main event CTA
<div className="relative rounded-2xl overflow-hidden group cursor-pointer">
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
  <img className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
  <div className="absolute bottom-0 left-0 p-6 z-20">
    <p className="text-eyebrow text-primary/90 mb-2">Featured Sermon</p>
    <h3 className="text-2xl font-heading italic text-white">Title here</h3>
  </div>
</div>
```

---

## 3. Navigation — Make It Feel Like Apple/Linear

The current nav is good. These micro-details make it premium:

```tsx
// src/components/navigation.tsx

// 1. Add a blur-in scroll effect (replace static glass)
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 20)
  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}, [])

<nav className={cn(
  "fixed top-0 w-full z-50 transition-all duration-500",
  scrolled
    ? "glass border-b border-white/8 py-3"
    : "bg-transparent border-b border-transparent py-5"
)}>

// 2. Active nav item — pill indicator, not just color change
<a className={cn(
  "relative px-4 py-2 text-sm transition-all duration-200 rounded-full",
  isActive
    ? "text-foreground bg-white/8"
    : "text-muted-foreground hover:text-foreground hover:bg-white/4"
)}>
  {label}
</a>

// 3. CTA button in nav — small, prominent
<Button variant="gradient" size="sm" className="rounded-full px-5 text-xs font-semibold tracking-wide">
  Join Us
</Button>
```

---

## 4. Hero Section — Cinematic, Not Corporate

```tsx
// src/components/hero-section.tsx

// Remove the symmetric two-column layout.
// Full-width layered approach instead:

<section className="relative min-h-[100svh] flex items-center overflow-hidden">
  
  {/* Background: large blurred image or solid mesh */}
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
    {/* Floating orbs — make them bigger, fewer */}
    <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-float" />
    <div className="absolute bottom-1/3 left-1/6 w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px] floating" style={{ animationDelay: '2s' }} />
  </div>

  <div className="container relative z-10 pt-32 pb-20">
    
    {/* Eyebrow */}
    <div className="flex items-center gap-3 mb-8 animate-slide-up">
      <div className="w-8 h-px bg-primary" />
      <p className="text-eyebrow">Grace Church · Ahmedabad</p>
    </div>

    {/* Headline — asymmetric, large */}
    <h1 className="text-display max-w-4xl mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      Come as you are.<br />
      <em className="gradient-text">Leave transformed.</em>
    </h1>

    {/* Subtext — short, left-aligned */}
    <p className="text-muted-foreground text-lg max-w-md mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      A community of faith across multiple campuses in Gujarat, 
      united in worship and purpose.
    </p>

    {/* CTAs — staggered, not side-by-side */}
    <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <Button variant="gradient" size="xl" className="rounded-full">
        Find Your Campus
      </Button>
      <Button variant="ghost" size="lg" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
        <Play className="w-4 h-4" />
        Watch Live
      </Button>
    </div>

  </div>

  {/* Bottom scroll indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 animate-bounce">
    <div className="w-px h-8 bg-gradient-to-b from-transparent to-muted-foreground/40" />
  </div>

</section>
```

---

## 5. Section Transitions — Break the Grid

Every section currently uses the same padded container. Add spatial variety:

```tsx
// Pattern 1: Full-bleed background with contained content
<section className="bg-muted/30 -mx-6 lg:-mx-0 px-6 py-24">

// Pattern 2: Edge-to-edge with decorative offset text
<section className="py-24 relative overflow-hidden">
  {/* Large decorative word behind the content */}
  <span className="absolute -top-4 -left-4 text-[12rem] font-heading italic text-foreground/[0.02] select-none pointer-events-none">
    Worship
  </span>
  <div className="container relative z-10">
    {/* actual content */}
  </div>
</section>

// Pattern 3: Split asymmetric
// Content 60% / Visual 40% — not the default 50/50
<section className="grid lg:grid-cols-[3fr_2fr] gap-16 py-24">
```

---

## 6. The Sermon Cards — Premium Redesign

```tsx
// src/components/sermons-preview.tsx

// BEFORE: title + thumbnail + description cards in a grid
// AFTER: Featured lead card + smaller supporting cards

<div className="grid lg:grid-cols-[5fr_3fr] gap-6">
  
  {/* Featured Sermon — large, cinematic */}
  <div className="relative rounded-3xl overflow-hidden cursor-pointer group">
    <div className="aspect-[16/9] lg:aspect-[21/9]">
      <img src={featured.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
    <div className="absolute top-4 left-4">
      <Badge className="bg-primary/90 text-primary-foreground text-xs rounded-full px-3">
        {featured.series}
      </Badge>
    </div>
    <div className="absolute bottom-0 left-0 p-8">
      <p className="text-eyebrow text-primary mb-2">Latest Sermon</p>
      <h3 className="text-3xl font-heading italic text-white mb-2 leading-tight">{featured.title}</h3>
      <p className="text-white/60 text-sm">{featured.speaker} · {featured.date}</p>
    </div>
  </div>

  {/* Sidebar list — minimal, no thumbnails */}
  <div className="flex flex-col gap-4">
    <p className="text-eyebrow text-muted-foreground">Recent</p>
    {others.map(s => (
      <div key={s.id} className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white/4 transition-colors cursor-pointer border border-transparent hover:border-white/8">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
          <Play className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{s.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.speaker}</p>
        </div>
      </div>
    ))}
    <Button variant="ghost" className="self-start text-sm text-muted-foreground hover:text-primary mt-2 gap-1 p-0">
      View all sermons <ArrowRight className="w-3.5 h-3.5" />
    </Button>
  </div>

</div>
```

---

## 7. Event Cards — Dates as Design Elements

```tsx
// src/components/events-section.tsx

// BEFORE: standard card with all info in text
// AFTER: Date block used as strong visual anchor

<div className="group flex gap-5 p-5 rounded-2xl hover:bg-white/4 border border-transparent hover:border-white/8 transition-all duration-200 cursor-pointer">
  
  {/* Date block — treat this as an accent element */}
  <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20 py-3">
    <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
      {format(event.date, 'MMM')}
    </span>
    <span className="text-3xl font-heading text-primary leading-none">
      {format(event.date, 'd')}
    </span>
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-start justify-between gap-2 mb-1">
      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
        {event.title}
      </h4>
      {event.capacity && (
        <span className="text-xs text-muted-foreground/60 flex-shrink-0">
          {event.registrations}/{event.capacity} seats
        </span>
      )}
    </div>
    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
    <div className="flex items-center gap-3 mt-2">
      <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {format(event.date, 'h:mm a')}
      </span>
      <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {event.campus}
      </span>
    </div>
  </div>

</div>
```

---

## 8. Prayer Wall — Sacred, Not Clinical

```tsx
// src/components/prayer-wall.tsx

// Submission area — make it feel like a candle, not a form

<div className="relative p-8 rounded-3xl overflow-hidden">
  {/* Subtle prayer gradient bg */}
  <div className="absolute inset-0 bg-gradient-to-br from-prayer/10 to-accent/5 rounded-3xl" />
  
  {/* Decorative symbol */}
  <div className="relative z-10">
    <div className="w-10 h-10 rounded-full bg-prayer/20 border border-prayer/30 flex items-center justify-center mb-6 mx-auto">
      <Heart className="w-5 h-5 text-prayer" />
    </div>
    <p className="text-eyebrow text-prayer text-center mb-2">Prayer Wall</p>
    <h3 className="text-feature text-center text-foreground mb-2">
      "Cast your cares upon Him"
    </h3>
    <p className="text-center text-sm text-muted-foreground mb-8">Share your prayer request anonymously with the community.</p>
    
    {/* Textarea — borderless, feels like writing on paper */}
    <textarea
      className="w-full bg-white/4 border border-white/8 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-prayer/40 focus:bg-white/6 transition-all text-sm leading-relaxed min-h-[100px]"
      placeholder="Share what's on your heart..."
    />
  </div>
</div>

// Prayer cards — minimal, intimate
<div className="space-y-3">
  {prayers.map(p => (
    <div key={p.id} className="flex gap-3 p-4 rounded-xl bg-prayer-soft/30 border border-prayer/10">
      <div className="mt-0.5 w-5 h-5 rounded-full bg-prayer/20 flex-shrink-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-prayer" />
      </div>
      <div>
        <p className="text-sm text-foreground/90 leading-relaxed">{p.text}</p>
        <button className="text-xs text-prayer/60 hover:text-prayer mt-2 transition-colors flex items-center gap-1">
          <Heart className="w-3 h-3" /> Praying for this ({p.prayCount})
        </button>
      </div>
    </div>
  ))}
</div>
```

---

## 9. Admin Panel — Cleaner Data Density

```tsx
// Pattern: Replace thick-bordered tables with borderless lists

// BEFORE: shadcn Table with borders everywhere
// AFTER: Row-based list with hover state only

<div className="space-y-1">
  {items.map(item => (
    <div key={item.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/4 transition-colors group">
      {/* Avatar/icon */}
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.meta}</p>
      </div>
      {/* Status badge */}
      <Badge variant="outline" className="text-xs flex-shrink-0">
        {item.status}
      </Badge>
      {/* Actions — only visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="w-7 h-7">
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  ))}
</div>
```

---

## 10. Micro-interactions & Polish Details

### Stagger children animations

```tsx
// Utility: stagger animation delay on lists
// Add to any mapping loop:

{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'both' }}
  >
    <ItemCard item={item} />
  </div>
))}
```

### Empty states — not just text

```tsx
// Replace "No events found" with a designed empty state
<div className="flex flex-col items-center justify-center py-20 text-center">
  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
    <CalendarOff className="w-7 h-7 text-muted-foreground/40" />
  </div>
  <p className="text-sm font-medium text-muted-foreground">No events yet</p>
  <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
    Events will appear here once your admin adds them.
  </p>
</div>
```

### Button loading states

```tsx
// Add to all submit/action buttons:
<Button disabled={isLoading} className="gap-2 min-w-[120px]">
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

### Focus styles — visible but beautiful

```css
/* src/index.css */
:focus-visible {
  outline: 2px solid hsl(var(--primary) / 0.6);
  outline-offset: 3px;
  border-radius: 4px;
}
```

---

## 11. Login & Register Pages — Brand Moment

```tsx
// src/app/login/page.tsx
// BEFORE: centered card, generic
// AFTER: split layout with brand panel

<div className="min-h-screen grid lg:grid-cols-[1fr_1fr]">
  
  {/* Left — Brand panel (hidden on mobile) */}
  <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/20 via-accent/10 to-background border-r border-white/8">
    <div className="flex items-center gap-3">
      <img src="/logo.png" className="w-8 h-8" />
      <span className="font-semibold text-foreground">Grace Connect</span>
    </div>
    <blockquote className="space-y-3">
      <p className="text-feature text-foreground/90">
        "For where two or three gather in my name, there am I with them."
      </p>
      <footer className="text-sm text-muted-foreground">Matthew 18:20</footer>
    </blockquote>
    <p className="text-xs text-muted-foreground/40">
      Serving the Grace Church community across Gujarat
    </p>
  </div>

  {/* Right — Auth form */}
  <div className="flex items-center justify-center p-8">
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-heading italic text-foreground mb-2">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your Grace Connect account</p>
      </div>
      {/* form fields */}
    </div>
  </div>

</div>
```

---

## 12. Global CSS Additions

Add these to `src/index.css`:

```css
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: hsl(var(--background));
}
::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.5);
}

/* Text selection */
::selection {
  background: hsl(var(--primary) / 0.25);
  color: hsl(var(--foreground));
}

/* Eyebrow + display utilities */
.text-eyebrow {
  font-size: 0.6875rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
}

.text-display {
  font-size: clamp(2.5rem, 6vw, 5.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.text-feature {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  line-height: 1.5;
  font-style: italic;
}

/* Stagger animation helper */
.stagger > * {
  animation: slide-up 0.5s both;
}
.stagger > *:nth-child(1) { animation-delay: 0.0s; }
.stagger > *:nth-child(2) { animation-delay: 0.06s; }
.stagger > *:nth-child(3) { animation-delay: 0.12s; }
.stagger > *:nth-child(4) { animation-delay: 0.18s; }
.stagger > *:nth-child(5) { animation-delay: 0.24s; }
.stagger > *:nth-child(6) { animation-delay: 0.30s; }

/* Page transition wrapper */
.page-enter {
  animation: slide-up 0.4s ease both;
}
```

---

## Priority Order

| Priority | Change | Impact | Effort |
|---|---|---|---|
| 🔴 1 | Eyebrow + display text class (`text-eyebrow`, `text-display`) | Highest visual jump | 30 min |
| 🔴 2 | Instrument Serif import + hero headline font change | Makes hero cinematic | 15 min |
| 🔴 3 | Nav scroll effect (transparent → glass) | Pro feel instantly | 20 min |
| 🟡 4 | Sermon card redesign (featured + sidebar list) | Content feels premium | 1–2 hr |
| 🟡 5 | Event card with date block | Clear, usable | 1 hr |
| 🟡 6 | Login split layout | Strong brand moment | 1 hr |
| 🟢 7 | Prayer Wall redesign | Emotional resonance | 1–2 hr |
| 🟢 8 | Admin borderless rows | Cleaner density | 2 hr |
| 🟢 9 | Stagger animations + empty states | Polish throughout | 2 hr |
| 🟢 10 | Global CSS (scrollbar, selection, smooth scroll) | Invisible quality | 10 min |

---

## What NOT to Do

- ❌ Don't add more animations — the existing ones are enough. Trim, don't add.
- ❌ Don't use gradient buttons everywhere. Reserve `variant="gradient"` for the single most important CTA per page.
- ❌ Don't put borders on everything — use spacing and background shifts for separation instead.
- ❌ Don't center all text — left-aligned body copy reads faster and feels more intentional.
- ❌ Don't use `text-muted-foreground` for headings — ever. That's what makes things look grey and AI-generated.
- ❌ Don't use the same card component for every card. Differentiate intentionally.
