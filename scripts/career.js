// Dibuja assets/career.svg (la barra de la carrera) a partir de career.json.
// Lo corre GitHub Actions cada vez que cambias el número en career.json.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const c = JSON.parse(fs.readFileSync(path.join(root, 'career.json'), 'utf8'));
const p = Math.max(0, Math.min(100, Math.round(Number(c.progress) || 0)));
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const W = 1280, H = 220, X = 56, BW = W - 2 * X, BY = 142, BH = 18;
const fill = Math.round(BW * p / 100);
const ticks = Array.from({ length: 19 }, (_, i) => X + Math.round(BW * (i + 1) / 20))
  .map(x => `<rect x="${x}" y="${BY}" width="2" height="${BH}" fill="#0e1218" opacity=".9"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.degree)} progress: ${p}%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#151b24"/><stop offset="1" stop-color="#0e1218"/></linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1"><stop offset="0" stop-color="#0b2d63" stop-opacity=".9"/><stop offset="1" stop-color="#0b2d63" stop-opacity="0"/></radialGradient>
    <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#1e6bff"/><stop offset=".7" stop-color="#3aa0ff"/><stop offset="1" stop-color="#4bd6b4"/></linearGradient>
    <filter id="soft" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="${W}" height="${H}" rx="16" fill="url(#bg)"/>
  <ellipse cx="0" cy="0" rx="520" ry="260" fill="url(#glow)"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="#2a3442"/>
  <g font-family="Segoe UI, Inter, Helvetica, Arial, sans-serif">
    <text x="${X}" y="58" font-size="14" letter-spacing="3" fill="#4bd6b4" font-family="Consolas, Menlo, monospace">◆ MAIN QUEST · DEGREE</text>
    <text x="${X}" y="104" font-size="38" font-weight="800" fill="#eef3fb">${esc(c.degree)}<tspan fill="#8b97a8" font-weight="600" font-size="26"> · ${esc(c.school)}</tspan></text>
    <text x="${W - X}" y="104" font-size="54" font-weight="800" text-anchor="end" fill="#3aa0ff">${p}<tspan font-size="30" fill="#8b97a8">%</tspan></text>
  </g>
  <rect x="${X}" y="${BY}" width="${BW}" height="${BH}" rx="9" fill="#1d2430"/>
  <rect x="${X}" y="${BY - 2}" width="${fill}" height="${BH + 4}" rx="10" fill="url(#bar)" opacity=".55" filter="url(#soft)"/>
  <rect x="${X}" y="${BY}" width="${fill}" height="${BH}" rx="9" fill="url(#bar)"/>
  ${ticks}
  <g font-family="Consolas, Menlo, monospace" font-size="13" letter-spacing="2" fill="#8b97a8">
    <text x="${X}" y="${BY + 50}">START</text>
    <text x="${W - X}" y="${BY + 50}" text-anchor="end">GRADUATION</text>
  </g>
</svg>
`;
fs.writeFileSync(path.join(root, 'assets', 'career.svg'), svg);
console.log(`career.svg: ${p}%`);
