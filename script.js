/* ============================
   SCRIPT.JS - Joglo Sablon Kaos Blitar
   ============================ */

// ===== THEME TOGGLE (Night / Light) =====
const themeToggleBtn = document.getElementById('theme-toggle');
const themeLabel     = document.getElementById('theme-label');
const html           = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('joglo-theme', theme);
  if (themeLabel) {
    themeLabel.textContent = theme === 'dark' ? 'Light' : 'Night';
  }
}

// Init from saved preference (already applied in head, just sync label)
(function() {
  const saved = localStorage.getItem('joglo-theme') || 'dark';
  applyTheme(saved);
})();

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';

    // Ripple flash animation on toggle
    themeToggleBtn.style.transform = 'scale(0.92)';
    setTimeout(() => { themeToggleBtn.style.transform = ''; }, 150);

    applyTheme(next);
  });
}

// ===== APPLY CONTENT FROM ADMIN PANEL =====
function applyContent() {
  const raw = localStorage.getItem('joglo-content');
  if (!raw) return;
  let d;
  try { d = JSON.parse(raw); } catch { return; }

  // Helper: safe set text
  const setText = (sel, val) => {
    if (!val) return;
    document.querySelectorAll(sel).forEach(el => el.textContent = val);
  };
  const setHtml = (sel, val) => {
    if (!val) return;
    document.querySelectorAll(sel).forEach(el => el.innerHTML = val);
  };
  const setAttr = (sel, attr, val) => {
    if (!val) return;
    document.querySelectorAll(sel).forEach(el => el.setAttribute(attr, val));
  };
  const buildWA = (wa, msg) => `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;

  const b = d.bisnis || {};
  const h = d.hero || {};
  const k = d.kontak || {};

  // ---- BISNIS ----
  if (b.nama) {
    setText('.logo-main', b.nama.split(' ').slice(0,2).join(' '));
    setText('.logo-sub', b.nama.split(' ').slice(2).join(' ') || 'KAOS BLITAR');
    setText('.footer-logo-main', b.nama.split(' ').slice(0,2).join(' '));
    setText('.footer-logo-sub', b.nama.split(' ').slice(2).join(' ') || 'KAOS BLITAR');
    document.title = b.nama + ' | Sablon Berkualitas, Harga Terjangkau';
  }
  if (b.tagline) setText('.footer-tagline', b.tagline);

  // ★ LOGO — ganti icon hexagonal dengan gambar custom
  const logoIconEls = document.querySelectorAll('.logo-icon');
  if (b.logo_url) {
    logoIconEls.forEach(el => {
      // Hanya ganti jika belum jadi img
      if (!el.querySelector('img')) {
        el.innerHTML = '';
      }
      el.innerHTML = `<img src="${b.logo_url}" alt="Logo" style="width:36px;height:36px;object-fit:contain;display:block;" onerror="this.style.display='none'" />`;
    });
  } else {
    // Reset ke SVG default jika logo_url dikosongkan
    const svgDefault = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" fill="#C0392B" opacity="0.15"/><path d="M18 5L30 12V24L18 31L6 24V12L18 5Z" stroke="#C0392B" stroke-width="1.5" fill="none"/><path d="M10 14H26M10 14L8 18H28L26 14M12 18V24H24V18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    logoIconEls.forEach(el => { el.innerHTML = svgDefault; });
  }

  if (b.telp) {
    setText('.footer-telp', b.telp);
    // Selector yang benar sesuai struktur HTML: #kontak-phone > div > p
    const phoneEl = document.querySelector('#kontak-phone div > p');
    if (phoneEl) phoneEl.textContent = b.telp;
  }
  if (b.rating) {
    setText('.rating-number', b.rating);
    document.querySelectorAll('.hero-badge').forEach(el => {
      el.textContent = `${b.rating} Rating · ${b.ulasan || '156+'} Pelanggan Puas`;
    });
    setText('.footer-rating span', `${b.rating}/5 dari ${b.ulasan || '156+'} ulasan Google`);
    setText('.rating-count', `${b.ulasan || '156+'} Ulasan Google`);
  }
  if (b.pelanggan) {
    document.querySelectorAll('[data-target]').forEach(el => {
      const label = el.nextElementSibling?.nextElementSibling?.textContent || '';
      if (label.includes('Pelanggan')) el.setAttribute('data-target', b.pelanggan);
      if (label.includes('Tahun') && b.tahun) el.setAttribute('data-target', b.tahun);
    });
  }
  // Jam operasional — selector sesuai struktur HTML aktual
  if (b.hari || b.jam) {
    const jamRows = document.querySelectorAll('#kontak-jam .jam-row');
    const rowBuka = jamRows[0];
    if (rowBuka) {
      const spans = rowBuka.querySelectorAll('span');
      if (b.hari && spans[0]) spans[0].textContent = b.hari;
      if (b.jam && spans[1]) spans[1].textContent = b.jam;
    }
  }
  if (b.tutup_hari || b.tutup_ket) {
    const rowTutup = document.querySelector('#kontak-jam .jam-row.closed');
    if (rowTutup) {
      const spans = rowTutup.querySelectorAll('span');
      if (b.tutup_hari && spans[0]) spans[0].textContent = b.tutup_hari;
      if (b.tutup_ket && spans[1]) spans[1].textContent = b.tutup_ket;
    }
  }

  // WA links
  if (b.wa) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
      const href = el.getAttribute('href') || '';
      const msgMatch = href.match(/\?text=(.+)/);
      const msg = msgMatch ? decodeURIComponent(msgMatch[1]) : 'Halo Joglo Sablon!';
      el.setAttribute('href', buildWA(b.wa, msg));
    });
  }

  // ---- HERO ----
  if (h.badge) setText('.hero-badge', h.badge);
  if (h.judul1 || h.judul2 || h.judul3) {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.innerHTML =
        `${h.judul1 || ''}<br/>` +
        `<span class="hero-title-accent">${h.judul2 || ''}</span><br/>` +
        (h.judul3 || '');
    }
  }
  if (h.desc) setText('.hero-desc', h.desc);
  if (h.btn1) setText('#btn-hero-wa', h.btn1);
  if (h.btn2) setText('#btn-hero-lihat', h.btn2);

  // Section headings
  if (h.sec_layanan) setText('#layanan .section-title', h.sec_layanan);
  if (h.sec_produk)  setText('#produk .section-title', h.sec_produk);
  if (h.sec_video)   setText('#video-gallery .section-title', h.sec_video);
  if (h.sec_testi)   setText('#testimoni .section-title', h.sec_testi);
  if (h.sec_kontak)  setText('#kontak .section-title', h.sec_kontak);
  if (h.sec_cta)     setText('.cta-content h2', h.sec_cta);

  // ---- LAYANAN ----
  if (Array.isArray(d.layanan)) {
    const cards = document.querySelectorAll('.layanan-card');
    d.layanan.forEach((l, i) => {
      const card = cards[i];
      if (!card) return;

      // Judul
      const h3 = card.querySelector('h3');
      if (h3 && l.judul) h3.textContent = l.judul;

      // Deskripsi
      const p = card.querySelector('p');
      if (p && l.deskripsi) p.textContent = l.deskripsi;

      // Fitur
      const liItems = card.querySelectorAll('.layanan-features li');
      (l.fitur || []).forEach((f, fi) => {
        if (liItems[fi]) liItems[fi].textContent = '✓ ' + f;
      });

      // ★ POPULAR toggle: tambah/hapus class 'featured' + badge + warna ikon
      if (l.popular) {
        card.classList.add('featured');
        card.style.removeProperty('color');
        // Tambah badge Populer jika belum ada
        if (!card.querySelector('.layanan-badge-popular')) {
          const badge = document.createElement('div');
          badge.className = 'layanan-badge-popular';
          badge.textContent = 'Populer';
          card.insertBefore(badge, card.firstChild);
        }
        // Set icon accent ke putih (seperti card DTF asli)
        const icon = card.querySelector('.layanan-icon');
        if (icon) icon.style.setProperty('--accent', '#ffffff');
      } else {
        card.classList.remove('featured');
        // Hapus badge jika ada
        const badge = card.querySelector('.layanan-badge-popular');
        if (badge) badge.remove();
        // Reset icon accent ke merah
        const icon = card.querySelector('.layanan-icon');
        if (icon) icon.style.setProperty('--accent', '#C0392B');
      }
    });
  }

  // ---- PRODUK ----
  if (Array.isArray(d.produk)) {
    const cards = document.querySelectorAll('.produk-card');
    d.produk.forEach((p, i) => {
      const card = cards[i];
      if (!card) return;
      const img = card.querySelector('img');
      if (img && p.img) { img.src = p.img; img.alt = p.judul; }
      const tagEl = card.querySelector('.produk-tag');
      if (tagEl && p.tag) tagEl.textContent = p.tag;
      const h3 = card.querySelector('.produk-info h3');
      if (h3 && p.judul) h3.textContent = p.judul;
      const desc = card.querySelector('.produk-info p');
      if (desc && p.desc) desc.textContent = p.desc;
    });
  }

  // ---- VIDEO ----
  if (Array.isArray(d.video)) {
    const cards = document.querySelectorAll('.video-card');
    d.video.forEach((v, i) => {
      const card = cards[i];
      if (!card) return;
      const ytUrl = `https://www.youtube.com/embed/${v.yt_id}?autoplay=1`;
      card.setAttribute('data-video', ytUrl);
      card.setAttribute('data-title', v.judul);
      const img = card.querySelector('.video-thumb');
      if (img && v.yt_id) {
        img.src = `https://img.youtube.com/vi/${v.yt_id}/maxresdefault.jpg`;
        img.onerror = function() { this.src = `https://img.youtube.com/vi/${v.yt_id}/hqdefault.jpg`; };
        img.alt = v.judul;
      }
      const label = card.querySelector('.video-duration');
      if (label && v.label) label.textContent = v.label;
      const h4 = card.querySelector('.video-info h4');
      if (h4 && v.judul) h4.textContent = v.judul;
      const desc = card.querySelector('.video-info p');
      if (desc && v.desc) desc.textContent = v.desc;
    });
  }

  // ---- TESTIMONI ----
  if (Array.isArray(d.testimoni)) {
    const cards = document.querySelectorAll('.testi-card');
    d.testimoni.forEach((t, i) => {
      const card = cards[i];
      if (!card) return;
      const textEl = card.querySelector('.testi-text');
      if (textEl && t.teks) textEl.textContent = t.teks;
      const avatarEl = card.querySelector('.testi-avatar');
      if (avatarEl) {
        if (t.initial) avatarEl.textContent = t.initial;
        if (t.warna) avatarEl.style.background = t.warna;
      }
      const nameEl = card.querySelector('.testi-info strong');
      if (nameEl && t.nama) nameEl.textContent = t.nama;
      const timeEl = card.querySelector('.testi-info span');
      if (timeEl && t.waktu) timeEl.textContent = t.waktu;
    });
  }

  // ---- KONTAK ----
  if (k.alamat) {
    const alamatEl = document.querySelector('#kontak-alamat p');
    if (alamatEl) alamatEl.innerHTML = k.alamat.replace(/\n/g, '<br/>');
  }
  if (k.alamat_short) setText('.footer-alamat', k.alamat_short);
  if (k.maps_url) {
    setAttr('a[href*="maps.app.goo.gl"]', 'href', k.maps_url);
    setAttr('#btn-maps', 'href', k.maps_url);
    setAttr('#btn-cta-maps', 'href', k.maps_url);
    setAttr('#btn-map-link', 'href', k.maps_url);
  }
  if (k.maps_embed) {
    const iframe = document.querySelector('.map-embed iframe');
    if (iframe) iframe.setAttribute('src', k.maps_embed);
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', applyContent);

// Auto-apply when admin saves (cross-tab live update via storage event)
window.addEventListener('storage', (e) => {
  if (e.key === 'joglo-content') {
    applyContent();
    // Flash a subtle indicator that content was updated
    const flashEl = document.createElement('div');
    flashEl.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;background:#27AE60;color:white;font-family:Outfit,sans-serif;font-size:13px;font-weight:600;padding:10px 18px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:opacity 0.5s ease;';
    flashEl.textContent = '✅ Konten diperbarui dari Admin Panel';
    document.body.appendChild(flashEl);
    setTimeout(() => { flashEl.style.opacity = '0'; setTimeout(() => flashEl.remove(), 500); }, 2500);
  }
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = scrollY;

  // Update active nav link
  updateActiveNav();
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close menu when clicking nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== ACTIVE NAV HIGHLIGHT =====
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinksAll.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

// ===== COUNTER ANIMATION =====
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Observe stats section for counter
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = document.querySelectorAll('[data-target]');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 80);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Add reveal class to key elements
const revealElements = [
  '.layanan-card',
  '.produk-card',
  '.video-card',
  '.proses-step',
  '.testi-card',
  '.kontak-card',
  '.section-header',
  '.brand-bar-item'
];

revealElements.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
});

// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const particleCount = window.innerWidth > 768 ? 30 : 15;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: rgba(192, 57, 43, ${Math.random() * 0.4 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite;
      animation-delay: ${Math.random() * 4}s;
    `;
    container.appendChild(particle);
  }
}

// Add particle animation to CSS
const particleStyle = document.createElement('style');
particleStyle.textContent = `
  @keyframes particleFloat {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
    25% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(1.2); }
    50% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0.8); opacity: 0.3; }
    75% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(1.1); }
  }
`;
document.head.appendChild(particleStyle);
createParticles();

// ===== TILT EFFECT ON CARDS =====
function addTiltEffect(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
    });
  });
}

if (window.innerWidth > 768) {
  addTiltEffect('.layanan-card');
  addTiltEffect('.testi-card');
}

// ===== LAZY LOAD IMAGES =====
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imgObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imgObserver.observe(img);
  });
}

// ===== NAVBAR OVERLAY CLOSE =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 50);
});

// ===== FLOATING WA HIDE ON SCROLL =====
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const waFloat = document.querySelector('.wa-float');
      if (waFloat) {
        if (window.scrollY > 200) {
          waFloat.style.opacity = '1';
          waFloat.style.transform = 'scale(1)';
        }
      }
      ticking = false;
    });
    ticking = true;
  }
});

// ===== VIDEO GALLERY LIGHTBOX =====
(function() {
  const modal    = document.getElementById('video-modal');
  const iframe   = document.getElementById('video-modal-iframe');
  const title    = document.getElementById('video-modal-title');
  const closeBtn = document.getElementById('video-modal-close');
  const backdrop = document.getElementById('video-modal-backdrop');
  const fallback = document.getElementById('video-modal-fallback');
  const ytLink   = document.getElementById('video-modal-yt-link');

  if (!modal) return;

  let fallbackTimer = null;

  function extractYtId(url) {
    const m = url.match(/embed\/([^?&]+)/);
    return m ? m[1] : null;
  }

  // Click any video card → buka YouTube langsung di tab baru
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      const url = card.getAttribute('data-video');
      const ytId = extractYtId(url || '');
      if (ytId) {
        window.open('https://www.youtube.com/watch?v=' + ytId, '_blank', 'noopener');
      } else if (url) {
        window.open(url, '_blank', 'noopener');
      }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
})();


console.log('%c🎨 Joglo Sablon Kaos Blitar', 'font-size:20px;font-weight:bold;color:#C0392B;');
console.log('%cWebsite berhasil dimuat! Hubungi kami di WA: 0822-2810-6342', 'font-size:12px;color:#666;');
