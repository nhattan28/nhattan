function convert() {
  const inputText = document.getElementById("input").value;
  const rawLines = inputText.split("\n");

  const mergedLines = [];
  let buffer = "";

  rawLines.forEach(line => {
    const trimmed = line.trim();

    // ⚠️ Nếu là dòng chỉ chứa "a)", "b)",... → không phải đáp án mới, mà là dòng phụ → gộp vào dòng trước
    if (/^[a-dA-D][\.\,\)]\s*$/.test(trimmed)) {
      buffer += " " + trimmed;
      return;
    }

    // Nếu là đáp án mới (a. / b) / C. ...)
    if (/^(\*\*)?[a-dA-D][\.\,\)]\s+/.test(trimmed)) {
      if (buffer) mergedLines.push(buffer.trim());
      buffer = trimmed;
    }
    // Nếu là dòng bắt đầu bằng "Câu" hoặc số thứ tự → câu hỏi mới
    else if (/^(Câu\s*\d+[\s:.\)]*|\d+[\s:.\)]*)/i.test(trimmed)) {
      if (buffer) mergedLines.push(buffer.trim());
      buffer = trimmed;
    }
    // Nếu dòng trắng → xuống dòng thực sự
    else if (trimmed === "") {
      if (buffer) mergedLines.push(buffer.trim());
      buffer = "";
      mergedLines.push("");
    }
    // Dòng phụ → gộp tiếp
    else {
      buffer += " " + trimmed;
    }
  });

  if (buffer) mergedLines.push(buffer.trim());

  const lines = [];

  mergedLines.forEach(line => {
    const answerPattern = /((\*\*)?[a-dA-D][\.\,\)])\s+/g;
    const answerMatches = [...line.matchAll(answerPattern)];

    if (answerMatches.length >= 2) {
      const parts = line.split(/(?=(\*\*)?[a-dA-D][\.\,\)]\s)/g).filter(Boolean);
      const allValid = parts.every(p => /^(\*\*)?[a-dA-D][\.\,\)]\s/.test(p));
      if (allValid) {
        parts.forEach(p => lines.push(p.trim()));
      } else {
        lines.push(line.trim());
      }
    } else {
      lines.push(line.trim());
    }
  });

  let output = "";
  let questionNumber = 1;
  let collectingAnswers = false;

  const normalizeAnswer = (line) => {
    const match = line.match(/^(\*\*)?([a-dA-D])[\.\,\)]\s*/);
    if (match) {
      const isCorrect = match[1] ? "**" : "";
      const letter = match[2].toLowerCase();
      const content = line.replace(/^(\*\*)?[a-dA-D][\.\,\)]\s*/, "").trim();
      return `${isCorrect}${letter}) ${content}${isCorrect}`;
    }
    return line.trim();
  };

  lines.forEach(line => {
    const trimmed = line.trim();

    if (/^(Câu\s*\d+[\s:.\)]*|\d+[\s:.\)]*)/i.test(trimmed)) {
      const questionText = trimmed
        .replace(/^Câu\s*\d+[\s:.\)]*/i, "")
        .replace(/^\d+[\s:.\)]*/, "")
        .trim();
      output += `${questionNumber}. ${questionText}\n`;
      questionNumber++;
      collectingAnswers = true;
    } else if (collectingAnswers && /^(\*\*)?[a-dA-D][\.\,\)]\s*/.test(trimmed)) {
      output += normalizeAnswer(trimmed) + "\n";
    } else if (trimmed === "") {
      output += "\n";
      collectingAnswers = false;
    } else {
      output += trimmed + "\n";
    }
  });

  const finalOutput = output.trim();
  document.getElementById("output").textContent = finalOutput;
  document.querySelector(".placeholder").style.opacity = finalOutput ? "0" : "1";
}

function copyOutput() {
  const text = document.getElementById("output").textContent;
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = text;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  try {
    document.execCommand("copy");
    alert("✅ Đã sao chép kết quả!");
  } catch (err) {
    alert("❌ Sao chép thất bại.");
  }
  document.body.removeChild(tempTextarea);
}

function clearAll() {
  document.getElementById("input").value = "";
  document.getElementById("output").textContent = "";
  document.querySelector(".placeholder").style.opacity = "1";
}

async function pasteInput() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("input").value = text;
  } catch (err) {
    alert("❌ Không thể dán. Trình duyệt không hỗ trợ hoặc bạn chưa cho phép.");
  }
}
// NEW POPUP FUNCTIONS (MODAL STYLE) - THÊM VÀO DƯỚI CÙNG CỦA FILE CHUYENDOI.JS
function showPopup(title, message, confirm = false, onOkCallback = () => {}) {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popupTitle");
    const messageDiv = document.getElementById("popupMessage");
    const buttons = document.getElementById("popupButtons");

    popupTitle.textContent = title;
    messageDiv.innerHTML = message;
    
    overlay.style.display = "block";
    popup.style.display = "block";
    
    // Đảm bảo không có class hide trước khi thêm show
    popup.classList.remove('hide');
    popup.classList.add('show');
    
    document.querySelector(".container").classList.add("blur"); // Làm mờ container chính
    buttons.innerHTML = "";

    // Luôn hiển thị nút OK duy nhất cho hướng dẫn sử dụng
    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.className = "py-2 px-6 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition duration-200";
    okBtn.onclick = () => {
        closePopup('popup');
        onOkCallback(); // Gọi callback nếu có
    };
    buttons.appendChild(okBtn);
}

function closePopup(popupId = 'popup') {
    const popupToClose = document.getElementById(popupId);
    if (!popupToClose) return;

    popupToClose.classList.add('hide');
    // Khi animation kết thúc, ẩn hoàn toàn và loại bỏ blur
    popupToClose.addEventListener('transitionend', function handler() {
        popupToClose.style.display = 'none';
        popupToClose.classList.remove('hide'); // Xóa class hide sau khi ẩn
        popupToClose.removeEventListener('transitionend', handler);
        
        const allPopups = document.querySelectorAll('.popup:not([style*="display: none"])');
        if (allPopups.length === 0) { // Chỉ ẩn overlay và bỏ blur nếu không còn popup nào hiển thị
            document.getElementById("overlay").style.display = "none";
            document.querySelector(".container").classList.remove("blur");
        }
    });
}

function showUsageGuidePopup() {
    const usageGuideContent = `
        <ul class="list-disc pl-5 text-left text-gray-700 space-y-2">
            <li><strong>✨ Định dạng file:</strong> Đáp án đúng cần <strong>in đậm</strong> trong file Word (.docx).</li>
            <li><strong>❓ Định dạng câu hỏi:</strong> Bắt đầu bằng số (ví dụ: <code>1.</code> hoặc <code>1)</code>).</li>
            <li><strong>✅ Định dạng đáp án:</strong> Bắt đầu bằng chữ cái (ví dụ: <code>a.</code>, <code>a)</code>, <code>A.</code>, hoặc <code>A)</code>).</li>
            <li><strong>⚙️ Chuẩn hóa:</strong> Nếu file của bạn không đúng định dạng, hãy nhấn nút "Chuyển đổi" để hệ thống tự động sửa.</li>
            <li><strong>Mẹo:</strong> Công cụ này giúp bạn nhanh chóng đưa file câu hỏi về định dạng thống nhất.</li>
        </ul>
    `;
    showPopup("📚 Hướng Dẫn Sử Dụng", usageGuideContent, false); // Luôn hiển thị nút OK
}

// Gọi hàm showUsageGuidePopup() khi DOM đã tải xong để thông báo tự động hiển thị
document.addEventListener('DOMContentLoaded', showUsageGuidePopup);
