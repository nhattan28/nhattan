async function loadArticles() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbxgs9sZ5Ncakw96bl_fyVX-Kjnoo9FJVHAiliqmv33y-THKyAdlomNU32p2IxBuri2b/exec");
  const data = await response.json();
  const container = document.querySelector(".container");
  container.innerHTML = ''; // Reset container trước khi chèn bài mới

  data.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";

    card.innerHTML = `
      <div class="article-image">
        <img src="${article.image}" alt="Ảnh bài viết">
      </div>
      <div class="article-content">
        <a class="article-title" href="${article.link}" target="_blank">${article.title}</a>
        <p class="article-summary">${article.description.replace(/<[^>]+>/g, '').slice(0, 150)}...</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// Gọi hàm loadArticles lần đầu tiên khi trang được tải
loadArticles();

// Cập nhật tự động mỗi 30 giây (hoặc thời gian bạn muốn)
setInterval(loadArticles, 30000); // 30,000 ms = 30 giây