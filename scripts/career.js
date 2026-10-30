// Dibuja assets/career.svg (la barra de la carrera) a partir de career.json.
// Lo corre GitHub Actions cada vez que cambias el número en career.json.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const c = JSON.parse(fs.readFileSync(path.join(root, 'career.json'), 'utf8'));
const p = Math.max(0, Math.min(100, Math.round(Number(c.progress) || 0)));
const FONTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'fonts.json'), 'utf8'));
// Letras incluidas dentro de cada imagen: así se ven iguales en Windows, Mac y celular
const FONT_CSS = `<style>${['400', '600', '700', '800'].map(w => `@font-face{font-family:"Inter Embed";font-weight:${w};src:url(data:font/woff;base64,${FONTS['Inter-' + w]}) format("woff")}`).join('')}@font-face{font-family:"Mono Embed";src:url(data:font/woff;base64,${FONTS['Mono-400']}) format("woff")}</style>`;
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const W = 1280, H = 220, X = 56, BW = W - 2 * X, BY = 144, BH = 12;
const fill = Math.round(BW * p / 100);
const ease = t => 1 - Math.pow(1 - t, 3);
function countUp(x, y, n, cycle = 12, count = 1.8) {
  let out = '';
  for (let i = 0; i <= n; i++) {
    const a = count * ease(i / Math.max(n, 1)) / cycle, b = i < n ? count * ease((i + 1) / Math.max(n, 1)) / cycle : 1;
    const kt = i === 0 ? `0;${b.toFixed(4)};1` : `0;${a.toFixed(4)};${b.toFixed(4)}${i < n ? ';1' : ''}`;
    const vals = i === 0 ? '1;0;0' : (i < n ? '0;1;0;0' : '0;1;1');
    out += `<text x="${x}" y="${y}" font-family="'Inter Embed', Segoe UI, Helvetica, Arial, sans-serif" font-size="54" font-weight="800" text-anchor="end" fill="#3aa0ff" opacity="${i === 0 ? 1 : 0}">${i}<animate attributeName="opacity" values="${vals}" keyTimes="${kt}" dur="${cycle}s" calcMode="discrete" repeatCount="indefinite"/></text>`;
  }
  return out;
}
// punta de la barra que brilla
const grow = `<animate attributeName="width" values="0;${fill};${fill}" keyTimes="0;.15;1" dur="12s" calcMode="spline" keySplines=".2 .8 .2 1;0 0 1 1" repeatCount="indefinite"/>`;
const PER = 2 * (W + H) - (8 - 2 * Math.PI) * 19;
const ticks = Array.from({ length: 19 }, (_, i) => X + Math.round(BW * (i + 1) / 20))
  .map(x => `<rect x="${x}" y="${BY}" width="2" height="${BH}" fill="#0c1118" opacity=".9"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" width="${W + 24}" height="${H + 24}" viewBox="-12 -12 ${W + 24} ${H + 24}" role="img" aria-label="${esc(c.degree)} progress: ${p}%">
  ${FONT_CSS}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#131a24"/><stop offset="1" stop-color="#0c1118"/></linearGradient>
    <linearGradient id="aur" gradientUnits="userSpaceOnUse" x1="${X}" x2="${X + BW * .8}" y1="0" y2="0" spreadMethod="reflect"><stop offset="0" stop-color="#1e6bff"/><stop offset=".35" stop-color="#3aa0ff"/><stop offset=".65" stop-color="#4bd6b4"/><stop offset="1" stop-color="#9b8cff"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${BW * .8 * 2} 0" dur="8s" repeatCount="indefinite"/></linearGradient>
    <linearGradient id="pulse" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="pulseclip"><rect x="${X}" y="${BY + BH / 2 - 6}" width="${fill}" height="12" rx="6">${grow}</rect></clipPath>
    <filter id="neonsoft" x="-20%" y="-400%" width="140%" height="900%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="neonwide" x="-20%" y="-400%" width="140%" height="900%"><feGaussianBlur stdDeviation="12"/></filter>
    <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#0b3a8c"/><stop offset=".55" stop-color="#1e6bff"/><stop offset="1" stop-color="#3aa0ff"/></linearGradient>
    <linearGradient id="flow" gradientUnits="userSpaceOnUse" x1="${X}" y1="0" x2="${X + BW}" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="#0b3a8c"/><stop offset=".33" stop-color="#1e6bff"/><stop offset=".66" stop-color="#3aa0ff"/><stop offset="1" stop-color="#0b3a8c"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${BW} 0" dur="10s" repeatCount="indefinite"/></linearGradient>
    <pattern id="stripes" width="40" height="${BH}" patternUnits="userSpaceOnUse"><path d="M0 ${BH} L20 0 L40 0 L20 ${BH}Z" fill="#fff"/></pattern>
    <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    <clipPath id="fillclip"><rect x="${X}" y="${BY}" width="${fill}" height="${BH}" rx="6"><animate attributeName="width" values="0;${fill};${fill}" keyTimes="0;.15;1" dur="12s" calcMode="spline" keySplines=".2 .8 .2 1;0 0 1 1" repeatCount="indefinite"/></rect></clipPath>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="soft" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <g clip-path="url(#card)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="80" cy="0" r="170" fill="#0b2d63" filter="url(#blur)"><animateTransform attributeName="transform" type="translate" values="0 0;90 30;0 0" dur="14s" repeatCount="indefinite"/></circle>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="#263142"/>
  <defs><linearGradient id="lb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4bd6b4"/><stop offset=".4" stop-color="#3aa0ff"/><stop offset="1" stop-color="#0b2d63" stop-opacity=".5"/></linearGradient>
    <linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#cfe6ff" stop-opacity=".13"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="lbg" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="url(#lb)" stroke-width="6" filter="url(#lbg)" opacity=".35"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="url(#lb)" stroke-width="1.4" opacity=".9"/>
  <g font-family="'Inter Embed', Segoe UI, Helvetica, Arial, sans-serif">
    <text x="${X}" y="58" font-size="14" letter-spacing="3" fill="#4bd6b4" font-family="'Mono Embed', Consolas, Menlo, monospace">MY DEGREE</text>
    <text x="${X}" y="104" font-size="38" font-weight="800" fill="#eef3fb">${esc(c.degree)}<tspan fill="#8d99ab" font-weight="600" font-size="26"> · ${esc(c.school)}</tspan></text>
    ${countUp(W - X - 34, 104, p)}
    <text x="${W - X}" y="104" font-size="30" font-weight="800" text-anchor="end" fill="#8d99ab">%</text>
  </g>
  <rect x="${X}" y="${BY + BH / 2 - 3}" width="${BW}" height="6" rx="3" fill="#1a212c"/>
  ${[25, 50, 75].map(m => `<circle cx="${X + BW * m / 100}" cy="${BY + BH / 2}" r="2.2" fill="none"/><circle cx="${X + BW * m / 100}" cy="${BY + BH / 2}" r="2" fill="#3a4659"/>`).join('')}
  <g>
    <rect x="${X}" y="${BY + BH / 2 - 6}" width="${fill}" height="12" rx="6" fill="url(#aur)" filter="url(#neonwide)" opacity=".8">${grow}<animate attributeName="opacity" values=".55;.95;.55" dur="1.8s" repeatCount="indefinite"/></rect>
    <rect x="${X}" y="${BY + BH / 2 - 4}" width="${fill}" height="8" rx="4" fill="url(#aur)" filter="url(#neonsoft)">${grow}</rect>
    <rect x="${X}" y="${BY + BH / 2 - 3}" width="${fill}" height="6" rx="3" fill="url(#aur)">${grow}</rect>
    <rect x="${X}" y="${BY + BH / 2 - 1}" width="${fill}" height="2" rx="1" fill="#f2fbff" opacity=".85">${grow}</rect>
    <g clip-path="url(#pulseclip)"><rect x="${X - 180}" y="${BY + BH / 2 - 6}" width="180" height="12" fill="url(#pulse)"><animate attributeName="x" values="${X - 180};${X + fill}" dur="1.7s" repeatCount="indefinite"/></rect></g>
    <g><animateTransform attributeName="transform" type="translate" values="${-fill} 0;0 0;0 0" keyTimes="0;.15;1" dur="12s" calcMode="spline" keySplines=".2 .8 .2 1;0 0 1 1" repeatCount="indefinite"/>
      <circle cx="${X + fill}" cy="${BY + BH / 2}" r="6" fill="#ffffff" filter="url(#neonsoft)"/><circle cx="${X + fill}" cy="${BY + BH / 2}" r="3.4" fill="#ffffff"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = i * 45 * Math.PI / 180, d = (i * .17).toFixed(2), col = ['#9be3ff', '#c9bfff', '#8ff0d6'][i % 3];
        return `<circle cx="${X + fill}" cy="${BY + BH / 2}" r="1.7" fill="${col}"><animateTransform attributeName="transform" type="translate" values="0 0;${(Math.cos(a) * 20).toFixed(1)} ${(Math.sin(a) * 15).toFixed(1)}" dur="1.1s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.1s" begin="${d}s" repeatCount="indefinite"/></circle>`; }).join('')}
    </g>
  </g>
  <g font-family="'Mono Embed', Consolas, Menlo, monospace" font-size="13" letter-spacing="2" fill="#8d99ab">
    <text x="${X}" y="${BY + 44}">START</text>
    <text x="${W - X}" y="${BY + 44}" text-anchor="end">GRADUATION</text>
  </g>
</svg>
`;
fs.writeFileSync(path.join(root, 'assets', 'career.svg'), svg);
console.log(`career.svg: ${p}%`);
