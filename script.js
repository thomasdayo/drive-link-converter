const inputUrls = document.getElementById("inputUrls");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const results = document.getElementById("results");
const summaryText = document.getElementById("summaryText");

let currentConvertedItems = [];

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

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function updateSummary(items) {
  if (items.length === 0) {
    summaryText.textContent = "まだ変換していません。";
    return;
  }

  const successCount = items.filter((item) => !item.error).length;
  const errorCount = items.filter((item) => item.error).length;

  summaryText.textContent = `入力 ${items.length} 件 / 成功 ${successCount} 件 / 失敗 ${errorCount} 件`;
}

function renderResults(items) {
  updateSummary(items);

  if (items.length === 0) {
    results.innerHTML = `
      <div class="empty-state">
        ここに変換結果が表示されます。
      </div>
    `;
    return;
  }

  results.innerHTML = items
    .map((item, index) => {
      if (item.error) {
        return `
          <article class="result-card error">
            <div class="result-body">
              <div class="meta">Input</div>
              <div class="original-url">${escapeHtml(item.original)}</div>
              <div class="result-separator"></div>
              <div class="error-text">このリンクからファイルIDを取得できませんでした。</div>
            </div>
          </article>
        `;
      }

      return `
        <article class="result-card success">
          <div class="result-body">
            <div class="meta">Input</div>
            <div class="original-url">${escapeHtml(item.original)}</div>

            <div class="result-separator"></div>

            <div class="meta">Converted URL</div>
            <div class="converted-url">
              <a href="${item.converted}" target="_blank" rel="noopener noreferrer">
                ${item.converted}
              </a>
            </div>

            <div class="result-actions">
              <button class="btn btn-secondary copy-one-btn" data-copy-index="${index}" type="button">
                このURLをコピー
              </button>
              <a
                class="btn btn-primary link-btn"
                href="${item.converted}"
                target="_blank"
                rel="noopener noreferrer"
              >
                開く
              </a>
            </div>

            <div class="copy-status" id="copy-status-${index}"></div>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".copy-one-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const index = Number(event.currentTarget.dataset.copyIndex);
      const item = items[index];
      const status = document.getElementById(`copy-status-${index}`);

      try {
        await copyText(item.converted);
        status.textContent = "コピーしました。";
      } catch (error) {
        status.textContent = "コピーに失敗しました。";
      }
    });
  });
}

function convertUrls() {
  const lines = inputUrls.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  currentConvertedItems = lines.map((url) => {
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

  renderResults(currentConvertedItems);
}

convertBtn.addEventListener("click", convertUrls);

clearBtn.addEventListener("click", () => {
  inputUrls.value = "";
  currentConvertedItems = [];
  renderResults([]);
});

copyAllBtn.addEventListener("click", async () => {
  const validItems = currentConvertedItems.filter((item) => !item.error);

  if (validItems.length === 0) {
    alert("コピーできる変換結果がありません。");
    return;
  }

  const text = validItems.map((item) => item.converted).join("\n");

  try {
    await copyText(text);
    alert("変換後URLをすべてコピーしました。");
  } catch (error) {
    alert("コピーに失敗しました。");
  }
});

renderResults([]);