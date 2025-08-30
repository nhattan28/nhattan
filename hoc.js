const folderIds = [
    "1qe2Fk8vImJknxpz1GIA9v8rpVFv6z-Wk",
    "1p913hDh98xc2YakoYZfmXBbxHjUDYAm2",
];
const apiKey = "AIzaSyCu6BDhyYqOj0AVa2M5rr1dqBKJ_9nSQS4";
// Tạo khóa cache duy nhất cho mỗi trang dựa trên tên tệp
const currentPage = window.location.pathname.split("/").pop() || "tailieu.html";
const CACHE_KEY = `cached_drive_files_${currentPage}`;
const CACHE_DURATION = 4 * 30 * 24 * 3600 * 1000; // Thời gian cache: khoảng 4 tháng

function normalizeText(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

async function fetchAllFiles(folderId) {
    let files = [];
    let pageToken = null;

    do {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;
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

async function loadFiles() {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const list = document.getElementById("fileList");
    const fileCount = document.getElementById("fileCount");
    list.innerHTML = `<div style="text-align: center; color: #0f0;">Đang tải dữ liệu...</div>`;
    fileCount.textContent = ``;

    if (cachedData) {
        const { timestamp, files } = JSON.parse(cachedData);
        const currentTime = new Date().getTime();
        if (currentTime - timestamp < CACHE_DURATION) {
            console.log("Sử dụng dữ liệu từ cache.");
            displayFiles(files);
            return;
        } else {
            console.log("Dữ liệu cache đã hết hạn, tải lại.");
        }
    }
    
    console.log("Tải dữ liệu mới từ Google Drive.");
    let allFiles = [];
    try {
        for (const folderId of folderIds) {
            const files = await fetchAllFiles(folderId);
            allFiles = allFiles.concat(files);
        }
        const dataToCache = {
            timestamp: new Date().getTime(),
            files: allFiles
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
        displayFiles(allFiles);
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

document.getElementById("searchInput").addEventListener("input", () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { files } = JSON.parse(cachedData);
        displayFiles(files);
    }
});

document.getElementById("closeViewer").onclick = () => {
    document.getElementById("viewerFrame").src = "";
    document.getElementById("viewerOverlay").classList.add("hidden");
};

document.getElementById("pageSelect").addEventListener("change", function () {
    const selected = this.value;
    if (selected) window.location.href = selected;
});

const currentPageElement = document.getElementById("pageSelect");
if (currentPageElement) {
    currentPageElement.value = currentPage;
}

window.addEventListener('load', async () => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = '';
    }
    loadFiles();
});
