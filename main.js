const API_KEY = "AIzaSyCu6BDhyYqOj0AVa2M5rr1dqBKJ_9nSQS4";
const CACHE_DURATION = 1 * 24 * 3600 * 1000; // Thời gian cache: khoảng 1 ngày

const pageFolders = {
    "tailieu.html": [
        "1xGWHzz4qOlZNe5AQxS9HDZBqw7afv-qW",
        "1qe2Fk8vImJknxpz1GIA9v8rpVFv6z-Wk",
        "1p913hDh98xc2YakoYZfmXBbxHjUDYAm2",
        "1XDTi79waBP9Rga8xzk9WVmOsINXIiWDE",
        "1FIvSs2AcmbcBKNblwFTG6SwEZMOaRGcs",
        "1Y4syXYDA_bkvByBe0djHBUd_EIqti-pI",
    ],
    "hoc.html": [
        "1qe2Fk8vImJknxpz1GIA9v8rpVFv6z-Wk", 
        "1p913hDh98xc2YakoYZfmXBbxHjUDYAm2",
    ],
    "vanban.html": [
        "1XDTi79waBP9Rga8xzk9WVmOsINXIiWDE",
    ],
    "chiase.html": [
        "1xGWHzz4qOlZNe5AQxS9HDZBqw7afv-qW",
    ],
    "upfile.html": [
        "1FIvSs2AcmbcBKNblwFTG6SwEZMOaRGcs",
    ],
    "code.html": [
        "1Y4syXYDA_bkvByBe0djHBUd_EIqti-pI",
    ],
};

function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function fetchAllFiles(folderId) {
    let files = [];
    let pageToken = null;
    do {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Google Drive API responded with status ${res.status}`);
        }
        const data = await res.json();
        files = files.concat(data.files || []);
        pageToken = data.nextPageToken;
    } while (pageToken);
    return files;
}

async function loadFiles(currentPage) {
    const folderIds = pageFolders[currentPage] || [];
    const CACHE_KEY = `cached_drive_files_${currentPage}`;
    const list = document.getElementById("fileList");
    const fileCount = document.getElementById("fileCount");
    list.innerHTML = `<div style="text-align: center; color: #0f0;">Đang tải dữ liệu...</div>`;
    fileCount.textContent = ``;

    const cachedData = localStorage.getItem(CACHE_KEY);
    let cachedFiles = [];
    if (cachedData) {
        const { timestamp, files } = JSON.parse(cachedData);
        cachedFiles = files;
        if (new Date().getTime() - timestamp < CACHE_DURATION) {
            console.log(`Sử dụng dữ liệu từ cache cho trang ${currentPage}.`);
            displayFiles(cachedFiles);
            return;
        }
    }
    
    console.log(`Kiểm tra dữ liệu mới từ Google Drive cho trang ${currentPage}.`);
    let allFiles = [];
    try {
        for (const folderId of folderIds) {
            const files = await fetchAllFiles(folderId);
            allFiles = allFiles.concat(files);
        }

        const cachedFileIds = new Set(cachedFiles.map(file => file.id));
        const newFiles = allFiles.filter(file => !cachedFileIds.has(file.id));

        if (newFiles.length === 0) {
            console.log("Không có tệp mới, hiển thị dữ liệu từ cache.");
            displayFiles(cachedFiles);
        } else {
            console.log(`Tìm thấy ${newFiles.length} tệp mới, cập nhật cache.`);
            const dataToCache = {
                timestamp: new Date().getTime(),
                files: allFiles
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
            displayFiles(allFiles);
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        list.innerHTML = `<div style="text-align: center; color: red;">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>`;
        fileCount.textContent = ``;
    }
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
    if (filteredFiles.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: #333;">Không tìm thấy tệp nào.</div>`;
    }
    filteredFiles.forEach(file => {
        const viewerUrl = `https://drive.google.com/file/d/${file.id}/preview`;
        const card = document.createElement("div");
        card.className = "file-card";
        card.innerHTML = `<h3>${file.name}</h3><button onclick="openViewer('${viewerUrl}')">👁️ Xem</button>`;
        list.appendChild(card);
    });
}

function openViewer(url) {
    document.getElementById("viewerFrame").src = url;
    document.getElementById("viewerOverlay").classList.remove("hidden");
}

function clearCacheAndReload() {
    for (const pageName in pageFolders) {
        localStorage.removeItem(`cached_drive_files_${pageName}`);
    }
    alert("Đã xóa lịch sử tìm kiếm. Trang sẽ được tải lại.");
    window.location.reload();
}

// Xử lý sự kiện chung
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split("/").pop() || "tailieu.html";
    
    const pageSelect = document.getElementById("pageSelect");
    if (pageSelect) {
        pageSelect.value = currentPage;
        pageSelect.addEventListener("change", function () {
            const selected = this.value;
            if (selected) window.location.href = selected;
        });
    }

    const clearCacheBtn = document.getElementById("clearCacheBtn");
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener("click", clearCacheAndReload);
    }
    
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = '';
        searchInput.addEventListener("input", () => {
            const CACHE_KEY = `cached_drive_files_${currentPage}`;
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const { files } = JSON.parse(cachedData);
                displayFiles(files);
            }
        });
    }

    const closeViewerBtn = document.getElementById("closeViewer");
    if (closeViewerBtn) {
        closeViewerBtn.onclick = () => {
            document.getElementById("viewerFrame").src = "";
            document.getElementById("viewerOverlay").classList.add("hidden");
        };
    }
    loadFiles(currentPage);
});