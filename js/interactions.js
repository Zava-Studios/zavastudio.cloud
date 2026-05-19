(function () {
  // ── Scroll progress bar ───────────────────────────────────────
  const progressBar = document.getElementById('scroll-progress');

  function updateProgress() {
    if (!progressBar) return;
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ── Scroll reveal ─────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // ── Smooth scroll for nav links ───────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Terminal typing animation ─────────────────────────────────
  const terminalLines = document.querySelectorAll('.terminal-line[data-delay]');
  terminalLines.forEach((line) => {
    const delay = parseFloat(line.dataset.delay) || 0;
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.opacity = '1';
    }, delay * 1000);
  });
})();
