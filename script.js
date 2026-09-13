// ---------- Scroll-spy for top nav ----------
(function () {
  const navLinks = document.querySelectorAll('.topnav__links a, .mobile-menu a');
  if (!navLinks.length) return;

  const ids = Array.from(document.querySelectorAll('.topnav__links a'))
    .map(a => a.getAttribute('href'))
    .filter(href => href && href.startsWith('#'))
    .map(href => href.slice(1));
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelectorAll(`a[href="#${entry.target.id}"]`).forEach(a => a.classList.add('active'));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

// ---------- Close mobile menu after clicking a link ----------
(function () {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
})();