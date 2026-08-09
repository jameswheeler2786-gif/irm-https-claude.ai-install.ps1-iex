/* campus-partners.js — Founding Campus Partner application page
   - Scroll reveal
   - FAQ accordion
   - Application form validation + submission
*/
(function () {
  'use strict';

  /* === SCROLL REVEAL === */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* === FAQ ACCORDION === */
  function toggleFaq(q) {
    const item = q.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  }
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => toggleFaq(q));
    q.setAttribute('role', 'button');
    q.setAttribute('tabindex', '0');
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); }
    });
  });

  /* === APPLICATION FORM === */
  const form = document.getElementById('cp-form');
  const successPanel = document.getElementById('cp-success');
  if (!form) return;

  const val = id => (document.getElementById(id).value || '').trim();

  function setError(fieldId, errId, show) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (f) f.classList.toggle('error', show);
    if (e) e.classList.toggle('show', show);
  }

  /* Required text/select fields: [elementId, errorId] */
  const REQUIRED = [
    ['cp-name',    'err-cp-name'],
    ['cp-dob',     'err-cp-dob'],
    ['cp-uni',     'err-cp-uni'],
    ['cp-year',    'err-cp-year'],
    ['cp-city',    'err-cp-city'],
    ['cp-network', 'err-cp-network'],
    ['cp-first10', 'err-cp-first10'],
    ['cp-why',     'err-cp-why'],
  ];

  /* Clear each error as the user types/changes */
  REQUIRED.concat([['cp-email', 'err-cp-email']]).forEach(([fid, eid]) => {
    const el = document.getElementById(fid);
    if (!el) return;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => setError(fid, eid, false));
  });
  const confirmBox = document.getElementById('cp-confirm');
  if (confirmBox) {
    confirmBox.addEventListener('change', () => {
      confirmBox.classList.toggle('error', !confirmBox.checked);
      document.getElementById('err-cp-confirm').classList.toggle('show', !confirmBox.checked);
    });
  }

  function validate() {
    let ok = true;

    REQUIRED.forEach(([fid, eid]) => {
      const empty = !val(fid);
      setError(fid, eid, empty);
      if (empty) ok = false;
    });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('cp-email'));
    setError('cp-email', 'err-cp-email', !emailOk);
    if (!emailOk) ok = false;

    if (!confirmBox.checked) {
      confirmBox.classList.add('error');
      document.getElementById('err-cp-confirm').classList.add('show');
      ok = false;
    }

    if (!ok) {
      const firstBad = form.querySelector('.error, .field-error.show');
      if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('button[type="submit"]');
    const btnHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const payload = {
      fullName:        val('cp-name'),
      email:           val('cp-email'),
      phone:           val('cp-phone') || null,
      dob:             val('cp-dob'),
      university:      val('cp-uni'),
      yearOfStudy:     val('cp-year'),
      city:            val('cp-city'),
      instagram:       val('cp-ig') || null,
      tiktok:          val('cp-tt') || null,
      linkedin:        val('cp-li') || null,
      network:         val('cp-network'),
      firstTen:        val('cp-first10'),
      trackRecord:     val('cp-track') || null,
      firstEvent:      val('cp-event') || null,
      motivation:      val('cp-why'),
      motivationNotes: val('cp-why-more') || null,
      confirmedEligible: confirmBox.checked,
      submittedAt:     new Date().toISOString(),
    };

    try {
      /* TODO — DEV: point this at the real endpoint when it exists.
         Nothing is stored until you do; the mailto below is only a stopgap.

         const res = await fetch('https://api.single-town.life/api/campus-applications', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload),
         });
         if (!res.ok) throw new Error('Server error');

         A Power Automate HTTP-trigger URL works here too — same one-line change.
      */

      /* Interim: open the user's mail client with the answers pre-filled. */
      const body = Object.entries(payload)
        .filter(([, v]) => v !== null && v !== '')
        .map(([k, v]) => k + ': ' + v)
        .join('\n\n');
      window.location.href =
        'mailto:hello@outly.co?subject=' +
        encodeURIComponent('Campus Partner application — ' + payload.fullName + ' (' + payload.university + ')') +
        '&body=' + encodeURIComponent(body);

      form.style.display = 'none';
      successPanel.classList.add('visible');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = btnHtml;
      alert('Something went wrong — please try again, or email hello@outly.co directly.');
    }
  });
})();
