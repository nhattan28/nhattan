document.addEventListener("DOMContentLoaded", function () {
    // Chặn chuột phải
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Chặn các phím tắt mở tùy chọn nhà phát triển
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C
            (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
            (e.ctrlKey && e.key === 'U') // Ctrl+U (xem mã nguồn)
        ) {
            e.preventDefault();
        }
    });

    const inputScreen = document.getElementById("input-screen");
    const resultScreen = document.getElementById("result-screen");
    const startButton = document.getElementById("startButton");
    const clearButton = document.getElementById("clearButton");
    const pasteButton = document.getElementById("pasteButton");
    const backButton = document.getElementById("backButton");
    const nameInput = document.getElementById("nameInput");
    const totalNamesCount = document.getElementById("totalNamesCount");
    const progressBar = document.getElementById("progressBar");
    const stageTwo = document.getElementById("stage-two");
    const finalNameElement = document.getElementById("finalName");
    const stageOneResult = document.getElementById("stage-one-result");

    let intervalId;
    let countdownId;
    let selectedNames = [];
    const scanTime = 10;
    let startTime;

    startButton.addEventListener("click", function () {
        const names = nameInput.value.split(',').map(name => name.trim()).filter(name => name !== '');

        if (names.length === 0) {
            alert("Vui lòng nhập ít nhất một tên.");
            return;
        }

        inputScreen.style.display = "none";
        resultScreen.style.display = "block";
        startButton.disabled = true;

        totalNamesCount.textContent = names.length;
        selectedNames = [];
        stageTwo.style.display = 'none';
        stageOneResult.style.display = 'none';

        // Đảm bảo thanh tiến trình được reset về 100%
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#4caf50';
        progressBar.classList.remove('progress-bar-critical');

        startTime = Date.now();

        const scanSpeed = 1;

        countdownId = setInterval(function () {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const remainingTime = scanTime - elapsedTime;

            if (remainingTime <= 0) {
                clearInterval(countdownId);
                clearInterval(intervalId);
                progressBar.style.width = '0%';

                for (let i = 0; i < 3; i++) {
                    const randomIndex = Math.floor(Math.random() * names.length);
                    selectedNames.push(names[randomIndex]);
                }

                startStageTwo();
            } else {
                const progressPercentage = (remainingTime / scanTime) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                if (remainingTime <= 3) {
                    progressBar.classList.add('progress-bar-critical');
                }
            }
        }, 10);

        intervalId = setInterval(function () {
            const elapsedTime = (Date.now() - startTime) / 1000;
            if (elapsedTime < scanTime) {
                const randomIndex = Math.floor(Math.random() * names.length);
            }
        }, scanSpeed);
    });

    function startStageTwo() {
        stageTwo.style.display = 'block';

        document.getElementById('name1').textContent = selectedNames[0];
        document.getElementById('name2').textContent = selectedNames[1];
        document.getElementById('name3').textContent = selectedNames[2];
        finalNameElement.textContent = '';

        let finalScanIndex = 0;
        const finalScanSpeed = 300;

        intervalId = setInterval(function () {
            document.querySelectorAll('.selected-name').forEach(el => el.classList.remove('final-selected'));
            document.getElementById(`name${finalScanIndex + 1}`).classList.add('final-selected');
            finalScanIndex++;

            if (finalScanIndex >= selectedNames.length) {
                clearInterval(intervalId);
                const finalChoiceIndex = Math.floor(Math.random() * selectedNames.length);
                finalNameElement.textContent = selectedNames[finalChoiceIndex];

                document.querySelectorAll('.selected-name').forEach(el => el.classList.remove('final-selected'));
                document.getElementById(`name${finalChoiceIndex + 1}`).classList.add('final-selected');
            }
        }, finalScanSpeed);
    }

    backButton.addEventListener('click', function () {
        clearInterval(intervalId);
        clearInterval(countdownId);

        resultScreen.style.display = 'none';
        inputScreen.style.display = 'block';
        startButton.disabled = false;
        stageTwo.style.display = 'none';
        finalNameElement.textContent = '';
    });

    clearButton.addEventListener('click', function () {
        nameInput.value = '';
    });

    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            nameInput.value = text;
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            alert('Không thể dán nội dung. Vui lòng thử lại hoặc dán thủ công.');
        }
    });
});