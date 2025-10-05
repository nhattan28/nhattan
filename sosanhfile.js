let fileContents = [];

function clearFiles() {
  fileContents = [];
  document.getElementById('fileContainers').innerHTML = '';
  document.getElementById('fileCount').textContent = '0 tệp';
}

document.getElementById('fileInput').addEventListener('change', async function (e) {
  const files = Array.from(e.target.files).slice(0, 4); // Tối đa 4 file
  fileContents = await Promise.all(files.map(readFileContent));
  displayFiles(fileContents);
  compareAndHighlight();
  document.getElementById('fileCount').textContent = files.length + ' tệp';
});

async function readFileContent(file) {
  if (file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (file.name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  } else {
    return await file.text();
  }
}

function displayFiles(contents) {
  const container = document.getElementById('fileContainers');
  container.innerHTML = '';
  contents.forEach(content => {
    const box = document.createElement('div');
    box.className = 'file-box';
    box.innerHTML = content.split('\n').map(line => `<div>${line}</div>`).join('');
    container.appendChild(box);
  });
}

function compareAndHighlight() {
  const linesArr = fileContents.map(content => content.split('\n'));
  const maxLines = Math.max(...linesArr.map(arr => arr.length));
  const boxes = document.querySelectorAll('.file-box');

  for (let i = 0; i < maxLines; i++) {
    const lineSet = linesArr.map(arr => arr[i] || '');
    const allSame = lineSet.every(line => line === lineSet[0]);
    if (!allSame) {
      boxes.forEach((box, idx) => {
        const div = box.children[i];
        if (div) div.classList.add('diff-line');
      });
    }
  }
}

function toggleDifferences(showDiffOnly) {
  const boxes = document.querySelectorAll('.file-box');
  boxes.forEach(box => {
    Array.from(box.children).forEach(div => {
      const isDiff = div.classList.contains('diff-line');
      div.classList.toggle('hidden-line', showDiffOnly && !isDiff);
    });
  });
}