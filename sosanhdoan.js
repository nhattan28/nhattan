    function compareTexts() {
      const text1 = document.getElementById("text1").value.split(/\r?\n/);
      const text2 = document.getElementById("text2").value.split(/\r?\n/);

      const maxLines = Math.max(text1.length, text2.length);
      const result1 = [];
      const result2 = [];

      for (let i = 0; i < maxLines; i++) {
        const line1 = text1[i] || "";
        const line2 = text2[i] || "";
        if (line1.trim() !== line2.trim()) {
          result1.push(`<div class="highlight">${line1}</div>`);
          result2.push(`<div class="highlight">${line2}</div>`);
        } else {
          result1.push(`<div>${line1}</div>`);
          result2.push(`<div>${line2}</div>`);
        }
      }

      document.getElementById("result1").innerHTML = result1.join("");
      document.getElementById("result2").innerHTML = result2.join("");
    }

    function clearTexts() {
      document.getElementById("text1").value = "";
      document.getElementById("text2").value = "";
      document.getElementById("result1").innerHTML = "";
      document.getElementById("result2").innerHTML = "";
    }
    function toggleDifferences(showOnly) {
    const boxes = document.querySelectorAll('.compare-box');
    boxes.forEach(box => {
    Array.from(box.children).forEach(div => {
      const isDiff = div.classList.contains('highlight');
      div.style.display = showOnly && !isDiff ? 'none' : '';
    });
  });
}
