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

// Meeting spots on the ABESIT campus map (/images/campus-map.webp).
// x / y are the pin position in percent of the map's width / height.
export const CAMPUS_SPOTS = [
  { name: 'Boys hostel', x: 70.7, y: 9.5 },
  { name: 'Girls hostel', x: 66.5, y: 31.0 },
  { name: 'Playground', x: 53.2, y: 43.8 },
  { name: 'Stationery shop', x: 56.2, y: 57.6 },
  { name: 'Canteen', x: 37.1, y: 58.3 },
  { name: 'Auditorium', x: 47.9, y: 62.5 },
  { name: 'B.Pharm block', x: 31.6, y: 64.7 },
  { name: 'Administration block', x: 33.6, y: 69.8 },
  { name: 'Academic block', x: 48.1, y: 69.8 },
  { name: 'Temple', x: 21.1, y: 77.9 },
  { name: 'Parking', x: 19.1, y: 84.3 },
  { name: 'Main gate', x: 24.6, y: 88.1 },
];
export const PICKUP_LOCATIONS = CAMPUS_SPOTS.map((s) => s.name);

// Campus map in a dialog. pick: true → tap a pin to choose (resolves the name, or null if closed).
// pick: false → shows only the selected spot.
export function openCampusMap({ selected = '', pick = true } = {}) {
  const dialog = document.createElement('dialog');
  dialog.className = 'modal modal-map';
  dialog.setAttribute('aria-labelledby', 'map-title');
  dialog.innerHTML = `
    <form method="dialog" class="map-head">
      <div>
        <h2 id="map-title">${pick ? 'Choose a meeting spot' : 'Meeting spot'}</h2>
        <p class="muted small"></p>
      </div>
      <button class="btn btn-ghost btn-icon" value="" aria-label="Close map">${icon('x')}</button>
    </form>
    <div class="campus-map">
      <div class="campus-map-inner">
        <img src="/images/campus-map.webp" width="900" height="1424" alt="ABESIT campus map">
      </div>
    </div>`;
  dialog.querySelector('.map-head p').textContent = pick
    ? 'Tap a pin to choose where you can meet buyers.'
    : `The seller meets buyers at: ${selected}.`;
  const map = dialog.querySelector('.campus-map-inner'); // pins are placed in % of the image
  for (const spot of CAMPUS_SPOTS) {
    if (!pick && spot.name !== selected) continue;
    const pin = document.createElement(pick ? 'button' : 'span');
    pin.className = 'map-pin';
    pin.style.left = `${spot.x}%`;
    pin.style.top = `${spot.y}%`;
    pin.innerHTML = '<span class="map-pin-label"></span>';
    pin.firstChild.textContent = spot.name;
    if (spot.name === selected) pin.dataset.selected = 'true';
    if (pick) {
      pin.type = 'button';
      pin.setAttribute('aria-pressed', spot.name === selected);
      pin.addEventListener('click', () => dialog.close(spot.name));
    }
    map.append(pin);
  }
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('[data-selected]')?.scrollIntoView({ block: 'center' });
  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue || null);
      setTimeout(() => dialog.remove(), 250); // after the close transition
    }, { once: true });
  });
}

export const REPORT_REASONS = {
  fraud: 'Scam or fraud',
  wrong_info: 'Wrong or misleading information',
  duplicate: 'Duplicate listing',
  inappropriate: 'Inappropriate or prohibited item',
  other: 'Something else',
};

export const LISTING_DAYS = 60;
export const renewedExpiry = () => new Date(Date.now() + LISTING_DAYS * 86_400_000).toISOString();
export const nowIso = () => new Date().toISOString();
export const isExpired = (p) => p.expires_at && new Date(p.expires_at) <= new Date();

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';

export const formatPrice = (price) => (Number(price) === 0 ? 'Free' : `₹${Number(price).toLocaleString('en-IN')}`);

export const imageUrl = (path) =>
  supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const stars = (rating) => '★★★★★'.slice(0, Math.round(rating)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(rating));

// WhatsApp link. ponytail: a 10-digit number is assumed Indian (+91); longer numbers already include a country code.
export function whatsappLink(phone, text) {
  const full = phone.length === 10 ? `91${phone}` : phone;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

// Phone numbers of students who chose to show WhatsApp (plus your own). Map of id → phone.
export async function whatsappNumbers(ids) {
  if (!ids.length) return new Map();
  const { data } = await supabase.rpc('whatsapp_numbers', { ids: [...new Set(ids)] });
  return new Map((data ?? []).map((r) => [r.id, r.phone]));
}

// ---------- Recently viewed (this browser only, no database use) ----------

const RECENT_KEY = 'cm-recent';
export function rememberViewed(id) {
  try {
    const ids = [id, ...recentlyViewed().filter((x) => x !== id)].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
  } catch { /* storage blocked: skip */ }
}
export function recentlyViewed() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) ?? []; } catch { return []; }
}

// ---------- Saved items ----------

export async function savedIds() {
  const { data } = await supabase.from('saved_items').select('product_id');
  return new Set((data ?? []).map((r) => r.product_id));
}

// Heart button; `saved` is the page's Set of saved product ids.
export function saveButton(productId, saved, { onChange } = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'save-btn';
  b.innerHTML = icon('heart');
  const render = () => {
    const on = saved.has(productId);
    b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'Remove from saved' : 'Save for later');
    b.title = on ? 'Saved' : 'Save';
  };
  render();
  b.addEventListener('click', async (e) => {
    e.preventDefault();
    const on = saved.has(productId);
    on ? saved.delete(productId) : saved.add(productId);
    render(); // optimistic
    const { error } = on
      ? await supabase.from('saved_items').delete().eq('product_id', productId)
      : await supabase.from('saved_items').insert({ product_id: productId });
    if (error) { on ? saved.add(productId) : saved.delete(productId); render(); }
    else onChange?.(!on);
  });
  return b;
}

// ---------- Product card (marketplace, landing, related, saved, seller page, sell preview) ----------

export function productCard(p, { imageSrc, saved } = {}) {
  const li = document.createElement('li');
  li.className = 'pcard-item';
  const category = p.categories?.name ?? '';
  li.innerHTML = `
    <a class="pcard">
      <div class="pcard-media"><img loading="lazy" alt=""><span class="badge"></span></div>
      <div class="pcard-body">
        <span class="pcard-cat">${icon(categoryIcon(category))}<span></span></span>
        <span class="pcard-title"></span>
        <span class="pcard-price-row"><span class="pcard-price"></span><span class="pcard-tags"></span></span>
        <span class="pcard-seller"><span class="avatar"></span><span class="pcard-seller-name"></span></span>
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

  const tags = li.querySelector('.pcard-tags');
  if (p.quantity > 1) tags.insertAdjacentHTML('beforeend', '<span class="badge badge-accent"></span>');
  if (p.negotiable) tags.insertAdjacentHTML('beforeend', '<span class="badge">Negotiable</span>');
  if (p.quantity > 1) tags.firstElementChild.textContent = `${p.quantity} available`;

  const seller = li.querySelector('.pcard-seller');
  if (p.profiles?.name) {
    seller.querySelector('.avatar').textContent = initials(p.profiles.name);
    seller.querySelector('.pcard-seller-name').textContent = p.pickup_location
      ? `${p.profiles.name} · ${p.pickup_location}` : p.profiles.name;
  } else {
    seller.remove();
  }
  if (saved && p.id) li.append(saveButton(p.id, saved));
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

// ---------- Session and profile ----------

export const sessionReady = supabase.auth.getSession().then(({ data }) => data.session);

// The signed-in student's profile (name, admin/blocked flags), or null when logged out.
export const meReady = sessionReady.then(async (session) => {
  if (!session) return null;
  const { data } = await supabase.from('profiles')
    .select('id, name, is_admin, blocked').eq('id', session.user.id).maybeSingle();
  return data ? { ...data, email: session.user.email } : null;
});

// Number of conversations with messages the student hasn't read yet.
export async function unreadCount(userId) {
  const { data } = await supabase.from('conversations')
    .select('buyer_id, last_message_at, buyer_last_read_at, seller_last_read_at')
    .order('last_message_at', { ascending: false }).limit(50);
  return (data ?? []).filter((c) =>
    c.last_message_at > (c.buyer_id === userId ? c.buyer_last_read_at : c.seller_last_read_at)).length;
}

// ---------- Install as an app ----------

// Chrome/Edge/Samsung Internet offer an install prompt once per visit; we keep it for our own
// button instead of letting the browser show its one-time pop-up.
let installPrompt = null;
const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; });
addEventListener('appinstalled', () => {
  installPrompt = null;
  document.querySelectorAll('[data-install]').forEach((el) => { el.hidden = true; });
});

export async function installApp() {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null; // a prompt can only be used once
    return;
  }
  showInstallHelp();
}

// Browsers without an install prompt (iPhone Safari, Firefox) or after it was used: show the steps.
function showInstallHelp() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const steps = ios
    ? ['Open this site in <strong>Safari</strong>.', `Tap the <strong>Share</strong> button ${icon('share-2')} at the bottom of the screen.`, 'Scroll down and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.']
    : ['Open this site in <strong>Chrome</strong> (or Edge / Samsung Internet).', 'Tap the browser menu <strong>⋮</strong> at the top right.', 'Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.'];
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.setAttribute('aria-labelledby', 'install-title');
  dialog.innerHTML = `
    <form method="dialog">
      <div class="install-head"><img src="/icons/app-192-v2.png" width="56" height="56" alt=""><div><h2 id="install-title">Install Campus Marketplace</h2><p class="muted small">Get an app icon on your home screen. It opens full screen, like a normal app.</p></div></div>
      <ol class="install-steps">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
      <p class="field-hint">Already installed? Look for Campus Marketplace on your home screen or app list.</p>
      <div class="modal-actions"><button class="btn btn-primary" value="ok">Got it</button></div>
    </form>`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.addEventListener('close', () => setTimeout(() => dialog.remove(), 250), { once: true });
}

// ---------- Header and footer ----------

const page = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
const NAV = [
  ['index', 'Home', '/'],
  ['marketplace', 'Marketplace', '/marketplace.html'],
  ['wanted', 'Wanted', '/wanted.html'],
  ['how-it-works', 'How it works', '/how-it-works.html'],
  ['about', 'About', '/about.html'],
];
const current = (key) =>
  (key === page || (key === 'marketplace' && ['product', 'seller'].includes(page)) ? ' aria-current="page"' : '');
const logo = '<a class="logo" href="/"><img class="logo-img" src="/images/logo-mark.png" width="58" height="34" alt="">Campus Marketplace</a>';

async function renderHeader(slot) {
  const session = await sessionReady;
  const navLinks = NAV.map(([key, label, href]) => `<a href="${href}"${current(key)}>${label}</a>`).join('');

  const accountDesktop = session
    ? `<a class="btn btn-ghost btn-icon desktop-only msg-link" href="/messages.html" aria-label="Messages">${icon('message-circle')}<span class="count-badge" data-unread hidden></span></a>
       <a class="btn btn-primary btn-sm desktop-only" href="/sell.html">${icon('plus')}Sell an item</a>
       <div class="menu desktop-only">
         <button class="menu-trigger" type="button" aria-expanded="false" aria-controls="account-menu" aria-label="Account menu">
           <span class="avatar" data-initials>…</span>${icon('chevron-down')}
         </button>
         <div class="menu-list" id="account-menu" hidden>
           <div class="menu-head"><strong data-name>Signed in</strong><span data-email></span></div>
           <a href="/dashboard.html">${icon('layout-dashboard')}Dashboard</a>
           <a href="/dashboard.html#saved">${icon('heart')}Saved items</a>
           <a href="/messages.html">${icon('message-circle')}Messages</a>
           <a href="/profile.html">${icon('user')}Profile</a>
           <a href="/admin.html" data-admin hidden>${icon('shield')}Admin</a>
           <button type="button" data-install>${icon('smartphone')}Install app</button>
           <button type="button" data-logout>${icon('log-out')}Log out</button>
         </div>
       </div>`
    : `<a class="btn btn-ghost desktop-only" href="/login.html">Log in</a>
       <a class="btn btn-primary desktop-only" href="/register.html">Sign up</a>`;

  const accountMobile = session
    ? `<hr><a href="/dashboard.html"${current('dashboard')}>${icon('layout-dashboard')}Dashboard</a>
       <a href="/messages.html"${current('messages')}>${icon('message-circle')}Messages<span class="count-badge" data-unread hidden></span></a>
       <a href="/dashboard.html#saved">${icon('heart')}Saved items</a>
       <a href="/profile.html"${current('profile')}>${icon('user')}Profile</a>
       <a href="/admin.html" data-admin hidden>${icon('shield')}Admin</a>
       <button type="button" data-install>${icon('smartphone')}Install app</button>
       <button type="button" data-logout>${icon('log-out')}Log out</button>
       <a class="btn btn-primary btn-block" href="/sell.html">${icon('plus')}Sell an item</a>`
    : `<hr><button type="button" data-install>${icon('smartphone')}Install app</button>
       <a class="btn btn-secondary btn-block" href="/login.html">Log in</a>
       <a class="btn btn-primary btn-block" href="/register.html">Sign up</a>`;

  slot.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        ${logo}
        <nav class="nav" aria-label="Main">${navLinks}</nav>
        <div class="header-actions">
          ${accountDesktop}
          <button class="btn btn-ghost btn-icon nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-panel" aria-label="Open menu">${icon('menu')}<span class="count-badge dot" data-unread-dot hidden></span></button>
        </div>
      </div>
    </header>
    <nav class="mobile-panel" id="mobile-panel" aria-label="Mobile" hidden>${navLinks}${accountMobile}</nav>
    <div class="blocked-banner" data-blocked hidden>
      <div class="container">${icon('ban')}Your account has been blocked by an admin. You can browse, but you can't post listings, wanted posts or messages.</div>
    </div>`;

  // Mobile menu
  const toggle = slot.querySelector('.nav-toggle');
  const panel = slot.querySelector('#mobile-panel');
  const setPanel = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('.icon').outerHTML = icon(open ? 'x' : 'menu');
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

  wireInstallButtons(slot);

  slot.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async () => {
    await supabase.auth.signOut();
    location.href = '/';
  }));

  const me = await meReady;
  if (me) {
    slot.querySelectorAll('[data-initials]').forEach((el) => { el.textContent = initials(me.name); });
    slot.querySelector('[data-name]').textContent = me.name;
    slot.querySelector('[data-email]').textContent = me.email;
    slot.querySelectorAll('[data-admin]').forEach((el) => { el.hidden = !me.is_admin; });
    slot.querySelector('[data-blocked]').hidden = !me.blocked;

    if (page !== 'messages') {
      const unread = await unreadCount(me.id);
      slot.querySelectorAll('[data-unread]').forEach((el) => { el.textContent = unread; el.hidden = !unread; });
      slot.querySelector('[data-unread-dot]').hidden = !unread;
    }
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
              <li><a href="/wanted.html">Wanted board</a></li>
              <li><a href="/#categories">Categories</a></li>
              <li><a href="/dashboard.html">Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li><a href="/about.html">About</a></li>
              <li><a href="/how-it-works.html">How it works</a></li>
              <li><a href="/faq.html">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h2>Account</h2>
            <ul>
              <li><a href="/login.html">Log in</a></li>
              <li><a href="/register.html">Sign up</a></li>
              <li><a href="/profile.html">Profile</a></li>
              <li><button type="button" class="footer-link" data-install>Install the app</button></li>
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

// Every [data-install] control opens the install flow; hidden inside the installed app.
function wireInstallButtons(root) {
  root.querySelectorAll('[data-install]').forEach((el) => {
    el.hidden = isInstalled();
    el.addEventListener('click', installApp);
  });
}

const headerSlot = document.getElementById('site-header');
const footerSlot = document.getElementById('site-footer');
if (headerSlot) renderHeader(headerSlot);
if (footerSlot) { renderFooter(footerSlot); wireInstallButtons(footerSlot); }

// Installable app (PWA): the service worker only adds an offline fallback, it never caches data.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
