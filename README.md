# すむら酒店 ホームページ（Next.js版）

HTML版のレイアウト・機能をそのまま Next.js（App Router / TypeScript）へ移したものです。
見た目・文言・挙動は一切変えていません。

## 構成

```
app/            ページ（URLはHTML版と同じ。/home → home.html も従来どおり開けます）
components/     共通部品（外枠・時間旅行・言語バー・ストア・非公開ページ など）
lib/            翻訳辞書・時代の定義・Apps Script連携・商品データの読み書き
public/         画像・GIF・商品データ・基本CSS・時代別CSS
```

## 4つの時代

`html[data-era]` を切り替えることで 1990年代 / 2000年代 / 2010年代 / 2020年代 の
レイアウトが入れ替わります。CSSは `public/eras.css`、切替は `components/TimeTravel.tsx`。

## 5つの言語

`lib/i18n.ts` に日本語・英語・フランス語・中国語・韓国語の全文が入っています。
キー名はHTML版の `data-i18n` と同じです。

## バックエンド

お問い合わせ・メルマガ登録・コメント・来客カウンターは Google Apps Script のままです。
URLは `lib/api.ts` の1箇所だけ書き換えれば全部に効きます。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 静的書き出し（out/）
```

GitHub Pages 用の本番ビルドは `BASE_PATH=/sumura-sake npm run build` です。
