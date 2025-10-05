// Chặn chuột phải và một số phím tắt phổ biến
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
    e.preventDefault();
    Swal.fire({
      icon: "error",
      title: "Bị chặn!",
      text: "Truy cập công cụ nhà phát triển đã bị chặn."
    });
  }
  if (e.ctrlKey && e.key === 'U') {
    e.preventDefault();
    Swal.fire({
      icon: "warning",
      title: "Không cho phép!",
      text: "Xem mã nguồn đã bị chặn."
    });
  }
});

// Tách MSSV từ text (8-15 số)
function extractIdsFromText(text) {
  if (!text) return [];
  const matches = text.match(/\d{8,15}/g) || [];
  const filtered = matches.filter(m => !/^0+$/.test(m));
  return Array.from(new Set(filtered));
}

// Tạo card ảnh
function createCard(id) {
  const card = document.createElement("div");
  card.className = "student-card";

  const img = document.createElement("img");
  img.loading = "lazy";
  img.alt = `Ảnh ${id}`;
  img.src = `https://hfs1.duytan.edu.vn/Upload/dichvu/sv_${id}_01.jpg`;

  img.onerror = () => {
    img.remove();
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.textContent = id;
    card.prepend(ph);
  };

  const caption = document.createElement("div");
  caption.className = "caption";
  caption.textContent = id;

  card.appendChild(img);
  card.appendChild(caption);
  return card;
}

// Hiển thị ảnh
function searchStudentImages(ids) {
  const container = document.getElementById("student-images");
  container.innerHTML = "";

  if (ids.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Không tìm thấy!",
      text: "Bạn chưa nhập MSSV hợp lệ."
    });
    return;
  }

  const used = ids.slice(0, 800);
  used.forEach(id => container.appendChild(createCard(id)));

  document.getElementById("search-form-container").style.display = "none";
  document.getElementById("image-view").style.display = "block";

  document.getElementById("summary").textContent =
    `Tìm: ${ids.length} Mã Sinh viên (hiển thị ${used.length})`;
}

// Form submit
document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const ids = extractIdsFromText(document.getElementById("student-ids").value);
  if (ids.length > 0) searchStudentImages(ids);
  else {
    Swal.fire({
      icon: "warning",
      title: "Thiếu dữ liệu!",
      text: "Hãy nhập hoặc dán MSSV trước khi tìm kiếm."
    });
  }
});

// Upload file
document.getElementById("upload-file").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    const reader = new FileReader();
    reader.onload = ev => {
      const data = new Uint8Array(ev.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const content = rows.flat().join("\n");
      const ids = extractIdsFromText(content);
      if (ids.length > 0) {
        document.getElementById("student-ids").value = ids.join("\n");
        Swal.fire({
          icon: "success",
          title: "Tải thành công!",
          text: `Đã tìm thấy ${ids.length} MSSV trong file Excel.`,
          timer: 2000,
          showConfirmButton: false
        });
        searchStudentImages(ids);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không tìm thấy MSSV trong file Excel!"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = ev => {
      const ids = extractIdsFromText(ev.target.result);
      if (ids.length > 0) {
        document.getElementById("student-ids").value = ids.join("\n");
        Swal.fire({
          icon: "success",
          title: "Tải thành công!",
          text: `Đã tìm thấy ${ids.length} MSSV trong file.`,
          timer: 2000,
          showConfirmButton: false
        });
        searchStudentImages(ids);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "File không có MSSV hợp lệ!"
        });
      }
    };
    reader.readAsText(file);
  }
});

// Paste
document.getElementById("paste-button").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    const ids = extractIdsFromText(text);
    document.getElementById("student-ids").value = ids.join("\n") || text;
    Swal.fire({
      icon: "info",
      title: "Dán thành công",
      text: `Đã dán ${ids.length} MSSV vào ô nhập.`,
      timer: 1500,
      showConfirmButton: false
    });
  } catch {
    Swal.fire({
      icon: "error",
      title: "Không thể dán!",
      text: "Hãy cho phép quyền truy cập clipboard."
    });
  }
});

// Clear
document.getElementById("clear-button").addEventListener("click", () => {
  document.getElementById("student-ids").value = "";
  document.getElementById("upload-file").value = "";
  Swal.fire({
    icon: "success",
    title: "Đã xóa!",
    text: "Đã xóa dữ liệu và file tải lên.",
    timer: 1200,
    showConfirmButton: false
  });
});

// Back
document.getElementById("back-button").addEventListener("click", () => {
  document.getElementById("search-form-container").style.display = "block";
  document.getElementById("image-view").style.display = "none";
});

// Search trong grid
document.getElementById("search-in-images").addEventListener("input", e => {
  const kw = e.target.value.trim();
  document.querySelectorAll(".student-card").forEach(card => {
    const id = card.querySelector(".caption").textContent;
    card.style.display = id.includes(kw) ? "flex" : "none";
  });
});
