function parseLinks(input) {
  return input
    .split(/[\s,\n]+/)
    .map(link => link.trim())
    .filter(link => /^https?:\/\/\S+$/i.test(link));
}

let links = [];
let isDownloading = false;

function setDownloadingState(downloading) {
  isDownloading = downloading;
  document.getElementById('confirmBtn').disabled = downloading;
  document.getElementById('parseBtn').disabled = downloading;
  document.getElementById('linksInput').disabled = downloading;
}

function renderLinksTable() {
  const gridSection = document.getElementById('linksSection');
  const gridBody = document.querySelector('#linksGrid tbody');
  gridBody.innerHTML = '';
  if (links.length > 0) {
    links.forEach((link, idx) => {
      const row = document.createElement('tr');
      // Get file extension
      const extMatch = link.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
      const ext = extMatch ? extMatch[1].toLowerCase() : '';
      // Use SVG icon for file type
      let icon = '';
      const iconSize = 22;
      switch (ext) {
        case 'pdf':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="2" width="20" height="20" rx="4" fill="#e3342f"/><text x="12" y="15" text-anchor="middle" font-size="10" font-family="Arial, sans-serif" fill="#fff" font-weight="bold" dominant-baseline="middle">PDF</text></svg>`;
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="4" width="20" height="16" rx="4" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/><circle cx="9" cy="12" r="2" fill="#fff" stroke="#b45309" stroke-width="1"/><rect x="13" y="12" width="5" height="5" fill="#6ee7b7" stroke="#047857" stroke-width="1"/></svg>`;
          break;
        case 'zip':
        case 'rar':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="3" width="20" height="5" rx="2.5" fill="#6366f1"/><rect x="2" y="8" width="20" height="13" rx="3" fill="#a5b4fc"/><rect x="10" y="13" width="4" height="2" fill="#6366f1"/></svg>`;
          break;
        case 'doc':
        case 'docx':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="2" width="20" height="20" rx="4" fill="#2563eb"/><text x="12" y="15" text-anchor="middle" font-size="10" font-family="Arial, sans-serif" fill="#fff" font-weight="bold" dominant-baseline="middle">DOC</text></svg>`;
          break;
        case 'xls':
        case 'xlsx':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="2" width="20" height="20" rx="4" fill="#059669"/><text x="12" y="15" text-anchor="middle" font-size="10" font-family="Arial, sans-serif" fill="#fff" font-weight="bold" dominant-baseline="middle">XLS</text></svg>`;
          break;
        case 'mp3':
        case 'wav':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><circle cx="7" cy="17" r="3" fill="#f59e42"/><circle cx="17" cy="17" r="3" fill="#f59e42"/><rect x="10" y="7" width="4" height="10" fill="#fbbf24"/></svg>`;
          break;
        case 'mp4':
        case 'avi':
        case 'mov':
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="7" width="20" height="10" rx="3" fill="#0ea5e9"/><polygon points="10,10 16,13 10,16" fill="#fff"/></svg>`;
          break;
        default:
          icon = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}"><rect x="2" y="2" width="20" height="20" rx="4" fill="#6b7280"/><text x="12" y="15" text-anchor="middle" font-size="10" font-family="Arial, sans-serif" fill="#fff" font-weight="bold" dominant-baseline="middle">FILE</text></svg>`;
      }
      row.innerHTML = `<td>${icon}</td><td>${idx + 1}</td><td>${link}</td><td><button class='btn btn-danger btn-sm remove-link' data-idx='${idx}' title='Remove' style='padding:0 6px;font-size:13px;line-height:1;min-width:unset;height:22px;width:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;'><span style='font-size:15px;line-height:1;'>✕</span></button></td>`;
      gridBody.appendChild(row);
    });
    gridSection.style.display = '';
  } else {
    gridSection.style.display = 'none';
  }
  // Attach remove event listeners after rendering
  gridBody.querySelectorAll('.remove-link').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const idx = parseInt(this.getAttribute('data-idx'));
      links.splice(idx, 1);
      renderLinksTable();
    });
  });
}

document.getElementById('parseBtn').addEventListener('click', () => {
  if (isDownloading) return;
  const input = document.getElementById('linksInput').value;
  links = parseLinks(input).slice(0, 100);
  renderLinksTable();
});

document.getElementById('confirmBtn').addEventListener('click', async () => {
  if (isDownloading) return;
  setDownloadingState(true);
  const statusDiv = document.getElementById('status');
  for (let i = 0; i < links.length; i++) {
    const url = links[i];
    statusDiv.textContent = `Downloading (${i+1}/${links.length}): ${url}`;
    try {
      // Always use browser's default download method
      await chrome.downloads.download({ url });
    } catch (e) {
      statusDiv.textContent = `Failed to download: ${url}`;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  statusDiv.textContent = 'All downloads finished!';
  setDownloadingState(false);
});
