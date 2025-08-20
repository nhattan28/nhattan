let videoQueue = [], currentIndex = -1, player;

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function pasteAndAdd() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("videoInput").value = text;
    addVideo();
  } catch {
    alert("Không đọc được clipboard");
  }
}

function clearInput() {
  document.getElementById("videoInput").value = "";
}

function startFirstVideo() {
  const input = document.getElementById("firstVideo").value.trim();
  const id = extractVideoId(input);
  if (!id) return alert("❌ Link không hợp lệ");

  videoQueue.push(id);
  currentIndex = 0;
  playVideo(id);
  updateQueueDisplay();
  document.getElementById("firstVideo").style.display = "none";
  document.querySelector("button[onclick='startFirstVideo()']").style.display = "none";
  document.getElementById("addSection").style.display = "block";
}

function addVideo() {
  const input = document.getElementById("videoInput");
  const url = input.value.trim();
  const id = extractVideoId(url);
  if (!id) return alert("❌ Link không hợp lệ");
  videoQueue.push(id);
  updateQueueDisplay();
  input.value = "";
}

function updateQueueDisplay() {
  const list = document.getElementById("queueList");
  list.innerHTML = "";
  videoQueue.forEach((id, index) => {
    const li = document.createElement("li");
    const link = `https://youtu.be/${id}`;
    li.innerHTML = `
      <div>
        ${index + 1}. <a href="${link}" target="_blank">${link}</a>
        ${index === currentIndex ? " 🎥 (Đang phát)" : ""}
      </div>
      <button class="delete-btn" onclick="removeVideo(${index})">Xóa</button>
    `;
    list.appendChild(li);
  });
  Sortable.create(list, {
    animation: 150,
    onEnd: function (evt) {
      const from = evt.oldIndex;
      const to = evt.newIndex;
      const v = videoQueue.splice(from, 1)[0];
      videoQueue.splice(to, 0, v);
      if (from === currentIndex) currentIndex = to;
      else if (from < currentIndex && to >= currentIndex) currentIndex--;
      else if (from > currentIndex && to <= currentIndex) currentIndex++;
      updateQueueDisplay();
    }
  });
}

function playVideo(id) {
  document.getElementById("playerContainer").innerHTML = `
    <iframe id="ytPlayer"
      src="https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0"
      allow="autoplay" allowfullscreen></iframe>
  `;
  setTimeout(() => {
    const iframe = document.getElementById("ytPlayer");
    player = new YT.Player(iframe, {
      events: { 'onStateChange': onPlayerStateChange }
    });
  }, 500);
}

function nextVideo() {
  if (currentIndex + 1 < videoQueue.length) {
    currentIndex++;
    playVideo(videoQueue[currentIndex]);
    updateQueueDisplay();
  }
}

function prevVideo() {
  if (currentIndex > 0) {
    currentIndex--;
    playVideo(videoQueue[currentIndex]);
    updateQueueDisplay();
  }
}

function removeVideo(index) {
  videoQueue.splice(index, 1);
  if (index === currentIndex) {
    if (videoQueue.length > 0) {
      currentIndex = Math.min(index, videoQueue.length - 1);
      playVideo(videoQueue[currentIndex]);
    } else {
      currentIndex = -1;
      document.getElementById("playerContainer").innerHTML = "";
    }
  } else if (index < currentIndex) {
    currentIndex--;
  }
  updateQueueDisplay();
}

function resetAll() {
  if (confirm("Bạn có chắc chắn muốn xoá toàn bộ playlist?")) {
    videoQueue = [];
    currentIndex = -1;
    document.getElementById("playerContainer").innerHTML = "";
    document.getElementById("queueList").innerHTML = "";
    document.getElementById("firstVideo").style.display = "block";
    document.getElementById("firstVideo").value = "";
    document.getElementById("addSection").style.display = "none";
    document.querySelector("button[onclick='startFirstVideo()']").style.display = "inline-block";
  }
}

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
  // Xoá video hiện tại
  if (currentIndex >= 0 && currentIndex < videoQueue.length) {
    videoQueue.splice(currentIndex, 1);
    // Điều chỉnh chỉ số sau khi xóa
    if (currentIndex >= videoQueue.length) {
      currentIndex = videoQueue.length - 1;
    }
    if (currentIndex >= 0) {
      playVideo(videoQueue[currentIndex]);
    } else {
      document.getElementById("playerContainer").innerHTML = "";
    }
    updateQueueDisplay();
  }
}

}

function toggleMenu() {
  const menu = document.querySelector('.queue-section');
  const btn = document.getElementById('menuToggleBtn');
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
    btn.style.display = 'block';
  } else {
    menu.classList.add('show');
    btn.style.display = 'none';
  }
}

window.addEventListener('click', function (e) {
  const menu = document.querySelector('.queue-section');
  const btn = document.getElementById('menuToggleBtn');
  if (menu.classList.contains('show') && !menu.contains(e.target) && e.target !== btn) {
    menu.classList.remove('show');
    btn.style.display = 'block';
  }
});
