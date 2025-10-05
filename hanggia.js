function search() {
  const keyword = document.getElementById('keyword').value.trim();
  const resultBox = document.getElementById('results');

  if (!keyword) {
    resultBox.innerText = 'Nhập từ khóa để tìm kiếm sản phẩm sữa.';
    return;
  }

  const results = milkProducts.filter(product =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );

  if (results.length === 0) {
    resultBox.innerText = '❌ Không tìm thấy sản phẩm phù hợp.';
  } else {
    resultBox.innerHTML = '';
    results.forEach(product => {
      const div = document.createElement('div');
      div.className = 'result-item';
      const statusClass = product.status === 'Giả' ? 'status-fake' : 'status-investigating';
      div.innerHTML = `${product.name} (<span class="${statusClass}">${product.status}</span>) - ${product.company}`;
      resultBox.appendChild(div);
    });
  }
}

function clearSearch() {
  document.getElementById('keyword').value = '';
  document.getElementById('results').innerText = 'Nhập từ khóa để tìm kiếm sản phẩm sữa.';
}
