/**
 * Validates input length and shows/hides error message
 */
function validateInput() {
  const lyricsInput = document.getElementById("lyricsInput");
  const inputError = document.getElementById("inputError");
  if (lyricsInput.value.length < 3) {
    inputError.classList.remove("hidden");
  } else {
    inputError.classList.add("hidden");
  }
}

/**
 * Searches YouTube for videos based on lyrics input
 */
async function searchYouTube() {
  const lyrics = document.getElementById("lyricsInput").value.trim();
  const resultDiv = document.getElementById("result");

  // Input validation
  if (!lyrics || lyrics.length < 3) {
    resultDiv.innerHTML = `<p class="text-red-500 font-semibold">❗ Vui lòng nhập ít nhất 3 ký tự.</p>`;
    return;
  }

  // Show loading spinner
  resultDiv.innerHTML = `<div class="loader"></div><p class="text-sm text-gray-500 mt-2">⏳ Đang tìm kiếm trên YouTube...</p>`;

  // Check cache
  const cacheKey = `lyrics:${lyrics}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    showResult(data);
    return;
  }

  // YouTube API call
  const apiKey = "AIzaSyDUaEAdkfCAJQu1iUQQyd16uAYYWfjTX_8"; // Replace with your API key
  const query = encodeURIComponent(lyrics);
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}&type=video&maxResults=1`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultDiv.innerHTML = `<p class="text-red-500 font-semibold">❌ Không tìm thấy video nào.</p>`;
      return;
    }

    const video = data.items[0];
    const resultData = {
      videoId: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high.url
    };

    // Save to cache
    localStorage.setItem(cacheKey, JSON.stringify(resultData));

    showResult(resultData);
  } catch (err) {
    console.error("Error fetching YouTube data:", err);
    resultDiv.innerHTML = `<p class="text-red-500 font-semibold">❗ Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.</p>`;
  }
}

/**
 * Displays search result with video thumbnail, title, and link
 * @param {Object} data - Contains videoId, title, and thumbnail
 */
function showResult({ videoId, title, thumbnail }) {
  const link = `https://www.youtube.com/watch?v=${videoId}`;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <div class="mt-4 animate-fade-in">
      <img src="${thumbnail}" alt="Video thumbnail for ${title}" class="rounded-xl w-full mb-2 shadow-md" />
      <p class="text-lg font-semibold text-gray-800">${title}</p>
      <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 transition">Xem trên YouTube</a>
    </div>
  `;
}