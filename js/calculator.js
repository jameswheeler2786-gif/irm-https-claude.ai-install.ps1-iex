/* ============================================================
   calculator.js — Host + Promoter earnings calculators
   ============================================================

   ┌──────────────────────────────────────────────────────────┐
   │  DEV: EVERY RATE IS IN THE PRICING BLOCK BELOW.          │
   │  Change it there and the whole page updates — both       │
   │  calculators and the pricing cards. Never hard-code a    │
   │  rate anywhere else.                                     │
   └──────────────────────────────────────────────────────────┘

   Model confirmed against Outly_Pricing.xlsx (GBP/USD summary blocks):

     HOST pays      3% + £1.00 (GBP) / 3% + $1.50 (USD)  per ticket
                    → deducted from the host's ticket revenue
     CUSTOMER pays  10% + £1.50 (GBP) / 10% + $2.50 (USD) per ticket
                    → added on top of the host's ticket price
     PROMOTER earns £1.00 (GBP) / $1.50 (USD) flat per ticket
                    → for 12 months from the host joining

   Verified: £5 ticket, 30 attendees → host keeps £3.85, customer pays
   £7.00, promoter earns £30/event. $10 ticket → host keeps $8.20,
   customer pays $13.50, promoter earns $45/event.

   NOTE ON DISCLOSURE: this page deliberately does NOT show Outly's own
   revenue. Hosts see what they keep; promoters see what they earn.
   Don't add an "Outly keeps" line.

   No charting library — bars are inline SVG (drawBars), so the site keeps
   its zero-external-JS property and the strict CSP needs no change.
*/
(function () {
  'use strict';

  /* ===== THE ONLY PLACE RATES ARE DEFINED ===== */
  var PRICING = {
    /* Host side — deducted from the host's ticket revenue */
    hostPct:  0.03,
    hostFlat: { GBP: 1.00, USD: 1.50 },

    /* Customer side — added on top of the host's ticket price */
    customerPct:  0.10,
    customerFlat: { GBP: 1.50, USD: 2.50 },

    /* Promoter — flat amount per ticket sold by a host they introduced */
    promoterPerTicket:   { GBP: 1.00, USD: 1.50 },
    promoterTrailMonths: 12,
  };

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
  function pct(x) { return (Math.round(x * 1000) / 10) + '%'; }
  function setText(id, t) { var el = $(id); if (el) el.textContent = t; }

  /* Fee helpers — single source of truth for the arithmetic */
  function hostFee(price, cur)     { return price * PRICING.hostPct + PRICING.hostFlat[cur]; }
  function hostReceives(price, cur){ return price - hostFee(price, cur); }
  function customerFee(price, cur) { return price * PRICING.customerPct + PRICING.customerFlat[cur]; }
  function customerPays(price, cur){ return price + customerFee(price, cur); }
  function feeLabel(p, flat, sym)  { return pct(p) + ' + ' + money2(sym, flat); }

  /* ===== inline SVG bar chart ===== */
  function drawBars(svgId, labels, values, sym, cssClass) {
    var svg = $(svgId);
    if (!svg) return;
    var W = 720, H = 240, padL = 8, padR = 8, padT = 24, padB = 26;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var max = Math.max.apply(null, values.concat([1]));
    var slot = innerW / values.length, bw = Math.min(slot * 0.6, 46);
    var parts = [];
    [0, 0.5, 1].forEach(function (f) {
      var y = padT + innerH - innerH * f;
      parts.push('<line class="bar-grid" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>');
    });
    values.forEach(function (v, i) {
      var h = max > 0 ? (Math.max(0, v) / max) * innerH : 0;
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
     HOST
     ======================================================== */
  function updateHost() {
    var cur = $('h-currency').value;
    var sym = symbolFor(cur);
    ['h-sym1', 'h-sym2', 'h-sym3'].forEach(function (id) { setText(id, sym); });

    var price     = num('h-price', 20);
    var attendees = num('h-attendees', 30);
    var epm       = Math.max(1, num('h-epm', 2));
    var venue     = num('h-venue', 0);

    var hFee    = hostFee(price, cur);
    var hNet    = hostReceives(price, cur);
    var cPays   = customerPays(price, cur);

    setText('h-custpays', cPays.toFixed(2));
    setText('h-feehint', 'Your price + ' + feeLabel(PRICING.customerPct, PRICING.customerFlat[cur], sym) + ' booking fee');

    setText('hA1', money2(sym, price));
    setText('hA2l', 'Platform fee (' + feeLabel(PRICING.hostPct, PRICING.hostFlat[cur], sym) + ')');
    setText('hA2', '−' + money2(sym, hFee));
    setText('hA3l', 'You receive');
    setText('hA3', money2(sym, hNet));
    setText('hA4', money2(sym, cPays));

    /* Warn rather than show nonsense if the ticket is priced below the flat fee */
    var viable = hNet > 0;
    $('hWarn').hidden = viable;
    if (!viable) {
      setText('hWarn', 'At ' + money2(sym, price) + ' a ticket the flat fee is larger than your revenue. ' +
              'Price above about ' + money2(sym, PRICING.hostFlat[cur] / (1 - PRICING.hostPct)) + ' for this to work.');
    }

    var revPerEvent   = Math.max(0, hNet) * attendees;
    var netPerEvent   = revPerEvent - venue;
    var revPerMonth   = revPerEvent * epm;
    var venuePerMonth = venue * epm;
    var netPerMonth   = revPerMonth - venuePerMonth;

    setText('hB1', Math.round(attendees).toLocaleString() + ' tickets');
    setText('hB2', money(sym, revPerEvent));
    setText('hB3', venue > 0 ? '−' + money(sym, venue) : sym + '0');
    setText('hB4', money(sym, netPerEvent));
    setText('hB5', epm + (epm > 1 ? ' events' : ' event'));
    setText('hB6', money(sym, netPerMonth));

    setText('hSEvent', money(sym, revPerEvent));
    setText('hSEventSub', Math.round(attendees) + ' tickets × ' + money2(sym, Math.max(0, hNet)));
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
      pts.map(function (e) { return (revPerEvent - venue) * e; }),
      sym, 'bar-fill2');

    setText('hNote',
      'You set your ticket price. A platform fee of ' + feeLabel(PRICING.hostPct, PRICING.hostFlat[cur], sym) +
      ' per ticket comes out of your side, and a booking fee of ' +
      feeLabel(PRICING.customerPct, PRICING.customerFlat[cur], sym) +
      ' is added to what the customer pays. Payment processing is covered by Outly. ' +
      'If a promoter introduced you to Outly, their reward is paid separately and does not change what you receive. ' +
      'Venue cost is your own estimate. These are planning estimates, not a guarantee of earnings.');
  }

  /* ========================================================
     PROMOTER
     ======================================================== */
  function updatePromoter() {
    var cur = $('p-currency').value;
    var sym = symbolFor(cur);
    var months = PRICING.promoterTrailMonths;
    var perTicket = PRICING.promoterPerTicket[cur];
    ['p-sym1', 'p-sym2'].forEach(function (id) { setText(id, sym); });

    var hosts     = Math.max(1, num('p-hosts', 10));
    var price     = num('p-price', 20);
    var attendees = num('p-attendees', 30);
    var epm       = Math.max(1, num('p-epm', 1));

    setText('p-comm', perTicket.toFixed(2));
    setText('p-commhint', 'Flat ' + money2(sym, perTicket) + ' per ticket, whatever the ticket price');

    setText('pA1', money2(sym, price));
    setText('pA2', money2(sym, customerPays(price, cur)));
    setText('pA3', money2(sym, hostReceives(price, cur)));
    setText('pA4', money2(sym, perTicket));

    var ticketsPerHostMonth = attendees * epm;
    var perHostMonth  = perTicket * ticketsPerHostMonth;
    var perHostTrail  = perHostMonth * months;
    var allHostsMonth = perHostMonth * hosts;
    var trailTotal    = allHostsMonth * months;

    setText('pB1', Math.round(ticketsPerHostMonth).toLocaleString() + ' tickets');
    setText('pB2', money2(sym, perTicket));
    setText('pB3', money(sym, perHostMonth));
    setText('pB4', months + ' months');
    setText('pB5', money(sym, perHostTrail));

    setText('pSMonth', money(sym, allHostsMonth));
    setText('pSMonthSub', Math.round(hosts) + ' hosts × ' + money(sym, perHostMonth));
    setText('pSTrailLbl', 'Full ' + months + '-month total');
    setText('pSTrail', money(sym, trailTotal));
    setText('pSPerHostLbl', 'Value of one host');
    setText('pSPerHost', money(sym, perHostTrail));

    setText('pBannerTag', 'Full ' + months + '-month earnings');
    setText('pTotal', moneyK(sym, trailTotal));
    setText('pTotalNote', Math.round(hosts) + ' hosts · ' + months + ' months · ' +
            Math.round(ticketsPerHostMonth) + ' tickets per host per month');
    setText('pPerHost', money(sym, perHostTrail));
    setText('pTickets', Math.round(ticketsPerHostMonth * hosts * months).toLocaleString());
    setText('pPerTicket', money2(sym, perTicket));

    var pts = [1, 2, 5, 10, 20, 30, 50, 75, 100];
    drawBars('pChart',
      pts.map(function (h) { return h + (h === 1 ? ' host' : ' hosts'); }),
      pts.map(function (h) { return perHostMonth * h * months; }),
      sym, 'bar-fill');

    setText('pNote',
      'You earn a flat ' + money2(sym, perTicket) + ' on every ticket sold by hosts you personally introduce, for ' +
      months + ' months from the point each host joins. It is the same ' + money2(sym, perTicket) +
      ' whatever the host charges. Your reward does not come out of the host — they receive exactly the same either way. ' +
      'Earnings stop after month ' + months + ' for that host, so keep introducing new ones. ' +
      'These are planning estimates, not a guarantee of earnings.');
  }

  /* ========================================================
     PRICING CARDS (host-facing; no Outly revenue shown)
     ======================================================== */
  function updatePricing() {
    var hostTab = $('tab-host').getAttribute('aria-selected') === 'true';
    var cur   = hostTab ? $('h-currency').value : $('p-currency').value;
    var price = hostTab ? num('h-price', 20) : num('p-price', 20);
    var sym   = symbolFor(cur);

    setText('pxKeepFee',  feeLabel(PRICING.hostPct, PRICING.hostFlat[cur], sym) + ' per ticket');
    setText('pxKeepVal',  money2(sym, Math.max(0, hostReceives(price, cur))));
    setText('pxPaysFee',  feeLabel(PRICING.customerPct, PRICING.customerFlat[cur], sym) + ' on top');
    setText('pxPaysVal',  money2(sym, customerPays(price, cur)));
    setText('pxPromoVal', money2(sym, PRICING.promoterPerTicket[cur]));
    setText('pxPromoFee', 'per ticket, for ' + PRICING.promoterTrailMonths + ' months');
    setText('pxExample',  'Based on the ' + money2(sym, price) + ' ticket price in the calculator above.');
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
    if (isHost) { updateHost(); } else { updatePromoter(); }
    updatePricing();
  }
  $('tab-host').addEventListener('click', function () { selectTab('host'); });
  $('tab-promoter').addEventListener('click', function () { selectTab('promoter'); });

  ['h-currency','h-price','h-attendees','h-epm','h-venue'].forEach(function (id) {
    var el = $(id);
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
      updateHost(); updatePricing();
    });
  });
  ['p-currency','p-hosts','p-price','p-attendees','p-epm'].forEach(function (id) {
    var el = $(id);
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
      updatePromoter(); updatePricing();
    });
  });

  /* keep both currency pickers in step */
  $('h-currency').addEventListener('change', function () { $('p-currency').value = this.value; updatePromoter(); });
  $('p-currency').addEventListener('change', function () { $('h-currency').value = this.value; updateHost(); });

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });

  updateHost();
  updatePromoter();
  updatePricing();
})();
