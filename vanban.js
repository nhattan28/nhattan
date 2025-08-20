const folderIds = [
        "1XDTi79waBP9Rga8xzk9WVmOsINXIiWDE",
  ];
  const apiKey = "AIzaSyCu6BDhyYqOj0AVa2M5rr1dqBKJ_9nSQS4";

  function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  async function fetchAllFiles(folderId) {
    let files = [];
    let pageToken = null;

    do {
      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      files = files.concat(data.files || []);
      pageToken = data.nextPageToken;
    } while (pageToken);

    return files;
  }

  async function loadFiles() {
    let allFiles = [];
    for (const folderId of folderIds) {
      const files = await fetchAllFiles(folderId);
      allFiles = allFiles.concat(files);
    }
    displayFiles(allFiles);
  }

  function displayFiles(files) {
    const list = document.getElementById("fileList");
    const fileCount = document.getElementById("fileCount");
    list.innerHTML = "";

    const keywordRaw = document.getElementById("searchInput").value;
    const keyword = normalizeText(keywordRaw);

    const filteredFiles = files.filter(file => {
      const fileName = normalizeText(file.name);
      return fileName.includes(keyword);
    });

    fileCount.textContent = `${filteredFiles.length} tệp`;

    filteredFiles.forEach(file => {
      const viewerUrl = `https://drive.google.com/file/d/${file.id}/preview`;
      const card = document.createElement("div");
      card.className = "file-card";
      card.innerHTML = `<h3>${file.name}</h3><button onclick="openViewer('${viewerUrl}')">👁️ Xem</button>`;
      list.appendChild(card);
    });
  }

  document.getElementById("searchInput").addEventListener("input", loadFiles);

  function openViewer(url) {
    document.getElementById("viewerFrame").src = url;
    document.getElementById("viewerOverlay").classList.remove("hidden");
  }

  document.getElementById("closeViewer").onclick = () => {
    document.getElementById("viewerFrame").src = "";
    document.getElementById("viewerOverlay").classList.add("hidden");
  };

  document.getElementById("pageSelect").addEventListener("change", function () {
    const selected = this.value;
    if (selected) window.location.href = selected;
  });

  const currentPage = window.location.pathname.split("/").pop() || "tailieu.html";
  document.getElementById("pageSelect").value = currentPage;

  window.onload = loadFiles;