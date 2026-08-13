# サードパーティ ライセンス表記

このアプリ本体（`index.html`, `sw.js`, `server.js`, `tools/`）は外部ライブラリに依存していません。
顔の自動検出機能を有効にした場合のみ、以下を `vendor/` に取り込みます。
取得は `node tools/fetch-pico.js` で行い、リポジトリには含めない運用も可能です。

---

## pico.js

- 取得元: https://github.com/tehnokv/picojs (`pico.js`)
- 配置先: `vendor/pico.js`

## facefinder（学習済みカスケード）

- 取得元: https://github.com/nenadmarkus/pico (`rnt/cascades/facefinder`)
- コミット: `c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9`（公式サンプルと同じ固定参照）
- 配置先: `vendor/facefinder`、および base64 を埋め込んだ `vendor/pico-cascade.js`

## 検証用画像

- 取得元: https://github.com/tehnokv/picojs (`examples/img.jpg`)
- 配置先: `tools/testdata/faces.jpg`
- 顔検出の動作確認にのみ使用し、アプリの配布物には含めません。

---

## ライセンス本文

上記はいずれも MIT ライセンスで提供されています。

```
The MIT License

Copyright (c) 2013 Nenad Markus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

再配布する場合は、この著作権表示とライセンス本文を同梱してください。
