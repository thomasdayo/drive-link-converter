const inputUrls = document.getElementById("inputUrls");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const results = document.getElementById("results");

function extractFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/uc\?export=download&id=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

function buildDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function copyText(text, statusElement) {
  try {
    await navigator.clipboard.writeText(text);
    statusElement.textContent = "コピーしました";
  } catch (error) {
    statusElement.textContent = "コピーに失敗しました";
  }
}

function renderResults(items) {
  if (items.length === 0) {
    results.innerHTML = `<div class="empty">まだ変換結果はありません。</div>`;
    return;
  }

  results.innerHTML = items
    .map((item, index) => {
      if (item.error) {
        return `
          <div class="result-card error">
            <div class="result-label">入力元</div>
            <div class="original-url">${escapeHtml(item.original)}</div>
            <div class="error-text">変換できませんでした</div>
          </div>
        `;
      }

      return `
        <div class="result-card success">
          <div class="result-label">入力元</div>
          <div class="original-url">${escapeHtml(item.original)}</div>

          <div class="result-label">変換後URL</div>
          <div class="result-url">
            <a href="${item.converted}" target="_blank" rel="noopener noreferrer">
              ${item.converted}
            </a>
          </div>

          <div class="card-actions">
            <button class="small-btn secondary" data-copy-index="${index}">
              このURLをコピー
            </button>
            <a href="${item.converted}" target="_blank" rel="noopener noreferrer">
              <button class="small-btn">開く</button>
            </a>
          </div>

          <div class="copy-status" id="copy-status-${index}"></div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll("[data-copy-index]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const idx = event.currentTarget.getAttribute("data-copy-index");
      const item = items[idx];
      const statusElement = document.getElementById(`copy-status-${idx}`);
      await copyText(item.converted, statusElement);
    });
  });
}

function convertUrls() {
  const lines = inputUrls.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const convertedItems = lines.map((url) => {
    const fileId = extractFileId(url);

    if (!fileId) {
      return {
        original: url,
        error: true
      };
    }

    return {
      original: url,
      converted: buildDownloadUrl(fileId),
      error: false
    };
  });

  renderResults(convertedItems);
  window.currentConvertedItems = convertedItems;
}

convertBtn.addEventListener("click", convertUrls);

clearBtn.addEventListener("click", () => {
  inputUrls.value = "";
  window.currentConvertedItems = [];
  renderResults([]);
});

copyAllBtn.addEventListener("click", async () => {
  const items = (window.currentConvertedItems || []).filter((item) => !item.error);

  if (items.length === 0) {
    alert("コピーできる変換結果がありません。");
    return;
  }

  const text = items.map((item) => item.converted).join("\n");

  try {
    await navigator.clipboard.writeText(text);
    alert("変換後URLを全てコピーしました。");
  } catch (error) {
    alert("コピーに失敗しました。");
  }
});

renderResults([]);