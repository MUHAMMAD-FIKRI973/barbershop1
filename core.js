// ===== IRON & GOLD - CORE JS =====
const API = '';
let currentUser = null;
let token = localStorage.getItem('ig_token');

function showToast(msg) {
  const t = document.getElementById('toast');
  if(!t) return;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

async function api(url, opts = {}) {
  if (token) opts.headers = { ...opts.headers, 'Authorization': 'Bearer ' + token };
  if (opts.body && typeof opts.body === 'object') {
    opts.headers = { ...opts.headers, 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(opts.body);
  }
  const r = await fetch(API + url, opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Error');
  return data;
}

function setAuth(data) {
  token = data.token;
  currentUser = data.user;
  localStorage.setItem('ig_token', token);
  localStorage.setItem('ig_user', JSON.stringify(data.user));
  updateNavAuth();
}

function logout() {
  token = null; currentUser = null;
  localStorage.removeItem('ig_token');
  localStorage.removeItem('ig_user');
  updateNavAuth();
  window.location.href = 'index.html';
}

function updateNavAuth() {
  const link = document.getElementById('nav-login-link');
  if (!link) return;
  if (currentUser) {
    link.textContent = currentUser.name;
    link.href = currentUser.role === 'admin' ? 'admin.html' : '#';
    if(currentUser.role !== 'admin') {
      link.onclick = (e) => { e.preventDefault(); logout(); }
      link.title = "Click to logout";
    }
  } else {
    link.textContent = 'Login';
    link.href = 'login.html';
  }
}

function phImg(text) {
  return `<div class="placeholder-img">${text || '✂'}</div>`;
}

function imgOrPh(src, alt) {
  if (!src || src === 'null') return phImg(alt ? alt[0] : '✂');
  return `<img src="${src}" alt="${alt || ''}" onerror="this.onerror=null; this.outerHTML='<div class=\\'placeholder-img\\'>✂</div>'">`;
}

function stars(r) { return '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(r)); }

window.addEventListener('DOMContentLoaded', () => {
  const u = localStorage.getItem('ig_user');
  if (u) currentUser = JSON.parse(u);
  updateNavAuth();
  
  // Splash Screen (hanya muncul di halaman utama dan sekali per session)
  const splashEl = document.getElementById('splash-screen');
  if(splashEl && !sessionStorage.getItem('splashed')) {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => {
        splashEl.classList.add('hidden');
        sessionStorage.setItem('splashed', 'true');
      }, 400); }
      const bar = document.getElementById('splash-bar');
      const pct = document.getElementById('splash-pct');
      if(bar) bar.style.width = p + '%';
      if(pct) pct.textContent = Math.floor(p) + '%';
    }, 200);
  } else if(splashEl) {
    splashEl.classList.add('hidden');
  }

  // Navbar Scroll
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile Menu
  const mobileToggle = document.getElementById('mobile-toggle');
  if(mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const nl = document.getElementById('nav-links');
      nl.style.display = nl.style.display === 'flex' ? 'none' : 'flex';
    });
  }
});
