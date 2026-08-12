# Parchi Management System — Design System

> Primary source of truth for all UI/UX decisions.

---

## 1. Design Philosophy

**"Professional Calm"** — The interface should feel like a well-organized physical ledger: clean, legible, authoritative. No unnecessary decoration, no playful colors, no SaaS dashboard clichés.

Design references:
- Collection Industries (typography, whitespace, editorial feel)
- Premium POS terminals
- Japanese stationery / accounting tools

---

## 2. Color System

### Primary Palette

| Token               | Hex       | Usage                              |
|----------------------|-----------|-------------------------------------|
| `--ink`              | `#1A1A1A` | Primary text, headings              |
| `--ink-light`        | `#4A4A4A` | Secondary text, labels              |
| `--ink-muted`        | `#8A8A8A` | Placeholder, disabled text          |
| `--cream`            | `#FAF7F2` | Page background                     |
| `--cream-warm`       | `#F5F0E8` | Card backgrounds, surfaces          |
| `--cream-deep`       | `#EDE8DD` | Borders, dividers, hover states     |
| `--paper`            | `#FFFFFF` | Elevated surfaces, modals, inputs   |

### Accent Colors (Minimal, purposeful)

| Token               | Hex       | Usage                              |
|----------------------|-----------|-------------------------------------|
| `--accent`           | `#2D2D2D` | Primary buttons, active states      |
| `--accent-hover`     | `#404040` | Button hover                        |
| `--success`          | `#2D6A4F` | Verified, paid, collected           |
| `--success-bg`       | `#E8F5E9` | Success badge background            |
| `--warning`          | `#B8860B` | Pending, partial payment            |
| `--warning-bg`       | `#FFF8E1` | Warning badge background            |
| `--danger`           | `#8B2500` | Overdue, error, unpaid              |
| `--danger-bg`        | `#FFEBEE` | Error badge background              |
| `--info`             | `#37474F` | Info states, links                  |

### Semantic Colors

| State       | Text          | Background     | Border         |
|-------------|---------------|----------------|----------------|
| Verified    | `--success`   | `--success-bg` | `--success`    |
| Pending     | `--warning`   | `--warning-bg` | `--warning`    |
| Overdue     | `--danger`    | `--danger-bg`  | `--danger`     |
| Default     | `--ink`       | `--cream-warm` | `--cream-deep` |

---

## 3. Typography

### Font Stack

```
Primary:    "DM Serif Display", Georgia, serif   → Headings, page titles, amounts
Secondary:  "Inter", system-ui, sans-serif        → Body text, labels, inputs, UI
Mono:       "JetBrains Mono", monospace            → Numbers, amounts in tables
```

### Type Scale

| Element              | Font         | Size   | Weight | Letter-Spacing | Line-Height |
|----------------------|-------------|--------|--------|----------------|-------------|
| Page Title (H1)     | DM Serif    | 32px   | 400    | -0.02em        | 1.2         |
| Section Title (H2)  | DM Serif    | 24px   | 400    | -0.01em        | 1.3         |
| Card Title (H3)     | DM Serif    | 18px   | 400    | -0.01em        | 1.4         |
| Body                | Inter       | 14px   | 400    | 0              | 1.6         |
| Body Small          | Inter       | 13px   | 400    | 0              | 1.5         |
| Label               | Inter       | 12px   | 500    | 0.04em         | 1.4         |
| Caption             | Inter       | 11px   | 400    | 0.02em         | 1.4         |
| Amount (large)      | JetBrains   | 28px   | 600    | -0.02em        | 1.1         |
| Amount (table)      | JetBrains   | 14px   | 500    | 0              | 1.4         |
| Amount (small)      | JetBrains   | 12px   | 500    | 0              | 1.3         |

### Typography Rules

1. **Headings** always use DM Serif Display — gives the editorial, premium feel.
2. **All monetary amounts** use JetBrains Mono — ensures numerical alignment and readability.
3. **Labels** are always UPPERCASE with letter-spacing for scannability.
4. **Body text** uses Inter — clean, neutral, highly legible.
5. Never use more than 2 font weights on a single card/section.

---

## 4. Spacing & Layout

### Spacing Scale

```
4px   → xs    (tight spacing, icon gaps)
8px   → sm    (inline padding, compact)
12px  → md    (input padding, card internal)
16px  → base  (section gaps, standard padding)
24px  → lg    (between card groups)
32px  → xl    (page section gaps)
48px  → 2xl   (major layout sections)
64px  → 3xl   (page top padding)
```

### Layout Grid

- **Sidebar**: Fixed 260px width (Admin), 220px (Employee)
- **Main Content**: Fluid, max-width 1200px, centered
- **Content Padding**: 32px horizontal, 24px vertical
- **Card Grid**: CSS Grid, `gap: 16px`
- **Form Layout**: Single column for data entry speed, max-width 640px
- **Table Container**: Full width of content area

### Responsive Breakpoints

```
sm:   640px   → Mobile
md:   768px   → Tablet (sidebar becomes overlay)
lg:   1024px  → Desktop (sidebar visible)
xl:   1280px  → Large desktop
```

---

## 5. Components

### 5.1 Sidebar Navigation

```
Structure:
┌──────────────────────┐
│  PARCHI              │  ← Logo text, DM Serif, 20px
│  Management System   │  ← Subtitle, Inter, 11px, muted
│                      │
│  ─── MAIN ────────   │  ← Section label, uppercase, 10px
│                      │
│  ⊡ Dashboard         │  ← Nav item
│  ⊡ Daily Parchi      │
│  ⊡ Collections       │
│  ⊡ Shopkeepers       │
│  ⊡ Khata             │
│                      │
│  ─── MANAGE ──────   │
│                      │
│  ⊡ Employees         │
│  ⊡ Reports           │
│  ⊡ Settings          │
│                      │
│                      │
│  ┌────────────────┐  │
│  │ Admin Name     │  │  ← User info at bottom
│  │ admin@shop.pk  │  │
│  └────────────────┘  │
└──────────────────────┘
```

- Background: `--paper` (#FFFFFF)
- Border right: 1px solid `--cream-deep`
- Active item: Background `--cream-warm`, left border 2px solid `--ink`
- Hover item: Background `--cream`
- Icons: Lucide React, 18px, `--ink-muted`
- Active icon: `--ink`
- Text: Inter 14px, regular
- Active text: Inter 14px, medium

### 5.2 Cards

**Stat Card (Dashboard)**:
```
┌─────────────────────────┐
│  TODAY'S COLLECTION     │  ← Label, 11px, uppercase, muted
│                         │
│  Rs. 145,200            │  ← Amount, JetBrains Mono, 28px
│                         │
│  ↑ 12% from yesterday   │  ← Comparison, 12px, success/danger
└─────────────────────────┘
```
- Background: `--paper`
- Border: 1px solid `--cream-deep`
- Padding: 20px 24px
- Border-radius: 8px
- Shadow: none (rely on borders and background contrast)
- No gradient backgrounds
- No colored left borders for cards

**Info Card**:
- Same as stat card but without the large amount
- Used for shopkeeper info, employee info

### 5.3 Tables

Tables are the backbone of this system. They must be highly readable.

```
┌──────────────────────────────────────────────────────┐
│  Shopkeeper    │  Amount    │  Employee  │  Status   │
├──────────────────────────────────────────────────────┤
│  Ahmad Hdw.    │  Rs. 8,000 │  Saleem    │ ● Pending │
│  Bilal Store   │  Rs. 5,500 │  Saleem    │ ✓ Paid    │
│  Madina Hdw.   │  Rs. 12,000│  Razzaq    │ ○ Partial │
└──────────────────────────────────────────────────────┘
```

- Header: Background `--cream`, font Inter 11px uppercase, letter-spacing 0.06em, color `--ink-muted`
- Row: Background `--paper`, border-bottom 1px solid `--cream-deep`
- Row hover: Background `--cream`
- Cell padding: 12px 16px
- Amount column: JetBrains Mono, right-aligned
- Status: Small badge (see Badges below)
- No zebra striping — use border-bottom only
- Sticky header on scroll

### 5.4 Buttons

**Primary Button**:
- Background: `--ink` (#1A1A1A)
- Text: `--paper` (#FFFFFF), Inter 14px, medium
- Padding: 10px 20px
- Border-radius: 6px
- Hover: `--accent-hover` (#404040)
- Transition: background 150ms ease
- No shadows, no gradients

**Secondary Button**:
- Background: transparent
- Border: 1px solid `--cream-deep`
- Text: `--ink`, Inter 14px, regular
- Hover: Background `--cream`

**Ghost Button**:
- Background: transparent
- No border
- Text: `--ink-light`, Inter 14px, regular
- Hover: Background `--cream`, text `--ink`

**Danger Button**:
- Background: `--danger`
- Text: white
- Used only for destructive actions

**Button Sizes**:
- `sm`: 8px 14px, 13px text
- `md`: 10px 20px, 14px text (default)
- `lg`: 12px 24px, 15px text

### 5.5 Forms & Inputs

**Text Input**:
- Background: `--paper`
- Border: 1px solid `--cream-deep`
- Padding: 10px 14px
- Font: Inter 14px
- Border-radius: 6px
- Focus: border-color `--ink`, outline: none, box-shadow: 0 0 0 2px rgba(26,26,26,0.08)
- Label: Above input, Inter 12px, 500 weight, uppercase, letter-spacing 0.04em, color `--ink-light`
- Label-input gap: 6px
- Placeholder: Inter 14px, `--ink-muted`

**Select / Searchable Dropdown**:
- Same styling as text input
- Dropdown panel: Background `--paper`, border 1px solid `--cream-deep`, shadow: 0 4px 12px rgba(0,0,0,0.08)
- Option hover: Background `--cream`
- Selected option: Background `--cream-warm`, font-weight 500

**Amount Inputs**:
- Same as text input BUT use JetBrains Mono font
- Right-aligned text
- "Rs." prefix label inside the input, color `--ink-muted`

### 5.6 Badges / Status Tags

```
● Paid       → green text on green-tint bg
● Pending    → amber text on amber-tint bg
● Partial    → amber text on amber-tint bg
● Overdue    → red text on red-tint bg
● Verified   → green text on green-tint bg
● Unverified → amber text on amber-tint bg
```

- Font: Inter 11px, 500 weight, uppercase, letter-spacing 0.04em
- Padding: 3px 8px
- Border-radius: 4px
- Small dot (●) before text, same color as text

### 5.7 Modals

- Overlay: rgba(26, 26, 26, 0.4), backdrop-filter: blur(2px)
- Modal: Background `--paper`, border-radius 10px
- Width: 480px (small), 640px (medium), 800px (large)
- Padding: 24px
- Header: DM Serif 20px, border-bottom 1px solid `--cream-deep`, padding-bottom 16px
- Footer: border-top 1px solid `--cream-deep`, padding-top 16px, buttons right-aligned
- Animation: fade in + slight scale (0.98 → 1.0), 200ms ease-out

### 5.8 Toast / Notifications

- Position: top-right, 24px from edge
- Background: `--ink` (dark toast)
- Text: `--paper`, Inter 13px
- Padding: 12px 16px
- Border-radius: 6px
- Auto-dismiss: 4 seconds
- Success variant: left border 3px solid `--success`
- Error variant: left border 3px solid `--danger`

---

## 6. Page-Specific Design

### 6.1 Admin Dashboard

Layout:
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Dashboard                        Thu, 08 Aug    │
│                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │Today │  │Yest. │  │Month │  │Khata │        │
│  │145.2K│  │132.8K│  │2.1M  │  │890K  │        │
│  └──────┘  └──────┘  └──────┘  └──────┘        │
│                                                  │
│  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Today's Parchis     │  │  Pending Online  │  │
│  │  ┌─────────────────┐ │  │  Verifications   │  │
│  │  │ Table...        │ │  │  ┌──────────────┐│  │
│  │  └─────────────────┘ │  │  │ List...      ││  │
│  └──────────────────────┘  │  └──────────────┘│  │
│                             └──────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Recent Collections                        │  │
│  │  Table...                                  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 6.2 Employee Dashboard

Layout:
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Good Morning, Saleem           Thu, 08 Aug      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Assigned │  │ Collected│  │ Remaining│       │
│  │ Rs. 85K  │  │ Rs. 52K  │  │ Rs. 33K  │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Today's Parchis           [Enter Collec.] │  │
│  │  ┌────────────────────────────────────────┐│  │
│  │  │ Shopkeeper  │ Amount  │ Status │ Action ││  │
│  │  │ Ahmad Hdw.  │ 8,000   │ Pend.  │  [→]  ││  │
│  │  │ Bilal Store │ 5,500   │ Paid   │  [✓]  ││  │
│  │  └────────────────────────────────────────┘│  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Today's Activity                          │  │
│  │  Timeline style list of collections...     │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 7. Icons

Use **Lucide React** exclusively.

Icon size: 18px default, 16px in buttons, 20px in nav.

Common icons:
- Dashboard: `LayoutDashboard`
- Parchi: `FileText`
- Collections: `Banknote`
- Shopkeepers: `Store`
- Khata: `BookOpen`
- Employees: `Users`
- Reports: `BarChart3`
- Settings: `Settings`
- WhatsApp: `MessageCircle`
- Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- Search: `Search`
- Filter: `SlidersHorizontal`
- Print: `Printer`
- Download: `Download`
- Verify: `CheckCircle`
- Pending: `Clock`
- Close: `X`
- Menu: `Menu`
- Logout: `LogOut`
- Calendar: `Calendar`

---

## 8. Animations & Transitions

Keep animations **minimal and functional**.

```css
/* Standard transition for interactive elements */
transition: all 150ms ease;

/* Page transitions */
transition: opacity 200ms ease-in-out;

/* Modal entry */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.98) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Sidebar collapse */
transition: width 200ms ease;

/* Toast entry */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

**Do NOT use:**
- Bouncing animations
- Spinning loaders (use subtle pulse)
- Slide-up page transitions
- Animated gradients
- Parallax effects

---

## 9. Print Styles

Reports and parchis must print cleanly.

```css
@media print {
  /* Hide sidebar, navigation, buttons */
  /* Show content at full width */
  /* Use black text on white background */
  /* Ensure tables don't break across pages */
  /* Add page headers with date and title */
  /* Show "Rs." prefix on all amounts */
}
```

---

## 10. Responsive Behavior

### Mobile (< 768px)
- Sidebar hidden, accessible via hamburger menu
- Stat cards stack vertically (1 column)
- Tables scroll horizontally
- Forms go full width
- Modal goes full-screen on mobile

### Tablet (768px — 1024px)
- Sidebar as overlay
- Stat cards 2 per row
- Tables may truncate less-critical columns

### Desktop (> 1024px)
- Full sidebar visible
- Stat cards 4 per row (admin), 3 per row (employee)
- Full tables
- Side-by-side layout where appropriate

---

## 11. Data Formatting

- **Currency**: Always `Rs. XX,XXX` — use Pakistani formatting (commas)
- **Dates**: `08 Aug 2025` or `08 Aug` for current year
- **Time**: `2:30 PM` (12-hour format)
- **Phone**: `03XX-XXXXXXX`
- **Percentages**: `12%` (no decimal unless needed)
- **Negative amounts**: `- Rs. 10,000` (dash with space, danger color)
- **Positive changes**: `↑ 12%` (success color)
- **Negative changes**: `↓ 8%` (danger color)

---

## 12. Empty States

When no data exists, show:

```
┌──────────────────────────────────┐
│                                  │
│     [Relevant icon, 48px]        │
│                                  │
│     No parchis for today         │  ← DM Serif, 18px
│                                  │
│     Create your first parchi     │  ← Inter, 13px, muted
│     to get started.              │
│                                  │
│        [+ Create Parchi]         │  ← Primary button
│                                  │
└──────────────────────────────────┘
```

---

## 13. Loading States

- **Page loading**: Full-height skeleton with subtle pulse animation
- **Table loading**: Skeleton rows (5 rows of gray bars)
- **Button loading**: Replace text with small spinner (16px), maintain button width
- **Inline loading**: Subtle pulse on the specific element

No full-page spinners. No blocking overlays unless saving critical data.

---

## 14. Amount Display Hierarchy

Amounts should visually communicate importance:

```
Hero Amount (Dashboard stat):   JetBrains Mono 28px, 600 weight, --ink
Table Amount:                    JetBrains Mono 14px, 500 weight, --ink
Inline Amount:                   JetBrains Mono 14px, 400 weight, --ink
Small Amount (badge/caption):    JetBrains Mono 12px, 500 weight, --ink-light
Negative Amount:                 JetBrains Mono, same size, --danger
Positive Change:                 JetBrains Mono, same size, --success
```
