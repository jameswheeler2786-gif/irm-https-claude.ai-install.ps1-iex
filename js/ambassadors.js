/* ambassadors.js — Founding Campus Partner application page
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
  const form = document.getElementById('amb-form');
  const successPanel = document.getElementById('amb-success');
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
    ['amb-name',    'err-amb-name'],
    ['amb-dob',     'err-amb-dob'],
    ['amb-uni',     'err-amb-uni'],
    ['amb-year',    'err-amb-year'],
    ['amb-city',    'err-amb-city'],
    ['amb-network', 'err-amb-network'],
    ['amb-first10', 'err-amb-first10'],
    ['amb-why',     'err-amb-why'],
  ];

  /* Clear each error as the user types/changes */
  REQUIRED.concat([['amb-email', 'err-amb-email']]).forEach(([fid, eid]) => {
    const el = document.getElementById(fid);
    if (!el) return;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => setError(fid, eid, false));
  });
  const confirmBox = document.getElementById('amb-confirm');
  if (confirmBox) {
    confirmBox.addEventListener('change', () => {
      confirmBox.classList.toggle('error', !confirmBox.checked);
      document.getElementById('err-amb-confirm').classList.toggle('show', !confirmBox.checked);
    });
  }

  function validate() {
    let ok = true;

    REQUIRED.forEach(([fid, eid]) => {
      const empty = !val(fid);
      setError(fid, eid, empty);
      if (empty) ok = false;
    });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('amb-email'));
    setError('amb-email', 'err-amb-email', !emailOk);
    if (!emailOk) ok = false;

    if (!confirmBox.checked) {
      confirmBox.classList.add('error');
      document.getElementById('err-amb-confirm').classList.add('show');
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
      fullName:        val('amb-name'),
      email:           val('amb-email'),
      phone:           val('amb-phone') || null,
      dob:             val('amb-dob'),
      university:      val('amb-uni'),
      yearOfStudy:     val('amb-year'),
      city:            val('amb-city'),
      instagram:       val('amb-ig') || null,
      tiktok:          val('amb-tt') || null,
      linkedin:        val('amb-li') || null,
      network:         val('amb-network'),
      firstTen:        val('amb-first10'),
      trackRecord:     val('amb-track') || null,
      firstEvent:      val('amb-event') || null,
      motivation:      val('amb-why'),
      motivationNotes: val('amb-why-more') || null,
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
