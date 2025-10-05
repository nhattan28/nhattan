    let EXAM_DATA = [];
    let HEADERS = [];
    const KHOI_THI_HEADER_NAME = 'Khối thi';
    const MA_MON_HEADER_NAME = 'Mã môn'; 
    const MON_THI_HEADER_NAME = 'Môn thi'; 
    const NGAY_THI_HEADER_NAME = 'Ngày thi'; 
    const KEY_COLUMNS_TO_FIND = ['STT', 'Ngày thi', 'Mã môn', 'Môn thi']; 
    
        function showModal(title, message, type = 'info', actions = null, duration = 3000) {
        const modal = document.getElementById('modalContainer');
        const content = modal.querySelector('.modal-content');
        const actionsContainer = document.getElementById('modalActions');
        
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').innerHTML = message; 
        
        let icon = '';
        content.className = `modal-content modal-${type}`;

        if (type === 'success') icon = '🎉';
        else if (type === 'error') icon = '❌';
        else if (type === 'info') icon = '⏱️';
        else if (type === 'warning') icon = '⚠️';
        else if (type === 'confirm') icon = '🖼️'; 
        
        document.getElementById('modalIcon').textContent = icon;
        
        actionsContainer.innerHTML = '';
        if (actions && Array.isArray(actions)) {
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `modal-btn modal-btn-${action.class}`;
                button.textContent = action.text;
                button.onclick = () => {
                    hideModal();
                    if (action.action) {
                        action.action();
                    }
                };
                actionsContainer.appendChild(button);
            });
        }
        actionsContainer.style.display = (actions && actions.length > 0) ? 'flex' : 'none';

        modal.classList.add('show');
        
        if (duration > 0 && (!actions || actions.length === 0)) {
            setTimeout(() => {
                modal.classList.remove('show');
            }, duration);
        }
    }

    function hideModal() {
        document.getElementById('modalContainer').classList.remove('show');
    }

    function showDownloadConfirmModal() {
        const tableBody = document.querySelector('#resultTable tbody');
        
        if (tableBody.children.length === 0 || tableBody.querySelector('td').textContent.includes('Chưa có dữ liệu')) {
            showModal('Không Có Dữ Liệu!', 'Vui lòng tải lên file lịch thi và tìm kiếm trước khi tải ảnh.', 'error');
            return;
        }

        const actions = [
            { text: 'Xác Nhận Tải', class: 'confirm', action: downloadTableImageLogic },
            { text: 'Hủy Bỏ', class: 'cancel', action: hideModal } 
        ];

        showModal(
            'Xác Nhận Tải Xuống',
            'Bạn có muốn tải xuống bảng kết quả đang hiển thị dưới dạng hình ảnh (.png) không? <br>Quá trình có thể mất vài giây.',
            'confirm',
            actions,
            0 
        );
    }

    function downloadTableImageLogic() {
        const tableWrapper = document.getElementById('tableWrapper');
        const captureArea = document.getElementById('captureArea');
        
        showModal('Đang Tạo Ảnh...', 'Đang chụp ảnh màn hình bảng kết quả. Vui lòng đợi...', 'info', null, 5000); 

        tableWrapper.classList.add('capturing');
        const originalScroll = tableWrapper.scrollTop; 

        setTimeout(() => {
            html2canvas(captureArea, {
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff' 
            }).then(canvas => {

                tableWrapper.classList.remove('capturing');
                tableWrapper.scrollTop = originalScroll; 
                
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                
                const date = new Date();
                const dateString = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`;
                
                link.download = `LichThi_DaLoc_${dateString}.png`;
                link.href = image;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showModal('Tải Xuống Hoàn Tất!', 'Hình ảnh bảng dữ liệu đã được tải xuống thành công!', 'success', null, 4000);
            }).catch(error => {
                tableWrapper.classList.remove('capturing');
                tableWrapper.scrollTop = originalScroll; 
                console.error("Lỗi khi tạo hình ảnh:", error);
                showModal('Lỗi Tải Ảnh!', 'Không thể tạo hình ảnh từ bảng. Vui lòng thử lại.', 'error');
            });
        }, 100); 
    }

    function excelSerialToJSDate(serial) {
        if (typeof serial !== 'number' || serial <= 0) return serial;
        
        const utc_days = Math.floor(serial - 25569); 
        const utc_value = utc_days * 86400; 
        const date = new Date(utc_value * 1000);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    function normalizeHeaderName(name) {
        let result = String(name || '').trim();
        result = result.replace(/\n/g, ' '); 
        result = result.replace(/\s+/g, ' '); 
        return result;
    }
    
    function getHeadersFromWorksheet(worksheet, rowIndex) {
        if (!worksheet || !worksheet['!ref']) return [];
        
        const fullRange = XLSX.utils.decode_range(worksheet['!ref']);
        const headerRange = {s: { r: rowIndex, c: fullRange.s.c }, e: { r: rowIndex, c: fullRange.e.c }};
        const headerSheetRef = XLSX.utils.encode_range(headerRange);
        
        const headersArray = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: headerSheetRef, defval: null })[0];
        
        if (!headersArray) return [];
        
        return headersArray
            .map(h => normalizeHeaderName(h))
            .filter(h => h.length > 0 && h.toLowerCase() !== 'undefined');
    }

    function findActualHeaderIndex(data, isExcel = false) { 
        const MAX_ROWS_TO_CHECK = 50; 
        let worksheet;
        
        try {
            if (isExcel) {
                const workbook = XLSX.read(data, { type: 'array', raw: true }); 
                worksheet = workbook.Sheets[workbook.SheetNames[0]];
            } else {
                worksheet = XLSX.utils.csv_to_sheet(data);
            }
        } catch(e) {
            console.error("Error creating worksheet:", e);
            return -1;
        }

        if (!worksheet || !worksheet['!ref']) return -1;
        
        const normalizeKey = (key) => normalizeHeaderName(key).toUpperCase();

        for (let i = 0; i < MAX_ROWS_TO_CHECK; i++) {
            const currentHeaders = getHeadersFromWorksheet(worksheet, i);
            
            if (currentHeaders.length === 0) continue;

            const normalizedCurrentHeaders = currentHeaders.map(h => h.toUpperCase());
            
            const allKeysFound = KEY_COLUMNS_TO_FIND.every(key => {
                const requiredKey = normalizeKey(key); 
                
                return normalizedCurrentHeaders.some(h => h.includes(requiredKey)); 
            });
            
            if (allKeysFound) {
                HEADERS = currentHeaders;
                console.log(`✅ Header tự động tìm thấy ở dòng ${i + 1} (0-indexed).`);
                return i;
            }
        }
        
        return -1; 
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        
        if (!file) {
            showModal('Thông Báo', 'Vui lòng chọn một file lịch thi.', 'info', null, 2000);
            return;
        }
        
        showModal('Đang Xử Lý...', `Đang đọc file: <strong>${file.name}</strong>. Vui lòng đợi...`, 'info', null, 10000);

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    processExcelData(e.target.result);
                } else {
                    processCSVData(e.target.result);
                }

                EXAM_DATA = EXAM_DATA.filter(row => {
                    const maMonKey = HEADERS.find(h => normalizeHeaderName(h).toUpperCase().includes(MA_MON_HEADER_NAME.toUpperCase())) || MA_MON_HEADER_NAME;
                    const maMon = String(row[maMonKey] || '').trim();
                    const hasValidMaMon = maMon.length > 0 && !/^\d+$/.test(maMon);
                    return hasValidMaMon;
                });

                document.getElementById('step1Container').style.display = 'none';
                document.getElementById('step2Container').style.display = 'block';

                showModal('Hoàn Thành!', `Tải lên và xử lý thành công file <strong>${file.name}</strong>.<br>Đã hiển thị <strong>${EXAM_DATA.length}</strong> dòng lịch thi.`, 'success', null, 4000);
                searchData(); 
            } catch (error) {
                document.getElementById('step1Container').style.display = 'block';
                document.getElementById('step2Container').style.display = 'none';
                
                showModal('Lỗi Dữ Liệu!', `<strong>Lỗi:</strong> ${error.message}<br>Vui lòng kiểm tra lại cấu trúc file.`, 'error');
                
                console.error("Lỗi chi tiết:", error);
                displayResults([]); 
                EXAM_DATA = []; 
                HEADERS = [];
            }
        };

        reader.onerror = function(e) {
            showModal('Lỗi Đọc File!', 'Không thể đọc được file. Vui lòng thử lại hoặc kiểm tra định dạng file.', 'error');
        };
        
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file, 'UTF-8'); 
        }
    }
    
    function processExcelData(data) {
        const workbook = XLSX.read(data, { type: 'array', raw: true }); 
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet || !worksheet['!ref']) throw new Error('Không tìm thấy dữ liệu trong sheet đầu tiên.');

        const headerRowIndex = findActualHeaderIndex(data, true); 
        
        if (headerRowIndex === -1) {
            throw new Error(`Không thể tìm thấy hàng tiêu đề (header) chứa các cột: ${KEY_COLUMNS_TO_FIND.join(', ')} trong 50 dòng đầu.`);
        }
        
        const dataRowStartIndex = headerRowIndex + 1; 
        const fullRange = XLSX.utils.decode_range(worksheet['!ref']);
        const dataRange = {s: { r: dataRowStartIndex, c: fullRange.s.c }, e: fullRange.e};
        const dataSheetRef = XLSX.utils.encode_range(dataRange);
        
        EXAM_DATA = XLSX.utils.sheet_to_json(worksheet, { 
            header: HEADERS, 
            range: dataSheetRef, 
            defval: "",
            raw: true 
        });
        
        checkAndDisplayHeaders(); 
    }
    
    function processCSVData(csvText) {
        const headerRowIndex = findActualHeaderIndex(csvText, false); 

        if (headerRowIndex === -1) {
            throw new Error(`Không thể tìm thấy hàng tiêu đề (header) chứa các cột: ${KEY_COLUMNS_TO_FIND.join(', ')} trong 50 dòng đầu.`);
        }
        
        const worksheet = XLSX.utils.csv_to_sheet(csvText);
        const dataRowStartIndex = headerRowIndex + 1; 
        
        if (!worksheet || !worksheet['!ref']) {
            throw new Error('Không tìm thấy dữ liệu sau hàng tiêu đề.');
        }
        
        const fullRange = XLSX.utils.decode_range(worksheet['!ref']);
        const dataRange = {s: { r: dataRowStartIndex, c: fullRange.s.c }, e: fullRange.e};
        const dataSheetRef = XLSX.utils.encode_range(dataRange);

        EXAM_DATA = XLSX.utils.sheet_to_json(worksheet, { 
            header: HEADERS, 
            range: dataSheetRef, 
            defval: "",
            raw: true 
        });

        checkAndDisplayHeaders(); 
    }
    
    function checkAndDisplayHeaders() {
         const headerKeys = {};
         HEADERS.forEach(h => {
             headerKeys[normalizeHeaderName(h).toUpperCase()] = h;
         });
         
         const normalizeKey = (key) => normalizeHeaderName(key).toUpperCase();

         const requiredKeys = [KHOI_THI_HEADER_NAME, MA_MON_HEADER_NAME, MON_THI_HEADER_NAME, NGAY_THI_HEADER_NAME];
         
         const missingCols = requiredKeys.filter(key => !(normalizeKey(key) in headerKeys));

        if (missingCols.length > 0) {
            throw new Error(`File thiếu cột quan trọng: ${missingCols.join(', ')}. Vui lòng kiểm tra lại file.`);
        }
    }
    
    const normalizeSearchString = (term) => {
         return String(term || '').trim().toUpperCase();
    };

    const splitSearchTerm = (term) => {
        const match = term.match(/^(.*?)([A-Z]{1,2})$/i);
        
        if (match) {
            const maMon = match[1].trim(); 
            const khoiThi = match[2].trim();
            return { maMon: maMon.toUpperCase(), khoiThi: khoiThi.toUpperCase() };
        }
        return { maMon: term.toUpperCase(), khoiThi: '' };
    };


    function searchData() {
        if (EXAM_DATA.length === 0) {
            displayResults([]); 
            return;
        }
        
        const inputElement = document.getElementById('searchTermInput');
        const rawSearchText = inputElement.value;
        
        const rawTerms = rawSearchText.split(',')
                            .map(term => normalizeSearchString(term))
                            .filter(term => term.length > 0);
        
        if (rawTerms.length === 0) {
            displayResults(EXAM_DATA);
            return;
        }

        let foundTerms = new Set();
        let notFoundTerms = new Set();

        const getHeaderKey = (targetName) => {
            return HEADERS.find(h => normalizeHeaderName(h).toUpperCase().includes(normalizeHeaderName(targetName).toUpperCase())) || targetName;
        };
        const KHOI_THI_KEY = getHeaderKey(KHOI_THI_HEADER_NAME);
        const MA_MON_KEY = getHeaderKey(MA_MON_HEADER_NAME);
        const MON_THI_KEY = getHeaderKey(MON_THI_HEADER_NAME);
        
        const filteredData = EXAM_DATA.filter(row => {
            const maMonValue = String(row[MA_MON_KEY] || '').trim().toUpperCase();
            const monThiValue = String(row[MON_THI_KEY] || '').trim().toUpperCase();
            const khoiThiRaw = String(row[KHOI_THI_KEY] || '').trim().toUpperCase();
            
            const isMatch = rawTerms.some(searchTerm => {
                let matchFound = false;
                
                const { maMon: searchMaMon, khoiThi: searchKhoiThi } = splitSearchTerm(searchTerm);
                
                if (monThiValue.includes(searchTerm) || maMonValue.includes(searchTerm)) {
                    matchFound = true;
                }
                
                if (!matchFound && searchKhoiThi.length > 0) {
                    
                    if (maMonValue.includes(searchMaMon)) {
                        
                        const matchBracket = khoiThiRaw.match(/\((.*?)\)/); 
                        
                        if (matchBracket && matchBracket[1]) {
                            let bracketContent = matchBracket[1]; 
                            bracketContent = bracketContent.replace(/[\s\-]/g, '');
                            
                            if (bracketContent.includes(searchKhoiThi)) {
                                matchFound = true;
                            }
                        }
                    }
                }
                
                if (matchFound) {
                    foundTerms.add(searchTerm);
                }
                return matchFound;
            });
            return isMatch;
        });

        rawTerms.forEach(term => {
            if (!foundTerms.has(term)) {
                notFoundTerms.add(term);
            }
        });
        
        displayResults(filteredData, notFoundTerms);
    }

    function displayResults(data, notFoundTerms = new Set()) {
        const tableBody = document.querySelector('#resultTable tbody');
        const tableHead = document.querySelector('#resultTable thead tr');
        
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        const colspan = HEADERS.length > 0 ? HEADERS.length : 1;
        if (HEADERS.length > 0 && tableHead.children.length === 0) {
            HEADERS.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tableHead.appendChild(th);
            });
        }
        
        if (data.length === 0) {
             tableBody.innerHTML = `<tr><td colspan="${colspan}">Không tìm thấy kết quả phù hợp nào.</td></tr>`;
        } else {
            const NGAY_THI_KEY = HEADERS.find(h => normalizeHeaderName(h).toUpperCase().includes(normalizeHeaderName(NGAY_THI_HEADER_NAME).toUpperCase())) || NGAY_THI_HEADER_NAME;

            data.forEach(row => {
                const tr = document.createElement('tr');
                HEADERS.forEach(header => {
                    const td = document.createElement('td');
                    let cellValue = row[header] || '';

                    if (header === NGAY_THI_KEY && !isNaN(cellValue) && Number(cellValue) > 0 && typeof cellValue === 'number') {
                        cellValue = excelSerialToJSDate(Number(cellValue));
                    }
                    
                    td.textContent = cellValue; 
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        }
        
        const currentSearchText = document.getElementById('searchTermInput').value.trim();

        if (notFoundTerms.size > 0) {
            const termList = Array.from(notFoundTerms).join(', '); 
            showModal('Không Tìm Thấy!', `Không tìm thấy kết quả cho các từ khóa/mã môn: <strong>${termList}</strong>.`, 'warning', null, 5000);
        } else if (currentSearchText !== "" && data.length === 0) {
            showModal('Không Có Kết Quả', `Không có kết quả nào cho "${currentSearchText}".`, 'warning', null, 3000);
        }
    }