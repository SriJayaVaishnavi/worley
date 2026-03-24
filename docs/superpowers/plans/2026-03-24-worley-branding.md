# Worley Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand Explainable Risk Pulse with Worley's corporate colors and company name throughout all UI components.

**Architecture:** Define Worley color tokens as CSS custom properties in `index.css`, then replace all `zinc-900`/`zinc-800` brand-color usages across 7 files with the new Tailwind v4 theme tokens. Sidebar gets Worley name + "W" icon.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 (with `@theme` directive), Vite

**Spec:** `docs/superpowers/specs/2026-03-24-worley-branding-design.md`

---

### Task 1: Define Worley CSS custom properties

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add Worley color tokens to the `@theme` block**

In `src/index.css`, add the Worley colors inside the existing `@theme { }` block, after the font definitions:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --color-worley-primary: #E8491A;
  --color-worley-primary-hover: #D4400F;
  --color-worley-secondary: #F26522;
  --color-worley-navy: #1A1A2E;
  --color-worley-navy-mid: #2D2D44;
  --color-worley-bg: #F5F5F0;
}
```

This makes classes like `bg-worley-primary`, `text-worley-navy`, `border-worley-navy-mid` etc. available throughout all components.

- [ ] **Step 2: Verify the dev server picks up the new tokens**

Run: `npm run dev`
Open browser, inspect any element, confirm the CSS variables exist in `:root`.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add Worley brand color tokens to Tailwind theme"
```

---

### Task 2: Rebrand the Sidebar

**Files:**
- Modify: `src/App.tsx` — lines 262-314 (sidebar section)

- [ ] **Step 1: Replace the outer `<div>` background**

Line 262: Change `bg-zinc-50` to `bg-worley-bg` and `text-zinc-900` to `text-worley-navy`:
```tsx
<div className="flex h-screen bg-worley-bg font-sans text-worley-navy overflow-hidden">
```

- [ ] **Step 2: Replace sidebar `<motion.aside>` colors**

Line 267: Change `bg-zinc-900` to `bg-worley-navy` and `border-zinc-800` to `border-worley-navy-mid`:
```tsx
className="bg-worley-navy text-white flex flex-col border-r border-worley-navy-mid z-50"
```

- [ ] **Step 3: Replace the logo icon and add Worley subtitle**

Lines 271-276. Replace the current `ShieldAlert` icon block with a "W" icon and add subtitle:
```tsx
{isSidebarOpen && (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-worley-primary rounded-lg flex items-center justify-center">
      <span className="text-white font-extrabold text-sm">W</span>
    </div>
    <div>
      <span className="font-bold tracking-tight text-lg">Risk Pulse</span>
      <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-worley-primary">Worley Intelligence</div>
    </div>
  </div>
)}
```

- [ ] **Step 4: Replace sidebar toggle button hover**

Line 278: Change `hover:bg-zinc-800` to `hover:bg-worley-navy-mid`:
```tsx
className="p-1 hover:bg-worley-navy-mid rounded"
```

- [ ] **Step 5: Replace nav button active/hover states**

Line 294: Change the active/hover classes:
```tsx
activeTab === item.id ? "bg-worley-primary text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-worley-navy-mid"
```

- [ ] **Step 6: Replace user section border and avatar**

Line 303: Change `border-zinc-800` to `border-worley-navy-mid`:
```tsx
<div className="p-6 border-t border-worley-navy-mid">
```

Line 305 (user avatar): Change `bg-zinc-700` to `bg-worley-navy-mid`:
```tsx
<div className="w-8 h-8 rounded-full bg-worley-navy-mid flex items-center justify-center text-xs font-bold">JD</div>
```

- [ ] **Step 7: Verify sidebar in browser**

Open the app. Confirm:
- Sidebar background is dark navy (#1A1A2E)
- "W" icon is orange with "Risk Pulse" + "WORLEY INTELLIGENCE" subtitle
- Active tab is orange, hover states use mid-navy
- User avatar area uses mid-navy divider and background

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rebrand sidebar with Worley name and color palette"
```

---

### Task 3: Rebrand Dashboard Summary Cards

**Files:**
- Modify: `src/App.tsx` — lines 351-362 (summary cards)

Note: The main content area background is already handled by Task 2 Step 1 (`bg-zinc-50` → `bg-worley-bg` on the outer wrapper at line 262). The scrollable area at line 339 has no background class — it inherits from the wrapper.

- [ ] **Step 1: Rebrand Critical Risks card**

Line 351: Add `border-l-4 border-worley-primary` and change value text color:
```tsx
<div className="p-6 bg-white rounded-2xl border border-zinc-200 border-l-4 border-l-worley-primary shadow-sm">
  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Critical Risks</span>
  <div className="text-3xl font-bold mt-1 text-worley-primary">{risks.filter(r => r.likelihood > 70).length}</div>
</div>
```

- [ ] **Step 2: Rebrand Deltas card**

Line 355: Add `border-l-4 border-worley-secondary` and change value text from `text-amber-600` to `text-worley-secondary`:
```tsx
<div className="p-6 bg-white rounded-2xl border border-zinc-200 border-l-4 border-l-worley-secondary shadow-sm">
  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Deltas</span>
  <div className="text-3xl font-bold mt-1 text-worley-secondary">{deltas.length}</div>
</div>
```

- [ ] **Step 3: Rebrand Confidence card**

Line 359: Add `border-l-4 border-worley-navy` and change value text from `text-green-600` to `text-worley-navy` (intentional — green implied "healthy" which is misleading for a neutral metric):
```tsx
<div className="p-6 bg-white rounded-2xl border border-zinc-200 border-l-4 border-l-worley-navy shadow-sm">
  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Avg Confidence</span>
  <div className="text-3xl font-bold mt-1 text-worley-navy">{risks.length > 0 ? Math.round(risks.reduce((s, r) => s + r.confidence, 0) / risks.length) : 0}%</div>
</div>
```

- [ ] **Step 4: Verify in browser**

Confirm summary cards have colored left borders (orange, secondary orange, navy) and matching value colors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rebrand dashboard summary cards with Worley accents"
```

---

### Task 4: Rebrand Brief Cards (Signal/Impact/Root Cause/Action)

**Files:**
- Modify: `src/App.tsx` — lines ~486-522 (structured explanation cards)

- [ ] **Step 1: Replace Signal card colors**

Change:
- `border-red-200` → `border-worley-primary`
- `bg-red-100` → `bg-worley-primary/10`
- `text-red-600` (on label) → `text-worley-primary`

- [ ] **Step 2: Replace Impact card colors**

Change:
- `border-amber-200` → `border-worley-secondary`
- `bg-amber-100` → `bg-worley-secondary/10`
- `text-amber-600` (on label) → `text-worley-secondary`

- [ ] **Step 3: Replace Root Cause card colors**

Change:
- `border-purple-200` → `border-worley-navy-mid`
- `bg-purple-100` → `bg-worley-navy-mid/10`
- `text-purple-600` (on label) → `text-worley-navy-mid`

- [ ] **Step 4: Replace Action card colors**

Change:
- `border-blue-200` → `border-worley-navy`
- `bg-blue-100` → `bg-worley-navy/10`
- `text-blue-600` (on label) → `text-worley-navy`

- [ ] **Step 5: Verify in browser**

Select a risk, wait for the AI explanation to load. Confirm the four brief cards show:
- Signal: orange border + orange label
- Impact: secondary orange border + label
- Root Cause: mid-navy border + label
- Action: dark navy border + label

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rebrand brief cards with Worley color palette"
```

---

### Task 5: Rebrand Detail Panel, Sub-tabs, and Buttons in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace risk detail panel border and icon**

Line 400: Change `border-2 border-zinc-900` to `border-2 border-worley-navy`:
```tsx
<div className="p-5 bg-white rounded-2xl border-2 border-worley-navy shadow-xl relative shrink-0">
```

Line 407: Change `bg-zinc-900` to `bg-worley-navy`:
```tsx
<div className="w-10 h-10 bg-worley-navy text-white rounded-xl flex items-center justify-center shrink-0">
```

- [ ] **Step 2: Replace detail sub-tab active state**

Line 459: Change active state from `bg-zinc-900 text-white` to `bg-worley-navy text-white`:
```tsx
? "bg-worley-navy text-white shadow-lg"
```

Line 460: Change hover from `hover:text-zinc-900` to `hover:text-worley-navy`:
```tsx
: "bg-white text-zinc-500 hover:text-worley-navy hover:bg-zinc-100 border border-zinc-200"
```

- [ ] **Step 3: Replace GID Surge button**

Line 594: Change `bg-zinc-900` to `bg-worley-primary` and `hover:bg-zinc-800` to `hover:bg-worley-primary-hover`:
```tsx
className="w-full p-4 bg-worley-primary text-white rounded-xl flex items-center justify-center gap-3 hover:bg-worley-primary-hover transition-colors shadow-lg"
```

- [ ] **Step 4: Replace Copilot FAB button**

Line 711: Change `bg-zinc-900` to `bg-worley-navy` and `hover:bg-zinc-800` to `hover:bg-worley-navy-mid`:
```tsx
className="w-14 h-14 bg-worley-navy text-white rounded-full shadow-xl flex items-center justify-center hover:bg-worley-navy-mid transition-colors"
```

- [ ] **Step 5: Verify in browser**

Check:
- Detail panel has navy border
- Sub-tabs use navy active state
- GID Surge button is orange
- Copilot FAB is navy

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rebrand detail panel, sub-tabs, and buttons with Worley colors"
```

---

### Task 6: Rebrand Copilot.tsx

**Files:**
- Modify: `src/components/Copilot.tsx`

- [ ] **Step 1: Replace outer container**

Line 32: Change `bg-zinc-900` to `bg-worley-navy` and `border-zinc-800` to `border-worley-navy-mid`:
```tsx
<div className="flex flex-col h-full bg-worley-navy text-white rounded-2xl border border-worley-navy-mid shadow-2xl overflow-hidden">
```

- [ ] **Step 2: Replace header**

Line 34: Change `border-zinc-800` to `border-worley-navy-mid` and `bg-zinc-900/50` to `bg-worley-navy/50`:
```tsx
<div className="p-4 border-b border-worley-navy-mid flex items-center justify-between bg-worley-navy/50 backdrop-blur-md">
```

- [ ] **Step 3: Replace quick-prompt buttons**

Line 64: Change `border-zinc-800` to `border-worley-navy-mid` and `hover:bg-zinc-800` to `hover:bg-worley-navy-mid`:
```tsx
className="text-[10px] font-bold uppercase tracking-wider p-2 border border-worley-navy-mid rounded-lg hover:bg-worley-navy-mid transition-colors"
```

- [ ] **Step 4: Replace user message bubble and avatar**

Line 86: Change `bg-zinc-800` to `bg-worley-navy-mid`:
```tsx
msg.role === 'user' ? "bg-worley-navy-mid" : "bg-zinc-100"
```

Line 93: Change `bg-zinc-800` to `bg-worley-navy-mid`:
```tsx
msg.role === 'user' ? "bg-worley-navy-mid text-zinc-100 rounded-tr-none" : "bg-zinc-100 text-zinc-900 rounded-tl-none"
```

- [ ] **Step 5: Replace input area**

Line 121: Change `bg-zinc-900` and `border-zinc-800`:
```tsx
<form onSubmit={handleSubmit} className="p-4 bg-worley-navy border-t border-worley-navy-mid">
```

Line 128: Change `bg-zinc-800` and `border-zinc-700` and `focus:ring-zinc-600`:
```tsx
className="w-full bg-worley-navy-mid border border-worley-navy-mid rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-worley-primary transition-all"
```

- [ ] **Step 6: Verify in browser**

Open the copilot chat. Confirm:
- Container is navy, not zinc
- User messages are mid-navy
- Input area and field match the navy theme
- Quick prompts have navy borders

- [ ] **Step 7: Commit**

```bash
git add src/components/Copilot.tsx
git commit -m "feat: rebrand Copilot chat with Worley navy palette"
```

---

### Task 7: Rebrand ChallengeMode.tsx

**Files:**
- Modify: `src/components/ChallengeMode.tsx`

- [ ] **Step 1: Replace toggle header**

Line 59: Change `bg-zinc-900 text-white` to `bg-worley-navy text-white` and `text-zinc-900` to `text-worley-navy`:
```tsx
isOpen ? "bg-worley-navy text-white" : "bg-white text-worley-navy hover:bg-zinc-50"
```

- [ ] **Step 2: Replace user challenge bubble**

Line 116: Change `bg-zinc-800` to `bg-worley-navy-mid`:
```tsx
<div className="p-3 bg-worley-navy-mid text-white rounded-xl rounded-tr-none max-w-[80%]">
```

- [ ] **Step 3: Replace send button**

Line 163: Change `bg-zinc-900` to `bg-worley-navy` and `hover:bg-zinc-700` to `hover:bg-worley-navy-mid`:
```tsx
className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-worley-navy rounded-lg flex items-center justify-center text-white disabled:opacity-30 hover:bg-worley-navy-mid transition-colors"
```

- [ ] **Step 4: Verify in browser**

Open challenge mode on a risk. Confirm toggle header is navy, user bubbles are mid-navy, send button is navy.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChallengeMode.tsx
git commit -m "feat: rebrand ChallengeMode with Worley navy palette"
```

---

### Task 8: Rebrand FileUpload.tsx

**Files:**
- Modify: `src/components/FileUpload.tsx`

- [ ] **Step 1: Replace "Load Sample Data" button**

Line 119: Change `bg-zinc-900` to `bg-worley-primary` and `hover:bg-zinc-800` to `hover:bg-worley-primary-hover`:
```tsx
className="flex items-center gap-2 px-3 py-1.5 bg-worley-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-worley-primary-hover transition-all"
```

- [ ] **Step 2: Replace drag-active border**

Line 132: Change `border-zinc-900` to `border-worley-primary`:
```tsx
isDragging ? "border-worley-primary bg-zinc-50" : "border-zinc-200 hover:border-zinc-400",
```

- [ ] **Step 3: Replace loading spinner**

Line 157: Change `border-zinc-900` to `border-worley-primary`:
```tsx
<div className="w-8 h-8 border-2 border-worley-primary border-t-transparent rounded-full animate-spin mb-4" />
```

- [ ] **Step 4: Replace text color references**

Line 150: Change `text-zinc-900` to `text-worley-navy`:
```tsx
<p className="text-sm font-medium text-worley-navy">Click to upload or drag and drop</p>
```

Lines 168, 181: Change `hover:text-zinc-900` to `hover:text-worley-navy`:
```tsx
className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-worley-navy"
```

- [ ] **Step 5: Verify in browser**

Go to Data tab. Confirm Load Sample Data button is orange, drag area highlights orange, spinner is orange.

- [ ] **Step 6: Commit**

```bash
git add src/components/FileUpload.tsx
git commit -m "feat: rebrand FileUpload with Worley primary orange"
```

---

### Task 9: Rebrand StressSimulator.tsx and BenchmarkCard.tsx

**Files:**
- Modify: `src/components/StressSimulator.tsx`
- Modify: `src/components/BenchmarkCard.tsx`

- [ ] **Step 1: Replace StressSimulator header icon**

Line 72: Change `bg-zinc-900` to `bg-worley-navy`:
```tsx
<div className="w-8 h-8 bg-worley-navy rounded-lg flex items-center justify-center">
```

- [ ] **Step 2: Replace range slider accent**

Line 97: Change `accent-zinc-900` to `accent-worley-primary`:
```tsx
className="w-full h-2 rounded-full appearance-none cursor-pointer accent-worley-primary"
```

- [ ] **Step 3: Replace StressSimulator value text**

Line 155: Change `text-zinc-900` to `text-worley-navy`:
```tsx
<span className="text-lg font-bold font-mono text-worley-navy">
```

- [ ] **Step 4: Replace BenchmarkCard hover border**

Line 53: Change `hover:border-zinc-900` to `hover:border-worley-navy`:
```tsx
'bg-white border border-zinc-200 text-zinc-500 hover:text-worley-navy hover:border-worley-navy'
```

- [ ] **Step 5: Replace BenchmarkCard heading text**

Line 22: Change `text-zinc-900` to `text-worley-navy`:
```tsx
<h4 className="text-sm font-bold text-worley-navy mb-1">{benchmark.project_type}</h4>
```

- [ ] **Step 6: Verify in browser**

Check Simulate tab: slider is orange accent, header icon is navy. Check benchmark card: hover border is navy.

- [ ] **Step 7: Commit**

```bash
git add src/components/StressSimulator.tsx src/components/BenchmarkCard.tsx
git commit -m "feat: rebrand StressSimulator and BenchmarkCard with Worley colors"
```

---

### Task 10: Rebrand RiskRadar.tsx selected state

**Files:**
- Modify: `src/components/RiskRadar.tsx`

- [ ] **Step 1: Replace selected risk card colors**

Line 40: Change `bg-zinc-900 border-zinc-900 text-white` to `bg-worley-navy border-worley-navy text-white` and `text-zinc-900` to `text-worley-navy`:
```tsx
selectedRiskId === risk.id ? "bg-worley-navy border-worley-navy text-white shadow-lg" : "bg-white border-zinc-200 hover:border-zinc-400 text-worley-navy"
```

- [ ] **Step 2: Verify in browser**

Go to Risk Radar tab. Select a risk. Confirm the selected card is dark navy, unselected cards have navy text.

- [ ] **Step 3: Commit**

```bash
git add src/components/RiskRadar.tsx
git commit -m "feat: rebrand RiskRadar selected state with Worley navy"
```

---

### Task 11: Final visual QA pass

- [ ] **Step 1: Full walkthrough**

Walk through every screen in the app:
1. Data tab → upload CSV / load sample data → orange button, orange drag state
2. Dashboard → summary cards with colored left borders, off-white background
3. Risk Radar → select a risk → navy selected card
4. Brief tab → Signal/Impact/Root Cause/Action cards in Worley colors
5. Simulate tab → navy header icon, orange slider, orange GID button
6. Challenge tab → navy toggle, navy bubbles
7. Copilot FAB → navy button, navy chat container

- [ ] **Step 2: Check for any remaining zinc-900 or zinc-800 brand usages**

Run: `grep -rn "zinc-900\|zinc-800\|zinc-700" src/ --include="*.tsx"`

Any remaining matches should only be in:
- Model (AI) message bubbles in Copilot (`bg-zinc-100 text-zinc-900` — these are the light-themed AI messages, correct)
- Neutral text colors that are not brand colors (e.g., `text-zinc-900` on non-branded text)

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: final QA cleanup for Worley branding"
```
