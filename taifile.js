const scriptURL = 'https://script.google.com/macros/s/AKfycbxmtzI-TIJU7kHlgISJFPnKQhm5gwPjUKxXAaAuajA_Cj-FYPnC1_1N7Ggu6-emXMJS/exec';
function uploadFiles(files) {
  const result = document.getElementById('resultList');
  const loading = document.getElementById('loading');
  const uploadPromises = [];

  result.innerHTML = '';
  if (!files || files.length === 0) return;

  loading.style.display = 'block';

  for (let file of files) {
    const fileName = file.webkitRelativePath || file.name;

    const promise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function () {
        const form = new FormData();
        form.append("file", reader.result.split(',')[1]);
        form.append("name", fileName);

        fetch(scriptURL, {
          method: 'POST',
          body: form,
        })
          .then(res => res.text())
          .then(txt => {
            const li = document.createElement('li');
            li.className = txt.includes("Tồn tại") ? 'duplicate' : 'success';
            li.textContent = txt;
            result.appendChild(li);
            resolve({ status: 'success', fileName: fileName });
          })
          .catch(() => {
            const li = document.createElement('li');
            li.className = 'error';
            li.textContent = `❌ Lỗi khi upload: ${fileName}`;
            result.appendChild(li);
            resolve({ status: 'error', fileName: fileName });
          });
      };
      reader.readAsDataURL(file);
    });
    uploadPromises.push(promise);
  }

  Promise.allSettled(uploadPromises).finally(() => {
    loading.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('drop-zone');

  // Vô hiệu hóa chuột phải trên toàn bộ trang
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Vô hiệu hóa các phím tắt mở công cụ nhà phát triển
  document.addEventListener('keydown', e => {
    // Vô hiệu hóa F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
    // Vô hiệu hóa Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
    }
    // Vô hiệu hóa Ctrl+Shift+J (Mac: Cmd+Option+J)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
    }
    // Vô hiệu hóa Ctrl+U (Xem mã nguồn)
    if (e.ctrlKey && e.key === 'U') {
      e.preventDefault();
    }
  });

  // Xử lý sự kiện kéo thả
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    uploadFiles(files);
  });
  
  // Xử lý sự kiện chọn tệp
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    uploadFiles(files);
  });
});