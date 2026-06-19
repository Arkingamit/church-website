---
name: Sanctuary Modern
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5a403d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8e706c'
  outline-variant: '#e2beba'
  surface-tint: '#b52522'
  primary: '#810008'
  on-primary: '#ffffff'
  primary-container: '#a61919'
  on-primary-container: '#ffb7af'
  inverse-primary: '#ffb4ab'
  secondary: '#805600'
  on-secondary: '#ffffff'
  secondary-container: '#fdb32d'
  on-secondary-container: '#6c4800'
  tertiary: '#2f3c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#465376'
  on-tertiary-container: '#bac7f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#92040d'
  secondary-fixed: '#ffddb0'
  secondary-fixed-dim: '#ffba47'
  on-secondary-fixed: '#281800'
  on-secondary-fixed-variant: '#614000'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b9c6ef'
  on-tertiary-fixed: '#0c1a3a'
  on-tertiary-fixed-variant: '#394668'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 120px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is built for a contemporary spiritual community, focusing on an atmosphere of warmth, reverence, and accessibility. The brand personality is "Elevated Grace"—it avoids the cluttered feel of traditional religious sites in favor of a **Corporate Modern** aesthetic infused with **Minimalist** breathing room.

The target audience spans a diverse congregation, requiring a UI that feels high-end yet deeply approachable. We use large, literary typography paired with a clean, structured layout to evoke a sense of peace and stability. High-quality imagery of community and nature should be treated with subtle overlays to maintain text legibility and visual cohesion.

## Colors

The palette is derived directly from the logo to maintain heritage while introducing deep tones for modern depth.

*   **Primary (Deep Crimson):** Used for key brand moments, high-emphasis buttons, and primary iconography. It represents the heart of the community.
*   **Secondary (Harvest Gold):** Employed for accents, "Live" indicators, and secondary calls to action. It provides a warm contrast to the deep red.
*   **Tertiary (Midnight Navy):** Extracted from the darker UI elements of the reference landing page, this color provides grounding for footers, text, and heavy navigation elements.
*   **Neutral (Parchment & Slate):** The background utilizes a very soft off-white to reduce eye strain, while text sits on a scale of deep slates to ensure maximum accessibility.

## Typography

This system uses a "Transitional" typographic pairing. **Playfair Display** provides an editorial, authoritative, and elegant feel for headings, reflecting the literary nature of scripture and sermon titles. **Work Sans** is used for body text and functional labels to provide a grounded, neutral, and highly legible experience across all digital touchpoints.

Headlines should use tight letter-spacing to feel modern, while labels utilize slight tracking and uppercase styling to differentiate themselves from body copy.

## Layout & Spacing

The design system utilizes a **Fixed Grid** model for desktop to ensure content remains readable and focused. 

*   **Grid System:** A 12-column grid with a 1280px max-width container. 
*   **Vertical Rhythm:** Generous section gaps (120px) are used to separate major content areas like "Worship Music" and "Upcoming Events," creating a "breathable" experience that doesn't feel rushed.
*   **Mobile Adaptation:** On mobile, margins shrink to 16px and the 12-column grid collapses into a single-column stack. Typography scales down specifically for display roles to prevent awkward wrapping.

## Elevation & Depth

To maintain a clean and sophisticated look, we use **Tonal Layers** and **Ambient Shadows** rather than heavy borders.

*   **Surfaces:** The main background is the Neutral highlight. Cards and containers use pure white (#FFFFFF) to lift off the page.
*   **Shadows:** Shadows are extremely soft and diffused (e.g., `0px 4px 20px rgba(0,0,0,0.05)`). We use a subtle tint of the Tertiary Navy in shadows to maintain color harmony.
*   **Interactive Depth:** On hover, cards should subtly lift (increased shadow spread) or utilize a thin secondary-colored top-border to indicate focus.

## Shapes

The shape language is **Rounded**, reflecting the welcoming nature of the church community. 

*   **Cards & Containers:** Use a 0.5rem (8px) radius for a soft, approachable feel.
*   **Buttons:** Standard buttons follow the `rounded-lg` (16px) pattern to feel distinct from data containers.
*   **Inputs:** Form fields and dropdowns use the base 8px radius to maintain consistency with the grid.

## Components

*   **Buttons:** 
    *   *Primary:* Solid Red background with White text. Bold and authoritative.
    *   *Secondary:* Midnight Navy background or Ghost-style with a Secondary Gold border.
*   **Cards:** Pure white background, 1px soft neutral border, and a subtle ambient shadow. Used for "Campus Locations" and "Events."
*   **Chips/Filter Tags:** Pill-shaped (rounded-xl) with light gray backgrounds. Active states use the Tertiary Navy for high contrast.
*   **Input Fields:** Minimalist with a soft 1px border. Focus state uses a 2px Primary Red bottom border or a subtle gold glow.
*   **Live Indicator:** A custom component using the Secondary Gold with a soft "pulse" animation to draw attention to active worship services.
*   **Quote Blocks:** Used for the "Daily Bible Verse," these should use the Headline-MD typography with a decorative serif quote mark in the Primary Red.