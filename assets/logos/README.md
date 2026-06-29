# Outly logos

The site references exactly **two** logo files. To drop in the official
brand artwork, replace these files in place — keep the same filenames and
nothing else needs to change.

| File | Where it's used | Background | Recommended artwork |
|------|-----------------|------------|---------------------|
| `logo-light.svg` | Top nav | Light (frost `#F2EEE6`) | Dark graphite + orange mark |
| `logo-dark.svg`  | Footer  | Dark (graphite `#1A3A3A`) | Frost/white + orange mark |

## How to swap in the official logo

1. Export the official Outly mark from your brand file as **SVG** (preferred)
   or a transparent **PNG** at 2× (≈88px tall for nav, 64px for footer).
2. Save the light-background version as `logo-light.svg` and the
   dark-background version as `logo-dark.svg`, overwriting the placeholders.
3. If you export PNGs instead of SVGs, rename them `logo-light.png` /
   `logo-dark.png` and update the two `<img src>` references in
   `index.html` and `signup.html` (search for `logo-light` / `logo-dark`).

### Notes on the current markup
- The nav and footer currently render the **ring mark** (`<img>`) next to the
  word "Outly" set in the Sora typeface (`.logo-text` / `.ft-logo-text`).
- If your official export is a **full wordmark lockup** (mark + "Outly"
  together), set the image to the full lockup and delete the adjacent
  `<span class="logo-text">Outly</span>` / `<span class="ft-logo-text">Outly</span>`.
- Brand strapline in use: **Less swiping. More Outly.**

## Current placeholder

`logo-light.svg` / `logo-dark.svg` are geometric placeholders of the ring
mark (orange + graphite arcs). They are close to brand but are **not** the
official artwork — replace before any production/public launch.
