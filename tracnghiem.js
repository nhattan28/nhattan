// =================================================================================
// SECTION: STATE VARIABLES & CONSTANTS
// =================================================================================
let rawQuestions = [];
let questions = [];
let userAnswers = [];
let current = 0;
let quizStarted = false;
let scale = 10;
let quizMode = 'test';
let helpCount = 3;
let timerInterval = null;
let timeLimitSeconds = null;
let violationCount = 0;
let navCurrentPage = 0;
const NAV_PAGE_SIZE = 20;

const confetti = new ConfettiGenerator({ target: 'confetti' });

// =================================================================================
// SECTION: INITIALIZATION
// =================================================================================

window.onload = function () {
    setupTheme();
    document.addEventListener('keydown', handleArrowKeys);
    const quizAction = localStorage.getItem("quizAction");
    if (quizAction) {
        localStorage.removeItem("quizAction");
        rawQuestions = JSON.parse(localStorage.getItem("quizQuestions") || "[]");
        if (rawQuestions.length > 0) {
            document.getElementById("upload").style.display = "none";
            document.getElementById("fileLoadedActions").style.display = "block";
            document.getElementById("extraButtonsWrapper").style.display = "none";
            if (quizAction === 'practiceWrong') {
                const wrongIndices = JSON.parse(localStorage.getItem('wrongAnswerIndices')) || [];
                if (wrongIndices.length > 0) {
                    handleStart({ mode: 'practice', isPracticingWrong: true, scale: 10, timeLimit: null });
                } else {
                    showPopup({ icon: 'ℹ️', message: "Bạn không có câu sai nào để ôn tập." });
                }
            } else if (quizAction === 'restart') {
                showSettingsPopup('test');
            }
            return;
        }
    }
    const fileName = localStorage.getItem("currentFileName");
    if (fileName && localStorage.getItem("quizQuestions")) {
        rawQuestions = JSON.parse(localStorage.getItem("quizQuestions"));
        if (rawQuestions.length > 0) {
            document.getElementById("upload").style.display = "none";
            document.getElementById("fileLoadedActions").style.display = "block";
            document.getElementById("extraButtonsWrapper").style.display = "none";
        }
    } else { resetUI(); }
    document.getElementById("upload").addEventListener("change", handleFileUpload);
    document.getElementById('nav-arrow-left').addEventListener('click', () => changeNavPage(-1));
    document.getElementById('nav-arrow-right').addEventListener('click', () => changeNavPage(1));
};

// =================================================================================
// SECTION: FILE HANDLING & PARSING
// =================================================================================
function handleFileUpload(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    showLoader();
    reader.onload = function () {
        mammoth.convertToHtml({ arrayBuffer: reader.result })
            .then(result => {
                parseQuestions(result.value);
                if (rawQuestions.length > 0) {
                    localStorage.setItem("quizQuestions", JSON.stringify(rawQuestions));
                    localStorage.setItem("currentFileName", file.name);
                    resetUI();
                    document.getElementById("upload").style.display = "none";
                    document.getElementById("fileLoadedActions").style.display = "block";
                    document.getElementById("extraButtonsWrapper").style.display = "none";
                } else { showPopup({ icon: '⚠️', message: "Không tìm thấy câu hỏi hợp lệ." }); }
            }).catch(() => showPopup({ icon: '❌', message: "Lỗi đọc file." }))
            .finally(hideLoader);
    };
    reader.readAsArrayBuffer(file);
}

function parseQuestions(html) {
    const container = document.createElement("div"); container.innerHTML = html;
    rawQuestions = []; let currentQ = null;
    container.querySelectorAll("p").forEach(p => {
        const text = p.innerText.trim();
        if (/^\d+[\.\)]\s/.test(text)) {
            if (currentQ) rawQuestions.push(currentQ);
            currentQ = { question: text, options: [], isFlagged: false, type: 'single' };
            if (text.toLowerCase().includes('(nhiều đáp án)')) { currentQ.type = 'multiple'; }
            else if (text.includes('[') && text.includes(']')) {
                currentQ.type = 'fill'; const match = text.match(/\[(.*?)\]/);
                if (match) currentQ.correctAnswerText = match[1];
                currentQ.question = text.replace(/\[.*?\]/, '______');
            }
        } else if (/^[a-dA-D][\.\)]\s/.test(text) && currentQ && currentQ.type !== 'fill') {
            currentQ.options.push({ text: text, isCorrect: p.querySelector("strong, b") !== null });
        }
    });
    if (currentQ) rawQuestions.push(currentQ);
}

// =================================================================================
// SECTION: CORE QUIZ LOGIC
// =================================================================================
function startQuiz(settings) {
    quizStarted = true; violationCount = 0;
    if (settings.mode === 'test') { setupAntiCheatListeners(true); }
    quizMode = settings.mode; scale = settings.scale; timeLimitSeconds = settings.timeLimit;
    const wrongIndices = JSON.parse(localStorage.getItem('wrongAnswerIndices')) || [];
    let tempQuestions = settings.isPracticingWrong ? wrongIndices.map(index => rawQuestions.find((q, i) => i === index)).filter(Boolean) : [...rawQuestions];
    if (!settings.isPracticingWrong) { shuffleArray(tempQuestions); }
    questions = (settings.randomCount && !settings.isPracticingWrong) ? tempQuestions.slice(0, settings.randomCount) : tempQuestions;
    questions.forEach(q => {
        if (q.options) {
            shuffleArray(q.options);
            if (q.type === 'multiple') { q.correctAnswers = []; q.options.forEach((opt, index) => { if (opt.isCorrect) q.correctAnswers.push(index); }); }
            else if (q.type === 'single') { q.correctAnswer = q.options.findIndex(opt => opt.isCorrect); }
        }
    });
    userAnswers = new Array(questions.length).fill(undefined);
    current = 0; helpCount = 3; navCurrentPage = 0;
    document.getElementById("fileLoadedActions").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";
    document.getElementById("progressBar").style.display = "block";
    document.getElementById("question-nav-wrapper").style.display = "flex";
    if (quizMode === 'practice') {
        document.getElementById("helpBtn").style.display = "inline-block";
        document.getElementById("helpCount").textContent = helpCount;
        document.getElementById("helpBtn").disabled = false;
    } else { document.getElementById("helpBtn").style.display = "none"; }
    renderNavPanel(); showQuestion(); startTimer();
}

function showQuestion() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.classList.add('fade-out');
    setTimeout(() => {
        const q = questions[current];
        document.getElementById("questionText").innerHTML = `<h3 class="text-xl font-semibold">${q.question}</h3>`;
        const optContainer = document.getElementById("optionsContainer");
        optContainer.innerHTML = "";
        const currentAnswers = userAnswers[current];
        if (q.type === 'fill') {
            const userAnswer = currentAnswers || "";
            optContainer.innerHTML = `<input type="text" id="fillAnswer" class="w-full p-2 border rounded text-black" placeholder="Nhập câu trả lời..." value="${userAnswer}">`;
            document.getElementById('fillAnswer').oninput = (e) => { userAnswers[current] = e.target.value; updateUI(); };
        } else {
            const inputType = q.type === 'multiple' ? 'checkbox' : 'radio';
            q.options.forEach((opt, idx) => {
                if (!opt) return;
                let isChecked = false;
                if (inputType === 'radio' && currentAnswers === idx) isChecked = true;
                else if (inputType === 'checkbox' && Array.isArray(currentAnswers) && currentAnswers.includes(idx)) isChecked = true;
                const label = document.createElement('label');
                label.innerHTML = `<input type="${inputType}" name="option" value="${idx}" class="mr-2" ${isChecked ? 'checked' : ''}> ${opt.text}`;
                optContainer.appendChild(label);
            });
            optContainer.querySelectorAll('input').forEach(input => input.addEventListener('change', handleOptionSelect));
        }
        updateUI();
        quizContainer.classList.remove('fade-out');
    }, 200);
}

function handleOptionSelect() {
    const q = questions[current];
    if (q.type === 'multiple') { let selected = []; document.querySelectorAll('input[name="option"]:checked').forEach(cb => selected.push(parseInt(cb.value))); userAnswers[current] = selected; }
    else { const selected = document.querySelector('input[name="option"]:checked'); userAnswers[current] = selected ? parseInt(selected.value) : undefined; }
    if (quizMode === 'practice' && q.type !== 'fill') {
        document.querySelectorAll('#optionsContainer label').forEach(label => label.classList.add('disabled'));
        const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswer];
        correctAnswers.forEach(ans => { const el = document.querySelector(`input[value="${ans}"]`); if (el) el.parentElement.classList.add('correct'); });
        const userAns = Array.isArray(userAnswers[current]) ? userAnswers[current] : [userAnswers[current]];
        userAns.forEach(ans => { if (!correctAnswers.includes(ans)) { const el = document.querySelector(`input[value="${ans}"]`); if (el) el.parentElement.classList.add('wrong'); } });
    }
    updateUI();
    if (current === questions.length - 1 && quizMode === 'practice') { setTimeout(() => submitQuiz(), 500); }
}

function submitQuiz() {
    if (!quizStarted) return;

    showLoader();

    setTimeout(() => {
        quizStarted = false; setupAntiCheatListeners(false); stopTimer();
        let correctCount = 0; const wrongAnswerDetails = []; const correctAnswerDetails = [];
        questions.forEach((q, indexInQuiz) => {
            const userAnswer = userAnswers[indexInQuiz]; let isCorrect = false;
            if (q.type === 'single') isCorrect = userAnswer === q.correctAnswer;
            else if (q.type === 'multiple') { const correctSet = new Set(q.correctAnswers); const userSet = new Set(userAnswer || []); isCorrect = correctSet.size === userSet.size && [...correctSet].every(item => userSet.has(item)); }
            else if (q.type === 'fill') isCorrect = typeof userAnswer === 'string' && userAnswer.trim().toLowerCase() === q.correctAnswerText.toLowerCase();
            let selectedText = "Chưa trả lời"; let correctText = "";
            if (q.type === 'fill') { correctText = q.correctAnswerText; if (userAnswer !== undefined) selectedText = userAnswer; }
            else {
                correctText = (Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswer]).map(i => q.options[i]?.text).filter(Boolean).join(', ');
                if (userAnswer !== undefined) selectedText = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).map(i => q.options[i]?.text).filter(Boolean).join(', ');
            }
            if (isCorrect) { correctCount++; correctAnswerDetails.push({ question: q.question, selected: selectedText, correct: correctText }); }
            else { wrongAnswerDetails.push({ question: q.question, selected: selectedText, correct: correctText }); }
        });
        const score = questions.length > 0 ? ((correctCount / questions.length) * scale).toFixed(2) : 0;
        localStorage.setItem("quizScore", score); localStorage.setItem("quizCorrect", correctCount);
        localStorage.setItem("quizTotal", questions.length); localStorage.setItem("quizViolations", violationCount);
        localStorage.setItem("quizWrongAnswers", JSON.stringify(wrongAnswerDetails));
        localStorage.setItem("quizCorrectAnswers", JSON.stringify(correctAnswerDetails));
        localStorage.setItem("questionsInQuiz", JSON.stringify(questions));
        localStorage.setItem("userAnswersInQuiz", JSON.stringify(userAnswers));
        const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
        history.push({ fileName: localStorage.getItem("currentFileName") || "Bài thi", score, scale, correctCount, total: questions.length, date: new Date().toLocaleString('vi-VN') });
        localStorage.setItem('quizHistory', JSON.stringify(history));
        confetti.render();
        setTimeout(() => window.location.href = "ketqua.html", 1500);
    }, 50);
}


// =================================================================================
// SECTION: UI, POPUPS & FEATURES
// =================================================================================
function showSettingsPopup(mode) {
    const wrongIndices = JSON.parse(localStorage.getItem('wrongAnswerIndices')) || [];
    const practiceWrongOption = wrongIndices.length > 0 ? `<button class="popup-btn-confirm w-full mb-4" onclick="handleStart({ mode: 'practice', isPracticingWrong: true, scale: 10, timeLimit: null })">🔄 Ôn lại ${wrongIndices.length} câu sai</button>` : '';
    showPopup({
        icon: '💡',
        message: `<div class="text-left space-y-4">
            ${practiceWrongOption}
            <div><p class="font-semibold">Thời gian (phút, để trống để không giới hạn):</p><input type="number" id="timeInput" min="1" placeholder="Ví dụ: 15" class="w-full p-2 border rounded text-black" /></div>
            <div><p class="font-semibold">Số câu hỏi (để trống để làm tất cả):</p><input type="number" id="randomCountInput" min="1" max="${rawQuestions.length}" placeholder="Tối đa ${rawQuestions.length}" class="w-full p-2 border rounded text-black" /></div>
            <div><p class="font-semibold">Thang điểm:</p><input type="number" id="scaleInput" value="10" min="1" max="10" step="0.1" class="w-full p-2 border rounded text-black" /></div>
        </div>`,
        buttons: [{
            text: "Bắt đầu", cssClass: "popup-btn-confirm",
            action: () => {
                const settings = {
                    mode: mode, isPracticingWrong: false,
                    randomCount: document.getElementById("randomCountInput").value ? parseInt(document.getElementById("randomCountInput").value) : null,
                    scale: parseFloat(document.getElementById("scaleInput").value) || 10,
                    timeLimit: document.getElementById("timeInput").value ? parseInt(document.getElementById("timeInput").value) * 60 : null
                };
                handleStart(settings);
            }
        }]
    });
}

function handleStart(settings) {
    closeAllPopups();
    showLoader();
    setTimeout(() => {
        startQuiz(settings);
        hideLoader();
    }, 50);
}

function showPopup({ icon, message, buttons = [{ text: "OK", cssClass: "popup-btn-confirm", action: () => { } }] }) {
    document.getElementById("popupIcon").textContent = icon || '';
    document.getElementById("popupMessage").innerHTML = message;
    const buttonsContainer = document.getElementById("popupButtons");
    buttonsContainer.innerHTML = "";
    buttons.forEach(btnInfo => {
        const button = document.createElement("button");
        button.textContent = btnInfo.text;
        button.className = btnInfo.cssClass || 'popup-btn-confirm';
        button.onclick = () => { closeAllPopups(); setTimeout(btnInfo.action, 10); };
        buttonsContainer.appendChild(button);
    });
    document.addEventListener('keydown', handleEscKey);
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";
}

function closeAllPopups() {
    document.removeEventListener('keydown', handleEscKey);
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
}

function handleEscKey(event) { if (event.key === "Escape") { closeAllPopups(); } }
function renderNavPanel() { const navContainer = document.getElementById("question-nav-container"); navContainer.innerHTML = ""; const totalPages = Math.ceil(questions.length / NAV_PAGE_SIZE); const start = navCurrentPage * NAV_PAGE_SIZE; const end = Math.min(start + NAV_PAGE_SIZE, questions.length); for (let i = start; i < end; i++) { const btn = document.createElement("div"); btn.className = "question-nav-button"; btn.textContent = i + 1; btn.onclick = () => jumpToQuestion(i); navContainer.appendChild(btn); } document.getElementById('nav-arrow-left').style.visibility = navCurrentPage > 0 ? 'visible' : 'hidden'; document.getElementById('nav-arrow-right').style.visibility = navCurrentPage < totalPages - 1 ? 'visible' : 'hidden'; updateNavPanelHighlights(); }
function updateNavPanelHighlights() { document.querySelectorAll(".question-nav-button").forEach(btn => { const index = parseInt(btn.textContent) - 1; btn.className = "question-nav-button"; const answer = userAnswers[index]; if (answer !== undefined && answer !== null && (Array.isArray(answer) ? answer.length > 0 : String(answer).length > 0)) { btn.classList.add("answered"); } if (questions[index]?.isFlagged) { btn.classList.add("flagged"); } if (index === current) { btn.classList.add("current"); } }); }
function changeNavPage(direction) { const totalPages = Math.ceil(questions.length / NAV_PAGE_SIZE); const newPage = navCurrentPage + direction; if (newPage >= 0 && newPage < totalPages) { navCurrentPage = newPage; renderNavPanel(); } }
function nextQuestion() { if (current < questions.length - 1) { jumpToQuestion(current + 1); } }
function prevQuestion() { if (current > 0) { jumpToQuestion(current - 1); } }
function jumpToQuestion(index) { if (index >= 0 && index < questions.length) { current = index; const newPage = Math.floor(index / NAV_PAGE_SIZE); if (newPage !== navCurrentPage) { navCurrentPage = newPage; renderNavPanel(); } else { updateNavPanelHighlights(); } showQuestion(); } }
function updateUI() { updateProgress(); updateNavPanelHighlights(); updateFlagButton(); document.getElementById('prevBtn').disabled = current === 0; document.getElementById('nextBtn').disabled = current === questions.length - 1; }
function updateProgress() { const answeredCount = userAnswers.filter(a => a !== undefined && a !== null && (Array.isArray(a) ? a.length > 0 : true)).length; document.getElementById("progressBar").textContent = `Đã làm: ${answeredCount} / ${questions.length}`; }
function toggleFlag() { questions[current].isFlagged = !questions[current].isFlagged; updateUI(); }
function updateFlagButton() { const flagBtn = document.getElementById("flagBtn"); if (questions[current].isFlagged) { flagBtn.textContent = "🚩 Bỏ đánh dấu"; flagBtn.style.background = "#f59e0b"; } else { flagBtn.textContent = "🚩 Đánh dấu"; flagBtn.style.background = ""; } }
function useHelp() { if (helpCount > 0 && userAnswers[current] === undefined && questions[current].type === 'single') { helpCount--; document.getElementById("helpCount").textContent = helpCount; const correctIndex = questions[current].correctAnswer; let wrongOptions = []; questions[current].options.forEach((_, idx) => { if (idx !== correctIndex) wrongOptions.push(idx); }); shuffleArray(wrongOptions); const optionsToHide = wrongOptions.slice(0, 2); document.querySelectorAll('#optionsContainer input').forEach(radio => { if (optionsToHide.includes(parseInt(radio.value))) { radio.parentElement.style.display = 'none'; } }); if (helpCount === 0) document.getElementById("helpBtn").disabled = true; } }
function showHistory() { const history = JSON.parse(localStorage.getItem('quizHistory')) || []; if (history.length === 0) return showPopup({ icon: '📜', message: "Chưa có lịch sử làm bài." }); const historyHtml = `<div class="text-left max-h-96 overflow-y-auto">${history.reverse().map(item => `<div class="p-2 border-b"><p><strong>${item.fileName}</strong> - ${item.date}</p><p>Điểm: <strong>${item.score}/${item.scale}</strong> | Đúng: ${item.correctCount}/${item.total}</p></div>`).join('')}</div>`; showPopup({ icon: '📜', message: historyHtml, buttons: [{ text: "Xóa tất cả", cssClass: "popup-btn-cancel", action: confirmClearHistory }, { text: "Đóng", cssClass: "popup-btn-confirm", action: () => { } }] }); }
function confirmClearHistory() { showPopup({ icon: '🗑️', message: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử làm bài không?', buttons: [{ text: "Hủy", cssClass: "popup-btn-cancel", action: () => { } }, { text: "Xác nhận xóa", cssClass: "popup-btn-confirm", action: () => { localStorage.removeItem('quizHistory'); showPopup({ icon: '✅', message: 'Đã xóa toàn bộ lịch sử.' }); } }] }); }

// =================================================================================
// SECTION: TIMER & ANTI-CHEAT
// =================================================================================
function startTimer() { if (timerInterval) clearInterval(timerInterval); if (!timeLimitSeconds) return; let secondsRemaining = timeLimitSeconds; const timerDisplay = document.getElementById('timerDisplay'); timerDisplay.style.display = 'block'; const updateTimer = () => { const minutes = Math.floor(secondsRemaining / 60); const seconds = secondsRemaining % 60; timerDisplay.textContent = `Thời gian: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; if (secondsRemaining < 0) { stopTimer(); submitQuiz(); } secondsRemaining--; }; updateTimer(); timerInterval = setInterval(updateTimer, 1000); }
function stopTimer() { clearInterval(timerInterval); const timerDisplay = document.getElementById('timerDisplay'); if (timerDisplay) timerDisplay.style.display = 'none'; }
function handleViolation(reason) { if (!quizStarted) return; violationCount++; if (violationCount === 1) { showPopup({ icon: '⚠️', message: `Cảnh cáo lần 1: Phát hiện hành vi ${reason}.` }); } else if (violationCount === 2) { const flash = document.getElementById('red-flash-overlay'); flash.style.display = 'block'; setTimeout(() => { flash.style.display = 'none'; }, 5000); } else if (violationCount >= 3) { submitQuiz(); } }
const antiCheatHandlers = { blur: () => handleViolation('rời khỏi màn hình thi'), visibilitychange: () => { if (document.hidden) handleViolation('chuyển tab'); }, contextmenu: (e) => { e.preventDefault(); handleViolation('sử dụng chuột phải'); }, copy: (e) => { e.preventDefault(); handleViolation('sao chép nội dung'); }, selectstart: (e) => e.preventDefault(), mouseleave: () => handleViolation('di chuyển chuột ra ngoài'), keydown: (e) => { if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || (e.ctrlKey && e.key.toUpperCase() === 'U')) { e.preventDefault(); handleViolation('mở công cụ cho nhà phát triển'); } } };
function setupAntiCheatListeners(enable) { const action = enable ? 'addEventListener' : 'removeEventListener'; for (const event in antiCheatHandlers) { const target = (event === 'mouseleave' || event === 'blur') ? window : document; target[action](event, antiCheatHandlers[event]); } }

// =================================================================================
// SECTION: UTILITIES
// =================================================================================
function handleArrowKeys(e) { if (!quizStarted) return; if (e.key === 'ArrowLeft') { e.preventDefault(); prevQuestion(); } else if (e.key === 'ArrowRight') { e.preventDefault(); nextQuestion(); } }
function shuffleArray(array) { if (!Array.isArray(array)) return; for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }

function clearFile() {
    // Chỉ xóa file, không xóa lịch sử
    localStorage.removeItem("quizQuestions");
    localStorage.removeItem("currentFileName");
    localStorage.removeItem("wrongAnswerIndices"); // Xóa chỉ số câu sai của file cũ
    resetUI();
}

function resetUI() { document.getElementById("upload").style.display = "block"; document.getElementById("upload").value = ""; document.getElementById("fileLoadedActions").style.display = "none"; document.getElementById("extraButtonsWrapper").style.display = "block"; document.getElementById("quizContainer").style.display = "none"; document.getElementById("progressBar").style.display = "none"; document.getElementById("question-nav-wrapper").style.display = "none"; }
function showLoader() { document.getElementById('loader').style.display = 'flex'; }
function hideLoader() { document.getElementById('loader').style.display = 'none'; }
function setupTheme() { const themeSwitcher = document.getElementById('theme-switcher'); const savedTheme = localStorage.getItem('theme') || 'light'; if (savedTheme === 'dark') { document.body.classList.add('dark-theme'); themeSwitcher.textContent = '🌙'; } themeSwitcher.addEventListener('click', () => { if (document.body.classList.toggle('dark-theme')) { themeSwitcher.textContent = '🌙'; localStorage.setItem('theme', 'dark'); } else { themeSwitcher.textContent = '☀️'; localStorage.setItem('theme', 'light'); } }); }