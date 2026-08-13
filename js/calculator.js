/* ============================================================
   calculator.js — Host + Promoter earnings calculators
   ============================================================

   ┌──────────────────────────────────────────────────────────┐
   │  DEV: EVERY RATE ON THIS PAGE IS IN THE PRICING BLOCK    │
   │  DIRECTLY BELOW. Change it there and the whole page —    │
   │  both calculators, the pricing split cards and the        │
   │  comparison table — updates. Do not hard-code rates       │
   │  anywhere else.                                           │
   └──────────────────────────────────────────────────────────┘

   ⚠️  UNRESOLVED: the source documents disagree with each other.
       See DEV_NOTES.md §6.10. The values below follow the two
       calculator prototypes (outlyhostcalculatorv3 /
       outlypromotercalculatorv2), which are the most recent
       artefacts. Confirm before publishing.

   No charting library — the bar charts are drawn as inline SVG
   below, so this page keeps the site's zero-external-JS property
   and works under the strict CSP.
*/
(function () {
  'use strict';

  /* ===== THE ONLY PLACE RATES ARE DEFINED ===== */
  var PRICING = {
    hostShare:        0.90,   // host keeps this share of their ticket price
    outlyCommission:  0.10,   // Outly's share of the ticket price
    promoterShare:    0.05,   // promoter's share — taken OUT of Outly's commission
    buyerFee:         { GBP: 2.00, USD: 2.00 },   // flat, added on top of the ticket price
    promoterTrailMonths: 24,  // how long a promoter earns on a host they introduced
  };

  /* Published headline rates for the comparison table.
     pct = % of ticket price, flat = fixed amount per ticket.
     ⚠️ Re-verify against each provider's live pricing page before launch. */
  var COMPETITORS = [
    { name: 'Eventbrite',  pct: 0.037, flat: 1.79 },
    { name: 'TicketSauce', pct: 0.03,  flat: 0.99 },
    { name: 'FairHarbor',  pct: 0.06,  flat: null, note: '6% + fee' },
    { name: 'eTix',        pct: null,  flat: null, note: 'Not published' },
  ];

  /* ===== helpers ===== */
  var $ = function (id) { return document.getElementById(id); };
  function num(id, fallback) {
    var v = parseFloat($(id).value);
    return (isNaN(v) || v < 0) ? fallback : v;
  }
  function symbolFor(cur) { return cur === 'USD' ? '$' : '£'; }
  function money(sym, n) { return sym + Math.round(n).toLocaleString(); }
  function money2(sym, n) { return sym + n.toFixed(2); }
  function moneyK(sym, v) {
    if (!isFinite(v) || !v) return sym + '0';
    if (v >= 1000000) return sym + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000)    return sym + Math.round(v / 1000) + 'k';
    return sym + Math.round(v);
  }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function setText(id, txt) { var el = $(id); if (el) el.textContent = txt; }

  /* ===== inline SVG bar chart (no library) ===== */
  function drawBars(svgId, labels, values, sym, cssClass) {
    var svg = $(svgId);
    if (!svg) return;
    var W = 720, H = 240, padL = 8, padR = 8, padT = 24, padB = 26;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var max = Math.max.apply(null, values.concat([1]));
    var n = values.length;
    var slot = innerW / n, bw = Math.min(slot * 0.6, 46);
    var parts = [];

    /* gridlines at 0 / 50 / 100% */
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + innerH - innerH * f;
      parts.push('<line class="bar-grid" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>');
    });

    values.forEach(function (v, i) {
      var h = max > 0 ? (v / max) * innerH : 0;
      var x = padL + slot * i + (slot - bw) / 2;
      var y = padT + innerH - h;
      parts.push('<rect class="' + cssClass + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
                 '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, 1).toFixed(1) + '" rx="3"/>');
      parts.push('<text class="bar-val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) +
                 '" text-anchor="middle">' + moneyK(sym, v) + '</text>');
      parts.push('<text class="bar-lbl" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) +
                 '" text-anchor="middle">' + labels[i] + '</text>');
    });
    svg.innerHTML = parts.join('');
  }

  /* ========================================================
     HOST CALCULATOR
     ======================================================== */
  function updateHost() {
    var cur = $('h-currency').value;
    var sym = symbolFor(cur);
    var fee = PRICING.buyerFee[cur];

    ['h-sym1', 'h-sym2', 'h-sym3'].forEach(function (id) { setText(id, sym); });

    var price     = num('h-price', 20);
    var attendees = num('h-attendees', 30);
    var epm       = Math.max(1, num('h-epm', 2));
    var venue     = num('h-venue', 0);
    var viaPromo  = $('h-promoter').checked;

    var custPays   = price + fee;
    var hostPer    = price * PRICING.hostShare;
    var promoterCut = viaPromo ? price * PRICING.promoterShare : 0;
    var outlyKeeps = price * PRICING.outlyCommission + fee;   // fee always stays with Outly

    setText('h-custpays', custPays.toFixed(2));
    setText('h-feehint', 'Your price + ' + money2(sym, fee) + ' booking fee');

    setText('hA1', money2(sym, price));
    setText('hA2', '+' + money2(sym, fee));
    setText('hA3', money2(sym, custPays));
    setText('hA4l', 'Outly keeps (' + pct(PRICING.outlyCommission) + ' + fee)');
    setText('hA4', money2(sym, outlyKeeps));
    setText('hA6l', 'You receive (' + pct(PRICING.hostShare) + ')');
    setText('hA6', money2(sym, hostPer));

    /* promoter row only shown when relevant */
    $('hA5row').hidden = !viaPromo;
    if (viaPromo) setText('hA5', money2(sym, promoterCut));

    var revPerEvent = hostPer * attendees;
    var netPerEvent = revPerEvent - venue;
    var revPerMonth = revPerEvent * epm;
    var venuePerMonth = venue * epm;
    var netPerMonth = revPerMonth - venuePerMonth;

    setText('hB1', Math.round(attendees).toLocaleString() + ' tickets');
    setText('hB2', money(sym, revPerEvent));
    setText('hB3', venue > 0 ? '−' + money(sym, venue) : sym + '0');
    setText('hB4', money(sym, netPerEvent));
    setText('hB5', epm + (epm > 1 ? ' events' : ' event'));
    setText('hB6', money(sym, netPerMonth));

    setText('hSEvent', money(sym, revPerEvent));
    setText('hSEventSub', Math.round(attendees) + ' tickets × ' + money2(sym, hostPer));
    setText('hSMonth', money(sym, revPerMonth));
    setText('hSMonthSub', epm + (epm > 1 ? ' events × ' : ' event × ') + money(sym, revPerEvent));
    setText('hSNet', money(sym, netPerMonth));

    setText('hAnnual', moneyK(sym, netPerMonth * 12));
    setText('hAnnualNote', epm + (epm > 1 ? ' events' : ' event') + '/month · ' +
            Math.round(attendees) + ' attendees · ' + money2(sym, price) + ' ticket');
    setText('hGross', moneyK(sym, revPerMonth * 12));
    setText('hVenue', venue > 0 ? moneyK(sym, venuePerMonth * 12) : sym + '0');
    setText('hTickets', Math.round(attendees * epm * 12).toLocaleString());

    var pts = [1, 2, 3, 4, 6, 8, 10, 15, 20];
    drawBars('hChart',
      pts.map(function (e) { return e + (e === 1 ? ' event' : ' events'); }),
      pts.map(function (e) { return Math.max(0, (revPerEvent - venue) * e); }),
      sym, 'bar-fill2');

    setText('hNote',
      'You keep ' + pct(PRICING.hostShare) + ' of every ticket at the price you set. Outly adds a flat ' +
      money2(sym, fee) + ' booking fee on top — that is the only fee your customer sees, and it never comes out of your price. ' +
      'Payment processing is absorbed by Outly. Venue cost is your own estimate. ' +
      'Figures are estimates for planning, not a guarantee of earnings.');
  }

  /* ========================================================
     PROMOTER CALCULATOR
     ======================================================== */
  function updatePromoter() {
    var cur = $('p-currency').value;
    var sym = symbolFor(cur);
    var fee = PRICING.buyerFee[cur];
    var months = PRICING.promoterTrailMonths;

    ['p-sym1', 'p-sym2'].forEach(function (id) { setText(id, sym); });

    var hosts     = Math.max(1, num('p-hosts', 10));
    var price     = num('p-price', 20);
    var attendees = num('p-attendees', 30);
    var epm       = Math.max(1, num('p-epm', 1));

    var commPerTicket = price * PRICING.promoterShare;
    var custPays      = price + fee;
    var hostPer       = price * PRICING.hostShare;
    var outlyKeeps    = price * (PRICING.outlyCommission - PRICING.promoterShare) + fee;

    setText('p-comm', commPerTicket.toFixed(2));
    setText('p-commhint', pct(PRICING.promoterShare) + ' of the ticket price — auto-calculated');

    setText('pA1', money2(sym, price));
    setText('pA2', money2(sym, custPays));
    setText('pA3l', 'Host receives (' + pct(PRICING.hostShare) + ', unchanged)');
    setText('pA3', money2(sym, hostPer));
    setText('pA4', money2(sym, outlyKeeps));
    setText('pA5l', 'You earn (' + pct(PRICING.promoterShare) + ')');
    setText('pA5', money2(sym, commPerTicket));

    var ticketsPerHostMonth = attendees * epm;
    var perHostMonth = commPerTicket * ticketsPerHostMonth;
    var perHostTrail = perHostMonth * months;
    var allHostsMonth = perHostMonth * hosts;
    var trailTotal = allHostsMonth * months;

    setText('pB1', Math.round(ticketsPerHostMonth).toLocaleString() + ' tickets');
    setText('pB2', money2(sym, commPerTicket));
    setText('pB3', money(sym, perHostMonth));
    setText('pB4', months + ' months');
    setText('pB5', money(sym, perHostTrail));

    setText('pSMonth', money(sym, allHostsMonth));
    setText('pSMonthSub', Math.round(hosts) + ' hosts × ' + money(sym, perHostMonth));
    setText('pSY1', money(sym, allHostsMonth * Math.min(12, months)));
    setText('pSY2', money(sym, allHostsMonth * Math.max(0, Math.min(12, months - 12))));

    setText('pBannerTag', 'Full ' + months + '-month trail');
    setText('pTotal', moneyK(sym, trailTotal));
    setText('pTotalNote', Math.round(hosts) + ' hosts · ' + months + ' months · ' + money2(sym, price) + ' ticket');
    setText('pPerHost', money(sym, perHostTrail));
    setText('pTickets', Math.round(ticketsPerHostMonth * hosts * months).toLocaleString());
    setText('pPerTicket', money2(sym, commPerTicket));

    var pts = [1, 2, 5, 10, 20, 30, 50, 75, 100];
    drawBars('pChart',
      pts.map(function (h) { return h + (h === 1 ? ' host' : ' hosts'); }),
      pts.map(function (h) { return perHostMonth * h * months; }),
      sym, 'bar-fill');

    setText('pNote',
      'You earn ' + pct(PRICING.promoterShare) + ' of the ticket price on every ticket sold by hosts you personally introduce, for ' +
      months + ' months from the point they join. Your share comes out of Outly’s commission — the host still receives ' +
      pct(PRICING.hostShare) + ' either way. The flat booking fee always stays with Outly. The trail ends after month ' +
      months + ', so keep introducing hosts to keep earning. ' +
      'Figures are estimates for planning, not a guarantee of earnings.');
  }

  /* ========================================================
     PRICING SPLIT + COMPARISON TABLE
     ======================================================== */
  function updatePricing() {
    /* Use whichever calculator is on screen so the table tracks the user's price */
    var hostTabActive = $('tab-host').getAttribute('aria-selected') === 'true';
    var cur   = hostTabActive ? $('h-currency').value : $('p-currency').value;
    var price = hostTabActive ? num('h-price', 20) : num('p-price', 20);
    var sym   = symbolFor(cur);
    var fee   = PRICING.buyerFee[cur];

    setText('pxHost',  pct(PRICING.hostShare));
    setText('pxOutly', pct(PRICING.outlyCommission));
    setText('pxFee',   '+' + sym + fee.toFixed(fee % 1 ? 2 : 0));
    setText('cmpPriceLabel', money2(sym, price));

    var rows = [{
      name: 'Outly',
      us: true,
      feeLabel: pct(PRICING.outlyCommission) + ' + ' + money2(sym, fee) + ' flat',
      keeps: price * PRICING.hostShare,
      pays: price + fee,
    }];

    COMPETITORS.forEach(function (c) {
      if (c.pct === null) {
        rows.push({ name: c.name, feeLabel: c.note || 'Not published', keeps: null, pays: null });
        return;
      }
      var flat = c.flat === null ? null : c.flat;
      var label = c.note || (Math.round(c.pct * 1000) / 10) + '% + ' + sym + (flat === null ? '?' : flat.toFixed(2));
      if (flat === null) {
        rows.push({ name: c.name, feeLabel: label, keeps: null, pays: null });
        return;
      }
      /* Competitor fees modelled as passed to the buyer, which is their default:
         the host keeps their full face price and the customer pays the fee. */
      var cFee = price * c.pct + flat;
      rows.push({ name: c.name, feeLabel: label, keeps: price, pays: price + cFee });
    });

    var body = $('cmpBody');
    body.innerHTML = rows.map(function (r) {
      return '<tr' + (r.us ? ' class="cmp-us"' : '') + '>' +
        '<td>' + r.name + '</td>' +
        '<td>' + r.feeLabel + '</td>' +
        '<td class="num">' + (r.keeps === null ? '—' : money2(sym, r.keeps)) + '</td>' +
        '<td class="num">' + (r.pays  === null ? '—' : money2(sym, r.pays))  + '</td>' +
        '</tr>';
    }).join('');

    setText('cmpNote',
      'Competitor rows use published headline rates with fees passed to the buyer, which is their standard setting. ' +
      'Third-party pricing changes — verify before relying on this. Outly’s row shows the host keeping ' +
      pct(PRICING.hostShare) + ' of their own price with the booking fee added on top.');
  }

  /* ========================================================
     TABS + WIRING
     ======================================================== */
  function selectTab(which) {
    var isHost = which === 'host';
    $('tab-host').setAttribute('aria-selected', String(isHost));
    $('tab-promoter').setAttribute('aria-selected', String(!isHost));
    $('panel-host').classList.toggle('active', isHost);
    $('panel-promoter').classList.toggle('active', !isHost);
    /* charts need a real layout box to size against, so redraw on show */
    if (isHost) { updateHost(); } else { updatePromoter(); }
    updatePricing();
  }

  $('tab-host').addEventListener('click', function () { selectTab('host'); });
  $('tab-promoter').addEventListener('click', function () { selectTab('promoter'); });

  ['h-currency','h-price','h-attendees','h-epm','h-venue','h-promoter'].forEach(function (id) {
    var el = $(id);
    el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', function () {
      updateHost(); updatePricing();
    });
  });
  ['p-currency','p-hosts','p-price','p-attendees','p-epm'].forEach(function (id) {
    var el = $(id);
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
      updatePromoter(); updatePricing();
    });
  });

  /* keep the two currency pickers in step */
  $('h-currency').addEventListener('change', function () {
    $('p-currency').value = this.value; updatePromoter();
  });
  $('p-currency').addEventListener('change', function () {
    $('h-currency').value = this.value; updateHost();
  });

  /* scroll reveal for the pricing section */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });

  /* initial paint */
  updateHost();
  updatePromoter();
  updatePricing();
})();
