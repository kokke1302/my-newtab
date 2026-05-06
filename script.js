/* ─── Constants ─── */
const STORAGE_KEY = "newtab_shortcuts_v1";
const FAVICON_API = "https://www.google.com/s2/favicons?domain=";
const SEARCH_ENGINE = {
  action: "https://www.google.com/search", // 検索エンジンのURL
  param: "q", // クエリパラメータ名
  placeholder: "Google で検索...", // 検索バーのプレースホルダー
};

/* ─── Data Management (LocalStorage) ─── */
const Storage = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },
  save(shortcuts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  },
};

/* ─── URL Utilities ─── */
const Utils = {
  getFavicon(url) {
    try {
      const origin = new URL(url).origin;
      return `${FAVICON_API}${encodeURIComponent(origin)}&sz=64`;
    } catch {
      return null;
    }
  },
  formatUrl(url) {
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    return target;
  },
};

/* ─── UI Components ─── */
const UI = {
  // ショートカットタイルの生成
  createTile(sc, index, onDelete) {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = sc.url;
    tile.title = sc.name;

    // ファビコン画像（失敗時はイニシャルにフォールバック）
    const favUrl = Utils.getFavicon(sc.url);
    const img = document.createElement("img");
    img.src = favUrl;
    img.alt = "";
    img.onerror = () => img.replaceWith(this.createFallback(sc.name));

    // タイル名
    const nameSpan = document.createElement("span");
    nameSpan.className = "tile-name";
    nameSpan.textContent = sc.name;

    // 削除ボタン
    const delBtn = document.createElement("button");
    delBtn.className = "tile-del";
    delBtn.innerHTML = "✕";
    delBtn.title = "削除";
    delBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const list = Storage.load();
      list.splice(index, 1);
      Storage.save(list);
      onDelete();
    });

    tile.append(img, nameSpan, delBtn);
    return tile;
  },

  createFallback(name) {
    const div = document.createElement("div");
    div.className = "tile-fallback";
    div.textContent = (name || "?").trim().charAt(0).toUpperCase();
    return div;
  },
};

/* ─── Main App Logic ─── */
const App = {
  init() {
    this.cacheDOM();
    this.applySearchEngine();
    this.bindEvents();
    this.render();
    this.startClock();
  },

  // DOM 要素のキャッシュ
  cacheDOM() {
    this.clock = document.getElementById("clock");
    this.search = document.getElementById("search");
    this.searchForm = document.getElementById("search-form");
    this.searchClear = document.getElementById("search-clear");
    this.shortcuts = document.getElementById("shortcuts");
    this.addBtn = document.getElementById("add-btn");

    // モーダル関連
    this.dialog = document.getElementById("modal-overlay");
    this.modalForm = document.getElementById("modal");
    this.urlInput = document.getElementById("modal-url");
    this.nameInput = document.getElementById("modal-name");
    this.previewContent = document.getElementById("favicon-preview-content");
  },

  // 検索エンジンの設定
  applySearchEngine() {
    this.searchForm.action = SEARCH_ENGINE.action;
    this.search.name = SEARCH_ENGINE.param;
    this.search.placeholder = SEARCH_ENGINE.placeholder;
  },

  // イベントの設定
  bindEvents() {
    // 検索バーにフォーカス
    window.addEventListener("load", () => this.search.focus());

    // 検索クリアボタン: 入力中
    this.search.addEventListener("input", () => {
      this.searchClear.hidden = this.search.value === "";
    });

    // 検索クリアボタン: クリック時
    this.searchClear.addEventListener("click", () => {
      this.search.value = "";
      this.searchClear.hidden = true;
      this.search.focus();
    });

    // モーダルを開く
    this.addBtn.addEventListener("click", () => this.dialog.showModal());

    // モーダルを閉じる
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) this.dialog.close();
    });

    // URL入力時、ファビコンをプレビュー
    this.urlInput.addEventListener("input", () => {
      const raw = this.urlInput.value.trim();
      if (!raw) {
        this.previewContent.innerHTML = "";
        return;
      }
      const favUrl = Utils.getFavicon(Utils.formatUrl(raw));
      this.previewContent.innerHTML = favUrl
        ? `<img src="${favUrl}" alt="">`
        : "";
    });

    // フォーム送信（追加 or キャンセル）
    this.modalForm.addEventListener("submit", (e) => {
      // キャンセルボタン or Esc: リセットのみ（ダイアログは method="dialog" で自動クローズ）
      if (e.submitter?.value === "cancel") {
        this.modalForm.reset();
        this.previewContent.innerHTML = "";
        return;
      }

      e.preventDefault();

      const newShortcut = {
        url: Utils.formatUrl(this.urlInput.value),
        name: this.nameInput.value.trim(),
      };

      const list = Storage.load();
      list.push(newShortcut);
      Storage.save(list);

      this.render();
      this.dialog.close();
      this.modalForm.reset();
      this.previewContent.innerHTML = "";
    });
  },

  // タイルの描画
  render() {
    // 既存のタイルを削除（追加タイルは除く）
    this.shortcuts.querySelectorAll(".tile").forEach((el) => el.remove());

    const list = Storage.load();
    list.forEach((sc, idx) => {
      const tile = UI.createTile(sc, idx, () => this.render());
      this.shortcuts.insertBefore(tile, this.addBtn);
    });
  },

  // 時計の更新
  startClock() {
    const update = () => {
      const now = new Date();
      this.clock.textContent = now.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };
    update();
    setInterval(update, 1000);
  },
};

/* ─── Init ─── */
document.addEventListener("DOMContentLoaded", () => App.init());
