const encouragements = [
    "Đừng nản, bạn đang làm rất tốt! 💪",
    "Thử lại nhé, bạn sẽ làm được! 🌟",
    "Mỗi lần sai là một lần học! 📘",
    "Bạn đang tiến bộ đấy! 🚀",
    "Giữ vững tinh thần nhé! 💖"
];

let rawQuestions = [],
    current = 0,
    userAnswers = [],
    quizStarted = false;
let timerInterval = null,
    totalSeconds = 0,
    scale = null,
    timeLimitSeconds = null;
let randomQuestionCount = null;

const TIME_PER_QUESTION_SECONDS = 30;
const confetti = new ConfettiGenerator({
    target: 'confetti'
});

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (quizStarted) recordViolation("Nhấn chuột phải");
});
document.addEventListener('dragstart', function (e) {
    e.preventDefault();
});

document.addEventListener('keydown', function (e) {
    if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        e.key === 'F12'
    ) {
        e.preventDefault();
        if (quizStarted) recordViolation(`Nhấn phím tắt ${e.key}`);
    }
});
window.onload = function () {
    const fileName = localStorage.getItem("currentFileName");
    if (!fileName || !localStorage.getItem("quizQuestions")) {
        clearQuizState();
    } else {
        rawQuestions = JSON.parse(localStorage.getItem("quizQuestions"));
        if (rawQuestions.length > 0) {
            document.getElementById("upload").style.display = "none";
            document.getElementById("clearFileBtn").style.display = "inline-block";
            document.getElementById("startQuiz").style.display = "block";
            // Kích hoạt lại cửa sổ cài đặt nếu đã có file nhưng chưa bắt đầu (ví dụ: sau khi reload)
            // showSettingsPopup(); 
        } else {
            // document.getElementById("usageGuide").classList.add("show"); // REMOVED
        }
    }

    showUsageGuidePopup(); // Call the popup on page load

    document.getElementById("upload").addEventListener("change", function (event) {
        const reader = new FileReader();
        reader.onload = function () {
            mammoth.convertToHtml({
                arrayBuffer: reader.result
            }).then(function (result) {
                const html = result.value;
                parseQuestions(html);
                if (rawQuestions.length > 0) {
                    localStorage.setItem("quizQuestions", JSON.stringify(rawQuestions));
                    localStorage.setItem("currentFileName", event.target.files[0].name);
                    let retryData = JSON.parse(localStorage.getItem("retryData")) || {};
                    if (!retryData[event.target.files[0].name]) {
                        retryData[event.target.files[0].name] = {
                            attempts: 0,
                            scores: []
                        };
                        localStorage.setItem("retryData", JSON.stringify(retryData));
                    }
                    document.getElementById("upload").style.display = "none";
                    document.getElementById("clearFileBtn").style.display = "inline-block";
                    document.getElementById("startQuiz").style.display = "block";
                    // document.getElementById("usageGuide").classList.remove("show"); // REMOVED

                    // === LOGIC MỚI: HIỆN POPUP HỎI NGẪU NHIÊN CÂU HỎI ===
                    showQuestionCountPopup(rawQuestions.length);

                    const fileUploads = JSON.parse(sessionStorage.getItem('fileUploads')) || [];
                    fileUploads.push({
                        file: event.target.files[0].name,
                        time: new Date().toLocaleString('vi-VN')
                    });
                    sessionStorage.setItem('fileUploads', JSON.stringify(fileUploads));
                } else {
                    showPopup("⚠️ Không tìm thấy câu hỏi hợp lệ.");
                }
            }).catch(() => {
                showPopup("❌ Lỗi đọc file.");
            });
        };
        if (event.target.files.length > 0) reader.readAsArrayBuffer(event.target.files[0]);
    });
};

function parseQuestions(html) {
    const container = document.createElement("div");
    container.innerHTML = html;
    const paras = container.querySelectorAll("p");
    rawQuestions = [];
    let currentQ = null;

    function isRedOrBold(p) {
        let hasRed = false;
        let hasBold = false;
        p.querySelectorAll("*").forEach(el => {
            const style = el.getAttribute("style") || "";
            const colorRed = /color:\s*(red|#ff0000)/i.test(style);
            const tagBold = el.tagName === "B" || el.tagName === "STRONG";
            if (colorRed) hasRed = true;
            if (tagBold) hasBold = true;
        });
        return hasRed || hasBold;
    }

    paras.forEach(p => {
        const text = p.innerText.trim();
        if (/^\d+[\.\)]\s/.test(text)) {
            if (currentQ) rawQuestions.push(currentQ);
            currentQ = {
                question: text,
                options: [],
                correctIndex: null
            };
        } else if (/^[a-dA-D][\.\)]\s/.test(text) && currentQ) {
            const label = text.substring(0, 2);
            const content = text.substring(2).trim();
            const full = label + " " + content;
            const isCorrect = isRedOrBold(p);
            currentQ.options.push({
                text: full,
                isCorrect
            });
        }
    });

    if (currentQ) rawQuestions.push(currentQ);
}

/**
 * Hiển thị popup hỏi người dùng có muốn chọn ngẫu nhiên X câu hỏi không.
 * @param {number} totalQuestions Tổng số câu hỏi trong file.
 */
function showQuestionCountPopup(totalQuestions) {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    const messageDiv = document.getElementById("popupMessage");
    const buttons = document.getElementById("popupButtons");

    messageDiv.innerHTML = `
        <p class="mb-3 text-lg">Bạn đã tải thành công <strong>${totalQuestions} câu hỏi</strong>.</p>
        <p class="mb-4">Bạn có muốn chọn ngẫu nhiên một số câu hỏi để làm bài không?</p>
        <div class="flex flex-col items-center space-y-3">
            <input type="number" id="randomCountInput" min="1" max="${totalQuestions}" placeholder="Nhập số câu (tối đa ${totalQuestions})" required 
                   class="w-full sm:w-2/3 p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 text-center font-medium"/>
            <p class="text-sm text-gray-500 italic">Mặc định: 30 giây/câu</p>
        </div>
    `;

    buttons.innerHTML = "";

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "✅ Bắt đầu ngẫu nhiên";
    Object.assign(confirmBtn.style, {
        background: 'linear-gradient(to right, #f472b6, #db2777)',
        marginRight: '0.75rem'
    });
    confirmBtn.onclick = () => {
        const countInput = document.getElementById("randomCountInput");
        const count = parseInt(countInput.value);

        if (isNaN(count) || count < 1 || count > totalQuestions) {
            alert(`Vui lòng nhập số câu hợp lệ từ 1 đến ${totalQuestions}.`);
            return;
        }

        randomQuestionCount = count; // Lưu số câu ngẫu nhiên
        closePopup();
        showSettingsPopup(true, count * TIME_PER_QUESTION_SECONDS); // Chuyển sang cài đặt với thời gian tự động
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "❌ Làm tất cả câu";
    Object.assign(cancelBtn.style, {
        background: 'linear-gradient(to right, #10b981, #059669)'
    });
    cancelBtn.onclick = () => {
        randomQuestionCount = null; // Làm tất cả
        closePopup();
        showSettingsPopup(false); // Chuyển sang cài đặt bình thường
    };

    buttons.appendChild(confirmBtn);
    buttons.appendChild(cancelBtn);

    overlay.style.display = "block";
    popup.style.display = "block";
    document.querySelector(".container").classList.add("blur");
}

function showSettingsPopup(isRandomMode = false, autoTimeSeconds = 0) {
    document.getElementById("settingsPopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";

    const timeInput = document.getElementById("timeInput");
    const timeMessage = document.getElementById("timePopupMessage");

    if (isRandomMode) {
        // Tự động điền thời gian và ẩn các tùy chọn thời gian khác
        timeInput.value = Math.ceil(autoTimeSeconds / 60);
        timeInput.setAttribute('disabled', 'true');
        timeMessage.innerHTML = `
            Chế độ ngẫu nhiên (${randomQuestionCount} câu): <strong class="text-pink-600">${Math.ceil(autoTimeSeconds / 60)} phút</strong>
        `;
        document.getElementById("limitedModeBtn").style.display = 'none'; // Ẩn nút "Nhập số phút"
        document.querySelector('li:nth-child(1) button').style.display = 'none'; // Ẩn "Không giới hạn"
    } else {
        // Chế độ bình thường
        timeInput.removeAttribute('disabled');
        timeMessage.innerHTML = 'Chọn chế độ thời gian:';
        document.getElementById("limitedModeBtn").style.display = 'block';
        document.querySelector('li:nth-child(1) button').style.display = 'block';
        if (!quizStarted) {
            timeInput.value = ''; // Giữ input rỗng nếu chưa bắt đầu
            document.getElementById("scaleInput").value = '';
        }
    }
    toggleConfirmButton();
}

function applySettings() {
    const scaleInput = document.getElementById("scaleInput");
    const timeInput = document.getElementById("timeInput");

    // Kiểm tra scale
    const newScale = parseFloat(scaleInput.value);
    if (newScale < 1 || newScale > 10) {
        showPopup("Thang điểm phải từ 1 đến 10.");
        return;
    }
    scale = newScale;

    // Kiểm tra thời gian nếu không ở chế độ tự động tính (tức là input không bị disabled)
    if (!timeInput.disabled) {
        if (timeInput.value.trim() !== "") {
            const minutes = parseInt(timeInput.value);
            if (minutes < 1) {
                showPopup("Số phút phải lớn hơn hoặc bằng 1.");
                return;
            }
            timeLimitSeconds = minutes * 60;
            document.getElementById("timer-container").style.display = "block";
            document.getElementById("timer-text").style.display = "block";
        } else {
            timeLimitSeconds = null; // Free mode
            document.getElementById("timer-container").style.display = "none";
            document.getElementById("timer-text").style.display = "none";
        }
    } else {
        // Đã là chế độ tự động tính thời gian (input disabled)
        // Lấy giá trị từ input đã điền tự động
        const minutes = parseInt(timeInput.value);
        timeLimitSeconds = minutes * 60;
        document.getElementById("timer-container").style.display = "block";
        document.getElementById("timer-text").style.display = "block";
        // Bỏ disabled sau khi lấy giá trị để tránh lỗi trong các lần showSettingsPopup sau (nếu cần)
        timeInput.removeAttribute('disabled');
        document.getElementById("limitedModeBtn").style.display = 'block'; // Hiển thị lại các nút sau khi áp dụng
        document.querySelector('li:nth-child(1) button').style.display = 'block';
    }

    document.getElementById("settingsPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.querySelector(".container").classList.remove("blur");
    showFullscreenCountdown();
}

function selectTimeMode(mode) {
    const timeInput = document.getElementById("timeInput");

    if (mode === "free") {
        timeInput.value = ''; // Clear time input for free mode
        timeLimitSeconds = null; // Set to null for free mode immediately
        document.getElementById("timer-container").style.display = "none";
        document.getElementById("timer-text").style.display = "none";
        // Vẫn gọi applySettings để đảm bảo scale được lưu
        applySettings();
    }
    // Đối với chế độ có giới hạn, người dùng sẽ nhập vào ô input và nhấn Xác nhận
}

function showFullscreenCountdown() {
    const countdown = document.createElement("div");
    countdown.id = "fullscreenCountdown";
    Object.assign(countdown.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') no-repeat center center fixed`,
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "8rem",
        fontWeight: "bold",
        color: "#f0f4f8",
        zIndex: "100000",
        textShadow: "0 0 30px rgba(0, 0, 0, 0.6)"
    });
    document.body.appendChild(countdown);

    let count = 4;
    countdown.textContent = count;
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count;
        } else {
            clearInterval(interval);
            countdown.remove();
            startQuiz();
        }
    }, 1000);
}

function startQuiz() {
    quizStarted = true;

    let questionsToUse = [...rawQuestions]; // Tạo bản sao để tránh thay đổi rawQuestions gốc

    if (randomQuestionCount !== null) {
        // Thực hiện ngẫu nhiên câu hỏi
        shuffleArray(questionsToUse);
        questionsToUse = questionsToUse.slice(0, randomQuestionCount);
        // Cập nhật lại rawQuestions để chỉ bao gồm các câu hỏi ngẫu nhiên được chọn
        rawQuestions = questionsToUse;
        randomQuestionCount = null; // Đặt lại sau khi đã chọn
    } else {
        // Nếu không ngẫu nhiên, vẫn xáo trộn thứ tự
        shuffleArray(rawQuestions);
    }

    rawQuestions.forEach(q => {
        shuffleArray(q.options);
        q.correctIndex = q.options.findIndex(opt => opt.isCorrect);
    });
    document.getElementById("startQuiz").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";
    document.getElementById("countdown").style.display = "none";
    document.getElementById("progressBar").classList.add("show");
    userAnswers = [];
    current = 0;
    totalSeconds = 0;
    startTimer();
    showQuestion();
    document.getElementById("extraButtons").style.display = "none";
}

function showQuestion() {
    const q = rawQuestions[current];
    const questionText = document.getElementById("questionText");
    const optContainer = document.getElementById("optionsContainer");

    questionText.innerHTML = `<h3 class="text-xl font-semibold" style="-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;">${q.question}</h3>`;
    optContainer.innerHTML = "";
    q.options.forEach((opt, idx) => {
        optContainer.innerHTML += `<label style="-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;"><input type="radio" name="option" value="${idx}" class="mr-2"> ${opt.text}</label>`;
    });

    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            nextQuestion();
        });
    });

    updateProgress();
}

function nextQuestion() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
        showPopup("Bạn phải chọn một đáp án.");
        return;
    }
    userAnswers.push(parseInt(selected.value));
    current++;
    if (current < rawQuestions.length) {
        showQuestion();
    } else {
        stopTimer();
        submitQuiz(); // Automatically submit if all questions are answered
    }
}

function updateProgress() {
    document.getElementById("progressBar").textContent = `${current} / ${rawQuestions.length} câu đã làm`;
}
function showResult() {
    quizStarted = false;
    let correct = 0;
    const wrongAnswers = [];
    const correctAnswers = [];

    rawQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.correctIndex) {
            correct++;
            correctAnswers.push({
                question: q.question,
                selected: q.options[userAnswers[i]].text,
                correct: q.options[q.correctIndex].text
            });
        } else {
            wrongAnswers.push({
                question: q.question,
                selected: q.options[userAnswers[i]]?.text || "Không chọn",
                correct: q.options[q.correctIndex]?.text || "Không xác định"
            });
        }
    });

    const score = ((correct / rawQuestions.length) * scale).toFixed(2);
    localStorage.setItem("quizScore", score);
    localStorage.setItem("quizCorrect", correct);
    localStorage.setItem("quizTotal", rawQuestions.length);
    localStorage.setItem("quizTime", formatTime(totalSeconds));
    localStorage.setItem("quizWrongAnswers", JSON.stringify(wrongAnswers));
    localStorage.setItem("quizCorrectAnswers", JSON.stringify(correctAnswers));
    localStorage.setItem("quizScale", scale);

    // Đảm bảo dòng này được đặt TRƯỚC khi chuyển hướng
    // `userAnswers.filter(answer => answer !== undefined && answer !== null).length`
    // sẽ đếm số câu người dùng đã thực sự trả lời.
    localStorage.setItem("quizAnsweredCount", userAnswers.filter(answer => answer !== undefined && answer !== null).length); //

    userAnswers = [];
    current = 0;
    totalSeconds = 0;
    violationCount = 0;
    sessionStorage.removeItem('violations');

    document.getElementById("extraButtons").style.display = "flex";
    window.location.href = "ketqua.html"; //
}

function restartQuiz() {
    document.getElementById("result").innerHTML = "";
    document.getElementById("quizContainer").style.display = "block";

    const savedQuestions = localStorage.getItem("quizQuestions");
    if (savedQuestions) {
        rawQuestions = JSON.parse(savedQuestions);
    }

    if (rawQuestions.length > 0) {
        shuffleArray(rawQuestions);
        rawQuestions.forEach(q => {
            shuffleArray(q.options);
            q.correctIndex = q.options.findIndex(opt => opt.isCorrect);
        });
    } else {
        showPopup("Không tìm thấy dữ liệu câu hỏi để làm lại. Vui lòng tải file mới.");
        return;
    }

    userAnswers = [];
    current = 0;
    totalSeconds = 0;
    violationCount = 0;
    sessionStorage.removeItem('violations');
    quizStarted = true;
    startTimer();
    showQuestion();
    document.getElementById("extraButtons").style.display = "none";
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer() {
    const timerProgress = document.getElementById("timer-progress");
    const timerText = document.getElementById("timer-text");
    const initialTimeLimit = timeLimitSeconds;

    timerInterval = setInterval(() => {
        if (timeLimitSeconds !== null) {
            timeLimitSeconds--;
            totalSeconds++;
            document.getElementById("timer").textContent = `⏱️ Thời gian còn lại: ${formatTime(timeLimitSeconds)}`;
            const percentage = (timeLimitSeconds / initialTimeLimit) * 100;
            timerProgress.style.width = `${percentage}%`;

            if (timeLimitSeconds <= 60) {
                document.getElementById("timer").classList.add("critical");
                document.getElementById("timer").classList.remove("warning");
                timerProgress.classList.add("danger");
                timerProgress.classList.remove("warning");
                if (timeLimitSeconds === 0) {
                    stopTimer();
                    submitQuiz();
                }
            } else if (timeLimitSeconds <= 300) {
                document.getElementById("timer").classList.add("warning");
                document.getElementById("timer").classList.remove("critical");
                timerProgress.classList.add("warning");
                timerProgress.classList.remove("danger");
            } else {
                document.getElementById("timer").classList.remove("warning", "critical");
                timerProgress.classList.remove("warning", "danger");
            }
        } else {
            totalSeconds++;
            document.getElementById("timer").textContent = `⏱️ Thời gian: ${formatTime(totalSeconds)}`;
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = '';
    document.getElementById("timer").classList.remove("warning", "critical");
    document.getElementById("timer-container").style.display = "none";
    document.getElementById("timer-text").style.display = "none";
}

function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

let violations = JSON.parse(sessionStorage.getItem('violations')) || [];
let violationCount = violations.length;

function showViolationWarning(message, backgroundColor, duration, callback) {
    const warning = document.createElement("div");
    warning.className = "violation-warning";
    warning.style.backgroundColor = backgroundColor;
    warning.textContent = message;
    document.body.appendChild(warning);
    setTimeout(() => {
        warning.remove();
        if (callback) callback();
    }, duration);
}

function recordViolation(action) {
    if (!quizStarted) return;
    const now = new Date().toLocaleString('vi-VN');
    violationCount++;
    let message;

    if (violationCount === 1) {
        message = `Vi phạm lần 1: ${action}. Ôi trời, định "chơi chiêu" hả? 😏 Làm bài tử tế đi nha!`;
        showViolationWarning(message, '#34d399', 3000);
    } else if (violationCount === 2) {
        message = `Vi phạm lần 2: ${action}. Lại nữa hả? 😒 Coi chừng lần sau nha!`;
        showViolationWarning(message, '#ef4444', 3000);
    } else if (violationCount >= 3) {
        message = `Vi phạm lần 3: ${action}. Thôi đủ rồi nha! 😤 Bài thi tự động nộp, mời bạn ra ngoài!`;
        localStorage.setItem('quizViolation', action);
        violations.push({
            message: `Vi phạm: ${action}`,
            time: now
        });
        sessionStorage.setItem('violations', JSON.stringify(violations));
        showViolationWarning(message, '#ef4444', 3000, () => {
            submitQuiz();
        });
        return;
    }

    violations.push({
        message: `Vi phạm: ${action}`,
        time: now
    });
    sessionStorage.setItem('violations', JSON.stringify(violations));
}

document.addEventListener("visibilitychange", () => {
    if (quizStarted && document.hidden) {
        recordViolation("Chuyển tab hoặc ẩn trình duyệt");
    }
});

window.addEventListener("resize", () => {
    if (quizStarted && window.outerWidth < 800) {
        recordViolation("Thu nhỏ trình duyệt");
    }
});

const violation = localStorage.getItem("quizViolation");
if (violation) {
    const message = document.createElement("div");
    message.className = "text-center text-red-600 text-xl font-semibold mb-4";
    message.innerHTML = `🚫 Bài làm kết thúc do <strong>${violation}</strong>`;
    document.querySelector(".container").prepend(message);
    localStorage.removeItem("quizViolation");
}

function showPopup(message, confirm = false, onOkCallback = closePopup) {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    const messageDiv = document.getElementById("popupMessage");
    const buttons = document.getElementById("popupButtons");

    messageDiv.innerHTML = message; // Changed to innerHTML to allow HTML content
    overlay.style.display = "block"; // Ensure overlay is shown for generic popups
    popup.style.display = "block";
    document.querySelector(".container").classList.add("blur"); // Blur background
    buttons.innerHTML = "";

    if (confirm) {
        const yesBtn = document.createElement("button");
        yesBtn.textContent = "Có";
        yesBtn.onclick = () => {
            closePopup();
            restartQuiz();
        };
        const noBtn = document.createElement("button");
        noBtn.textContent = "Không";
        noBtn.onclick = closePopup;
        buttons.appendChild(yesBtn);
        buttons.appendChild(noBtn);
    } else {
        const okBtn = document.createElement("button");
        okBtn.textContent = "OK";
        okBtn.onclick = () => {
            closePopup();
            onOkCallback();
        };
        buttons.appendChild(okBtn);
    }
}
function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("settingsPopup").style.display = "none"; // Close settings popup as well
    document.getElementById("overlay").style.display = "none";
    document.querySelector(".container").classList.remove("blur");
}

function prevQuestion() {
    if (current === 0) {
        showPopup("Bạn đang ở câu đầu tiên.");
        return;
    }
    current--;
    userAnswers.pop();
    showQuestion();
}

function clearFile() {
    clearQuizState();
}

function clearQuizState() {
    document.getElementById("upload").value = "";
    rawQuestions = [];
    userAnswers = [];
    current = 0;
    scale = 10;
    timeLimitSeconds = null;
    violationCount = 0;
    const fileName = localStorage.getItem("currentFileName");
    if (fileName) {
        let retryData = JSON.parse(localStorage.getItem("retryData")) || {};
        delete retryData[fileName];
        localStorage.setItem("retryData", JSON.stringify(retryData));
    }
    localStorage.removeItem("quizQuestions");
    localStorage.removeItem("currentFileName");
    sessionStorage.removeItem("violations");
    sessionStorage.removeItem("fileUploads");
    document.getElementById("startQuiz").style.display = "none";
    document.getElementById("quizContainer").style.display = "none";
    document.getElementById("progressBar").classList.remove("show");
    document.getElementById("progressBar").textContent = "0 / 0 câu đã làm";
    document.getElementById("timer").textContent = '';
    stopTimer();
    document.getElementById("upload").style.display = "block";
    document.getElementById("clearFileBtn").style.display = "none";
    document.getElementById("extraButtons").style.display = "flex";
    // document.getElementById("usageGuide").classList.add("show"); // REMOVED
    closePopup(); // Ensure all popups are closed
}

function submitQuiz() {
    const selected = document.querySelector('input[name="option"]:checked');
    if (selected) userAnswers[current] = parseInt(selected.value); // Store current answer before submitting

    // Fill in any unanswered questions with null
    for (let i = userAnswers.length; i < rawQuestions.length; i++) {
        userAnswers.push(null);
    }

    stopTimer();
    showResult();
}
function toggleConfirmButton() {
    const timeInput = document.getElementById("timeInput");
    const confirmBtn = document.getElementById("confirmSettingsBtn");
    const scaleInput = document.getElementById("scaleInput");

    const isScaleInputValid = scaleInput.value.trim() !== "" && !isNaN(scaleInput.value) && parseFloat(scaleInput.value) >= 1 && parseFloat(scaleInput.value) <= 10;
    const isTimeInputValid = timeInput.value.trim() !== "" && !isNaN(timeInput.value) && parseInt(timeInput.value) >= 1;

    // Kích hoạt khi: (Scale hợp lệ) VÀ [ (Time input bị disabled) HOẶC (Time input rỗng) HOẶC (Time input hợp lệ) ]
    confirmBtn.disabled = !(isScaleInputValid && (timeInput.disabled || timeInput.value.trim() === "" || isTimeInputValid));
}
document.addEventListener("DOMContentLoaded", () => {
    const isRestart = localStorage.getItem("restartQuiz") === "true";
    if (isRestart) {
        const savedQuestions = JSON.parse(localStorage.getItem("quizQuestions"));
        if (savedQuestions && savedQuestions.length > 0) {
            showSettingsPopup(); // Show settings for restart
        } else {
            alert("Không tìm thấy dữ liệu bài làm trước.");
        }
        localStorage.removeItem("restartQuiz");
    }
});
// Xử lý sự kiện chuột rời khỏi vùng làm bài
let mouseLeaveTimeout = null;

document.addEventListener('mousemove', function (e) {
    if (quizStarted) {
        const container = document.querySelector('.container');
        const rect = container.getBoundingClientRect();

        // Kiểm tra nếu chuột nằm ngoài vùng .container trong tài liệu hiện tại
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            if (!mouseLeaveTimeout) {
                mouseLeaveTimeout = setTimeout(() => {
                    recordViolation("Chuột rời khỏi vùng làm bài");
                    mouseLeaveTimeout = null;
                }, 500); // Thay bằng 500ms để phản hồi nhanh hơn
            }
        } else {
            if (mouseLeaveTimeout) {
                clearTimeout(mouseLeaveTimeout);
                mouseLeaveTimeout = null;
            }
        }
    }
});

// Loại bỏ các sự kiện không cần thiết liên quan đến tab hoặc resize
// document.removeEventListener('visibilitychange', function() {}); // Keep this for violation tracking
// window.removeEventListener('resize', function() {}); // Keep this for violation tracking
window.removeEventListener('blur', function () { }); // Keep this for tab switching violation

window.addEventListener('beforeunload', function (e) {
    if (quizStarted) {
        document.getElementById("upload").value = "";
        rawQuestions = [];
        userAnswers = [];
        current = 0;
        timeLimitSeconds = null;
        violationCount = 0;
        localStorage.clear();
        sessionStorage.clear();
    }
});

function showUsageGuidePopup() {
    const usageGuideContent = `
<div class="text-center">
<h3 class="text-xl font-bold mb-4 text-gray-800">📘 Hướng dẫn sử dụng</h3>
 <ul class="list-disc pl-5 text-left text-gray-700 space-y-2 inline-block text-start">
<li><strong>✨ Định dạng file:</strong> Đáp án đúng cần <strong>in đậm</strong> trong file Word (.docx).</li>
<li><strong>❓ Định dạng câu hỏi:</strong> Bắt đầu bằng số (ví dụ: <code>1.</code> hoặc <code>1)</code>).</li>
 <li><strong>✅ Định dạng đáp án:</strong> Bắt đầu bằng chữ cái (ví dụ: <code>a.</code>, <code>a)</code>, <code>A.</code>, hoặc <code>A)</code>).</li>
<li><strong>⚙️ Chuẩn hóa:</strong> Nếu file của bạn không đúng định dạng, hãy nhấn nút "Chuẩn hóa câu hỏi".</li>
 <li><strong>📊 Cài đặt bài thi:</strong> Sau khi tải file, bạn có thể chọn thang điểm và thời gian.</li>
<li><strong>🚀 Bắt đầu:</strong> Nhấn "Xác nhận" để bắt đầu bài thi.</li>
<li><strong>💡 Mẹo:</strong> Thanh thời gian sẽ chuyển màu khi gần hết giờ.</li>
<li><strong>🚫 Chống gian lận:</strong> Hệ thống có thể tự động nộp bài nếu phát hiện gian lận.</li>
</ul>
</div>
 `;
    showPopup(usageGuideContent, false);
}
