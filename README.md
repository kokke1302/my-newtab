# My New Tab

ブラウザの新規タブを自分専用のポータルページに置き換えるための、静的Webページです。

## 機能

- デジタル時計: 現在時刻をリアルタイム表示（24時間表記）
- 検索バー: Google検索（設定で変更可能）、Enterキーで遷移、✕ボタンでクリア
- ショートカット管理: サイトをタイル表示、追加・削除をブラウザ内に永続保存
- ファビコン自動取得: 登録URLからアイコンを自動表示、取得失敗時はイニシャルで代替

## 使い方

### GitHub Pagesで公開する場合

1. このリポジトリを `Fork` または `Clone`
2. GitHub Pages を有効化（Settings → Pages → Branch: `main` / Root）
3. 発行されたURLを、ブラウザの新規タブ拡張機能（例: Firefox の場合 [New Tab Override](https://addons.mozilla.org/ja/firefox/addon/new-tab-override/)）に設定

### ローカルで使う場合

`index.html`, `style.css`, `script.js` を同一ディレクトリに配置し、
`index.html` をブラウザで直接開くか、任意のローカルサーバーで配信してください。

## 検索エンジンの変更

`script.js` 冒頭の `SEARCH_ENGINE` オブジェクトを編集するだけで切り替えられます。

```js
const SEARCH_ENGINE = {
  action:      "https://www.google.com/search", // 検索エンジンのURL
  param:       "q",                             // クエリパラメータ名
  placeholder: "Google で検索...",              // 検索バーのプレースホルダー
};
```

**Bingに切り替える例:**

```js
const SEARCH_ENGINE = {
  action:      "https://www.bing.com/search",
  param:       "q",
  placeholder: "Bing で検索...",
};
```

## ファイル構成

```
.
├── default
│   ├── generated.html  # AIが生成した初期コード
│   └── prompt.md       # AIに指示を与えたプロンプト
├── index.html   # マークアップ
├── style.css    # スタイル
├── script.js    # ロジック（時計・検索・ショートカット管理）
└── README.md
```

外部依存はGoogle Fonts（CDN）のみ。フレームワーク・ビルドツール不要のバニラHTML/CSS/JSです。

## 技術スタック

- HTML5 / CSS3 / JavaScript（Vanilla JS、外部フレームワークなし）
- データ永続化: `localStorage`（クッキー不使用）
- ファビコン取得: [Google S2 Favicons API](https://www.google.com/s2/favicons)
- フォント: [Google Fonts](https://fonts.google.com/)（Space Mono / DM Sans）

## 開発の経緯と責任範囲

最初のたたき台（[`generated.html`](./default/generated.html)）は、[`prompt.md`](./default/prompt.md) をもとにAI（Claude Sonnet 4.6 アダプティブ）が生成しました。

その後、生成されたコードの全文を精読し、以下を自分で実施しています。

- `index.html` / `style.css` / `script.js` への分割とリファクタリング
- ロジックの不具合修正・改善（イベント登録の統一、入力バリデーション等）
- UIの追加実装（検索クリアボタン、ファビコンプレビュー等）

リポジトリを構成するファイルはすべて自分の手を通したものです。コードの品質・動作・不具合に対する責任は作者が負います。

## ライセンス

MIT