const EXAM_FILE_URL = 'https://raw.githubusercontent.com/nhattan28/lich_thi_DTU/main/LICH_THI_KTHP.xlsx';

let EXAM_DATA = [];
let HEADERS = [];
const KHOI_THI_HEADER_NAME = 'Khối thi';
const MA_MON_HEADER_NAME = 'Mã môn';
const MON_THI_HEADER_NAME = 'Môn thi';
const NGAY_THI_HEADER_NAME = 'Ngày thi';
const KEY_COLUMNS_TO_FIND = ['STT', 'Ngày thi', 'Mã môn', 'Môn thi'];

// Tự động chạy hàm tải dữ liệu ngay khi trang web được mở
document.addEventListener('DOMContentLoaded', () => {
    loadAndProcessFile(EXAM_FILE_URL);
});

async function loadAndProcessFile(url) {
    if (!url || url === 'URL_FILE_EXCEL_CUA_BAN') {
        showModal('Lỗi Cấu Hình', 'Đường dẫn đến file lịch thi (EXAM_FILE_URL) chưa được thiết lập trong file `timmonthi.js`.', 'error', null, 0);
        document.querySelector('#resultTable tbody').innerHTML = `<tr><td colspan="100%">Lỗi cấu hình. Vui lòng liên hệ quản trị viên.</td></tr>`;
        return;
    }

    showModal('', '', 'info', null, 0.000000000001);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Không thể tải file. (Mã lỗi: ${response.status})`);
        }

        const data = await response.arrayBuffer();
        processExcelData(data);

        EXAM_DATA = EXAM_DATA.filter(row => {
            const maMonKey = HEADERS.find(h => normalizeHeaderName(h).toUpperCase().includes(MA_MON_HEADER_NAME.toUpperCase())) || MA_MON_HEADER_NAME;
            const maMon = String(row[maMonKey] || '').trim();
            return maMon.length > 0 && !/^\d+$/.test(maMon);
        });

        showModal('', ``, 'success', null, 0.000000001);
        searchData();

    } catch (error) {
        console.error("Lỗi khi tải hoặc xử lý file:", error);
        showModal('Tải Lịch Thi Thất Bại!', `Đã xảy ra lỗi: ${error.message}.<br>Vui lòng kiểm tra lại đường dẫn file trên GitHub hoặc thử tải lại trang.`, 'error', null, 0);
        document.querySelector('#resultTable tbody').innerHTML = `<tr><td colspan="100%">Tải dữ liệu thất bại.</td></tr>`;
    }
}

function showModal(title, message, type = 'info', actions = null, duration = 0.0001) {
    const modal = document.getElementById('modalContainer');
    const content = modal.querySelector('.modal-content');
    const actionsContainer = document.getElementById('modalActions');

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').innerHTML = message;

    let icon = '';
    content.className = `modal-content modal-${type}`;

    if (type === 'success') icon = '';
    else if (type === 'error') icon = '';
    else if (type === 'info') icon = '';
    else if (type === 'warning') icon = '';
    else if (type === 'confirm') icon = '';

    document.getElementById('modalIcon').textContent = icon;

    actionsContainer.innerHTML = '';
    if (actions && Array.isArray(actions)) {
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = `modal-btn modal-btn-${action.class}`;
            button.textContent = action.text;
            button.onclick = () => {
                hideModal();
                if (action.action) action.action();
            };
            actionsContainer.appendChild(button);
        });
    }
    actionsContainer.style.display = (actions && actions.length > 0) ? 'flex' : 'none';

    modal.classList.add('show');

    if (duration > 0 && (!actions || actions.length === 0)) {
        setTimeout(() => modal.classList.remove('show'), duration);
    }
}

function hideModal() {
    document.getElementById('modalContainer').classList.remove('show');
}

function showDownloadConfirmModal() {
    const tableBody = document.querySelector('#resultTable tbody');
    if (tableBody.children.length === 0 || tableBody.querySelector('td').textContent.includes('Chưa có dữ liệu')) {
        showModal('Không Có Dữ Liệu!', 'Không có dữ liệu để tải xuống.', 'error');
        return;
    }

    const actions = [
        { text: 'Xác Nhận', class: 'confirm', action: downloadTableImageLogic },
        { text: 'Hủy', class: 'cancel', action: hideModal }
    ];
    showModal('Xác Nhận Tải Xuống', 'Bạn có muốn tải bảng kết quả này dưới dạng hình ảnh không?', 'confirm', actions, 0);
}

function downloadTableImageLogic() {
    const tableWrapper = document.getElementById('tableWrapper');
    const captureArea = document.getElementById('captureArea');

    showModal('Đang Tạo Ảnh...', 'Vui lòng đợi trong giây lát...', 'info', null, 5000);

    tableWrapper.classList.add('capturing');
    const originalScroll = tableWrapper.scrollTop;

    setTimeout(() => {
        html2canvas(captureArea, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
            tableWrapper.classList.remove('capturing');
            tableWrapper.scrollTop = originalScroll;

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            const date = new Date();
            const dateString = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`;
            link.download = `LichThi_${dateString}.png`;
            link.href = image;
            link.click();

            showModal('Hoàn Tất!', 'Hình ảnh đã được tải xuống thành công!', 'success');
        }).catch(error => {
            tableWrapper.classList.remove('capturing');
            tableWrapper.scrollTop = originalScroll;
            console.error("Lỗi khi tạo ảnh:", error);
            showModal('Lỗi!', 'Không thể tạo hình ảnh. Vui lòng thử lại.', 'error');
        });
    }, 100);
}

function excelSerialToJSDate(serial) {
    if (typeof serial !== 'number' || serial <= 0) return serial;
    const utc_days = Math.floor(serial - 25569);
    const date = new Date(utc_days * 86400 * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function normalizeHeaderName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ');
}

function getHeadersFromWorksheet(worksheet, rowIndex) {
    if (!worksheet || !worksheet['!ref']) return [];
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headerRange = { s: { r: rowIndex, c: range.s.c }, e: { r: rowIndex, c: range.e.c } };
    const headersArray = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: XLSX.utils.encode_range(headerRange), defval: null })[0];
    return headersArray ? headersArray.map(h => normalizeHeaderName(h)).filter(Boolean) : [];
}

function findActualHeaderIndex(data) {
    const MAX_ROWS_TO_CHECK = 50;
    const workbook = XLSX.read(data, { type: 'array', raw: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet || !worksheet['!ref']) return -1;

    const normalizeKey = (key) => normalizeHeaderName(key).toUpperCase();

    for (let i = 0; i < MAX_ROWS_TO_CHECK; i++) {
        const currentHeaders = getHeadersFromWorksheet(worksheet, i);
        if (currentHeaders.length === 0) continue;
        const normalizedCurrentHeaders = currentHeaders.map(h => h.toUpperCase());
        const allKeysFound = KEY_COLUMNS_TO_FIND.every(key => normalizedCurrentHeaders.some(h => h.includes(normalizeKey(key))));

        if (allKeysFound) {
            HEADERS = currentHeaders;
            console.log(`✅ Header đã được tìm thấy ở dòng ${i + 1}.`);
            return i;
        }
    }
    return -1;
}

function processExcelData(data) {
    const workbook = XLSX.read(data, { type: 'array', raw: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet || !worksheet['!ref']) throw new Error('Không tìm thấy dữ liệu trong file Excel.');

    const headerRowIndex = findActualHeaderIndex(new Uint8Array(data));
    if (headerRowIndex === -1) {
        throw new Error(`Không thể tìm thấy hàng tiêu đề chứa các cột: ${KEY_COLUMNS_TO_FIND.join(', ')}.`);
    }

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const dataRange = { s: { r: headerRowIndex + 1, c: range.s.c }, e: range.e };

    EXAM_DATA = XLSX.utils.sheet_to_json(worksheet, {
        header: HEADERS,
        range: XLSX.utils.encode_range(dataRange),
        defval: "",
        raw: true
    });
    checkAndDisplayHeaders();
}

function checkAndDisplayHeaders() {
    const headerKeys = new Set(HEADERS.map(h => normalizeHeaderName(h).toUpperCase()));
    const requiredKeys = [KHOI_THI_HEADER_NAME, MA_MON_HEADER_NAME, MON_THI_HEADER_NAME, NGAY_THI_HEADER_NAME];
    const missingCols = requiredKeys.filter(key => !headerKeys.has(key.toUpperCase()));
    if (missingCols.length > 0) {
        throw new Error(`File thiếu các cột quan trọng: ${missingCols.join(', ')}.`);
    }
}

const normalizeSearchString = (term) => String(term || '').trim().toUpperCase();

const splitSearchTerm = (term) => {
    const match = term.match(/^(.*?)([A-Z]{1,2})$/i);
    if (match) {
        const [_, maMon, khoiThi] = match;
        return { maMon: maMon.trim().toUpperCase(), khoiThi: khoiThi.trim().toUpperCase() };
    }
    return { maMon: term.toUpperCase(), khoiThi: '' };
};

function searchData() {
    if (EXAM_DATA.length === 0) {
        displayResults([]);
        return;
    }

    const rawSearchText = document.getElementById('searchTermInput').value;
    const rawTerms = rawSearchText.split(',').map(normalizeSearchString).filter(Boolean);

    if (rawTerms.length === 0) {
        displayResults(EXAM_DATA);
        return;
    }

    const getHeaderKey = (targetName) => HEADERS.find(h => normalizeHeaderName(h).toUpperCase().includes(targetName.toUpperCase())) || targetName;
    const KHOI_THI_KEY = getHeaderKey(KHOI_THI_HEADER_NAME);
    const MA_MON_KEY = getHeaderKey(MA_MON_HEADER_NAME);
    const MON_THI_KEY = getHeaderKey(MON_THI_HEADER_NAME);

    let foundTerms = new Set();
    const filteredData = EXAM_DATA.filter(row => {
        const maMonValue = normalizeSearchString(row[MA_MON_KEY]);
        const monThiValue = normalizeSearchString(row[MON_THI_KEY]);
        const khoiThiRaw = normalizeSearchString(row[KHOI_THI_KEY]);

        return rawTerms.some(searchTerm => {
            let matchFound = false;
            const { maMon: searchMaMon, khoiThi: searchKhoiThi } = splitSearchTerm(searchTerm);

            if (monThiValue.includes(searchTerm) || maMonValue.includes(searchTerm)) {
                matchFound = true;
            }

            if (!matchFound && searchKhoiThi && maMonValue.includes(searchMaMon)) {
                const matchBracket = khoiThiRaw.match(/\((.*?)\)/);
                if (matchBracket && matchBracket[1].replace(/[\s\-]/g, '').includes(searchKhoiThi)) {
                    matchFound = true;
                }
            }

            if (matchFound) foundTerms.add(searchTerm);
            return matchFound;
        });
    });

    const notFoundTerms = new Set(rawTerms.filter(term => !foundTerms.has(term)));
    displayResults(filteredData, notFoundTerms);
}

function displayResults(data, notFoundTerms = new Set()) {
    const tableBody = document.querySelector('#resultTable tbody');
    const tableHead = document.querySelector('#resultTable thead tr');

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (HEADERS.length > 0) {
        HEADERS.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHead.appendChild(th);
        });
    }

    const colspan = HEADERS.length || 1;
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${colspan}">Không tìm thấy kết quả phù hợp.</td></tr>`;
    } else {
        const NGAY_THI_KEY = HEADERS.find(h => normalizeHeaderName(h).toUpperCase().includes(NGAY_THI_HEADER_NAME.toUpperCase())) || NGAY_THI_HEADER_NAME;

        data.forEach(row => {
            const tr = document.createElement('tr');
            HEADERS.forEach(header => {
                const td = document.createElement('td');
                let cellValue = row[header] || '';
                if (header === NGAY_THI_KEY && typeof cellValue === 'number' && cellValue > 0) {
                    cellValue = excelSerialToJSDate(cellValue);
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
        showModal('Không Tìm Thấy', `Không tìm thấy kết quả cho: <strong>${termList}</strong>.`, 'warning', null, 5000);
    } else if (currentSearchText && data.length === 0) {
        showModal('Không Có Kết Quả', `Không có kết quả nào cho "${currentSearchText}".`, 'warning', null, 3000);
    }
}