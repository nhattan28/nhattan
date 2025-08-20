// chuyendoi.js

/**
 * Hàm chính để chuyển đổi định dạng văn bản.
 * Nó sẽ đọc nội dung từ ô nhập, xử lý từng dòng để gộp các dòng phụ,
 * chuẩn hóa số câu hỏi và đáp án, sau đó hiển thị kết quả.
 */
function convert() {
  const inputText = document.getElementById("input").value;
   const rawLines = inputText.split("\n");
   
   const mergedLines = [];
   let buffer = "";

   rawLines.forEach(line => {
      const trimmed = line.trim();

      // Dòng trắng thì thêm dòng trắng vào kết quả nếu buffer đã có nội dung
      if (trimmed === "") {
         if (buffer) {
            mergedLines.push(buffer.trim());
         }
         buffer = "";
         mergedLines.push("");
      }  
      // Nếu là dòng bắt đầu bằng "Câu" hoặc số thứ tự, đây là một câu hỏi mới
      else if (/^(Câu\s*\d+[\s:.)]*|\d+[\s:.)]*)/i.test(trimmed)) {
         if (buffer) {
            mergedLines.push(buffer.trim());
         }
         buffer = trimmed;
      }  
      // Nếu là đáp án mới (a. / b) / C. ...)
      else if (/^(\*\*|\*|\/|_)?\s*[a-zA-Z][\.\,\)]\s+/.test(trimmed)) {
         if (buffer) {
            mergedLines.push(buffer.trim());
         }
         buffer = trimmed;
      }
      // Dòng phụ thì gộp vào buffer hiện tại
      else {
         buffer += " " + trimmed;
      }
   });

   // Thêm nội dung cuối cùng trong buffer vào kết quả
   if (buffer) {
      mergedLines.push(buffer.trim());
   }

   // Chuẩn hóa định dạng câu hỏi và đáp án
   const formattedLines = [];
   let questionCounter = 1;
   const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
   let answerCounter = 0;
   
   mergedLines.forEach(line => {
      // Chuẩn hóa câu hỏi
      if (/^(Câu\s*\d+[\s:.)]*|\d+[\s:.)]*)/i.test(line)) {
      const cleanedLine = line.replace(/^(Câu\s*\d+[\s:.)]*|\d+[\s:.)]*)/i, '').trim();
      formattedLines.push(`${questionCounter}, ${cleanedLine}`);
      questionCounter++;
         answerCounter = 0;
      }  
      // Chuẩn hóa đáp án
      else if (/^(\*\*|\*|\/|_)?\s*[a-zA-Z][\.\,\)]\s*/.test(line)) {
         const boldMark = line.match(/^(\*\*|\*|\/|_)/);
         const boldPrefix = boldMark ? boldMark[0] : '';
         const cleanedLine = line.replace(/^(\*\*|\*|\/|_)?\s*[a-zA-Z][\.\,\)]\s*/, '').trim();
         // Sửa đổi dòng này để sử dụng dấu phẩy
         formattedLines.push(`${boldPrefix}${letters[answerCounter]}, ${cleanedLine}`);
         answerCounter++;
      }  
      // Giữ nguyên các dòng khác
      else {
         formattedLines.push(line);
      }
   });

   document.getElementById("output").textContent = formattedLines.join("\n").trim();
}

// ... các hàm copyOutput, clearAll, showMessage vẫn giữ nguyên ...

/**
 * Sao chép nội dung từ ô kết quả vào clipboard.
 */
function copyOutput() {
  const outputText = document.getElementById("output").textContent;
  if (!outputText) {
    return showMessage("Không có nội dung để sao chép!", "warning");
  }

  // Sử dụng document.execCommand để tương thích tốt hơn với iframe
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = outputText;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  try {
    document.execCommand('copy');
    showMessage("Đã sao chép vào clipboard!", "success");
  } catch (err) {
    showMessage("Không thể sao chép. Vui lòng thử lại.", "error");
  }
  document.body.removeChild(tempTextarea);
}

/**
 * Xóa toàn bộ nội dung trong cả hai ô nhập liệu và kết quả.
 */
function clearAll() {
  document.getElementById("input").value = "";
  document.getElementById("output").textContent = "";
  showMessage("Đã xóa tất cả nội dung.", "info");
}

/**
 * Hiển thị thông báo tạm thời cho người dùng.
 * @param {string} message - Nội dung thông báo.
 * @param {string} type - Loại thông báo ('success', 'warning', 'error', 'info').
 */
function showMessage(message, type) {
  const messageBox = document.getElementById("message-box");
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = "block";
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000);
}


