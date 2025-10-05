// Function để vô hiệu hóa F12 và các phím tắt khác của DevTools
function disableDevTools() {
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
            console.log('Developer Tools are disabled.');
        }
    });
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    const threshold = 160;
    let devToolsOpen = false;
    window.addEventListener('resize', () => {
        if (
            window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold
        ) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                console.log('DevTools have been detected and an action has been taken.');
            }
        } else {
            devToolsOpen = false;
        }
    });
}
disableDevTools();

// CẬP NHẬT HÀM showAlert (4 tham số)
function showAlert(title, message, type, details = '') {
    const alertContainer = document.getElementById('custom-alert');
    const alertBox = alertContainer.querySelector('.alert-box');
    const alertIcon = document.getElementById('alert-icon');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const alertOkBtn = document.getElementById('alert-ok-btn');

    alertTitle.textContent = title;
    
    // Nếu là lỗi trùng lịch, message là đoạn văn bản đầu tiên
    if (type === 'error' && details) {
        alertMessage.innerHTML = `<p>${message}</p><div class="conflict-detail">${details}</div>`;
    } else {
        // Đối với thông báo thông thường (success/lỗi khác)
        alertMessage.innerHTML = `<p style="text-align:center; font-weight:bold;">${message}</p>`;
    }


    alertBox.className = `alert-box ${type}`;
    alertIcon.className = `alert-icon ${type}`;
    alertContainer.style.display = 'flex';

    alertOkBtn.onclick = function () {
        alertContainer.style.display = 'none';
    };
}

// Chuyển đổi giữa các trang
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[onclick="showPage('${pageId}')"]`).classList.add('active');

    if (pageId === 'page2') {
        renderTimetable();
        showTimetable('1');
    }
    if (pageId === 'page3') {
        updateRegisteredCoursesList();
    }
    if (pageId === 'page4') {
        calculateTuitionFee();
    }
}

// Chuyển đổi giữa các thời khóa biểu Giai đoạn 1 và 2
function showTimetable(semester) {
    document.getElementById('timetable-gd1').style.display = 'none';
    document.getElementById('timetable-gd2').style.display = 'none';
    document.getElementById(`timetable-gd${semester}`).style.display = 'block';

    document.querySelectorAll('.timetable-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`button[onclick="showTimetable('${semester}')"]`).classList.add('active');
}

// Global data and state variables
let registeredCourses = [];
let tuitionFeeData = {
    feePer16Credits: 0,
    programType: 'normal'
};
let sessionCounter = 1;

// Tìm đến đoạn mã xử lý sự kiện click của nút "Thêm giờ học"
document.querySelector('.add-session-btn').addEventListener('click', () => {
    const container = document.getElementById('class-sessions-container');
    const newSession = document.createElement('div');
    newSession.className = 'class-session-row';
    newSession.innerHTML = `
        <div class="input-row">
            <div class="input-group">
                <label for="day-of-week-${sessionCounter}">Thứ:</label>
                <select id="day-of-week-${sessionCounter}" class="day-of-week" required>
                    <option value="">-- Chọn --</option>
                    <option value="T2">T2</option>
                    <option value="T3">T3</option>
                    <option value="T4">T4</option>
                    <option value="T5">T5</option>
                    <option value="T6">T6</option>
                    <option value="T7">T7</option>
                    <option value="CN">CN</option>
                </select>
            </div>
            <div class="input-group">
                <label for="time-${sessionCounter}">Giờ học:</label>
                <select id="time-${sessionCounter}" class="time" required>
                    <option value="">-- Chọn --</option>
                    <option value="07:00-09:00">07:00 - 09:00</option>
                    <option value="07:00-10:15">07:00 - 10:15</option>
                    <option value="07:00-11:15">07:00 - 11:15</option>
                    <option value="09:15-11:15">09:15 - 11:15</option>
                    <option value="13:00-15:00">13:00 - 15:00</option>
                    <option value="13:00-16:15">13:00 - 16:15</option>
                    <option value="13:00-17:15">13:00 - 17:15</option>
                    <option value="15:15-17:15">15:15 - 17:15</option>
                    <option value="17:45-21:00">17:45 - 21:00</option>
                </select>
            </div>
        </div>
        <div class="input-row">
            <label for="location-type-${sessionCounter}">Loại địa điểm:</label>
            <select id="location-type-${sessionCounter}" class="location-type" required>
                <option value="">-- Chọn --</option>
                <option value="online">Online</option>
                <option value="campus">Cơ sở</option>
            </select>
<div class="campus-location-field" style="display:none;">
    <label for="location-${sessionCounter}">Địa điểm:</label>
    <select id="location-${sessionCounter}" class="location" required>
        <option value="">-- Chọn địa điểm --</option>
        <option value="Hòa Khánh Nam">Hòa Khánh Nam</option>
        <option value="209 Phan Thanh">209 Phan Thanh</option>
        <option value="K7/25 Quang Trung">K7/25 Quang Trung</option>
        <option value="254 Nguyễn Văn Linh">254 Nguyễn Văn Linh</option>
        <option value="78A Phan Văn Trị">78A Phan Văn Trị</option>
        <option value="137 Nguyễn Văn Linh">137 Nguyễn Văn Linh</option>
        <option value="03 Quang Trung">03 Quang Trung</option>
    </select>
               </div>
            <button type="button" class="remove-session-btn">Xóa</button>
        </div>
    `;
    container.appendChild(newSession);

    // Attach event listeners to the new elements
    newSession.querySelector('.location-type').addEventListener('change', handleLocationTypeChange);
    newSession.querySelector('.remove-session-btn').addEventListener('click', removeSession);
    
    // Ensure the first "Xóa" button is shown if there's more than one session
    document.querySelector('.class-session-row .remove-session-btn').style.display = 'inline-block';

    sessionCounter++;
});

// Xóa một khối nhập liệu giờ học
function removeSession(e) {
    const sessionRow = e.target.closest('.class-session-row');
    if (document.querySelectorAll('.class-session-row').length > 1) {
        sessionRow.remove();
    }
    // Ẩn nút "Xóa" nếu chỉ còn một khối
    if (document.querySelectorAll('.class-session-row').length === 1) {
        document.querySelector('.class-session-row .remove-session-btn').style.display = 'none';
    }
}

// Xử lý logic hiển thị trường địa điểm
function handleLocationTypeChange(event) {
    const sessionRow = event.target.closest('.class-session-row');
    const campusField = sessionRow.querySelector('.campus-location-field');
    const locationInput = sessionRow.querySelector('.location');
    if (event.target.value === 'campus') {
        campusField.style.display = 'flex';
        locationInput.required = true;
    } else {
        campusField.style.display = 'none';
        locationInput.required = false;
    }
}
document.querySelectorAll('.location-type').forEach(select => {
    select.addEventListener('change', handleLocationTypeChange);
});
document.querySelectorAll('.remove-session-btn').forEach(btn => {
    btn.addEventListener('click', removeSession);
});

// Chuẩn hóa giá trị "Giai đoạn"
function normalizeSemesterWeek(value) {
    const v = value.trim();
    if (v === '1' || v.toLowerCase() === 'giai đoạn 1') return 'Giai đoạn 1';
    if (v === '2' || v.toLowerCase() === 'giai đoạn 2') return 'Giai đoạn 2';
    if (
        v === 'Cả 2 giai đoạn' ||
        v === '1,2' ||
        v === '2,1' ||
        v.toLowerCase() === 'cả 2 giai đoạn'
    ) return 'Cả 2 giai đoạn';
    return v;
}

// Chuyển đổi thời gian dạng "HH:mm" thành phút
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Chuyển đổi nhãn giai đoạn thành mã giai đoạn
function getSemestersFromLabel(label) {
    if (label === 'Giai đoạn 1') {
        return ['1'];
    } else if (label === 'Giai đoạn 2') {
        return ['2'];
    } else if (label === 'Cả 2 giai đoạn') {
        return ['1', '2'];
    }
    return [];
}

// Render lại toàn bộ thời khóa biểu
function renderTimetable() {
    const tables = {
        '1': document.getElementById('table-gd1').querySelector('tbody'),
        '2': document.getElementById('table-gd2').querySelector('tbody')
    };
    tables['1'].innerHTML = '';
    tables['2'].innerHTML = '';

    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const timeSlots = [
        "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
        "19:00", "20:00", "21:00"
    ];

    for (const semester of ['1', '2']) {
        const occupiedCells = new Set();
        
        // Tạo một mảng flat chứa tất cả các buổi học (sessions)
        const allSessions = registeredCourses.flatMap(course => 
            course.sessions.map(session => ({
                ...session,
                semesterWeek: course.semesterWeek,
                classCode: course.classCode
            }))
        ).filter(session => getSemestersFromLabel(session.semesterWeek).includes(semester));

        for (let i = 0; i < timeSlots.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `<td class="time-label">${timeSlots[i]}</td>`;

            for (let j = 0; j < daysOfWeek.length; j++) {
                const day = daysOfWeek[j];
                const cellKey = `${timeSlots[i]}-${day}`;

                if (occupiedCells.has(cellKey)) {
                    continue;
                }

                const session = allSessions.find(s => {
                    const sessionStartHour = s.time.split('-')[0];
                    return s.dayOfWeek === day && sessionStartHour.substring(0, 2) === timeSlots[i].substring(0, 2);
                });

                if (session) {
                    const [startTime, endTime] = session.time.split('-');
                    const startMin = timeToMinutes(startTime);
                    const endMin = timeToMinutes(endTime);
                    const durationInHours = (endMin - startMin) / 60;
                    const rowspan = Math.ceil(durationInHours);

                    for (let k = 0; k < rowspan; k++) {
                        if (i + k < timeSlots.length) {
                            occupiedCells.add(`${timeSlots[i + k]}-${day}`);
                        }
                    }

                    const location = session.locationType === 'online' ? 'Online' : session.location;
                    row.innerHTML += `
                        <td rowspan="${rowspan}" class="${session.locationType}-class">
                            <strong>${session.classCode}</strong><br/>
                            ${location}<br/>
                            (${session.time})
                        </td>
                    `;
                } else {
                    row.innerHTML += `<td></td>`;
                }
            }
            tables[semester].appendChild(row);
        }
    }
}

// Xử lý form khi submit
document.getElementById('course-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const semesterWeekRaw = document.getElementById('semester-week').value;
    const semesterWeek = normalizeSemesterWeek(semesterWeekRaw);

    if (!['Giai đoạn 1', 'Giai đoạn 2', 'Cả 2 giai đoạn'].includes(semesterWeek)) {
        showAlert('LỖI DỮ LIỆU', 'Vui lòng chọn đúng giá trị cho trường "Tuần học".', 'error');
        return;
    }

    const sessions = [];
    let isConflict = false;

    // Lấy dữ liệu từ tất cả các khối giờ học
    const sessionElements = document.querySelectorAll('.class-session-row');
    sessionElements.forEach(sessionElement => {
        const dayOfWeek = sessionElement.querySelector('.day-of-week').value.toUpperCase();
        const time = sessionElement.querySelector('.time').value;
        const locationType = sessionElement.querySelector('.location-type').value;
        const location = (locationType === 'online') ? 'Online' : sessionElement.querySelector('.location').value;

        // Kiểm tra dữ liệu buổi học
        if (!dayOfWeek || !time || !locationType) {
            isConflict = true;
            showAlert('LỖI DỮ LIỆU', 'Vui lòng điền đầy đủ thông tin cho tất cả các buổi học.', 'error');
            return;
        }

        sessions.push({
            dayOfWeek,
            time,
            locationType,
            location
        });
    });

    if (isConflict) {
        return;
    }

    const newCourse = {
        id: Date.now(),
        courseName: document.getElementById('course-name').value,
        classCode: document.getElementById('class-code').value,
        regCode: document.getElementById('reg-code').value,
        semesterWeek: semesterWeek,
        lecturer: document.getElementById('lecturer').value,
        credits: parseInt(document.getElementById('credits').value, 10),
        sessions: sessions
    };
    
    const semesters = getSemestersFromLabel(newCourse.semesterWeek);

    // Kiểm tra trùng lịch với các môn đã đăng ký
    for (const existingCourse of registeredCourses) {
        const existingSemesters = getSemestersFromLabel(existingCourse.semesterWeek);
        const hasCommonSemester = existingSemesters.some(s => semesters.includes(s));

        if (hasCommonSemester) {
            for (const newSession of newCourse.sessions) {
                for (const existingSession of existingCourse.sessions) {
                    if (newSession.dayOfWeek === existingSession.dayOfWeek) {
                        const newStartTimeInMin = timeToMinutes(newSession.time.split('-')[0]);
                        const newEndTimeInMin = timeToMinutes(newSession.time.split('-')[1]);
                        const existingStartTimeInMin = timeToMinutes(existingSession.time.split('-')[0]);
                        const existingEndTimeInMin = timeToMinutes(existingSession.time.split('-')[1]);
                        
                        if (Math.max(newStartTimeInMin, existingStartTimeInMin) < Math.min(newEndTimeInMin, existingEndTimeInMin)) {
                            isConflict = true;
                            
                            // CẬP NHẬT CÁCH GỌI HÀM showAlert
                            const detailsHTML = `Môn: <b>${existingCourse.courseName}</b><br>
                                                 Thời gian: <b>${existingSession.time}</b><br>
                                                 Ngày: <b>${existingSession.dayOfWeek}</b>`;

                            showAlert(
                                'LỊCH HỌC BỊ TRÙNG!',
                                'Môn bạn đang cố gắng đăng ký bị trùng với môn:',
                                'error',
                                detailsHTML
                            );
                            break;
                        }
                    }
                }
                if (isConflict) break;
            }
        }
        if (isConflict) break;
    }

    if (isConflict) {
        return;
    }

    registeredCourses.push(newCourse);
    registeredCourses.sort((a, b) => timeToMinutes(a.sessions[0].time.split('-')[0]) - timeToMinutes(b.sessions[0].time.split('-')[0]));
    renderTimetable();
    
    // CẬP NHẬT CÁCH GỌI HÀM showAlert
    showAlert('THÀNH CÔNG', 'Đăng ký môn học thành công!', 'success');
    
    document.getElementById('course-form').reset();
 // Thay thế đoạn mã cũ bằng đoạn HTML sau để form hiển thị lại dropdown
document.getElementById('class-sessions-container').innerHTML = `
<div class="class-session-row">
    <div class="input-row">
        <div class="input-group">
            <label for="day-of-week-0">Thứ:</label>
            <select id="day-of-week-0" class="day-of-week" required>
                <option value="">-- Chọn --</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="T4">T4</option>
                <option value="T5">T5</option>
                <option value="T6">T6</option>
                <option value="T7">T7</option>
                <option value="CN">CN</option>
            </select>
        </div>
        <div class="input-group">
            <label for="time-0">Giờ học:</label>
            <select id="time-0" class="time" required>
                <option value="">-- Chọn --</option>
                <option value="07:00-09:00">07:00 - 09:00</option>
                <option value="07:00-10:15">07:00 - 10:15</option>
                <option value="07:00-11:15">07:00 - 11:15</option>
                <option value="09:15-11:15">09:15 - 11:15</option>
                <option value="13:00-15:00">13:00 - 15:00</option>
                <option value="13:00-16:15">13:00 - 16:15</option>
                <option value="13:00-17:15">13:00 - 17:15</option>
                <option value="15:15-17:15">15:15 - 17:15</option>
                <option value="17:45-21:00">17:45 - 21:00</option>
            </select>
        </div>
    </div>
    <div class="input-row">
        <label for="location-type-0">Loại địa điểm:</label>
        <select id="location-type-0" class="location-type" required>
            <option value="">-- Chọn --</option>
            <option value="online">Online</option>
            <option value="campus">Cơ sở</option>
        </select>
        <div class="campus-location-field" style="display:none;">
            <label for="location-0">Địa điểm:</label>
            <select id="location-0" class="location" required>
                <option value="">-- Chọn địa điểm --</option>
                <option value="Hòa Khánh Nam">Hòa Khánh Nam</option>
                <option value="209 Phan Thanh">209 Phan Thanh</option>
                <option value="K7/25 Quang Trung">K7/25 Quang Trung</option>
                <option value="254 Nguyễn Văn Linh">254 Nguyễn Văn Linh</option>
                <option value="78A Phan Văn Trị">78A Phan Văn Trị</option>
                <option value="137 Nguyễn Văn Linh">137 Nguyễn Văn Linh</option>
                <option value="03 Quang Trung">03 Quang Trung</option>
            </select>
        </div>
        <button type="button" class="remove-session-btn" style="display:none;">Xóa</button>
    </div>
</div>
`;
    sessionCounter = 1;
    document.querySelector('.class-session-row .location-type').addEventListener('change', handleLocationTypeChange);
    document.querySelector('.class-session-row .remove-session-btn').addEventListener('click', removeSession);
});

// Cập nhật danh sách môn đã đăng ký và tổng tín chỉ
function updateRegisteredCoursesList() {
    const tbody = document.getElementById('registered-courses-body');
    tbody.innerHTML = '';
    let totalCredits = 0;

    registeredCourses.forEach((course, index) => {
        const row = tbody.insertRow();
        const semesterLabel = course.semesterWeek;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${course.courseName}</td>
            <td>${course.classCode}</td>
            <td>${course.regCode}</td>
            <td>${semesterLabel}</td>
            <td>${course.credits}</td>
            <td>${course.lecturer}</td>
            <td><button class="remove-btn" onclick="removeCourse(${course.id})">Xóa</button></td>
        `;
        totalCredits += parseInt(course.credits, 10);
    });

    document.getElementById('total-credits').textContent = totalCredits;
    calculateTuitionFee();
}

// Xóa môn học
function removeCourse(courseId) {
    registeredCourses = registeredCourses.filter(c => c.id !== courseId);
    renderTimetable();
    updateRegisteredCoursesList();
}

// Xóa tất cả môn học
function clearAllCourses() {
    registeredCourses = [];
    renderTimetable();
    updateRegisteredCoursesList();
    
    // CẬP NHẬT CÁCH GỌI HÀM showAlert
    showAlert('THÀNH CÔNG', 'Đã xóa tất cả môn học.', 'success');
}

// Tính toán học phí
function calculateTuitionFee() {
    const totalCredits = parseInt(document.getElementById('total-credits').textContent);
    const feePer16Credits = parseFloat(document.getElementById('fee-per-credit').value.replace(/[^0-9]/g, '')) || 0;
    const programType = document.querySelector('input[name="program-type"]:checked').value;
    let tuitionFee = 0;
    
    // Lưu giá trị vào biến toàn cục
    tuitionFeeData.feePer16Credits = feePer16Credits;
    tuitionFeeData.programType = programType;

    if (feePer16Credits === 0) {
        document.getElementById('total-tuition-fee').textContent = 'Vui lòng nhập học phí';
        return;
    }

    const feePerCredit = feePer16Credits / 16;
    let baseFee = feePer16Credits;

    if (programType === 'normal') {
        if (totalCredits < 14) {
            tuitionFee = totalCredits * feePerCredit;
        } else if (totalCredits >= 14 && totalCredits <= 19) {
            tuitionFee = baseFee;
        } else if (totalCredits > 19) {
            const extraCredits = totalCredits - 19;
            tuitionFee = baseFee + (extraCredits * feePerCredit);
        }
    } else if (programType === 'advanced') {
        if (totalCredits < 14) {
            tuitionFee = totalCredits * feePerCredit;
        } else if (totalCredits >= 14 && totalCredits <= 21) {
            tuitionFee = baseFee;
        } else if (totalCredits > 21) {
            const extraCredits = totalCredits - 21;
            tuitionFee = baseFee + (extraCredits * feePerCredit);
        }
    }

    const formattedFee = tuitionFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    document.getElementById('total-tuition-fee').textContent = formattedFee;
}

// Hàm xuất dữ liệu ra file JSON
function exportData() {
    if (registeredCourses.length === 0) {
        showAlert('LỖI XUẤT FILE', 'Không có dữ liệu để xuất.', 'error');
        return;
    }
    const dataToExport = {
        courses: registeredCourses,
        tuitionFeeData: tuitionFeeData
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thoi-khoa-bieu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // CẬP NHẬT CÁCH GỌI HÀM showAlert
    showAlert('THÀNH CÔNG', 'Xuất file thành công!', 'success');
}

// Hàm tải dữ liệu từ file JSON
function loadData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (!loadedData.courses || !Array.isArray(loadedData.courses)) {
                throw new Error('Định dạng file không hợp lệ.');
            }
            registeredCourses = loadedData.courses;
            tuitionFeeData = loadedData.tuitionFeeData || { feePer16Credits: 0, programType: 'normal' };
            
            // Cập nhật giao diện từ dữ liệu đã tải
            if (tuitionFeeData.feePer16Credits) {
                document.getElementById('fee-per-credit').value = tuitionFeeData.feePer16Credits.toLocaleString('vi-VN');
            }
            document.querySelector(`input[name="program-type"][value="${tuitionFeeData.programType}"]`).checked = true;

            renderTimetable();
            updateRegisteredCoursesList();
            
            // CẬP NHẬT CÁCH GỌI HÀM showAlert
            showAlert('THÀNH CÔNG', 'Tải dữ liệu thành công!', 'success');
        } catch (error) {
            console.error('Lỗi khi tải file:', error);
            showAlert('LỖI DỮ LIỆU', 'Định dạng file không hợp lệ. Vui lòng tải file JSON đúng định dạng.', 'error');
        }
    };
    reader.onerror = function() {
        showAlert('LỖI ĐỌC FILE', 'Lỗi khi đọc file. Vui lòng thử lại.', 'error');
    };
    reader.readAsText(file);
}

// Thêm sự kiện để format giá trị khi nhập
document.getElementById('fee-per-credit').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    calculateTuitionFee();
});

function redirectToPage() {
    window.location.href = "chuyendoijson.html";
}