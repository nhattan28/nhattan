window.onload = function () {
  const score = localStorage.getItem("quizScore");
  const correct = localStorage.getItem("quizCorrect");
  const total = localStorage.getItem("quizTotal");
  const violations = localStorage.getItem("quizViolations"); // Đọc số lần vi phạm
  const wrongAnswers = JSON.parse(localStorage.getItem("quizWrongAnswers") || "[]");
  const correctAnswers = JSON.parse(localStorage.getItem("quizCorrectAnswers") || "[]");
  const scale = localStorage.getItem("quizScale") || 10;

  // Hiển thị thông báo vi phạm nếu có
  if (violations && parseInt(violations) > 0) {
    const notice = document.getElementById("violationNotice");
    notice.classList.remove("hidden");
    notice.textContent = `🚫 Phát hiện ${violations} lần vi phạm quy chế thi!`;
  }

  // Hiển thị kết quả chính
  document.getElementById("score").textContent = `${parseFloat(score).toFixed(1)}/${scale}`;
  document.getElementById("correct").textContent = correct;
  document.getElementById("total").textContent = total;
  document.getElementById("wrong").textContent = total - correct;

  const wrongContainer = document.getElementById("wrongAnswersContainer");
  const wrongSection = document.getElementById("wrongAnswersSection");
  const toggleWrongBtn = document.getElementById("toggleWrongBtn");

  const correctContainer = document.getElementById("correctAnswersContainer");
  const correctSection = document.getElementById("correctAnswersSection");
  const toggleCorrectBtn = document.getElementById("toggleCorrectBtn");

  if (wrongAnswers.length > 0) {
    wrongAnswers.forEach((item) => {
      const div = document.createElement("div");
      div.className = "p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm text-left";
      div.innerHTML = `<p class="mb-2 text-lg font-semibold">${item.question}</p><p class="text-blue-700"><strong>Bạn chọn:</strong> ${item.selected}</p><p class="text-green-700"><strong>Đáp án đúng:</strong> ${item.correct}</p>`;
      wrongContainer.appendChild(div);
    });
  } else {
    toggleWrongBtn.style.display = "none";
    document.getElementById("perfectMessage").classList.remove("hidden");
  }

  if (correctAnswers.length > 0) {
    correctAnswers.forEach(item => {
      const div = document.createElement("div");
      div.className = "p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm text-left";
      div.innerHTML = `<p class="mb-2 text-lg font-semibold">${item.question}</p><p class="text-green-700"><strong>Đáp án đúng:</strong> ${item.correct}</p>`;
      correctContainer.appendChild(div);
    });
  } else {
    toggleCorrectBtn.style.display = "none";
  }

  toggleWrongBtn.addEventListener("click", function () {
    const isHidden = wrongSection.style.display === "none";
    wrongSection.style.display = isHidden ? "block" : "none";
    this.textContent = isHidden ? "Ẩn câu sai" : "Hiển thị câu sai";
  });

  toggleCorrectBtn.addEventListener("click", function () {
    const isHidden = correctSection.style.display === "none";
    correctSection.style.display = isHidden ? "block" : "none";
    this.textContent = isHidden ? "Ẩn câu đúng" : "Hiển thị câu đúng";
  });

  const actionButtons = document.querySelector('.button-group');
  actionButtons.innerHTML = `
        <button onclick="restartQuiz(false)" class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl">🔄 Làm lại bài thi</button>
        ${wrongAnswers.length > 0 ? `<button onclick="restartQuiz(true)" class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 px-8 rounded-xl">📚 Ôn lại ${wrongAnswers.length} câu sai</button>` : ''}
        <button onclick="goBack()" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-xl">⬅️ Trang chủ</button>
    `;
};

function restartQuiz(isPracticingWrong = false) {
  localStorage.setItem("quizAction", isPracticingWrong ? "practiceWrong" : "restart");
  window.location.href = "tracnghiem.html";
}

function goBack() {
  // Xóa các dữ liệu của phiên làm bài, bao gồm cả số lần vi phạm
  localStorage.removeItem("quizScore");
  localStorage.removeItem("quizCorrect");
  localStorage.removeItem("quizTotal");
  localStorage.removeItem("quizViolations");
  localStorage.removeItem("quizWrongAnswers");
  localStorage.removeItem("quizCorrectAnswers");
  localStorage.removeItem("questionsInQuiz");
  localStorage.removeItem("userAnswersInQuiz");
  window.location.href = "tracnghiem.html";
}