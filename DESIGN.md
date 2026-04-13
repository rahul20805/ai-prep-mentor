# AI Prep Mentor Design System

## Visual Direction
Editorial, refined, purposeful. Professional interface for focused exam preparation. Calm, structured aesthetic with clear information hierarchy.

## Tone & Differentiation
Confidence through clarity. No decoration, pure actionability. Cool slate/indigo primary paired with warm amber accents for action highlights. Today's tasks, progress visualizations, and weak areas emphasized.

## Color Palette (Light Mode)
| Role | OKLCH | Usage |
|------|-------|-------|
| Background | 0.97 0.01 270 | Main canvas, neutral base |
| Card | 0.99 0 0 | Content containers, elevated surfaces |
| Primary | 0.45 0.15 258 | Navigation active, focus rings, primary actions |
| Accent | 0.72 0.22 68 | Today highlights, calls-to-action, progress emphasis |
| Muted | 0.92 0.02 270 | Disabled states, secondary text hierarchy |
| Destructive | 0.55 0.22 25 | Delete, critical actions, errors |

## Color Palette (Dark Mode)
| Role | OKLCH | Usage |
|------|-------|-------|
| Background | 0.13 0.03 262 | Main canvas, deep slate |
| Card | 0.17 0.04 262 | Content containers, elevated contrast |
| Primary | 0.75 0.16 258 | Active navigation, interactive states |
| Accent | 0.75 0.22 68 | Highlights, action indicators (warm amber) |
| Muted | 0.22 0.03 270 | Secondary content, reduced emphasis |
| Destructive | 0.65 0.19 22 | Destructive actions, alerts |

## Typography
| Layer | Font | Scale | Weight |
|-------|------|-------|--------|
| Display | Bricolage Grotesque | 32px / 24px | 700–900 |
| Body | DM Sans | 14px / 16px | 400–600 |
| Mono | Geist Mono | 12px–14px | 400–600 |

## Structural Zones
| Zone | Style | Purpose |
|------|-------|---------|
| Sidebar | Dark (0.2 0.05 262), fixed left | Navigation, persistent context |
| Header | Light card (0.99 0 0), border-bottom | Quick stats, task count, date context |
| Main Content | bg-background, card grid | Dashboard sections, timetable, analytics |
| Charts Section | muted bg (0.92 0.02 270), data-heavy | Performance analytics, trend visualization |

## Spacing & Density
Grid: 8px base unit. Sidebar 260px. Card padding 16px. Gap between sections 16px. Info-dense layouts with 4-6 items per row on desktop.

## Component Patterns
- Buttons: Filled primary, outlined secondary, ghost muted. No rounded corners (sm radius).
- Cards: White bg, subtle shadow (2px 4px), border 1px muted. Active state: accent border, accent left stripe.
- Inputs: Muted bg (0.95 0.01 270), 8px border radius, 2px focused ring.
- Progress bars: Chart-1 (0.72 0.22 68) for filled, muted for background.
- Badges: Accent bg with accent-foreground text for active, muted for neutral.

## Motion & Interaction
Smooth transitions (0.3s) on all interactive state changes. Fast transitions (0.15s) for hover effects. No animations on load—focus on smooth interactions. Sidebar slide, dropdown fade.

## Constraints & Anti-Patterns
- No full-page gradients, no rainbow palettes, no excessive shadows.
- Min 8px border-radius for accessibility (clickable areas), 4px for decorative elements.
- 2-color chart palette maximum per visualization (primary + accent), rotate for multiple series.
- Sidebar stays fixed on desktop; drawer on mobile. No transitions that distract from studying.

## Key Differentiator
Warm accent color (amber) on today's tasks and weak-area highlights creates visual urgency without being aggressive. Information density meets white space—every pixel serves the study goal.
