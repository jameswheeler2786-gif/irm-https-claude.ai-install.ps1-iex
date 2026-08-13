# Outly — Developer Notes

Handover notes for the marketing site (`outlyevents.com`).
Static HTML/CSS/JS — no build step, no framework, no npm install.
Open `index.html` in a browser and it works.

---

## 1. File map

```
index.html            Landing page
signup.html           Host registration  → /signup.html
campus-partners.html  Campus Partner recruitment → /campus-partners.html
calculator.html       Host + Promoter earnings calculators → /calculator.html
css/main.css          ALL styles for both pages
js/main.js            Landing page: scroll reveal + FAQ accordion
js/signup.js          Signup: type picker, validation, submission
js/campus-partners.js Campus Partner: reveal, FAQ, application form
js/calculator.js      Calculators — ALL PRICING RATES LIVE HERE
assets/logos/
  logo-dark-bg.svg    THE logo — used by nav + footer on both pages
  logo-light-bg.svg   Spare, for light backgrounds. Not currently used.
  README.md           Logo swap instructions
```

**There are no external JavaScript dependencies.** The only outbound
request is Google Fonts. Everything else is self-contained.

---

## 2. Colours

Defined once as CSS custom properties at the top of `css/main.css`.
Change them there and they cascade everywhere — never hard-code a hex.

| Variable | Hex | Used for |
|---|---|---|
| `--graphite` | `#0F1E1E` | Dark section backgrounds, nav, footer, body text on light |
| `--frost` | `#F2EEE6` | Light section backgrounds, text on dark |
| `--orange` | `#E05A2A` | Primary accent — CTAs, eyebrows, `<em>` in headings, globe |
| `--bone` | `#BFE5E1` | Pale teal section backgrounds |
| `--slate` | `#4A6B6B` | Body copy on light backgrounds |
| `--cool-grey` | `#A8B5C4` | Body copy on dark backgrounds, muted labels |
| `--white` | `#FFFFFF` | Cards on coloured backgrounds |
| `--success` | `#157F7A` | Ticket "sold" counts, "Live" badge |

The four Pulse step tags (`.ptag`) all share **one orange treatment** — they
were previously four different colours. There is no per-tag modifier class;
if you add a fifth step, `class="ptag"` is all it needs.

Two brand secondaries — gold `#D4AF37` and purple `#7A68FF` — were retired
when the tags were unified. They're noted in a comment in `main.css` but
nothing references them.

### Text colour rule
Light background → `--graphite` headings, `--slate` body.
Dark background → `--frost` headings, `--cool-grey` body.

Getting this backwards makes text invisible — it has already happened once
on this site (a dark heading on a dark section). If you add a section,
check the heading actually renders.

---

## 3. Section rhythm

Backgrounds alternate deliberately. Keep the pattern if you add sections.

| # | Section | `id` | Background |
|---|---|---|---|
| 1 | Hero | `hero` | graphite (dark) |
| 2 | Ticker | — | graphite (dark) |
| 3 | What is Outly | `solution` | bone |
| 4 | What makes it unique | `value` | frost |
| 5 | How it works / Pulse | `pulse` | graphite (dark) |
| 6 | Who it's for | `matching` | bone |
| 7 | Getting started | `how` | frost |
| 8 | FAQ | `final` | graphite (dark) |
| 9 | Footer | — | graphite (dark) |

> `id="final"` holds the **FAQ** — a legacy name from the original design.
> Don't rename it without updating the nav/footer links in `signup.html`.

---

## 4. Sizing

### Full-viewport sections
Sections 3–8 are `height: calc(100vh - 60px)` with `overflow: hidden`,
so each fills the screen. The hero is `calc(100vh - 30px)`.

**This is the most fragile thing on the site.** If content grows past the
viewport it gets *silently clipped* — no scrollbar, it just vanishes.
Guards are already in place:

```css
@media (max-width: 900px)                      { height: auto; overflow: visible; }
@media (max-height: 820px) and (min-width: 901px) { height: auto; overflow: visible; }
```

If you add copy to one of these sections, **test at 1280×800** (a common
laptop) before shipping. If it clips, either trim the copy or drop that
section to `height: auto`.

### Layout widths
| Element | Max width |
|---|---|
| `.pulse-in` | 1060px |
| `.val-in` | 1100px |
| `.howsec-inner` | 1100px |
| `.matching-in` | 900px |
| `.faq-in` | 740px |
| `.signup-wrap` | 680px |
| `.cp-in` | 1060px |
| `.cp-in--narrow` / `.cp-form-wrap` | 780px / 680px |

### Standard padding
Desktop `48px` horizontal · Mobile (≤900px) `22px`.

### Breakpoints
| Width | Effect |
|---|---|
| ≤900px | Nav links hide, grids collapse to 1 column, fixed heights release |
| ≤640px | Signup form grids → 1 column |
| ≤540px | Pulse grid → 1 column |

There is **no hamburger menu**. Below 900px the nav links are hidden and
only the logo + Sign In button show. If you want mobile nav, that's a build.

### Type scale
Headings use **Sora** (weight 400 — deliberately light, don't bold them).
Body uses **Manrope**.

| Class | Size |
|---|---|
| `.hero-h1` | `clamp(40px, 5.5vw, 70px)` |
| `.title` | `clamp(28px, 3.5vw, 46px)` |
| `.sub` | 17px |
| `.eyebrow` | 12px uppercase, orange |
| Body / cards | 12–15px |

---

## 5. The logo

**One file: `assets/logos/logo-dark-bg.svg`.** It is used in four places
(nav + footer, on both pages). Replace that file, keep the filename, and
all four update. Nothing else to edit.

Sizing is in CSS, not the HTML:
```css
--logo-size:        44px;  /* nav */
--logo-size-footer: 32px;  /* footer */
```

The nav and footer are both dark, so the artwork needs the **light/frost**
version of the mark. `logo-light-bg.svg` is supplied only in case a light
header appears later.

**If your export is a full wordmark lockup** (mark + "Outly" together),
point the `<img>` at it and delete the adjacent
`<span class="logo-text">Outly</span>` (nav) /
`<span class="ft-logo-text">Outly</span>` (footer), or you'll get "Outly"
twice. Each position is marked with a `DEV: LOGO` comment in the HTML.

---

## 6. ⚠️ Things that still need doing before launch

These are placeholders. **This is the list to work through.**

### 6.1 Signup form doesn't submit anywhere real
`js/signup.js` around line 152. Right now it opens the user's email client
with the form contents pre-filled — a stopgap, not a real submission. It
will not work for anyone without a configured mail client.

The real `fetch()` call is written out and commented directly above it.
Uncomment it and delete the mailto block once the endpoint exists:

```js
const res = await fetch('https://api.single-town.life/api/host-applications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

`POST /api/host-applications` **does not exist yet** — it needs building.
The `payload` object in `signup.js` is the exact shape the form sends;
use it as the DTO. It includes `idVerifyConsent` (boolean) from the
over-18 / ID-verification checkbox.

Alternative if the API isn't ready: point the `fetch` at a **Power Automate**
HTTP-trigger URL, which can drop submissions into SharePoint, Excel or
Teams. Same one-line change.

### 6.5 Campus Partner page (`campus-partners.html`) — legal gates

**Do not publish this page or run recruitment against it until the items
below are closed.** They come straight from the strategy playbooks.

1. **The compensation model is proposed, not settled.** The playbook calls
   the promoter residual "subject to legal and economic validation" and
   says earnings examples must be "labelled illustrative rather than
   promised". Note the trail is now **12 months** (see §6.10), not the
   three years the playbook drafted. The page reflects that — there is a terms notice under
   "What you get" and matching wording in the FAQ and the consent
   checkbox. **Don't strengthen that language into a promise** without
   sign-off.
2. **US worker-classification advice is outstanding.** Whether this is
   employment, contractor, affiliate or something else affects tax
   reporting, state exposure and international-student eligibility. The
   playbook is explicit that calling it a "partner" does not resolve it.
3. **University careers portals have their own rules.** Manchester and
   Nottingham reject commission-only and self-employed vacancies. This
   page is the *independent* route. Anything posted on a university
   careers portal needs **separate, compliant copy** describing a paid
   role — do not link portals straight here without checking each one's
   policy.
4. **Handshake employer verification is unconfirmed** for a UK entity —
   its guidance is EIN/TIN-oriented and all new employers are manually
   reviewed.

### 6.6 Campus Partner form endpoint
Same situation as the host form: `js/campus-partners.js` currently opens a
mailto as a stopgap. The real call is commented in place —
`POST /api/campus-applications`, which **does not exist yet**. The
`payload` object is the DTO shape. A Power Automate HTTP trigger works
as a drop-in alternative.

The application questions are the playbook's filter questions verbatim,
including the key one — *"who would you contact first, and why?"* — which
is required. Keep it required; it's the whole screening mechanism.

### 6.7 Naming: don't call them "ambassadors"

The page, the file, the CSS prefix (`.cp-*`) and the URL all say **Campus
Partner**, deliberately. "Ambassador" describes `Brand → Ambassador →
Downloads`. What this actually is:

```
Outly → Campus Partner → Hosts/Organisations → Events → Attendees → more Hosts
```

Success is measured in **activated hosts, not downloads** — that's why the
page says so out loud. Please keep the naming consistent if you add related
pages or admin screens.

### 6.8 Build attribution as a generic system, not a campus feature

**Recommendation for whoever builds the backend:** don't build a
"campus ambassador" table. Build a generic **Partner / Promoter attribution
system** — a partner record, a referred entity (host or organisation), an
attribution window, and a rate. Campus Partner is then simply the first
*programme* running on it.

The same infrastructure is needed shortly for London promoters, venue
scouts, hostel partners and creators/influencers. Building it campus-shaped
means rebuilding it three times.

Two details worth designing in from the start, both from the playbook:
- Attribution for a society/chapter/club should attach to the
  **organisation account**, not the individual — so it survives a committee
  change.
- Keep it to **direct attribution only** (partner → host). The playbook
  explicitly warns against unlimited downstream referral trees.

### 6.9 Worked earnings example — slot is ready

`campus-partners.html` has a commented-out **worked example** block in the
"What you get" section. It's deliberately empty: the per-ticket rate isn't
agreed, and the playbook requires earnings figures to be labelled
illustrative rather than promised.

Once the rate is signed off, fill in the four numbers, delete the comment
markers, and it renders — the `.worked-example` CSS already exists, so no
styling work. **Keep the "Illustrative only" line**; do not reword it into
a forecast.

### 6.10 Pricing model — CONFIRMED

Confirmed against the GBP/USD summary blocks in `Outly_Pricing.xlsx`.
Earlier drafts and the two calculator prototypes disagreed with this; **this
table is the one that's right.**

| | GBP | USD |
|---|---|---|
| Host platform fee | 3% + £1.00 | 3% + $1.50 |
| Customer booking fee | 10% + £1.50 | 10% + $2.50 |
| Promoter reward | £1.00 flat/ticket | $1.50 flat/ticket |
| Promoter trail | 12 months | 12 months |

The host fee is **deducted** from the host's ticket revenue; the customer fee
is **added on top** of the ticket price. The promoter reward is a **flat
amount per ticket, not a percentage** — the same whatever the host charges.

Arithmetic verified against the spreadsheet: a £5 ticket with 30 attendees
gives the host £3.85/ticket, the customer pays £7.00, and the promoter earns
£30/event. A $10 ticket gives the host $8.20, the customer pays $13.50, and
the promoter earns $45/event. Both reproduce the spreadsheet's per-event and
per-month figures exactly.

**Changing any of it is one edit** — the `PRICING` object at the top of
`js/calculator.js`:

```js
var PRICING = {
  hostPct: 0.03,     hostFlat:     { GBP: 1.00, USD: 1.50 },
  customerPct: 0.10, customerFlat: { GBP: 1.50, USD: 2.50 },
  promoterPerTicket: { GBP: 1.00, USD: 1.50 },
  promoterTrailMonths: 12,
};
```

Both calculators and all three pricing cards read from it. No rate is
hard-coded anywhere else — please keep it that way.

> **Low ticket prices break down.** Because the host fee includes a flat
> component, a ticket priced below about £1.03 / $1.55 leaves the host with
> nothing. The calculator detects this and shows a warning instead of a
> negative number. If a minimum ticket price is introduced, set the input
> `min` attributes to match.

### 6.10a We do not disclose Outly's own revenue

Deliberate: the page shows hosts **what they keep** and promoters **what they
earn**, and never a line for what Outly takes. Two rows and a whole
comparison table were removed for this reason. Please don't reintroduce an
"Outly keeps" figure without asking.

### 6.11 The competitor comparison table was removed — read this before re-adding

An earlier version compared Outly to Eventbrite (3.7% + $1.79), TicketSauce
(3% + $0.99), FairHarbor and eTix, using the Competitors sheet. **I removed
it**, for two reasons:

1. It conflicts with 6.10a — a like-for-like fee table necessarily exposes
   the total take.
2. **On the confirmed numbers it does not favour Outly.** At a £20 ticket
   with fees passed to the buyer (the competitors' usual default):

   | | Host keeps | Customer pays |
   |---|---|---|
   | Outly | £18.40 | £23.50 |
   | Eventbrite | £20.00 | £22.53 |
   | TicketSauce | £20.00 | £21.59 |

   Outly is behind on both axes in that framing. That's a **commercial**
   observation, not a formatting one, and worth a deliberate decision:
   either the pricing changes, or the positioning leans on what the fee buys
   (discovery, Pulse, matching, absorbed processing) rather than on price.

If a comparison is ever re-added, re-verify every third-party rate against
their live pricing page first — this is a public claim about named companies.

### 6.12 Calculators use no charting library

The two prototypes loaded **Chart.js from a CDN**. I did not carry that over.
The bar charts are drawn as inline SVG by `drawBars()` in
`js/calculator.js` (~30 lines), which means:
- the site keeps its **zero-external-JS** property,
- the strict CSP in §7 needs **no `script-src` change**,
- and there's no repeat of the CDN/SRI failure that previously broke the globe.

If you ever do want a charting library, self-host it under `/js/vendor/`
rather than adding a CDN host to the CSP.

### 6.2 Dead links
| File | What | Currently |
|---|---|---|
| `signup.html` | Terms of Service | `href="#"` |
| `signup.html` | Privacy Policy | `href="#"` |
| `signup.html` | App Store badge | `href="#"` |
| `signup.html` | Google Play badge | `href="#"` |

The two app badges are emoji placeholders (🍎 / ▶️), not the official
Apple/Google badge artwork. Apple and Google both have brand guidelines
requiring their supplied assets — swap these before launch.

### 6.3 Content still to confirm
- Contact address is `hello@outly.co` (nav footer + signup fallback).
- Copyright reads **© 2025** — update for the launch year.
- Dashboard figures in the "What is Outly" section ($6.1k revenue,
  122 tickets, 6 events) and the event names are **illustrative mock-ups**,
  not real data.
- The "5,700+ couples matched" SoSyncd figure appears twice — verify it's
  current before launch.

### 6.4 Copy nits flagged but not changed
- Getting Started step 4: *"Pulse drives higher and repeat attendance"* —
  "higher" has no noun. Probably meant "higher show-up and repeat attendance".
- Hero web node says **"Culture centres"** (British) while the rest of the
  copy is US English ("Organizers", "recognize", "sports centers").

---

## 7. .NET 10 hosting

Serve as static files. Recommended response headers (there's a reminder
comment at the top of `index.html` too):

```
Content-Security-Policy: default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

That CSP is deliberately tight and **will work as-is** because the site has
no external JS. If you later add a third-party script or analytics tag, you
must add its host to `script-src` or it will be silently blocked.

**Do not add `integrity="sha…"` attributes to script tags unless you have
verified the hash against the actual file.** A wrong SRI hash makes the
browser refuse to load the script with no visible error. This exact issue
previously broke the site's globe animation.

Also: **disable Swagger UI in production** on `api.single-town.life`.
Public Swagger exposes your whole API surface.
`if (app.Environment.IsDevelopment()) { app.UseSwagger(); … }`

---

## 8. House rules

1. **No inline `style=""`.** Both pages are currently at zero. Use a class.
2. **No inline `onclick`.** Handlers are bound in the JS files — keeps the
   CSP strict and the markup clean.
3. **Use the colour variables**, don't hard-code hex values.
4. **Test at 1280×800** because of the fixed-height sections (see §4).
5. Decorative elements carry `aria-hidden="true"`; the FAQ rows are
   keyboard-operable. Keep that if you touch them.

---

## 9. Quick local run

```bash
cd <project folder>
python3 -m http.server 8000
# then open http://localhost:8000
```

Use a server rather than double-clicking the file, so the absolute paths
(`/css/main.css`, `/assets/…`) resolve the same way they will in production.
