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

/* ─── Drag & Drop State ─── */
const DD = {
  dragging: null,
};

/* ─── UI Components ─── */
const UI = {
  createTile(sc, index, onDelete, onReorder) {
    // タイル大枠
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = sc.url;
    tile.title = sc.name;
    tile.draggable = true;
    tile.dataset.index = index;

    // ファビコン: アップロード済み画像 > Google Favicon API > イニシャル
    const img = document.createElement("img");
    img.src = sc.favicon || Utils.getFavicon(sc.url);
    img.alt = "";
    img.onerror = () => img.replaceWith(this.createFallback(sc.name));
    tile.appendChild(img);

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

    tile.append(nameSpan, delBtn);

    // ── Drag & Drop events ──
    tile.addEventListener("dragstart", (e) => {
      DD.dragging = index;
      tile.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    tile.addEventListener("dragend", () => {
      tile.classList.remove("dragging");
      document
        .querySelectorAll(".tile.drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
      DD.dragging = null;
    });

    tile.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (DD.dragging === null || DD.dragging === index) return;
      document
        .querySelectorAll(".tile.drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
      tile.classList.add("drag-over");
    });

    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      if (DD.dragging === null || DD.dragging === index) return;
      const list = Storage.load();
      const [moved] = list.splice(DD.dragging, 1);
      list.splice(index, 0, moved);
      Storage.save(list);
      onReorder();
    });

    return tile;
  },

  createFallback(name) {
    const div = document.createElement("div");
    div.className = "tile-fallback";
    div.textContent = (name || "?").trim().charAt(0).toUpperCase();
    return div;
  },
};

/* ─── Modal Controller ─── */
const Modal = {
  init() {
    this.dialog = document.getElementById("modal-overlay");
    this.urlInput = document.getElementById("modal-url");
    this.nameInput = document.getElementById("modal-name");
    this.previewContent = document.getElementById("favicon-preview-content");
    this.faviconFile = document.getElementById("favicon-file-input");
    this.uploadedFavicon = null;

    // URL入力 → ファビコン自動取得
    this.urlInput.addEventListener("input", () => {
      if (this.uploadedFavicon) return;
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

    // ファビコン画像アップロード
    this.faviconFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.uploadedFavicon = ev.target.result;
        this.previewContent.innerHTML = `<img src="${this.uploadedFavicon}" alt="">`;
      };
      reader.readAsDataURL(file);
    });

    // キャンセルボタン
    document.getElementById("modal-cancel").addEventListener("click", (e) => {
      e.preventDefault();
      this.close();
    });

    // 保存ボタン
    document.getElementById("modal-save").addEventListener("click", (e) => {
      e.preventDefault();
      this._save();
    });

    // Enterキー
    [this.urlInput, this.nameInput].forEach((input) => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this._save();
        }
      });
    });

    // 背景クリックで閉じる
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) this.close();
    });

    // close イベントでリセット
    this.dialog.addEventListener("close", () => this._reset());
  },

  open() {
    this._reset();
    this.dialog.showModal();
  },

  close() {
    this.dialog.close();
  },

  _save() {
    const url = this.urlInput.value.trim();
    const name = this.nameInput.value.trim();
    if (!url || !name) return;

    const list = Storage.load();
    list.push({
      url: Utils.formatUrl(url),
      name,
      favicon: this.uploadedFavicon || null,
    });
    Storage.save(list);

    App.render();
    this.close();
  },

  _reset() {
    this.urlInput.value = "";
    this.nameInput.value = "";
    this.previewContent.innerHTML = "";
    this.uploadedFavicon = null;
    if (this.faviconFile) this.faviconFile.value = "";
  },
};

/* ─── Main App Logic ─── */
const App = {
  init() {
    this.cacheDOM();
    this.bindEvents();
    Modal.init();
    this.render();
    this.startClock();
    this.search.focus();
  },

  // DOM 要素のキャッシュ
  cacheDOM() {
    this.clock = document.getElementById("clock");
    this.search = document.getElementById("search");
    this.searchForm = document.getElementById("search-form");
    this.searchClear = document.getElementById("search-clear");
    this.shortcuts = document.getElementById("shortcuts");
    this.addBtn = document.getElementById("add-btn");
  },

  // 検索関連のイベント設定
  bindEvents() {
    // 検索フォームのsubmitイベント
    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = this.search.value.trim();
      if (!q) return;
      window.location.href = `${SEARCH_ENGINE.action}?${SEARCH_ENGINE.param}=${encodeURIComponent(q)}`;
    });

    // 検索エンジンの読み込み
    this.search.placeholder = SEARCH_ENGINE.placeholder;

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

    this.addBtn.addEventListener("click", () => Modal.open());
  },

  // タイルの描画
  render() {
    // 既存のタイルを削除（追加タイルは除く）
    this.shortcuts.querySelectorAll(".tile").forEach((el) => el.remove());

    const list = Storage.load();
    list.forEach((sc, idx) => {
      const tile = UI.createTile(
        sc,
        idx,
        () => this.render(),
        () => this.render(),
      );
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
