// Shared UI: site header (auth-aware), footer, and building blocks used by several pages.
// Paths are root-absolute so they also work on the 404 page, which Cloudflare serves at any URL.
import { supabase } from './supabase.js';

export const icon = (name, extraClass = '') =>
  `<svg class="icon ${extraClass}" aria-hidden="true"><use href="/src/icons.svg#${name}"></use></svg>`;

// Category names come from the database; icons are chosen here.
const CATEGORY_ICONS = {
  'Books': 'book-open',
  'Electronics': 'laptop',
  'Furniture': 'armchair',
  'Stationery': 'pencil-ruler',
  'Hostel Items': 'bed-double',
  'Cycles': 'bike',
  'Sports Equipment': 'volleyball',
  'Lab Equipment': 'flask-conical',
  'Clothing': 'shirt',
  'Accessories': 'backpack',
  'Other': 'package',
};
export const categoryIcon = (name) => CATEGORY_ICONS[name] ?? 'tag';

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';

export const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export const imageUrl = (path) =>
  supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ---------- Product card (marketplace, landing, related listings, sell preview) ----------

export function productCard(p, { imageSrc } = {}) {
  const li = document.createElement('li');
  const category = p.categories?.name ?? '';
  li.innerHTML = `
    <a class="pcard">
      <div class="pcard-media"><img loading="lazy" alt=""><span class="badge"></span></div>
      <div class="pcard-body">
        <span class="pcard-cat">${icon(categoryIcon(category))}<span></span></span>
        <span class="pcard-title"></span>
        <span class="pcard-price-row"><span class="pcard-price"></span><span class="badge badge-accent pcard-qty"></span></span>
        <span class="pcard-seller"><span class="avatar"></span><span></span></span>
      </div>
    </a>`;
  const a = li.querySelector('a');
  if (p.id) a.href = `product.html?id=${encodeURIComponent(p.id)}`;
  const img = li.querySelector('img');
  const src = imageSrc ?? (p.image_paths?.[0] ? imageUrl(p.image_paths[0]) : '');
  if (src) img.src = src;
  img.alt = p.title || 'Listing photo';
  li.querySelector('.pcard-media .badge').textContent = p.condition || 'Condition';
  li.querySelector('.pcard-cat span').textContent = category || 'Category';
  li.querySelector('.pcard-title').textContent = p.title || 'Your item title';
  li.querySelector('.pcard-price').textContent = p.price === '' || p.price == null ? '₹—' : formatPrice(p.price);
  const qty = li.querySelector('.pcard-qty');
  if (p.quantity > 1) qty.textContent = `${p.quantity} available`;
  else qty.remove();
  const seller = li.querySelector('.pcard-seller');
  if (p.profiles?.name) {
    seller.querySelector('.avatar').textContent = initials(p.profiles.name);
    seller.lastElementChild.textContent = p.profiles.name;
  } else {
    seller.remove();
  }
  return li;
}

export function skeletonCards(count) {
  return Array.from({ length: count }, () => {
    const li = document.createElement('li');
    li.setAttribute('aria-hidden', 'true');
    li.innerHTML = `
      <div class="pcard pcard-skeleton">
        <div class="pcard-media"><div class="skeleton skeleton-media"></div></div>
        <div class="pcard-body">
          <div class="skeleton" style="height:12px;width:40%"></div>
          <div class="skeleton" style="height:16px;width:90%;margin-top:6px"></div>
          <div class="skeleton" style="height:20px;width:35%;margin-top:8px"></div>
        </div>
      </div>`;
    return li;
  });
}

// Empty / error state. `action` is { label, href } or { label, onClick }.
export function stateBlock({ kind = 'empty', iconName = 'inbox', title, text, action, tag = 'li' }) {
  const el = document.createElement(tag);
  el.className = 'state';
  el.dataset.kind = kind;
  el.innerHTML = `<div class="state-icon">${icon(iconName)}</div><h3></h3><p></p>`;
  el.querySelector('h3').textContent = title;
  el.querySelector('p').textContent = text;
  if (action) {
    const btn = document.createElement(action.href ? 'a' : 'button');
    btn.className = 'btn btn-secondary';
    btn.textContent = action.label;
    if (action.href) btn.href = action.href;
    else { btn.type = 'button'; btn.addEventListener('click', action.onClick); }
    el.append(btn);
  }
  if (kind === 'error') el.setAttribute('role', 'alert');
  return el;
}

// ---------- Header and footer ----------

const page = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
const NAV = [
  ['index', 'Home', '/'],
  ['marketplace', 'Marketplace', '/marketplace.html'],
  ['how-it-works', 'How it works', '/how-it-works.html'],
  ['categories', 'Categories', '/#categories'],
  ['about', 'About', '/about.html'],
];
const current = (key) => (key === page || (key === 'marketplace' && page === 'product') ? ' aria-current="page"' : '');
const logo = `<a class="logo" href="/"><span class="logo-mark">${icon('tag')}</span>Campus Marketplace</a>`;

export const sessionReady = supabase.auth.getSession().then(({ data }) => data.session);

async function renderHeader(slot) {
  const session = await sessionReady;
  const navLinks = NAV.map(([key, label, href]) => `<a href="${href}"${current(key)}>${label}</a>`).join('');

  const accountDesktop = session
    ? `<a class="btn btn-primary btn-sm desktop-only" href="/sell.html">${icon('plus')}Sell an item</a>
       <div class="menu desktop-only">
         <button class="menu-trigger" type="button" aria-expanded="false" aria-controls="account-menu" aria-label="Account menu">
           <span class="avatar" data-initials>…</span>${icon('chevron-down')}
         </button>
         <div class="menu-list" id="account-menu" hidden>
           <div class="menu-head"><strong data-name>Signed in</strong><span data-email></span></div>
           <a href="/dashboard.html">${icon('layout-dashboard')}Dashboard</a>
           <a href="/profile.html">${icon('user')}Profile</a>
           <a href="/sell.html">${icon('plus')}Sell an item</a>
           <button type="button" data-logout>${icon('log-out')}Log out</button>
         </div>
       </div>`
    : `<a class="btn btn-ghost desktop-only" href="/login.html">Log in</a>
       <a class="btn btn-primary desktop-only" href="/register.html">Sign up</a>`;

  const accountMobile = session
    ? `<hr><a href="/dashboard.html"${current('dashboard')}>${icon('layout-dashboard')}Dashboard</a>
       <a href="/profile.html"${current('profile')}>${icon('user')}Profile</a>
       <button type="button" data-logout>${icon('log-out')}Log out</button>
       <a class="btn btn-primary btn-block" href="/sell.html">${icon('plus')}Sell an item</a>`
    : `<hr><a class="btn btn-secondary btn-block" href="/login.html">Log in</a>
       <a class="btn btn-primary btn-block" href="/register.html">Sign up</a>`;

  slot.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        ${logo}
        <nav class="nav" aria-label="Main">${navLinks}</nav>
        <div class="header-actions">
          ${accountDesktop}
          <button class="btn btn-ghost btn-icon nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-panel" aria-label="Open menu">${icon('menu')}</button>
        </div>
      </div>
    </header>
    <nav class="mobile-panel" id="mobile-panel" aria-label="Mobile" hidden>${navLinks}${accountMobile}</nav>`;

  // Mobile menu
  const toggle = slot.querySelector('.nav-toggle');
  const panel = slot.querySelector('#mobile-panel');
  const setPanel = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = icon(open ? 'x' : 'menu');
  };
  toggle.addEventListener('click', () => setPanel(panel.hidden));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) setPanel(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', () => setPanel(false));

  // Account dropdown
  const trigger = slot.querySelector('.menu-trigger');
  const menu = slot.querySelector('#account-menu');
  if (trigger) {
    const setMenu = (open) => { menu.hidden = !open; trigger.setAttribute('aria-expanded', open); };
    trigger.addEventListener('click', () => setMenu(menu.hidden));
    document.addEventListener('click', (e) => { if (!e.target.closest('.menu')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); trigger.focus(); }
    });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setPanel(false); toggle.focus(); } });

  slot.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.href = '/';
  }));

  if (session) {
    const { data: me } = await supabase.from('profiles').select('name').eq('id', session.user.id).maybeSingle();
    const name = me?.name ?? session.user.email;
    slot.querySelectorAll('[data-initials]').forEach((el) => { el.textContent = initials(name); });
    slot.querySelector('[data-name]').textContent = name;
    slot.querySelector('[data-email]').textContent = session.user.email;
  }
}

function renderFooter(slot) {
  const year = new Date().getFullYear();
  slot.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            ${logo}
            <p>A marketplace for students of one campus to buy and sell books, electronics, cycles and hostel essentials from each other.</p>
          </div>
          <div>
            <h2>Platform</h2>
            <ul>
              <li><a href="/marketplace.html">Marketplace</a></li>
              <li><a href="/how-it-works.html">How it works</a></li>
              <li><a href="/#categories">Categories</a></li>
              <li><a href="/dashboard.html">Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li><a href="/about.html">About</a></li>
              <li><a href="/faq.html">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h2>Account</h2>
            <ul>
              <li><a href="/login.html">Log in</a></li>
              <li><a href="/register.html">Sign up</a></li>
              <li><a href="/profile.html">Profile</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} Campus Marketplace</span>
          <nav aria-label="Legal"><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Service</a></nav>
        </div>
      </div>
    </footer>`;
}

const headerSlot = document.getElementById('site-header');
const footerSlot = document.getElementById('site-footer');
if (headerSlot) renderHeader(headerSlot);
if (footerSlot) renderFooter(footerSlot);
