// PWA アイコンを生成する。外部依存なし（Node 標準の zlib だけで PNG を書く）。
// 使い方: node tools/make-icons.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'icons');

/* ---------- 最小限の PNG エンコーダ ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
const crc32 = buf => {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;                                  // フィルタ: None
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;  // 8bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------- 描画 ---------- */
const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

function draw(size, pad, rounded) {
  const buf = Buffer.alloc(size * size * 4);
  const put = (x, y, [r, g, b], a = 1) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    const dst = buf[i + 3] / 255;
    const out = a + dst * (1 - a);
    buf[i]     = (r * a + buf[i]     * dst * (1 - a)) / out;
    buf[i + 1] = (g * a + buf[i + 1] * dst * (1 - a)) / out;
    buf[i + 2] = (b * a + buf[i + 2] * dst * (1 - a)) / out;
    buf[i + 3] = Math.round(out * 255);
  };
  const rect = (x0, y0, w, h, color, a = 1) => {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++)
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) put(x, y, color, a);
  };

  // 背景（斜めグラデーション＋角丸）
  const c0 = hex('#20263a'), c1 = hex('#0f1116');
  const rad = rounded ? size * 0.2 : 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let a = 1;
    if (rad) {                                              // 角丸をアンチエイリアス付きで
      const cx = Math.min(Math.max(x + 0.5, rad), size - rad);
      const cy = Math.min(Math.max(y + 0.5, rad), size - rad);
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      a = Math.min(Math.max(rad - d + 0.5, 0), 1);
      if (a <= 0) continue;
    }
    const t = (x + y) / (size * 2);
    put(x, y, [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t], a);
  }

  // モザイクのタイル（中心ほど濃く）
  const m = size * pad, area = size - m * 2, n = 5, b = area / n;
  const tones = ['#4c8dff', '#3a6fd8', '#5fa0ff', '#2f5cb0', '#7ab4ff', '#2a4d95', '#8fc2ff'].map(hex);
  const gap = Math.max(1, size * 0.008);
  for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
    const d = Math.hypot(q - (n - 1) / 2, r - (n - 1) / 2);
    rect(m + q * b + gap, m + r * b + gap, b - gap * 2, b - gap * 2,
         tones[(r * n + q * 3) % tones.length], Math.max(0.18, 1 - d / 3.2));
  }

  // 中央：隠された領域と鍵穴
  const cx = m + b * 1.5, cy = m + b * 1.5;
  rect(cx, cy, b * 2, b * 2, hex('#0d0f12'));
  rect(cx + b * 0.22, cy + b * 0.22, b * 1.56, b * 1.56, hex('#4c8dff'));
  rect(cx + b * 0.72, cy + b * 0.5, b * 0.56, b * 1.0, hex('#0d0f12'));
  return encodePng(size, size, buf);
}

fs.mkdirSync(OUT, { recursive: true });
const files = [
  ['icon-192.png', draw(192, 0.11, true)],
  ['icon-512.png', draw(512, 0.11, true)],
  ['icon-maskable-512.png', draw(512, 0.22, false)],   // セーフゾーンを確保、角丸なし
  ['apple-touch-icon.png', draw(180, 0.11, false)]     // iOS は自前で角丸にする
];
for (const [name, buf] of files) {
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`${name}  ${(buf.length / 1024).toFixed(1)} KB`);
}
