---
name: Pitch Velocity
colors:
  surface: '#0f1419'
  surface-dim: '#0f1419'
  surface-bright: '#353a3f'
  surface-container-lowest: '#0a0f14'
  surface-container-low: '#171c21'
  surface-container: '#1b2025'
  surface-container-high: '#252a30'
  surface-container-highest: '#30353b'
  on-surface: '#dee3ea'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#dee3ea'
  inverse-on-surface: '#2c3137'
  outline: '#849584'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e476'
  primary: '#f0ffee'
  on-primary: '#003919'
  primary-container: '#00ff85'
  on-primary-container: '#007137'
  inverse-primary: '#006d35'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#fffaf9'
  on-tertiary: '#621100'
  tertiary-container: '#ffd5cb'
  on-tertiary-container: '#ba2a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#61ff97'
  primary-fixed-dim: '#00e476'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0700'
  on-tertiary-fixed-variant: '#8a1d00'
  background: '#0f1419'
  on-background: '#dee3ea'
  surface-variant: '#30353b'
typography:
  display-lg:
    fontFamily: Anybody
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Anybody
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Anybody
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-match:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The brand personality is electric, competitive, and celebratory, capturing the massive scale of a North American World Cup. It targets a global audience of passionate fans, data enthusiasts, and travelers. The UI evokes the atmosphere of a sold-out stadium: high energy, high precision, and cultural vibrancy.

The design style is **High-Contrast / Bold** mixed with **Modern Data-Driven** aesthetics. It utilizes massive typography for impact and tight, technical layouts for match statistics. Visual interest is driven by sharp angles, rhythmic patterns inspired by the three host nations' textiles and urban grids, and a sense of forward motion.

## Colors

The palette is optimized for a **dark mode** default to mirror the drama of "night games" under stadium floodlights. 

- **Primary (Stadium Green):** A high-vibrancy green used for "live" indicators, primary actions, and success states.
- **Secondary (Energetic Blue):** A technical, glowing blue used for data visualizations, interactive elements, and navigation accents.
- **Tertiary (Festive Red):** A punchy accent color used for tension—cards, alerts, and highlighting "must-watch" matches.
- **Neutral:** A deep "Obsidian" base that allows the neon-adjacent primary colors to pop without visual vibration.

## Typography

This design system uses an **Athletic-Technical** typographic hierarchy. 

**Anybody** provides the "Athletic" voice—its variable width allows for aggressive, condensed headlines that mimic sports jersey numbering and stadium signage. **Hanken Grotesk** offers a clean, contemporary feel for long-form news and player bios. **JetBrains Mono** is utilized for the "Data" layer—scores, clock times, and tactical statistics—giving the app a precise, broadcast-ready feel. 

Large display type should utilize tight tracking to emphasize the "Power" of the brand.

## Elevation & Depth

This design system eschews traditional shadows in favor of **Tonal Layers and Neon Strokes**. 

Hierarchy is established through:
- **Surface Level 0:** The Obsidian base (#0A0F14).
- **Surface Level 1:** A slightly lighter charcoal (#1A2026) for cards and containers.
- **Inner Glows:** Instead of drop shadows, active match cards feature a 1px inner border of the Primary Green or Secondary Blue to denote "Live" status.
- **Glassmorphism:** Navigation bars and player overlays use a 20px backdrop blur with a 10% white tint to maintain legibility over vibrant photography of fans and stadiums.

## Shapes

The shape language is **Technical and Precise**. We use a "Soft" roundedness (4px - 12px) to maintain a modern feel while avoiding the "friendliness" of fully rounded corners. 

- **Standard Buttons/Inputs:** 4px radius.
- **Match Cards:** 8px radius.
- **Nation Badges:** Circular (Full roundedness) to frame flags effectively.
- **Data Accents:** Use 45-degree angled "clipped" corners for labels to reinforce the athletic, fast-paced aesthetic.

## Components

### Match Cards
The core component. Features a Level 1 surface. Teams are displayed horizontally on mobile, vertically on desktop. The score is centered using **JetBrains Mono** at a large scale. A "Live" tag in the top-right uses the Primary Green with a subtle pulsing opacity animation.

### Group Tables
High-density components. Use alternating row fills (Level 0 and Level 1). The "Rank" column is emphasized with **Anybody** bold. Qualification zones (e.g., top 2) are indicated by a 4px vertical Primary Green bar on the left edge of the row.

### Nation Badges
Circular containers for flags with a 1px silver stroke. When used in match cards, they are accompanied by 3-letter country codes (FIFA standard) in **JetBrains Mono**.

### Buttons
- **Primary:** Stadium Green background, black text, 4px radius. High impact.
- **Secondary:** Transparent background, 2px Energetic Blue stroke, white text.
- **Actionable Icons:** Square containers with 4px radius and subtle glass effect.

### Input Fields
Dark backgrounds (#000000) with a bottom-only 2px stroke that turns Secondary Blue on focus. Labels sit above the field in **JetBrains Mono** at 10px.