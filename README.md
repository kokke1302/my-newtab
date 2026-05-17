# My New Tab

ブラウザの新規タブを自分専用のポータルページに置き換えるための、静的Webページです。

## 機能

- デジタル時計: 現在時刻をリアルタイム表示（24時間表記）
- 検索バー: Google検索（設定で変更可能）、Enterキーで遷移、✕ボタンでクリア
- ショートカット管理: サイトをタイル表示、追加・削除・ドラッグ＆ドロップによる並び替えをブラウザ内に保存
- ファビコン自動取得: 登録URLからアイコンを自動表示、取得失敗時はイニシャルで代替
- ファビコン手動設定: 任意の画像ファイルをアップロードしてアイコンに使用可能
- カラーモード切り替え: ダークモード / ライトモード / システム設定に従う
- 背景カスタマイズ: SVGファイルをアップロードして背景画像に適用（デフォルトに戻すことも可能）

## 使い方

### GitHub Pagesで公開する場合

1. このリポジトリを `Fork` または `Clone`
2. GitHub Pages を有効化（Settings → Pages → Branch: `main` / Root）
3. 発行されたURLを、ブラウザの新規タブ拡張機能（例: Firefox の場合 [New Tab Override](https://addons.mozilla.org/ja/firefox/addon/new-tab-override/)）に設定

### ローカルで使う場合

`index.html`, `style.css`, `script.js`, `theme-D.svg` または `theme-L.svg` を同一ディレクトリに配置し、
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

## 設定モーダル

画面右下の歯車アイコンから開く設定モーダルで以下を変更できます。

### カラーモード

| 選択肢   | 動作                                   |
| -------- | -------------------------------------- |
| ダーク   | 常にダークテーマ（デフォルト）         |
| ライト   | 常にライトテーマ                       |
| システム | OSの `prefers-color-scheme` に自動追従 |

選択はページを閉じても `localStorage` に保存されます。

### 背景のカスタマイズ

SVGファイルをアップロードすると背景画像として適用されます。
「背景をリセット」ボタンでデフォルトのグラデーション背景に戻せます。

```
対応形式: .svg / .SVG
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
├── LICENSE      # ライセンス
├── theme-D.svg  # 初期背景（ライト）
├── theme-L.svg  # 初期背景（ダーク）
└── README.md
```

外部依存はGoogle Fonts（CDN）のみ。フレームワーク・ビルドツール不要のバニラHTML/CSS/JSです。

## 技術スタック

- HTML5 / CSS3 / JavaScript（Vanilla JS、外部フレームワークなし）
- データ永続化: `localStorage`（クッキー不使用）
- ファビコン取得: [Google S2 Favicons API](https://www.google.com/s2/favicons)
- フォント: [Google Fonts](https://fonts.google.com/)（Space Mono / DM Sans）

## 責任範囲

最初のたたき台（[`generated.html`](./default/generated.html)）は、[`prompt.md`](./default/prompt.md) をもとにAI（Claude Sonnet 4.6 アダプティブ）が生成しました。

その後、生成されたコードの全文を精読し、以下を自分で実施しています。

- 変数・関数・ID名のリネーム
- `index.html` / `style.css` / `script.js` への分割とリファクタリング
- ロジックの不具合修正・改善（イベント登録の統一、入力バリデーション等）
- UIの追加実装（検索クリアボタン、ファビコンプレビュー・手動アップロード、ドラッグ＆ドロップ並び替え等）
- 設定モーダルの追加（ダーク/ライト/システムのカラーモード切り替え、SVG背景カスタマイズ）

リポジトリを構成するファイルは全て制作者が目を通したものです。
コードの品質・動作・不具合に対する責任は制作者が負います。

## ライセンス

MIT [LICENSE](./LICENSE)