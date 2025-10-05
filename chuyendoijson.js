    const fileInput = document.getElementById('jsonFile');
    const btnGroup = document.getElementById('btnGroup');
    const convertAndDisplayBtn = document.getElementById('convertAndDisplayBtn');
    const convertAndDownloadBtn = document.getElementById('convertAndDownloadBtn');
    const copyImageBtn = document.getElementById('copyImageBtn');
    const statusDiv = document.getElementById('status');
    const summaryDiv = document.getElementById('summary');
    const totalCreditsP = document.getElementById('totalCredits');
    const tuitionFeeP = document.getElementById('tuitionFee');
    const outputContainer = document.getElementById('outputContainer');
    const outputTableContainer = document.getElementById('outputTableContainer');
    const outputTable = document.getElementById('outputTable');
    const summaryTable = document.getElementById('summaryTable');
    const imageWrapper = document.getElementById('image-wrapper');

    let jsonData = null;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            statusDiv.textContent = `Đã chọn file: ${file.name}`;
            btnGroup.style.display = 'flex';
            summaryDiv.style.display = 'none';
            outputContainer.style.display = 'none';

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    jsonData = JSON.parse(event.target.result);
                } catch (error) {
                    statusDiv.textContent = 'Lỗi: File không phải là JSON hợp lệ.';
                    btnGroup.style.display = 'none';
                    jsonData = null;
                }
            };
            reader.readAsText(file);
        } else {
            statusDiv.textContent = '';
            btnGroup.style.display = 'none';
            summaryDiv.style.display = 'none';
            outputContainer.style.display = 'none';
            jsonData = null;
        }
    });

    const processDataForDisplay = () => {
        if (!jsonData || !jsonData.courses) {
            statusDiv.textContent = 'Lỗi: Dữ liệu JSON không hợp lệ hoặc thiếu thông tin khóa học.';
            return null;
        }
        
        const outputData = [];
        let totalCredits = 0;
        let serialNumber = 1;

        jsonData.courses.forEach(course => {
            totalCredits += course.credits || 0;
            
            course.sessions.forEach(session => {
                outputData.push({
                    'STT': serialNumber,
                    'Tên Môn Học': course.courseName,
                    'Mã Lớp': course.classCode,
                    'Mã Đăng Ký': course.regCode,
                    'Giảng Viên': course.lecturer,
                    'Tín Chỉ': course.credits,
                    'Thời Gian': `${session.dayOfWeek} (${session.time})`,
                    'Địa Điểm': session.location
                });
            });
            serialNumber++;
        });

        let estimatedFee = 'Không có thông tin';
        if (jsonData.tuitionFeeData && jsonData.tuitionFeeData.feePer16Credits) {
            const feePerCredit = jsonData.tuitionFeeData.feePer16Credits / 16;
            estimatedFee = (totalCredits * feePerCredit).toLocaleString('vi-VN') + ' VND';
        }

        return { outputData, totalCredits, estimatedFee };
    };

    const processDataForDownload = () => {
        if (!jsonData || !jsonData.courses) {
            statusDiv.textContent = 'Lỗi: Dữ liệu JSON không hợp lệ hoặc thiếu thông tin khóa học.';
            return null;
        }
        
        const outputData = [];
        let totalCredits = 0;
        let serialNumber = 1;

        jsonData.courses.forEach(course => {
            totalCredits += course.credits || 0;
            
            const sessionsMerged = course.sessions.map(session => `${session.dayOfWeek} (${session.time}) tại ${session.location}`).join(', ');

            outputData.push({
                'STT': serialNumber,
                'Tên Môn Học': course.courseName,
                'Mã Lớp': course.classCode,
                'Mã Đăng Ký': course.regCode,
                'Giảng Viên': course.lecturer,
                'Tín Chỉ': course.credits,
                'Lịch Học Chi Tiết': sessionsMerged
            });
            serialNumber++;
        });

        let estimatedFee = 'Không có thông tin';
        if (jsonData.tuitionFeeData && jsonData.tuitionFeeData.feePer16Credits) {
            const feePerCredit = jsonData.tuitionFeeData.feePer16Credits / 16;
            estimatedFee = (totalCredits * feePerCredit).toLocaleString('vi-VN') + ' VND';
        }

        return { outputData, totalCredits, estimatedFee };
    };

    convertAndDisplayBtn.addEventListener('click', () => {
        const result = processDataForDisplay();
        if (!result) return;

        const { outputData, totalCredits, estimatedFee } = result;

        outputTable.innerHTML = '';
        const headerTitles = [
            'STT', 'Tên Môn Học', 'Mã Lớp', 'Mã Đăng Ký', 'Giảng Viên', 'Tín Chỉ', 'Thời Gian', 'Địa Điểm'
        ];
        
        let headerRow = outputTable.insertRow();
        headerTitles.forEach(title => {
            let th = document.createElement('th');
            th.textContent = title;
            headerRow.appendChild(th);
        });

        let mergeInfo = {};

        outputData.forEach((rowData, index) => {
            let row = outputTable.insertRow();
            headerTitles.forEach(key => {
                let cell = row.insertCell();
                cell.textContent = rowData[key];
            });

            const currentSTT = rowData['STT'];
            if (mergeInfo[currentSTT]) {
                const startRowIndex = mergeInfo[currentSTT].startIndex;
                const startRow = outputTable.rows[startRowIndex];
                
                for (let i = 0; i < 6; i++) {
                    const startCell = startRow.cells[i];
                    if (startCell) {
                        startCell.rowSpan = (startCell.rowSpan || 1) + 1;
                    }
                }
                for (let i = 0; i < 6; i++) {
                    row.cells[0].remove();
                }
            } else {
                mergeInfo[currentSTT] = {
                    startIndex: index + 1,
                    count: 1
                };
            }
        });

        summaryTable.innerHTML = '';
        
        let totalCreditsRow = summaryTable.insertRow();
        let tcLabelCell = totalCreditsRow.insertCell();
        tcLabelCell.textContent = 'Tổng tín chỉ:';
        let tcValueCell = totalCreditsRow.insertCell();
        tcValueCell.textContent = totalCredits;

        let tuitionFeeRow = summaryTable.insertRow();
        let tfLabelCell = tuitionFeeRow.insertCell();
        tfLabelCell.textContent = 'Học phí dự kiến:';
        let tfValueCell = tuitionFeeRow.insertCell();
        tfValueCell.textContent = estimatedFee;

        totalCreditsP.textContent = `Tổng số tín chỉ: ${totalCredits}`;
        tuitionFeeP.textContent = `Học phí dự kiến: ${estimatedFee}`;

        outputContainer.style.display = 'flex';
        statusDiv.textContent = 'Chuyển đổi thành công! Dữ liệu đã được hiển thị.';
    });

    convertAndDownloadBtn.addEventListener('click', () => {
        const result = processDataForDownload();
        if (!result) return;
        
        statusDiv.textContent = 'Đang xử lý...';
        const { outputData, totalCredits, estimatedFee } = result;

        const worksheet = XLSX.utils.json_to_sheet(outputData);
        
        const header = [
            'STT', 'Tên Môn Học', 'Mã Lớp', 'Mã Đăng Ký', 'Giảng Viên', 'Tín Chỉ', 'Lịch Học Chi Tiết'
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

        const wscols = [];
        header.forEach((colTitle) => {
            let maxLength = colTitle.length;
            outputData.forEach(row => {
                const cellValue = row[colTitle] ? String(row[colTitle]).length : 0;
                if (cellValue > maxLength) {
                    maxLength = cellValue;
                }
            });
            wscols.push({ wch: maxLength + 2 });
        });
        worksheet['!cols'] = wscols;

        const startSummaryRow = outputData.length + 5;
        const summaryExcelData = [
            ['Tổng tín chỉ:', totalCredits],
            ['Học phí dự kiến:', estimatedFee]
        ];

        XLSX.utils.sheet_add_aoa(worksheet, summaryExcelData, { origin: `B${startSummaryRow}` });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Thời Khóa Biểu");

        XLSX.writeFile(workbook, "thoi-khoa-bieu-gop-ngan-gon.xlsx");
        
        statusDiv.textContent = 'Chuyển đổi thành công! File Excel đã được tải xuống.';
        
        totalCreditsP.textContent = `Tổng số tín chỉ: ${totalCredits}`;
        tuitionFeeP.textContent = `Học phí dự kiến: ${estimatedFee}`;
        summaryDiv.style.display = 'block';
        outputContainer.style.display = 'none';
    });

    copyImageBtn.addEventListener('click', () => {
        statusDiv.textContent = 'Đang chụp ảnh bảng...';
        html2canvas(imageWrapper, { 
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            canvas.toBlob(blob => {
                if (blob) {
                    const item = new ClipboardItem({ "image/png": blob });
                    navigator.clipboard.write([item]).then(() => {
                        statusDiv.textContent = 'Đã sao chép ảnh bảng vào clipboard!';
                    }).catch(err => {
                        console.error('Lỗi khi sao chép ảnh:', err);
                        statusDiv.textContent = 'Lỗi khi sao chép ảnh. Vui lòng thử lại.';
                    });
                } else {
                    statusDiv.textContent = 'Lỗi: Không thể tạo ảnh từ bảng.';
                }
            }, 'image/png');
        }).catch(err => {
            console.error('Lỗi html2canvas:', err);
            statusDiv.textContent = 'Lỗi khi chụp ảnh bảng. Vui lòng kiểm tra console để biết thêm chi tiết.';
        });
    });

    // Chặn chuột phải
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Chặn phím mở công cụ nhà phát triển
    document.addEventListener('keydown', event => {
        if (event.key === 'F12' || 
            (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) ||
            (event.metaKey && event.altKey && event.key === 'I')) {
            event.preventDefault();
        }
    });