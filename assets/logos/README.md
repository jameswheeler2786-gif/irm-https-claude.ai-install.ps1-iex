# Outly logos

The site references **one** logo file in two places. To drop in the official
brand artwork, replace the file in place — keep the same filename and nothing
else needs to change.

| File | Used by | Sits on | Artwork needed |
|------|---------|---------|----------------|
| `logo-dark-bg.svg` | Nav (44px) **and** footer (32px) on `index.html` + `signup.html` | Dark graphite `#0F1E1E` | Frost/white mark + orange arc |
| `logo-light-bg.svg` | Not currently used — kept for future light-background placements | Light frost `#F2EEE6` | Dark graphite mark + orange arc |

> **Note:** the current design has a **dark nav and a dark footer**, so both
> positions use `logo-dark-bg.svg`. The light-background version is supplied
> only so it's ready if a light header is ever introduced.

## How to swap in the official logo

1. Export the official Outly mark as **SVG** (preferred) or a transparent
   **PNG** at 2× (≈88px tall covers the largest use).
2. Save the dark-background version over `logo-dark-bg.svg`, keeping the
   filename. Done — both the nav and footer pick it up.
3. If you export PNGs instead, name it `logo-dark-bg.png` and update the
   `<img src>` references (search `logo-dark-bg` in `index.html` and
   `signup.html` — there are two in each).

### If your export is a full wordmark lockup
The markup currently renders the **ring mark** (`<img>`) next to the word
"Outly" set in Sora. If the official artwork already includes the wordmark:

- Point the `<img>` at it, and
- Delete the adjacent `<span class="logo-text">Outly</span>` (nav) and
  `<span class="ft-logo-text">Outly</span>` (footer).

Each logo position is marked with a `DEV —` comment in the HTML.

## Brand

- Strapline in use: **Discover · Connect · Experience**
- Orange: `#E05A2A` · Graphite: `#0F1E1E` · Frost: `#F2EEE6`

## Current placeholder

Both SVGs are geometric placeholders of the ring mark (orange + graphite/frost
arcs). They are close to brand but are **not** the official artwork — replace
before public launch.
