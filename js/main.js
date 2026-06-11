/* main.js — UI behaviours for Outly landing page
   - Scroll reveal (IntersectionObserver)
   - Compatibility bar animations
   - FAQ accordion (no inline onclick handlers)
*/
(function () {
  'use strict';

  /* === SCROLL REVEAL === */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* === COMPATIBILITY BARS === */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.comp-fill').forEach(b => b.classList.add('anim'));
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.match-card').forEach(c => barObs.observe(c));

  /* === FAQ ACCORDION === */
  function toggleFaq(questionEl) {
    const item = questionEl.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  }

  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => toggleFaq(q));
    /* keyboard accessibility */
    q.setAttribute('role', 'button');
    q.setAttribute('tabindex', '0');
    q.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(q); }
    });
  });
})();
