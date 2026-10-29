// ============================================================
//  AJUSTES DE LA WEB: todo lo que tienes que cambiar está aquí
//  (vale para la página en español y para la de inglés)
// ============================================================
const CONFIG = {
  // ---- TEBEX --------------------------------------------------
  // Cuando tengas la tienda, pon aquí su enlace entre comillas, por ejemplo:
  //   tienda: 'https://gfscripts.tebex.io',
  // Mientras sea null, los botones de compra dicen "Próximamente" y llevan al Discord.
  tienda: 'https://gfscripts.tebex.store',

  // Enlace de cada producto en Tebex (opcional). Si lo dejas en null, el botón lleva a la tienda.
  productos: { police: null, radio: null, pack: null },
  // -------------------------------------------------------------

  // Invitación de Discord (en Discord: "Invitar" > "Editar enlace" > "Caducar después de: Nunca")
  discord: 'https://discord.gg/nR78WKsqf',

  // Descarga de GF UI. Ahora es el zip subido junto a la web.
  // Cuando publiques la versión en GitHub, cámbialo por:
  //   'https://github.com/gfscripts/gf-ui/releases/latest'
  gfui: 'gf-ui.zip',

  // Página de GF UI en GitHub (null = no se enseña el enlace)
  gfuiGithub: null,

  // Vídeo de YouTube de la portada. Pon solo el código del vídeo:
  //   de https://www.youtube.com/watch?v=AbCdEf12345  copia  'AbCdEf12345'
  // Mientras sea null, en la portada sale la captura de la tablet.
  video: 'oD_4RUe7QwY',

  // Precios en euros, con punto para los decimales. Ejemplo: police: 24.99
  // Mientras sean null, sale "[X €]". El ahorro del pack se calcula solo.
  precios: { police: 26.99, radio: 14.99, pack: 33.99 },
};

// ============================================================
//  A partir de aquí no hace falta tocar nada
// ============================================================
const EN = document.documentElement.lang === 'en';
const TXT = EN
  ? { soon: 'Coming soon', buy: { police: 'Buy GF Police', radio: 'Buy GF Radio', pack: 'Buy the bundle' }, store: 'Store', save: (v) => `You save ${v}`, video: 'Watch the video', placeholder: '[X €]' }
  : { soon: 'Próximamente', buy: { police: 'Comprar GF Police', radio: 'Comprar GF Radio', pack: 'Comprar el pack' }, store: 'Tienda', save: (v) => `Ahorras ${v}`, video: 'Ver el vídeo', placeholder: '[X €]' };

const money = (value) => new Intl.NumberFormat(EN ? 'en-IE' : 'es-ES', { style: 'currency', currency: 'EUR' }).format(value);
const external = (a, url) => { a.href = url; a.target = '_blank'; a.rel = 'noopener'; };

// ===== Tienda: abierta (Tebex) o "Próximamente" (Discord) =====
// En el HTML los botones ya vienen como "Próximamente" con el enlace al Discord.
// Cuando pongas CONFIG.tienda, aquí se convierten en botones de compra.
document.querySelectorAll('[data-buy]').forEach((a) => {
  const product = a.dataset.buy; // police, radio, pack o store
  const hint = a.parentElement.querySelector('.hint');

  if (CONFIG.tienda) {
    external(a, (CONFIG.productos && CONFIG.productos[product]) || CONFIG.tienda);

    if (a.classList.contains('btn')) {
      a.classList.remove('btn-soon');
      a.classList.add('btn-primary');
      a.innerHTML = '<svg aria-hidden="true"><use href="#i-cart"/></svg>' + (TXT.buy[product] || TXT.store);
    } else {
      a.textContent = TXT.store; // enlace de texto (pie de página)
    }

    if (hint && !hint.dataset.link) hint.hidden = true;
  } else {
    external(a, CONFIG.discord);
  }
});

const storeSoon = document.getElementById('store-soon');
if (storeSoon) storeSoon.hidden = Boolean(CONFIG.tienda);

// ===== Otros enlaces =====
document.querySelectorAll('[data-link="discord"]').forEach((a) => external(a, CONFIG.discord));
document.querySelectorAll('[data-link="gfui"]').forEach((a) => {
  a.href = CONFIG.gfui;
  if (/^https?:/.test(CONFIG.gfui)) external(a, CONFIG.gfui);
  else a.setAttribute('download', '');
});
document.querySelectorAll('[data-link="gfui-github"]').forEach((a) => {
  if (CONFIG.gfuiGithub) external(a, CONFIG.gfuiGithub);
  else a.hidden = true;
});

// ===== Precios =====
const p = CONFIG.precios || {};
const isNum = (v) => typeof v === 'number' && isFinite(v);
document.querySelectorAll('[data-price]').forEach((el) => {
  const value = p[el.dataset.price];
  el.textContent = isNum(value) ? money(value) : TXT.placeholder;
});
document.querySelectorAll('[data-save]').forEach((el) => {
  if (isNum(p.police) && isNum(p.radio) && isNum(p.pack) && p.police + p.radio > p.pack) {
    el.textContent = TXT.save(money(p.police + p.radio - p.pack));
  } else {
    el.textContent = TXT.save(TXT.placeholder);
  }
});

// ===== Vídeo de la portada =====
// Primero se enseña una imagen con un botón de "play". YouTube solo se carga al pulsar
// (la web va más rápida y no se conecta con YouTube hasta que el visitante quiere ver el vídeo).
const videoBox = document.getElementById('hero-video');
if (videoBox && typeof CONFIG.video === 'string' && /^[\w-]{6,20}$/.test(CONFIG.video)) {
  const id = CONFIG.video;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video';
  button.setAttribute('aria-label', TXT.video);
  // De fondo, una captura de la propia web (así no se pide nada a YouTube hasta pulsar)
  button.innerHTML = `<img src="tab-home.webp" alt="" width="1600" height="900">
    <span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
    <span class="label">${TXT.video}</span>`;
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = EN ? 'GF Scripts video' : 'Vídeo de GF Scripts';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    button.replaceWith(frame);
  }, { once: true });

  const screen = videoBox.querySelector('.screen');
  screen.replaceChildren(button);
  screen.style.position = 'relative';
  screen.style.aspectRatio = '16 / 9';
  screen.style.transform = 'none';
  // Las imágenes pequeñas que flotan sobre la captura taparían el vídeo
  videoBox.querySelectorAll('.float-timer, .float-radio').forEach((img) => img.remove());
}

// ===== Galería de GF Police =====
const galImg = document.getElementById('gal-img');
const galCap = document.getElementById('gal-cap');
const thumbs = [...document.querySelectorAll('#gal-thumbs button')];
function select(btn) {
  thumbs.forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
  galImg.src = btn.dataset.src;
  galImg.alt = btn.dataset.cap;
  galCap.textContent = btn.dataset.cap;
}
if (galImg && thumbs.length) {
  thumbs.forEach((b) => b.addEventListener('click', () => select(b)));
  select(thumbs[0]);
}

// ===== Visor en grande =====
const viewer = document.getElementById('viewer');
const galMain = document.getElementById('gal-main');
if (viewer && galMain) {
  const viewerImg = document.getElementById('viewer-img');
  const viewerCap = document.getElementById('viewer-cap');
  const openViewer = (src, cap) => {
    viewerImg.src = src;
    viewerImg.alt = cap || '';
    viewerCap.textContent = cap || '';
    try { viewer.showModal(); } catch (e) { viewer.setAttribute('open', ''); }
  };
  galMain.addEventListener('click', () => openViewer(galImg.src, galCap.textContent));
  galMain.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); galMain.click(); } });
  viewer.querySelector('.close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
}
