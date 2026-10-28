---
name: PeerLink
description: Closed-campus peer-to-peer student platform with Mona Sans typography and clean editorial structure
colors:
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-subtle: "#f4f4f5"
  text-primary: "#18181b"
  text-secondary: "#52525b"
  text-muted: "#71717a"
  border-subtle: "#e4e4e7"
  border-strong: "#d4d4d8"
  primary: "#18181b"
  primary-hover: "#27272a"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  brand-lilac: "#b5a5ec"
  brand-lilac-facet: "#9d8de2"
  brand-lilac-subtle: "#f0edfb"
  brand-lilac-scrollbar: "#c8beef"
  brand-yellow: "#f6d049"
  brand-yellow-hover: "#fde047"
  status-verified: "#166534"
  status-verified-bg: "#f0fdf4"
  status-pending: "#854d0e"
  status-pending-bg: "#fefce8"
  status-rejected: "#991b1b"
  status-rejected-bg: "#fef2f2"
  auth-canvas: "#b5a5ec"
  auth-facet: "#9d8de2"
  auth-yellow: "#f6d049"
  auth-card-bg: "#ffffff"
  auth-text-dark: "#18181b"
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
  xl: "12px"
  card-sm: "16px"
  xxl: "20px"
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
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

## Overview
PeerLink's design language draws inspiration from Mona Sans, GitHub's editorial product aesthetic, and the Deel authentication reference (`LogIn.png`). It balances spacious editorial layouts with a distinctive lilac split-canvas authentication world, white floating cards, and sharp typography.

## Colors
- **Canvas (`neutral-bg`)**: `#f8fafc` — crisp, clean light canvas for internal dashboard views.
- **Auth Canvas (`auth-canvas` / `brand-lilac`)**: `#b5a5ec` — soft lilac purple canvas directly inspired by `LogIn.png`.
- **Auth Facet (`auth-facet` / `brand-lilac-facet`)**: `#9d8de2` — angled geometric facet shade for visual momentum.
- **Surface (`neutral-surface` / `auth-card-bg`)**: `#ffffff` — clean floating card background.
- **Primary Text (`text-primary` / `auth-text-dark`)**: `#18181b` — deep charcoal slate for high contrast.
- **Secondary Text (`text-secondary`)**: `#52525b` and `#71717a` — balanced readable contrast (≥ 4.5:1).
- **Accent Yellow (`auth-yellow` / `brand-yellow`)**: `#f6d049` / `#fde047` — vibrant task chair, lamp, and sticker accent.
- **Borders (`border-subtle`, `border-strong`)**: `#e4e4e7` and `#d4d4d8` — minimal hairline dividers.
- **Primary Action (`primary`)**: `#18181b` with hover `#27272a`.
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
- Floating cards use soft depth: `0 25px 50px -12px rgba(30, 27, 75, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)`.

## Shapes
- Modest corner radii: `6px` to `8px` for buttons, inputs, and small badges. `20px` for floating cards.
- Clean straight edges with hairline dividers.

## Components
- **Buttons**: Restrained, accessible buttons with high-contrast text and 8px border-radius.
- **Forms**: Clean inputs with explicit semantic labels, clear placeholder guidance, inline validation, and visible focus rings.
- **Dividers**: 1px subtle lines (`border-bottom: 1px solid var(--border-subtle)`) separating list items and sections.
- **Status Badges**: Text with subtle color indicators (e.g. `● Verified`), not giant loud banners.

## Do's and Don'ts
- **DO**: Use generous whitespace, clean horizontal rules, and strong typography to create hierarchy.
- **DO**: Maintain WCAG AA contrast (≥4.5:1 for body copy).
- **DON'T**: Wrap every piece of data in rounded box cards.
- **DON'T**: Use gradient text, drop-shadow soup, or emoji as icon substitutes.
- **DON'T**: Use colored cards for statuses.
