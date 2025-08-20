const scriptURL = 'https://script.google.com/macros/s/AKfycbxmtzI-TIJU7kHlgISJFPnKQhm5gwPjUKxXAaAuajA_Cj-FYPnC1_1N7Ggu6-emXMJS/exec';

function uploadFiles() {
  const files = document.getElementById('fileInput').files;
  const result = document.getElementById('resultList');
  const loading = document.getElementById('loading');

  result.innerHTML = '';
  if (!files.length) return;

  loading.style.display = 'block';
  let completed = 0;

  for (let file of files) {
    const fileName = file.webkitRelativePath || file.name;

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
        })
        .catch(() => {
          const li = document.createElement('li');
          li.className = 'error';
          li.textContent = `❌ Lỗi khi upload: ${fileName}`;
          result.appendChild(li);
        })
        .finally(() => {
          completed++;
          if (completed === files.length) {
            loading.style.display = 'none';
          }
        });
    };
    reader.readAsDataURL(file);
  }
}