// Genera las tarjetas animadas (SVG) del perfil. Uso: node scripts/cards.js
// Las animaciones usan SMIL, que GitHub muestra dentro de <img>.
const fs = require('fs'), path = require('path');
const A = path.join(__dirname, '..', 'assets');
const C = { bg1:'#131a24', bg2:'#0c1118', ink:'#eef3fb', soft:'#8d99ab', line:'#263142', navy:'#0b2d63', azure:'#3aa0ff', blue:'#1e6bff', teal:'#4bd6b4', amber:'#f0b45a', coral:'#ff7a59', violet:'#9b8cff' };
const SANS = "'Inter Embed', Segoe UI, Helvetica, Arial, sans-serif";
const MONO = "'Mono Embed', Consolas, Menlo, monospace";
const FONTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts.json'), 'utf8'));
// Letras incluidas dentro de cada imagen: así se ven iguales en Windows, Mac y celular
const FONT_CSS = `<style>${['400', '600', '700', '800'].map(w => `@font-face{font-family:"Inter Embed";font-weight:${w};src:url(data:font/woff;base64,${FONTS['Inter-' + w]}) format("woff")}`).join('')}@font-face{font-family:"Mono Embed";src:url(data:font/woff;base64,${FONTS['Mono-400']}) format("woff")}</style>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const R = 20; // esquinas redondeadas

// Fondo: tarjeta redondeada (lo de afuera queda transparente) + "aurora" que se mueve despacio
function frame(id, w, h, inner, { aurora = true, glow = [C.navy, C.azure, C.teal] } = {}) {
  const blob = (cx, cy, r, color, dx, dy, dur, op) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" values="0 0; ${dx} ${dy}; 0 0" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1; .45 0 .55 1"/></circle>`;
  // Margen transparente alrededor: el brillo del borde se desvanece antes de llegar a la orilla
  // de la imagen, así las esquinas se ven redondas de verdad.
  const P = 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w + 2 * P}" height="${h + 2 * P}" viewBox="${-P} ${-P} ${w + 2 * P} ${h + 2 * P}" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">
  ${FONT_CSS}
  <defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg2}"/></linearGradient>
    <clipPath id="${id}clip"><rect width="${w}" height="${h}" rx="${R}"/></clipPath>
    <filter id="${id}blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(Math.min(w, h) / 5)}"/></filter>
  </defs>
  <g clip-path="url(#${id}clip)">
    <rect width="${w}" height="${h}" fill="url(#${id}bg)"/>
    ${aurora ? `<g filter="url(#${id}blur)">
      ${blob(w * .08, h * .1, Math.min(w, h) * .55, glow[0], w * .08, h * .12, 14, .95)}
      ${blob(w * .7, h * 1.05, Math.min(w, h) * .45, glow[1], -w * .1, -h * .1, 17, .28)}
      ${blob(w * .95, h * .05, Math.min(w, h) * .3, glow[2], -w * .06, h * .1, 12, .16)}
    </g>` : ''}
    ${inner}
    ${sheen(id, w, h)}
  </g>
  <rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${R}" fill="none" stroke="${C.line}"/>
  ${lightBorder(id, w, h)}
</svg>
`;
}
// Borde con degradado fijo (verde → azure → azul oscuro) y un halo suave
function lightBorder(id, w, h) {
  const grad = `<linearGradient id="${id}lb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.teal}"/><stop offset=".4" stop-color="${C.azure}"/><stop offset="1" stop-color="${C.navy}" stop-opacity=".5"/></linearGradient>`;
  const rect = extra => `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${R - 1}" fill="none" stroke="url(#${id}lb)" ${extra}/>`;
  return `<defs>${grad}<filter id="${id}lbg" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
  ${rect(`stroke-width="6" filter="url(#${id}lbg)" opacity=".35"`)}${rect('stroke-width="1.4" opacity=".9"')}`;
}
// Reflejo de cristal: una franja de luz diagonal cruza la tarjeta cada 7 s.
// Todas las tarjetas usan el mismo ciclo, así pasan juntas.
const SHEEN_CYCLE = 7;
function sheen(id, w, h, span = w) {
  const band = 220;
  return `<defs><linearGradient id="${id}sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#cfe6ff" stop-opacity=".13"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <g transform="skewX(-22)"><rect x="${-band - h}" y="-20" width="${band}" height="${h + 40}" fill="url(#${id}sh)">
    <animateTransform attributeName="transform" type="translate" values="0 0; ${span + band + 2 * h} 0; ${span + band + 2 * h} 0" keyTimes="0;.4;1" dur="${SHEEN_CYCLE}s" calcMode="spline" keySplines=".45 0 .55 1;0 0 1 1" repeatCount="indefinite"/></rect></g>`;
}
// Partículas que suben despacio (números fijos para que siempre salga igual)
function particles(w, h, n, seed = 7) {
  let x = seed; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: n }, () => {
    const cx = (rnd() * w).toFixed(0), r = (0.8 + rnd() * 1.8).toFixed(1), dur = (9 + rnd() * 10).toFixed(1), d = (-rnd() * dur).toFixed(1);
    const col = rnd() < .35 ? C.teal : rnd() < .6 ? C.azure : '#ffffff';
    return `<circle cx="${cx}" cy="${h + 10}" r="${r}" fill="${col}">
      <animateTransform attributeName="transform" type="translate" values="0 0; ${(rnd() * 40 - 20).toFixed(0)} -${h + 30}" dur="${dur}s" begin="${d}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.2;.7;1" dur="${dur}s" begin="${d}s" repeatCount="indefinite"/></circle>`;
  }).join('');
}
const pill = (x, y, t, color = C.soft) => { const w = 18 + t.length * 8.2;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="28" rx="14" fill="#ffffff" fill-opacity=".05" stroke="${C.line}"/>
  <text x="${x + w / 2}" y="${y + 19}" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="600" fill="#d5dde9">${esc(t)}</text></g>`; };
const pills = (x, y, list) => { let cx = x; return list.map(t => { const s = pill(cx, y, t); cx += 18 + t.length * 8.2 + 8; return s; }).join(''); };
const pulse = (cx, cy, color) => `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}"/><circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${color}" stroke-width="2">
  <animate attributeName="r" values="5;13" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="1.8s" repeatCount="indefinite"/></circle>`;


// Número que cuenta de 0 a N al principio de cada ciclo (SMIL no puede cambiar el texto,
// así que hay un <text> por número y se muestra uno a la vez).
const ease = t => 1 - Math.pow(1 - t, 3);
function counter(x, y, n, { cycle = 12, count = 1.8, attrs = '', suffix = '' } = {}) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = (count * ease(i / Math.max(n, 1))) / cycle, b = i < n ? (count * ease((i + 1) / Math.max(n, 1))) / cycle : 1;
    const kt = i === 0 ? `0;${b.toFixed(4)};1` : `0;${a.toFixed(4)};${b.toFixed(4)}${i < n ? ';1' : ''}`;
    const vals = i === 0 ? '1;0;0' : (i < n ? '0;1;0;0' : '0;1;1');
    out.push(`<text x="${x}" y="${y}" ${attrs} opacity="${i === 0 ? 1 : 0}">${i}${suffix}<animate attributeName="opacity" values="${vals}" keyTimes="${kt}" dur="${cycle}s" calcMode="discrete" repeatCount="indefinite"/></text>`);
  }
  return out.join('');
}
// Barra de segmentos que se encienden uno por uno al principio del ciclo
function segBar(x, y, w, n, color, { cycle = 12, start = .2, step = .09, segs = 10 } = {}) {
  const gap = 4, sw = (w - gap * (segs - 1)) / segs;
  return Array.from({ length: segs }, (_, i) => {
    const sx = (x + i * (sw + gap)).toFixed(1);
    if (i >= n) return `<rect x="${sx}" y="${y}" width="${sw.toFixed(1)}" height="8" rx="2" fill="#ffffff" fill-opacity=".07"/>`;
    const t = ((start + i * step) / cycle).toFixed(4);
    return `<rect x="${sx}" y="${y}" width="${sw.toFixed(1)}" height="8" rx="2" fill="#ffffff" fill-opacity=".07"/>
      <rect x="${sx}" y="${y}" width="${sw.toFixed(1)}" height="8" rx="2" fill="${color}" opacity="0"><animate attributeName="opacity" values="0;1;1" keyTimes="0;${t};1" dur="${cycle}s" calcMode="discrete" repeatCount="indefinite"/></rect>`;
  }).join('');
}

// ---------- 1. Portada ----------
function hero() {
  const w = 1280, h = 340;
  const typed = 'data centers · video games · apps I actually use';
  return frame('h', w, h, `
  ${particles(w, h, 46)}
  <g font-family="${SANS}">
    <text x="64" y="92" font-family="${MONO}" font-size="14" letter-spacing="3" fill="${C.teal}">SYSTEMS ENGINEERING · INTEC</text>
    <defs><linearGradient id="namegrad" gradientUnits="userSpaceOnUse" x1="60" y1="0" x2="760" y2="0">
      <stop offset="0" stop-color="${C.ink}"/><stop offset=".42" stop-color="${C.ink}"/><stop offset=".5" stop-color="#bfe6ff"/><stop offset=".58" stop-color="${C.ink}"/><stop offset="1" stop-color="${C.ink}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-900 0; 900 0" dur="5s" repeatCount="indefinite"/></linearGradient></defs>
    <text x="60" y="176" font-size="82" font-weight="800" letter-spacing="-2.5" fill="url(#namegrad)">Dominique Jeldes</text>
    <clipPath id="type"><rect x="64" y="200" width="0" height="40"><animate attributeName="width" values="0;760;760;0" keyTimes="0;.45;.9;1" dur="9s" repeatCount="indefinite"/></rect></clipPath>
    <text x="64" y="228" font-size="24" fill="${C.soft}" clip-path="url(#type)">${esc(typed)}</text>

    ${pulse(72, 282, C.teal)}
    <g transform="translate(838 52)">
      <rect width="380" height="236" rx="16" fill="#0a0f16" fill-opacity=".72" stroke="${C.line}"/>
      <text x="22" y="34" font-family="${MONO}" font-size="12" letter-spacing="2.5" fill="${C.soft}">STATS</text>
      ${pulse(300, 30, C.teal)}<text x="312" y="34" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${C.teal}">LIVE</text>
      ${[['Data centers', 9, C.teal], ['Video games', 10, C.azure], ['Building useful apps', 8, C.violet], ['Loving to code', 4, C.amber]].map(([t, v, col], k) => `
        <text x="22" y="${70 + k * 44}" font-size="15" font-weight="600" fill="#e3eaf4">${t}</text>
        ${counter(358, 70 + k * 44, v, { count: .2 + v * .09, attrs: `text-anchor="end" font-family="${MONO}" font-size="14" fill="${C.soft}"` })}
        ${segBar(22, 80 + k * 44, 336, v, col, { start: .2 + k * .15 })}`).join('')}
    </g>
    <text x="90" y="288" font-size="16" font-weight="600" fill="#cfd8e6">online · streaming on Twitch &amp; YouTube</text>
  </g>`);
}

// ---------- 2. Botones ----------
function button(label, handle, color, icon) {
  const w = 420, h = 104;
  return frame('b' + handle.replace(/\W/g, ''), w, h, `
  <rect x="26" y="26" width="52" height="52" rx="15" fill="${color}"/>
  <rect x="26" y="26" width="52" height="52" rx="15" fill="none" stroke="${color}" stroke-width="2"><animate attributeName="stroke-opacity" values=".6;0" dur="2.2s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="scale" values="1;1.18" dur="2.2s" repeatCount="indefinite" additive="sum"/></rect>
  <g transform="translate(52 52)">${icon}</g>
  <text x="100" y="47" font-family="${MONO}" font-size="12" letter-spacing="2" fill="${C.soft}">${esc(label)}</text>
  <text x="100" y="76" font-family="${SANS}" font-size="23" font-weight="700" fill="${C.ink}">${esc(handle)}</text>
  <text x="${w - 34}" y="62" text-anchor="end" font-family="${SANS}" font-size="22" fill="${C.soft}">→</text>`, { glow: [C.navy, color, C.azure] });
}
const ICON = {
  live: `<circle r="4.5" fill="#fff"/><path d="M-7-7a10 10 0 0 0 0 14M7-7a10 10 0 0 1 0 14" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  play: `<path d="M-6-9 L10 0 L-6 9Z" fill="#fff"/>`,
  case: `<g fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><rect x="-10" y="-6" width="20" height="14" rx="2.5"/><path d="M-4-6v-3h8v3M-10 0h20"/></g>`,
};

// ---------- 3. Plana ----------
function plana() {
  const w = 1280, h = 330;
  const pages = JSON.parse(fs.readFileSync('/tmp/pages-hd.json')).light;
  const pg = (src, x, y, rot, dy, dur) => `<g transform="translate(${x} ${y}) rotate(${rot})"><g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 ${dy}; 0 0" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1; .45 0 .55 1"/>
    <rect x="-2" y="6" width="154" height="246" rx="6" fill="#000" opacity=".35"/>
    <image href="${src}" xlink:href="${src}" width="150" height="240" preserveAspectRatio="xMidYMid slice"/></g></g>`;
  return frame('p', w, h, `
  ${particles(w, h, 22, 13)}
  <g font-family="${SANS}">
    <text x="64" y="80" font-family="${MONO}" font-size="14" letter-spacing="3" fill="${C.teal}">MY OWN APP</text>
    <text x="60" y="150" font-size="66" font-weight="800" letter-spacing="-2" fill="${C.ink}">Plana</text>
    <text x="64" y="194" font-size="20" fill="${C.soft}">Notebook templates for Samsung Notes,</text>
    <text x="64" y="222" font-size="20" fill="${C.soft}">sized to the real screen of each Galaxy Tab.</text>
    ${pills(64, 248, ['Vector PDF', 'Works offline', 'Installable', 'EN · ES · LT'])}
  </g>
  ${pg(pages[0], 790, 70, -8, -8, 6)}${pg(pages[2], 1050, 56, 7, -10, 7)}${pg(pages[1], 920, 40, -1, -12, 5)}`);
}

// ---------- 4. Materias (una sola imagen, 2 × 3) ----------
const COURSES = [
  ['software-dev-lab-3', 'Software Development · Lab 3', '15 projects: services, messaging, sockets, reports.', ['C#', 'ASP.NET Core', 'NServiceBus', 'SQL Server']],
  ['dsa-2', 'Data Structures & Algorithms 2', 'Graphs, backtracking, Minimax and a maze game.', ['C++', 'Python', 'Tkinter']],
  ['software-dev-2', 'Software Development 2', 'Sales and purchasing system, stored procedures.', ['C#', 'SQL Server']],
  ['dsa-1', 'Data Structures & Algorithms 1', 'Stacks, queues, trees and hash tables.', ['C++', 'Visual Studio']],
  ['software-dev-1', 'Software Development 1', 'Inventory and library systems.', ['C#', 'Windows Forms', 'SQL Server']],
];
function coursework() {
  const W = 1280, cw = 632, ch = 200, g = 16, H = 3 * ch + 2 * g, P = 12;
  const cells = [0, 1, 2, 3, 4, 5].map(i => ({ x: (i % 2) * (cw + g), y: Math.floor(i / 2) * (ch + g) }));
  const union = cells.map(c => `<rect x="${c.x}" y="${c.y}" width="${cw}" height="${ch}" rx="${R}"/>`).join('');
  const blob = (cx, cy, r, color, dx, dy, dur, op) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" values="0 0; ${dx} ${dy}; 0 0" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1; .45 0 .55 1"/></circle>`;
  const card = (c, i) => {
    if (i === 5) return `<g transform="translate(${c.x} ${c.y})">
      <rect width="${cw}" height="${ch}" rx="${R}" fill="#0b1017" fill-opacity=".86"/>
      <g clip-path="url(#cwcell)" opacity=".45">${Array.from({ length: 40 }, (_, k) => `<path d="M${k * 28 - 200} ${ch} L${k * 28} 0" stroke="#1d2532" stroke-width="12"/>`).join('')}</g>
      <rect x="206" y="66" width="68" height="68" rx="18" fill="#0f141c" stroke="${C.line}"/>
      <g transform="translate(240 100)" fill="none" stroke="${C.azure}" stroke-width="2.6" stroke-linecap="round"><rect x="-11" y="-3" width="22" height="16" rx="3"/><path d="M-6.5-3v-5a6.5 6.5 0 0 1 13 0v5"/>
        <animateTransform attributeName="transform" type="rotate" values="0;-6;6;0" dur="2.5s" repeatCount="indefinite" additive="sum"/></g>
      <text x="298" y="98" font-family="${SANS}" font-size="28" font-weight="800" fill="#62738f" letter-spacing="3">???</text>
      <text x="298" y="124" font-family="${MONO}" font-size="12" letter-spacing="2.5" fill="${C.soft}">NEXT · A GAME · SOON</text></g>`;
    const [title, sub, desc, tags] = COURSES[i];
    return `<g transform="translate(${c.x} ${c.y})">
      <rect width="${cw}" height="${ch}" rx="${R}" fill="#0b1017" fill-opacity=".55"/>
      <g font-family="${SANS}">
        <text x="34" y="50" font-family="${MONO}" font-size="12" letter-spacing="2.5" fill="${C.soft}">${esc(sub.toUpperCase())}</text>
        <text x="32" y="94" font-size="32" font-weight="800" letter-spacing="-.5" fill="${C.ink}">${esc(title)}</text>
        <text x="34" y="126" font-size="16" fill="${C.soft}">${esc(desc)}</text>
        ${pills(34, 146, tags)}
      </g></g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W + 2 * P}" height="${H + 2 * P}" viewBox="${-P} ${-P} ${W + 2 * P} ${H + 2 * P}" text-rendering="geometricPrecision" shape-rendering="geometricPrecision">
  ${FONT_CSS}
  <defs>
    <clipPath id="cwall">${union}</clipPath>
    <clipPath id="cwcell"><rect width="${cw}" height="${ch}" rx="${R}"/></clipPath>
    <linearGradient id="cwbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg2}"/></linearGradient>
    <filter id="cwblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
    <linearGradient id="cwlb" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
      <stop offset="0" stop-color="${C.teal}"/><stop offset=".45" stop-color="${C.azure}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>
    <filter id="cwglow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3.5"/></filter>
  </defs>
  <g clip-path="url(#cwall)">
    <rect width="${W}" height="${H}" fill="url(#cwbg)"/>
    <g filter="url(#cwblur)">
      ${blob(120, 60, 260, C.navy, 140, 80, 16, .95)}
      ${blob(1150, 420, 240, C.navy, -160, -60, 18, .9)}
      ${blob(640, 330, 200, C.azure, 120, -40, 14, .22)}
      ${blob(250, 560, 180, C.teal, 90, -50, 15, .13)}
      ${blob(1100, 80, 160, C.azure, -100, 60, 13, .18)}
    </g>
    ${cells.map(card).join('')}
    ${sheen('cw', W, H)}
  </g>
  ${cells.map(c => `<rect x="${c.x + 1}" y="${c.y + 1}" width="${cw - 2}" height="${ch - 2}" rx="${R - 1}" fill="none" stroke="url(#cwlb)" stroke-width="6" filter="url(#cwglow)" opacity=".35"/>
  <rect x="${c.x + 1}" y="${c.y + 1}" width="${cw - 2}" height="${ch - 2}" rx="${R - 1}" fill="none" stroke="url(#cwlb)" stroke-width="1.4" opacity=".9"/>`).join('')}
</svg>
`;
}

// ---------- 5. Herramientas ----------
function tools() {
  const w = 1280, h = 230, list = ['C#', '.NET', 'C++', 'Python', 'JavaScript', 'SQL Server', 'Git', 'GitHub Actions', 'Visual Studio', 'DaVinci Resolve', 'OBS', '+'];
  const cw = 182, ch = 70, gx = 16, x0 = (w - (6 * cw + 5 * gx)) / 2;
  return frame('t', w, h, list.map((t, i) => { const x = x0 + (i % 6) * (cw + gx), y = 36 + Math.floor(i / 6) * (ch + 18);
    return `<g><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" fill="#ffffff" fill-opacity=".03" stroke="${C.line}"/>
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" fill="none" stroke="${C.azure}" stroke-opacity="0"><animate attributeName="stroke-opacity" values="0;.7;0" dur="6s" begin="${(i * .5).toFixed(1)}s" repeatCount="indefinite"/></rect>
      <text x="${x + cw / 2}" y="${y + 42}" text-anchor="middle" font-family="${SANS}" font-size="${t === '+' ? 26 : 17}" font-weight="700" fill="${t === '+' ? C.soft : '#e3eaf4'}">${esc(t)}</text></g>`; }).join(''));
}

const out = {
  'hero.svg': hero(),
  'btn-twitch.svg': button('STREAMING ON TWITCH', 'qdothy', '#9146ff', ICON.live),
  'btn-youtube.svg': button('VIDEOS ON YOUTUBE', '@qDothy', '#ff2d2d', ICON.play),
  'btn-linkedin.svg': button('WORK · LINKEDIN', 'dominiquejeldes', '#0a66c2', ICON.case),
  'plana.svg': plana(),
  'coursework.svg': coursework(),
  'tools.svg': tools(),
};
for (const [f, s] of Object.entries(out)) fs.writeFileSync(path.join(A, f), s);
console.log('ok:', Object.keys(out).join(', '));
