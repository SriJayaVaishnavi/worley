# Worley Branding Integration — Design Spec

## Overview

Rebrand the Explainable Risk Pulse UI with Worley's corporate identity: company name in the sidebar and Worley color palette applied throughout all components.

## Decisions

- **Name placement**: Option D — "Risk Pulse" title with "WORLEY INTELLIGENCE" subtitle in sidebar header
- **Color depth**: Full Rebrand — Worley palette replaces all generic zinc/Tailwind colors across sidebar, cards, buttons, and content area
- **Severity colors**: Unchanged — red/amber/green stay for clarity in DeltaTable and RiskRadar severity badges

## Color System

| Token | Hex | CSS Variable | Role |
|-------|-----|-------------|------|
| Primary Orange | `#E8491A` | `--color-worley-primary` | Active sidebar tab, Signal card border, primary CTAs, summary card accent |
| Primary Hover | `#D4400F` | `--color-worley-primary-hover` | Hover state for primary buttons |
| Secondary Orange | `#F26522` | `--color-worley-secondary` | Impact card border, secondary accents |
| Dark Navy | `#1A1A2E` | `--color-worley-navy` | Sidebar background, Action card border, headings, Copilot |
| Mid Navy | `#2D2D44` | `--color-worley-navy-mid` | Sidebar hover/border, Root Cause card border, user avatar bg |
| Off-White | `#F5F5F0` | `--color-worley-bg` | Main content area background |
| White | `#FFFFFF` | — | Cards, panels, input backgrounds |

CSS variables defined in `index.css` under `@theme`, referenced via Tailwind v4 as `bg-worley-primary`, `text-worley-navy`, etc.

## Component Color Mapping

### Sidebar (`App.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Background | `bg-zinc-900` | `bg-worley-navy` |
| Border | `border-zinc-800` | `border-worley-navy-mid` |
| Hover | `hover:bg-zinc-800` | `hover:bg-worley-navy-mid` |
| Active tab | `bg-white text-zinc-900` | `bg-worley-primary text-white` |
| Inactive text | `text-zinc-400` | `text-zinc-400` (unchanged) |
| Logo icon | `bg-white` with `text-zinc-900` ShieldAlert | `bg-worley-primary` with white "W" text |
| Title | "Risk Pulse" | "Risk Pulse" (kept) |
| Subtitle | (none) | "WORLEY INTELLIGENCE" in `text-worley-primary` |
| User section border | `border-zinc-800` | `border-worley-navy-mid` |
| User avatar bg | `bg-zinc-700` | `bg-worley-navy-mid` |

### Dashboard Summary Cards (`App.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Critical risks accent | generic | `border-l-4 border-worley-primary`, value in `text-worley-primary` |
| Deltas accent | generic | `border-l-4 border-worley-secondary`, value in `text-worley-secondary` |
| Confidence accent | generic | `border-l-4 border-worley-navy`, value in `text-worley-navy` |

Note: Confidence card currently uses `text-green-600`. Changing to navy is intentional — the green implied "healthy" which is misleading for a neutral metric. Navy keeps it informational.

### Brief Cards — Signal/Impact/Root Cause/Action (`App.tsx`)
| Card | Current border | New border | Current label color | New label color |
|------|---------------|------------|--------------------|-----------------|
| Signal | `border-red-200` | `border-worley-primary` | `text-red-600` | `text-worley-primary` |
| Impact | `border-amber-200` | `border-worley-secondary` | `text-amber-600` | `text-worley-secondary` |
| Root Cause | `border-purple-200` | `border-worley-navy-mid` | `text-purple-600` | `text-worley-navy-mid` |
| Action | `border-blue-200` | `border-worley-navy` | `text-blue-600` | `text-worley-navy` |

Icon background colors for brief cards:
- Signal: `bg-red-100` → `bg-worley-primary/10`
- Impact: `bg-amber-100` → `bg-worley-secondary/10`
- Root Cause: `bg-purple-100` → `bg-worley-navy-mid/10`
- Action: `bg-blue-100` → `bg-worley-navy/10`

Note on Root Cause vs Action differentiation: Mid Navy (#2D2D44) and Dark Navy (#1A1A2E) are visually close. The `border-top` color and icon background tint provide enough distinction on white cards. The icon itself (Search vs Lightbulb) and the uppercase label text add further differentiation. If in practice the cards look too similar, a fallback is to use a lighter `#4A4A6A` for Root Cause.

### Content Area (`App.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Main background | `bg-zinc-100` | `bg-worley-bg` |
| Page headings | `text-zinc-900` | `text-worley-navy` |

### Detail Sub-tabs (`App.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Active sub-tab (Brief/Simulate/Twin/Challenge) | `bg-zinc-900 text-white` | `bg-worley-navy text-white` |

### Risk Detail Panel (`App.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Panel border | `border-2 border-zinc-900` | `border-2 border-worley-navy` |
| Risk icon container | `bg-zinc-900` | `bg-worley-navy` |

### Buttons & CTAs (`App.tsx`, `StressSimulator.tsx`, `FileUpload.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Primary buttons | `bg-zinc-900` | `bg-worley-primary` with `hover:bg-worley-primary-hover` |
| Secondary buttons | varies | `bg-worley-navy` with `hover:bg-worley-navy-mid` |
| GID Surge button | `bg-zinc-900` | `bg-worley-primary` |

### FileUpload (`FileUpload.tsx`)
| Element | Current | New |
|---------|---------|-----|
| "Load Sample Data" button | `bg-zinc-900` | `bg-worley-primary` with `hover:bg-worley-primary-hover` |
| Drag-active border | `border-zinc-900` | `border-worley-primary` |
| Loading spinner | `border-zinc-900` | `border-worley-primary` |

### Copilot (`Copilot.tsx`, `App.tsx`)
| Element | Current | New |
|---------|---------|-----|
| FAB button | `bg-zinc-900` | `bg-worley-navy` |
| FAB hover | `hover:bg-zinc-800` | `hover:bg-worley-navy-mid` |
| Outer container | `bg-zinc-900` | `bg-worley-navy` |
| Container border | `border-zinc-800` | `border-worley-navy-mid` |
| Chat header bg | `bg-zinc-900` | `bg-worley-navy` |
| Quick-prompt buttons | `border-zinc-800`, `hover:bg-zinc-800` | `border-worley-navy-mid`, `hover:bg-worley-navy-mid` |
| User message bg | `bg-zinc-800` | `bg-worley-navy-mid` |
| User avatar | `bg-zinc-800` | `bg-worley-navy-mid` |
| Input area | `bg-zinc-900 border-zinc-800` | `bg-worley-navy border-worley-navy-mid` |
| Input field | `bg-zinc-800 border-zinc-700` | `bg-worley-navy-mid border-worley-navy-mid` |
| "Powered by Groq" footer | unchanged (third-party attribution) |

### ChallengeMode (`ChallengeMode.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Toggle header (open) | `bg-zinc-900 text-white` | `bg-worley-navy text-white` |
| User challenge bubble | `bg-zinc-800` | `bg-worley-navy-mid` |
| Send button | `bg-zinc-900` | `bg-worley-navy` |

### StressSimulator (`StressSimulator.tsx`)
| Element | Current | New |
|---------|---------|-----|
| Header icon bg | `bg-zinc-900` | `bg-worley-navy` |
| Range slider accent | `accent-zinc-900` | `accent-worley-primary` |
| GID Surge button | `bg-zinc-900` | `bg-worley-primary` |

### BenchmarkCard (`BenchmarkCard.tsx`)
| Element | Current | New |
|---------|---------|-----|
| "Simulate Mitigation" hover | `hover:border-zinc-900` | `hover:border-worley-navy` |

### Unchanged Components
- **RiskRadar.tsx**: Severity color coding (red/amber/green) unchanged for data clarity
- **DeltaTable.tsx**: Severity badges unchanged
- **DigitalTwin.tsx**: Domain-specific color coding unchanged
- **CarbonPenalty.tsx**: Severity-based greens/ambers/reds unchanged

## Files to Modify

1. **`src/index.css`** — Add Worley CSS custom properties under `@theme`
2. **`src/App.tsx`** — Sidebar branding, summary cards, brief cards, content bg, buttons, copilot FAB, detail panel, sub-tabs
3. **`src/components/Copilot.tsx`** — Full rebrand of all dark-background elements
4. **`src/components/ChallengeMode.tsx`** — Toggle header, user bubble, send button
5. **`src/components/FileUpload.tsx`** — Load Sample Data button, drag state, spinner
6. **`src/components/StressSimulator.tsx`** — Header icon, slider accent, GID button
7. **`src/components/BenchmarkCard.tsx`** — Mitigation button hover border

## Out of Scope

- Font changes (Inter stays)
- Worley logo image/SVG (using "W" text icon instead)
- Severity color overrides in RiskRadar, DeltaTable, CarbonPenalty, DigitalTwin
- Backend/LLM prompt changes
