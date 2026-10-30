// Dibuja assets/career.svg (la barra de la carrera) a partir de career.json.
// Lo corre GitHub Actions cada vez que cambias el número en career.json.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const c = JSON.parse(fs.readFileSync(path.join(root, 'career.json'), 'utf8'));
const p = Math.max(0, Math.min(100, Math.round(Number(c.progress) || 0)));
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const W = 1280, H = 220, X = 56, BW = W - 2 * X, BY = 138, BH = 24;
const fill = Math.round(BW * p / 100);
const ease = t => 1 - Math.pow(1 - t, 3);
function countUp(x, y, n, cycle = 12, count = 1.8) {
  let out = '';
  for (let i = 0; i <= n; i++) {
    const a = count * ease(i / Math.max(n, 1)) / cycle, b = i < n ? count * ease((i + 1) / Math.max(n, 1)) / cycle : 1;
    const kt = i === 0 ? `0;${b.toFixed(4)};1` : `0;${a.toFixed(4)};${b.toFixed(4)}${i < n ? ';1' : ''}`;
    const vals = i === 0 ? '1;0;0' : (i < n ? '0;1;0;0' : '0;1;1');
    out += `<text x="${x}" y="${y}" font-size="54" font-weight="800" text-anchor="end" fill="#3aa0ff" opacity="${i === 0 ? 1 : 0}">${i}<animate attributeName="opacity" values="${vals}" keyTimes="${kt}" dur="${cycle}s" calcMode="discrete" repeatCount="indefinite"/></text>`;
  }
  return out;
}
// punta de la barra que brilla
const PER = 2 * (W + H) - (8 - 2 * Math.PI) * 19;
const ticks = Array.from({ length: 19 }, (_, i) => X + Math.round(BW * (i + 1) / 20))
  .map(x => `<rect x="${x}" y="${BY}" width="2" height="${BH}" fill="#0c1118" opacity=".9"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.degree)} progress: ${p}%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#131a24"/><stop offset="1" stop-color="#0c1118"/></linearGradient>
    <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#0b3a8c"/><stop offset=".55" stop-color="#1e6bff"/><stop offset="1" stop-color="#3aa0ff"/></linearGradient>
    <linearGradient id="flow" gradientUnits="userSpaceOnUse" x1="${X}" y1="0" x2="${X + BW}" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="#0b3a8c"/><stop offset=".33" stop-color="#1e6bff"/><stop offset=".66" stop-color="#3aa0ff"/><stop offset="1" stop-color="#0b3a8c"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${BW} 0" dur="6s" repeatCount="indefinite"/></linearGradient>
    <pattern id="stripes" width="40" height="${BH}" patternUnits="userSpaceOnUse"><path d="M0 ${BH} L20 0 L40 0 L20 ${BH}Z" fill="#fff"/></pattern>
    <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    <clipPath id="fillclip"><rect x="${X}" y="${BY}" width="${fill}" height="${BH}" rx="12"><animate attributeName="width" values="0;${fill};${fill}" keyTimes="0;.15;1" dur="12s" calcMode="spline" keySplines=".2 .8 .2 1;0 0 1 1" repeatCount="indefinite"/></rect></clipPath>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="soft" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <g clip-path="url(#card)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="80" cy="0" r="170" fill="#0b2d63" filter="url(#blur)"><animateTransform attributeName="transform" type="translate" values="0 0;90 30;0 0" dur="14s" repeatCount="indefinite"/></circle>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="#263142"/>
  <defs><linearGradient id="lb" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4bd6b4"/><stop offset=".35" stop-color="#3aa0ff"/><stop offset=".65" stop-color="#0b2d63" stop-opacity=".25"/><stop offset="1" stop-color="#4bd6b4"/>
      <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="8s" repeatCount="indefinite"/></linearGradient>
    <filter id="lbg" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="url(#lb)" stroke-width="6" filter="url(#lbg)" opacity=".45"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="url(#lb)" stroke-width="1.5"/>
  <g font-family="Segoe UI, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif">
    <text x="${X}" y="58" font-size="14" letter-spacing="3" fill="#4bd6b4" font-family="ui-monospace, Consolas, Menlo, monospace">MY DEGREE</text>
    <text x="${X}" y="104" font-size="38" font-weight="800" fill="#eef3fb">${esc(c.degree)}<tspan fill="#8d99ab" font-weight="600" font-size="26"> · ${esc(c.school)}</tspan></text>
    ${countUp(W - X - 34, 104, p)}
    <text x="${W - X}" y="104" font-size="30" font-weight="800" text-anchor="end" fill="#8d99ab">%</text>
  </g>
  <rect x="${X}" y="${BY}" width="${BW}" height="${BH}" rx="12" fill="#1d2430"/>
  <rect x="${X}" y="${BY - 4}" width="${fill}" height="${BH + 8}" rx="13" fill="url(#bar)" opacity=".45" filter="url(#soft)">
    <animate attributeName="width" values="0;${fill};${fill}" keyTimes="0;.15;1" dur="12s" calcMode="spline" keySplines=".2 .8 .2 1;0 0 1 1" repeatCount="indefinite"/>
    <animate attributeName="opacity" values=".35;.7;.35" dur="2.4s" repeatCount="indefinite"/></rect>
  <g clip-path="url(#fillclip)">
    <rect x="${X}" y="${BY}" width="${fill}" height="${BH}" fill="url(#flow)"/>
    <rect x="${X - 40}" y="${BY}" width="${fill + 80}" height="${BH}" fill="url(#stripes)" opacity=".22">
      <animateTransform attributeName="transform" type="translate" values="0 0;40 0" dur="1s" repeatCount="indefinite"/></rect>
    <rect x="${X - 240}" y="${BY}" width="240" height="${BH}" fill="url(#shine)"><animate attributeName="x" values="${X - 240};${X + fill}" dur="2.2s" repeatCount="indefinite"/></rect>
  </g>

  <circle cx="${X}" cy="${BY + BH / 2}" r="9" fill="#cfe6ff" opacity=".9"><animate attributeName="cx" values="${X};${X + fill};${X + fill}" keyTimes="0;.15;1" dur="12s" calcMode="spline" keySplines=".2 .8 .2 1;0 0 1 1" repeatCount="indefinite"/><animate attributeName="r" values="7;13;7" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.4;.9" dur="1.4s" repeatCount="indefinite"/></circle>
  <g font-family="ui-monospace, Consolas, Menlo, monospace" font-size="13" letter-spacing="2" fill="#8d99ab">
    <text x="${X}" y="${BY + 50}">START</text>
    <text x="${W - X}" y="${BY + 50}" text-anchor="end">GRADUATION</text>
  </g>
</svg>
`;
fs.writeFileSync(path.join(root, 'assets', 'career.svg'), svg);
console.log(`career.svg: ${p}%`);
