(() => {
  'use strict';
  const current = document.documentElement.lang.startsWith('en') ? 'en' : 'br';
  const paths = {
    br: document.querySelector('meta[name="jb-br-path"]').content,
    en: document.querySelector('meta[name="jb-en-path"]').content
  };
  const url = new URL(location.href);
  const explicit = url.searchParams.get('lang');
  const valid = value => value === 'br' || value === 'en';
  let saved;
  try { saved = localStorage.getItem('jb-language'); } catch {}
  // An explicit English URL can always be shared, regardless of saved preference.
  const desired = valid(explicit) ? explicit : current === 'en' ? 'en' : valid(saved) ? saved : 'br';
  try { localStorage.setItem('jb-language', desired); } catch {}
  if (desired !== current) {
    url.pathname = paths[desired];
    location.replace(url.href);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(link => {
      const destination = new URL(link.href);
      destination.search = location.search;
      destination.searchParams.set('lang', link.dataset.language);
      destination.hash = location.hash;
      link.href = destination.href;
      link.addEventListener('click', () => {
        try { localStorage.setItem('jb-language', link.dataset.language); } catch {}
      });
    });
  });
})();
