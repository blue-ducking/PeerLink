---
name: PeerLink
description: Closed-campus peer-to-peer student platform with Mona Sans typography and clean editorial structure
colors:
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  text-primary: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#94a3b8"
  border-subtle: "#e2e8f0"
  border-strong: "#cbd5e1"
  primary: "#1e293b"
  primary-hover: "#0f172a"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  status-verified: "#166534"
  status-verified-bg: "#f0fdf4"
  status-pending: "#854d0e"
  status-pending-bg: "#fefce8"
  status-rejected: "#991b1b"
  status-rejected-bg: "#fef2f2"
typography:
  font-family: "'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  display:
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  headline:
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  subhead:
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  body-large:
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.4
  small:
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

## Overview
PeerLink's design language draws inspiration from Mona Sans and GitHub's editorial product aesthetic. It eschews generic "boxed CRUD card" tropes in favor of spacious typography, subtle horizontal rules, intentional whitespace, and crisp, restrained hierarchy.

## Colors
- **Canvas (`neutral-bg`)**: `#f8fafc` — crisp, clean light canvas.
- **Surface (`neutral-surface`)**: `#ffffff` — clean content background.
- **Primary Text (`text-primary`)**: `#0f172a` — deep slate for high contrast (passes WCAG AAA).
- **Secondary Text (`text-secondary`)**: `#475569` — balanced contrast (passes WCAG AA ≥ 4.5:1).
- **Borders (`border-subtle`, `border-strong`)**: `#e2e8f0` and `#cbd5e1` — minimal 1px hairline dividers.
- **Primary Action (`primary`)**: `#1e293b` with hover `#0f172a` — understated authority.
- **Accent Link (`accent`)**: `#2563eb` — focused interactive cues.

## Typography
- **Typeface**: `Mona Sans`, with fallback to modern system sans (`-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif`).
- **Hierarchy**: Large, confident headings with modest line-height and tight tracking (`-0.02em` to `-0.03em`).
- **Body Measure**: Formatted to 65–75 characters per line for maximum editorial legibility.

## Layout
- Spacious max-width containers (`max-width: 1040px` for standard views, `720px` for auth/forms, `1200px` for landing).
- Generous vertical rhythm with section spacing (`3rem` to `4.5rem`).
- Single-column editorial lists with hairline dividers instead of grid tiles in cards.

## Elevation & Depth
- Flat by default. Elevation is communicated through tonal contrast and hairline borders (`1px solid var(--border-subtle)`), not heavy drop shadows.
- Modest shadow `0 1px 3px rgba(15, 23, 42, 0.06)` used only on active floating controls like dropdown menus or search focus.

## Shapes
- Modest corner radii: `6px` for buttons, inputs, and small badges. No oversized pill buttons.
- Clean straight edges with hairline dividers.

## Components
- **Buttons**: Restrained, accessible buttons with high-contrast text and 6px border-radius.
- **Forms**: Clean inputs with explicit semantic labels, clear placeholder guidance, inline validation, and visible focus rings.
- **Dividers**: 1px subtle lines (`border-bottom: 1px solid var(--border-subtle)`) separating list items and sections.
- **Status Badges**: Text with subtle color indicators (e.g. `● Verified`), not giant loud banners.

## Do's and Don'ts
- **DO**: Use generous whitespace, clean horizontal rules, and strong typography to create hierarchy.
- **DO**: Maintain WCAG AA contrast (≥4.5:1 for body copy).
- **DON'T**: Wrap every piece of data in rounded box cards.
- **DON'T**: Use gradient text, drop-shadow soup, or emoji as icon substitutes.
- **DON'T**: Use colored cards for statuses.
