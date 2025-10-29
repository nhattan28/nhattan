// Biến để lưu trạng thái trang hiện tại, giúp nút "Quay lại" hoạt động đúng
let currentPage = 'input-page';

// Function để hiển thị modal thông báo tùy chỉnh
function showModal(message, type = 'alert', onConfirm = null) {
  const modal = document.getElementById('custom-modal');
  const messageElement = document.getElementById('modal-message');
  const confirmBtn = document.getElementById('modal-confirm-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');

  messageElement.innerText = message;

  if (type === 'confirm') {
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    confirmBtn.onclick = () => {
      onConfirm();
      modal.style.display = 'none';
    };
    cancelBtn.onclick = () => {
      modal.style.display = 'none';
    };
  } else {
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  modal.style.display = 'flex';
}

function addRow(subjectCode = '', credits = '', score10 = '') {
  const tbody = document.getElementById("subjects");
  const existingSubjectCodes = Array.from(tbody.querySelectorAll('input[type="text"]'))
    .map(input => input.value.trim().toUpperCase());

  if (subjectCode && existingSubjectCodes.includes(subjectCode.trim().toUpperCase())) {
    showModal(`Mã lớp "${subjectCode}" đã tồn tại. Vui lòng nhập mã lớp khác.`);
    return;
  }

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="Mã lớp" value="${subjectCode}"></td>
    <td><input type="number" min="" value="${credits}"placeholder="Số tín chỉ"></td>
    <td><input type="number" step="0.1" min="0" max="10" value="${score10}"placeholder="Thang điểm 10"></td>
    <td><button class="btn delete-btn" onclick="deleteRow(this)">Xóa</button></td>
  `;
  
  tbody.appendChild(row);
  
  row.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function deleteRow(btn) {
  const row = btn.parentNode.parentNode;
  const tbody = document.getElementById("subjects");
  if (tbody.rows.length > 1) {
    tbody.removeChild(row);
  } else {
    showModal("Phải có ít nhất 1 môn học!");
  }
}

// Hàm này giờ sẽ chỉ được gọi từ nút "Xóa Tất Cả"
function clearAllRows() {
  showModal("Bạn có chắc chắn muốn xóa tất cả các môn học đã nhập không?", 'confirm', () => {
    const tbody = document.getElementById("subjects");
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }
    addRow();

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
  });
}

// Cập nhật hàm convertTo4() để sử dụng bảng quy đổi mới
function convertTo4(score10) {
  if (score10 >= 9.5) return 4.0; // A+
  if (score10 >= 8.5) return 4.0; // A
  if (score10 >= 8.0) return 3.65; // A-
  if (score10 >= 7.5) return 3.33; // B+
  if (score10 >= 7.0) return 3.0; // B
  if (score10 >= 6.5) return 2.65; // B-
  if (score10 >= 6.0) return 2.33; // C+
  if (score10 >= 5.5) return 2.0; // C
  if (score10 >= 4.5) return 1.65; // C-
  if (score10 >= 4.0) return 1.0; // D
  return 0.0; // F
}

function getRank(avg4) {
  if (avg4 >= 3.6) return "Xuất sắc";
  if (avg4 >= 3.2) return "Giỏi";
  if (avg4 >= 2.5) return "Khá";
  if (avg4 >= 2.0) return "Trung bình";
  return "Yếu/Kém";
}

function calculate() {
  const rows = document.querySelectorAll("#subjects tr");
  let totalCredits = 0,
    sum10 = 0,
    sum4 = 0;
  let hasValidData = false;

  rows.forEach((r) => {
    const credits = parseFloat(r.children[1].children[0].value) || 0;
    const score10 = parseFloat(r.children[2].children[0].value) || 0;

    if (credits > 0 && score10 >= 0 && score10 <= 10) {
      hasValidData = true;
      const score4 = convertTo4(score10);

      totalCredits += credits;
      sum10 += score10 * credits;
      sum4 += score4 * credits;
    }
  });

  if (!hasValidData || totalCredits === 0) {
    showModal(
      "Vui lòng nhập số tín chỉ và điểm hợp lệ cho ít nhất một môn học!"
    );
    return;
  }

  const avg10 = (sum10 / totalCredits).toFixed(2);
  const avg4 = (sum4 / totalCredits).toFixed(2);
  const rank = getRank(parseFloat(avg4));

  document.getElementById("totalCredits").innerText =
    `📚 Tổng số Đơn vị Học tập (ĐVHT) toàn Khóa học: ${totalCredits}`;
  document.getElementById("avg10").innerText =
    `📘 Trung bình Điểm gốc toàn Khóa học: ${avg10}`;
  document.getElementById("avg4").innerText =
    `📗 Điểm Trung bình Tích lũy toàn Khóa học: ${avg4}`;
  document.getElementById("rank").innerText = `🏆 Xếp loại học lực đối với sinh viên năm cuối: ${rank}`;
  
  // Xóa lý do hạ bậc (nếu có từ lần tính trước)
  document.getElementById("demotionReason").innerText = "";

  document.getElementById("input-page").classList.add("hidden");
  document.getElementById("result-page").classList.remove("hidden");
}

function goBack() {
  document.getElementById("input-page").classList.remove("hidden");
  document.getElementById("result-page").classList.add("hidden");
  // Xóa lý do hạ bậc khi quay lại
  document.getElementById("demotionReason").innerText = "";
}

document.getElementById('fileInput').addEventListener('change', (event) => {
  // ... (Phần này không thay đổi) ...
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      showModal("Tệp không có dữ liệu!");
      return;
    }
    
    let subjectCodeIndex = -1, creditsIndex = -1, scoreIndex = -1, letterGradeIndex = -1;
    let dataStartIndex = -1;

    for (let i = 0; i < jsonData.length; i++) {
      const headers = jsonData[i];
      if (Array.isArray(headers)) {
        subjectCodeIndex = headers.findIndex(header => header && header.toString().trim() === 'Mã Lớp');
        creditsIndex = headers.findIndex(header => header && header.toString().trim() === 'Số ĐVHT');
        scoreIndex = headers.findIndex(header => header && header.toString().trim() === 'Điểm gốc');
        letterGradeIndex = headers.findIndex(header => header && header.toString().trim() === 'Điểm chữ');
      }

      if (subjectCodeIndex !== -1 && creditsIndex !== -1 && scoreIndex !== -1 && letterGradeIndex !== -1) {
        dataStartIndex = i + 1;
        break;
      }
    }

    if (dataStartIndex === -1) {
      showModal("Tệp Excel không có đủ các cột 'Mã Lớp', 'Số ĐVHT', 'Điểm gốc', và 'Điểm chữ'. Vui lòng kiểm tra lại tiêu đề cột.");
      return;
    }
    
    const tbody = document.getElementById("subjects");
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }
    
    const existingSubjectCodes = new Set();
    let hasAddedData = false;
    const allowedGrades = new Set(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']);

    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row.length > 0) {
        const subjectCode = row[subjectCodeIndex] ? row[subjectCodeIndex].toString().trim() : '';
        const credits = parseFloat(row[creditsIndex]) || 0;
        const score10 = parseFloat(row[scoreIndex]) || 0;
        const letterGrade = row[letterGradeIndex] ? row[letterGradeIndex].toString().trim().toUpperCase() : '';

        if (allowedGrades.has(letterGrade) && subjectCode && credits > 0 && score10 >= 0 && score10 <= 10) {
          const codeToCompare = subjectCode.toUpperCase();
          if (existingSubjectCodes.has(codeToCompare)) {
            console.warn(`Mã môn "${subjectCode}" bị trùng lặp trong file và đã bị bỏ qua.`);
            continue;
          }
          existingSubjectCodes.add(codeToCompare);
          addRow(subjectCode, credits, score10);
          hasAddedData = true;
        } else {
            console.log(`Bỏ qua môn ${subjectCode} vì điểm chữ không hợp lệ: ${letterGrade}`);
        }
      }
    }
    
    if (!hasAddedData) {
        addRow();
        showModal("Không có dữ liệu hợp lệ được tìm thấy trong tệp Excel.");
    }
  };
  reader.readAsArrayBuffer(file);
});

// Hàm để hiển thị trang nhập liệu nhanh và xóa dữ liệu cũ
function showFastInputPage() {
    clearAllRowsWithoutConfirm();
    document.getElementById("input-page").classList.add("hidden");
    document.getElementById("result-page").classList.add("hidden");
    document.getElementById("fast-input-page").classList.remove("hidden");
}

// Hàm để hiển thị trang nhập liệu chính và xóa dữ liệu cũ
function showInputPage() {
    fastClear();
    document.getElementById("fast-input-page").classList.add("hidden");
    document.getElementById("result-page").classList.add("hidden");
    document.getElementById("input-page").classList.remove("hidden");
}

// ===== HÀM ĐÃ CẬP NHẬT (fastCalculate) =====
function fastCalculate() {
    const totalCredits = parseFloat(document.getElementById("fastTotalCredits").value) || 0;
    const avg10Input = document.getElementById("fastAvg10");
    const avg4Input = document.getElementById("fastAvg4");
    const retakenCredits = parseFloat(document.getElementById("fastRetakenCredits").value) || 0;
    const isDisciplined = document.getElementById("fastDisciplined").checked;
    
    let avg10 = parseFloat(avg10Input.value);
    let avg4 = parseFloat(avg4Input.value);

    if (isNaN(avg10) || avg10 < 0 || avg10 > 10) {
        showModal("Trung bình gốc (thang điểm 10) phải nằm trong khoảng từ 0.00 đến 10.00.");
        return;
    }
    
    if (isNaN(avg4) || avg4 < 0 || avg4 > 4) {
        showModal("Trung bình tích lũy (thang điểm 4) phải nằm trong khoảng từ 0.00 đến 4.00.");
        return;
    }

    if (totalCredits <= 0) {
        showModal("Vui lòng nhập Tổng số ĐVHT toàn Khóa học lớn hơn 0.");
        return;
    }

    const initialRank = getRank(avg4);
    let finalRank = initialRank;
    let reason = "";
    let retakenPercentage = 0;

    if (totalCredits > 0) {
        retakenPercentage = (retakenCredits / totalCredits) * 100;
    }

    const needsDemotion = (retakenPercentage > 5) || isDisciplined;

    if (needsDemotion && (initialRank === "Xuất sắc" || initialRank === "Giỏi")) {
        if (initialRank === "Xuất sắc") {
            finalRank = "Giỏi";
        } else if (initialRank === "Giỏi") {
            finalRank = "Khá";
        }

        // Xây dựng chuỗi lý do
        if (retakenPercentage > 5 && isDisciplined) {
            reason = `Lý do hạ bậc: Bị kỷ luật và có số TC học lại/ghép vượt quá 5% (${retakenPercentage.toFixed(2)}%).`;
        } else if (retakenPercentage > 5) {
            reason = `Lý do hạ bậc: Số TC học lại/ghép (${retakenCredits} TC) vượt quá 5% tổng số tín chỉ (${retakenPercentage.toFixed(2)}%).`;
        } else if (isDisciplined) {
            reason = "Lý do hạ bậc: Đã bị kỷ luật từ mức cảnh cáo trở lên.";
        }
    }

    document.getElementById("totalCredits").innerText = `📚 Tổng số Đơn vị Học tập (ĐVHT) toàn Khóa học: ${totalCredits || 'N/A'}`;
    document.getElementById("avg10").innerText = `📘 Trung bình Điểm gốc toàn Khóa học: ${avg10.toFixed(2)}`;
    document.getElementById("avg4").innerText = `📗 Điểm Trung bình Tích lũy toàn Khóa học: ${avg4.toFixed(2)}`;
    document.getElementById("rank").innerText = `🏆 Xếp loại học lực đối với sinh viên năm cuối: ${finalRank}`;
    document.getElementById("demotionReason").innerText = reason; // Hiển thị lý do

    document.getElementById("fast-input-page").classList.add("hidden");
    document.getElementById("result-page").classList.remove("hidden");
}

// ===== HÀM ĐÃ CẬP NHẬT (fastClear) =====
function fastClear() {
    document.getElementById("fastTotalCredits").value = "";
    document.getElementById("fastAvg10").value = "";
    document.getElementById("fastAvg4").value = "";
    document.getElementById("fastRetakenCredits").value = "";
    document.getElementById("fastDisciplined").checked = false;
    document.getElementById("result-page").classList.add("hidden");
    // Xóa cả lý do khi xóa form
    document.getElementById("demotionReason").innerText = "";
}

// Hàm để xóa tất cả các hàng mà không cần xác nhận
function clearAllRowsWithoutConfirm() {
    const tbody = document.getElementById("subjects");
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    addRow();

    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
    }
}
