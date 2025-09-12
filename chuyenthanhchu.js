    document.addEventListener('DOMContentLoaded', () => {
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        const resultsContainer = document.getElementById('results-container');
        const fileInputBtn = document.querySelector('.file-input-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');
        const scrollUpBtn = document.getElementById('scroll-up-btn');
        const scrollDownBtn = document.getElementById('scroll-down-btn');
        
        const languages = 'vie+eng'; 

        fileInputBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropArea.classList.remove('dragover');
            }, false);
        });

        dropArea.addEventListener('drop', (e) => {
            handleFiles(e.dataTransfer.files);
        }, false);
        
        document.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            let filesToProcess = [];
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    filesToProcess.push(item.getAsFile());
                }
            }
            if (filesToProcess.length > 0) {
                handleFiles(filesToProcess);
            }
        });

        clearAllBtn.addEventListener('click', () => {
            resultsContainer.innerHTML = '';
            clearAllBtn.style.display = 'none';
            fileInput.value = '';
            checkScrollButtonsVisibility();
        });

        function handleFiles(files) {
            if (files.length > 0) {
                clearAllBtn.style.display = 'inline-block';
            }
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    processImage(file);
                }
            }
        }

        function postProcessText(text) {
            // Bước 1: Loại bỏ các ký tự đặc biệt không mong muốn
            let cleanedText = text.replace(/®/g, 'ẽ').replace(/Ñ/g, 'Ñ');
            
            // Bước 2: Chuẩn hóa các ký tự đặc biệt thường bị lỗi
            // Ví dụ: "yếu te" thành "yếu tố", "phan" thành "phần"
            cleanedText = cleanedText.replace(/yếu té/g, 'yếu tố').replace(/phan/g, 'phần');
            
            // Bước 3: Loại bỏ các ký tự đơn lẻ thừa ở cuối dòng (ví dụ: "e")
            cleanedText = cleanedText.replace(/\s\w\s*$/g, '').trim();

            return cleanedText;
        }

        function processImage(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';

                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-display';
                
                const imageControls = document.createElement('div');
                imageControls.className = 'image-controls';

                const showBtn = document.createElement('button');
                showBtn.textContent = 'Hiện ảnh';
                const hideBtn = document.createElement('button');
                hideBtn.textContent = 'Ẩn ảnh';
                hideBtn.className = 'hide-btn';
                hideBtn.style.display = 'none';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = file.name;

                imageControls.appendChild(showBtn);
                imageControls.appendChild(hideBtn);
                imageContainer.appendChild(imageControls);
                imageContainer.appendChild(img);
                
                const resultBox = document.createElement('div');
                resultBox.className = 'result-box';
                resultBox.textContent = 'Đang xử lý...';

                resultItem.appendChild(imageContainer);
                resultItem.appendChild(resultBox);
                resultsContainer.prepend(resultItem);

                checkScrollButtonsVisibility();

                showBtn.addEventListener('click', () => {
                    img.style.display = 'block';
                    showBtn.style.display = 'none';
                    hideBtn.style.display = 'inline-block';
                });

                hideBtn.addEventListener('click', () => {
                    img.style.display = 'none';
                    showBtn.style.display = 'inline-block';
                    hideBtn.style.display = 'none';
                });

                Tesseract.recognize(
                    file,
                    languages,
                    { 
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                resultBox.textContent = `Đang xử lý... (${(m.progress * 100).toFixed(0)}%)`;
                            }
                        }
                    }
                ).then(({ data: { text } }) => {
                    const finalResult = postProcessText(text);
                    resultBox.textContent = finalResult || "❌ Không nhận dạng được văn bản.";
                }).catch(err => {
                    resultBox.textContent = `⚠️ Lỗi OCR: ${err.message}`;
                    console.error(err);
                });
            };
            reader.readAsDataURL(file);
        }

        function checkScrollButtonsVisibility() {
            const isScrollable = document.body.scrollHeight > window.innerHeight;
            if (isScrollable) {
                scrollUpBtn.style.display = 'block';
                scrollDownBtn.style.display = 'block';
            } else {
                scrollUpBtn.style.display = 'none';
                scrollDownBtn.style.display = 'none';
            }
        }

        scrollUpBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        scrollDownBtn.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                scrollUpBtn.style.display = 'block';
            } else {
                scrollUpBtn.style.display = 'none';
            }

            if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 20) {
                scrollDownBtn.style.display = 'none';
            } else {
                scrollDownBtn.style.display = 'block';
            }
        });

        checkScrollButtonsVisibility();
    });