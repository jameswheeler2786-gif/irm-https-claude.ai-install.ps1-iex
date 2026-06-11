/* signup.js — type picker, form validation, submission */
(function () {
  'use strict';

  const pickHost     = document.getElementById('pick-host');
  const pickAttendee = document.getElementById('pick-attendee');
  const attendeeCta  = document.getElementById('attendee-cta');
  const hostShell    = document.getElementById('host-form-shell');
  const form         = document.getElementById('host-form');
  const successPanel = document.getElementById('signup-success');
  const roleOtherField = document.getElementById('role-other-field');

  /* --- type picker --- */
  function selectType(type) {
    pickHost.classList.toggle('selected', type === 'host');
    pickAttendee.classList.toggle('selected', type === 'attendee');
    pickHost.setAttribute('aria-pressed', type === 'host');
    pickAttendee.setAttribute('aria-pressed', type === 'attendee');

    if (type === 'host') {
      attendeeCta.classList.remove('visible');
      hostShell.classList.add('visible');
      hostShell.querySelector('form').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      hostShell.classList.remove('visible');
      attendeeCta.classList.add('visible');
      attendeeCta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  pickHost.addEventListener('click', () => selectType('host'));
  pickAttendee.addEventListener('click', () => selectType('attendee'));
  pickHost.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectType('host'); } });
  pickAttendee.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectType('attendee'); } });

  /* --- show "other" text field when Other role selected --- */
  document.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener('change', () => {
      roleOtherField.classList.toggle('visible', radio.value === 'other' && radio.checked);
    });
  });

  /* --- validation helpers --- */
  function showError(fieldId, errId, show) {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById(errId);
    if (!field || !err) return;
    field.classList.toggle('error', show);
    err.classList.toggle('show', show);
  }

  function clearError(fieldId, errId) {
    showError(fieldId, errId, false);
  }

  /* clear errors on input */
  [
    ['full-name',  'err-full-name'],
    ['email',      'err-email'],
    ['phone',      'err-phone'],
    ['dob',        'err-dob'],
    ['city',       'err-city'],
  ].forEach(([fid, eid]) => {
    const el = document.getElementById(fid);
    if (el) el.addEventListener('input', () => clearError(fid, eid));
  });

  function validate() {
    let ok = true;

    const fullName = document.getElementById('full-name').value.trim();
    showError('full-name', 'err-full-name', !fullName);
    if (!fullName) ok = false;

    const email = document.getElementById('email').value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    showError('email', 'err-email', !emailOk);
    if (!emailOk) ok = false;

    const phone = document.getElementById('phone').value.trim();
    showError('phone', 'err-phone', !phone);
    if (!phone) ok = false;

    const dob = document.getElementById('dob').value;
    showError('dob', 'err-dob', !dob);
    if (!dob) ok = false;

    const city = document.getElementById('city').value.trim();
    showError('city', 'err-city', !city);
    if (!city) ok = false;

    const roleSelected = document.querySelector('input[name="role"]:checked');
    const roleErr = document.getElementById('err-role');
    if (!roleSelected) {
      roleErr.classList.add('show');
      ok = false;
    } else {
      roleErr.classList.remove('show');
      if (roleSelected.value === 'other') {
        const otherText = document.getElementById('role-other-text').value.trim();
        showError('role-other-text', 'err-role-other', !otherText);
        if (!otherText) ok = false;
      }
    }

    return ok;
  }

  /* --- submission --- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const roleEl = document.querySelector('input[name="role"]:checked');

    const payload = {
      fullName:      document.getElementById('full-name').value.trim(),
      email:         document.getElementById('email').value.trim(),
      phone:         document.getElementById('phone').value.trim(),
      dob:           document.getElementById('dob').value,
      city:          document.getElementById('city').value.trim(),
      instagram:     document.getElementById('instagram').value.trim() || null,
      tiktok:        document.getElementById('tiktok').value.trim() || null,
      linkedin:      document.getElementById('linkedin').value.trim() || null,
      businessName:  document.getElementById('biz-name').value.trim() || null,
      businessCountry: document.getElementById('biz-country').value || null,
      businessAddr1: document.getElementById('biz-addr1').value.trim() || null,
      businessAddr2: document.getElementById('biz-addr2').value.trim() || null,
      businessCity:  document.getElementById('biz-city').value.trim() || null,
      businessZip:   document.getElementById('biz-zip').value.trim() || null,
      role:          roleEl ? roleEl.value : null,
      roleOther:     document.getElementById('role-other-text').value.trim() || null,
    };

    try {
      /* TODO: replace with real endpoint once POST /api/host-applications exists
         const res = await fetch('https://api.single-town.life/api/host-applications', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload),
         });
         if (!res.ok) throw new Error('Server error');
      */

      /* Interim: mailto fallback */
      const body = Object.entries(payload)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      window.location.href = `mailto:hello@outly.co?subject=Host Application — ${encodeURIComponent(payload.fullName)}&body=${encodeURIComponent(body)}`;

      /* Show success */
      form.style.display = 'none';
      successPanel.classList.add('visible');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch {
      btn.disabled = false;
      btn.textContent = 'Apply to host';
      alert('Something went wrong — please try again or email hello@outly.co directly.');
    }
  });
})();
