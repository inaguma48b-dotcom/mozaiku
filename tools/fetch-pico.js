// 顔検出ライブラリ pico.js と学習済みカスケードを vendor/ へ取り込む。
// 使い方: node tools/fetch-pico.js
//
// pico.js        : https://github.com/tehnokv/picojs        (MIT / Nenad Markus)
// facefinder     : https://github.com/nenadmarkus/pico      (MIT / Nenad Markus)
//
// カスケードはバイナリなので、file:// で開いたときに fetch() が CORS で失敗する。
// そのため base64 を埋め込んだ JS も生成し、単体のHTMLからでも読めるようにする。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VENDOR = path.join(ROOT, 'vendor');
const TESTDATA = path.join(__dirname, 'testdata');

// カスケードは公式サンプルと同じコミットに固定して再現性を確保する
const CASCADE_COMMIT = 'c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9';
const SRC = {
  pico:   'https://raw.githubusercontent.com/tehnokv/picojs/master/pico.js',
  cascade:`https://raw.githubusercontent.com/nenadmarkus/pico/${CASCADE_COMMIT}/rnt/cascades/facefinder`,
  sample: 'https://raw.githubusercontent.com/tehnokv/picojs/master/examples/img.jpg'
};

async function get(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  fs.mkdirSync(VENDOR, {recursive:true});
  fs.mkdirSync(TESTDATA, {recursive:true});

  const pico = await get(SRC.pico);
  fs.writeFileSync(path.join(VENDOR, 'pico.js'), pico);
  console.log(`vendor/pico.js            ${pico.length} bytes`);

  const cascade = await get(SRC.cascade);
  fs.writeFileSync(path.join(VENDOR, 'facefinder'), cascade);
  console.log(`vendor/facefinder         ${cascade.length} bytes`);

  const js =
`/* 顔検出カスケード（MIT / Copyright (c) 2013 Nenad Markus）
   出典: https://github.com/nenadmarkus/pico  rnt/cascades/facefinder
   コミット ${CASCADE_COMMIT}
   file:// でも読めるよう base64 で埋め込んでいる。tools/fetch-pico.js が生成。 */
window.PICO_CASCADE_B64 = "${cascade.toString('base64')}";
`;
  fs.writeFileSync(path.join(VENDOR, 'pico-cascade.js'), js);
  console.log(`vendor/pico-cascade.js    ${js.length} bytes`);

  // 検出精度の確認に使う顔写真（アプリ本体には含めない）
  const sample = await get(SRC.sample);
  fs.writeFileSync(path.join(TESTDATA, 'faces.jpg'), sample);
  console.log(`tools/testdata/faces.jpg  ${sample.length} bytes`);
})().catch(e => { console.error('失敗:', e.message); process.exit(1); });
