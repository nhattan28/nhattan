document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadFile = document.getElementById('uploadFile');
    const clearBtn = document.getElementById('clearBtn');
    const profileForm = document.getElementById('profileForm');
    const statusMessage = document.getElementById('statusMessage');
    
    // Nút và container cho các trường động
    const emailContainer = document.getElementById('emailContainer');
    const phoneContainer = document.getElementById('phoneContainer');
    const emergencyContactContainer = document.getElementById('emergencyContactContainer');
    const socialMediaContainer = document.getElementById('socialMediaContainer');
    const bankAccountContainer = document.getElementById('bankAccountContainer');
    
    // Các trường cần định dạng đặc biệt
    const cccdInput = document.getElementById('cccd');
    const bhytInput = document.getElementById('bhyt');
    const studentIdInput = document.getElementById('studentId');

    // Modal elements
    const downloadModal = document.getElementById('downloadModal');
    const fileNameInput = document.getElementById('fileNameInput');
    const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');
    const closeBtn = document.querySelector('.close-btn');

    // Chuyển đổi giữa các tab
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const targetTab = button.dataset.tab;
            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // Hàm định dạng số điện thoại: 3-3-4
    function formatPhoneNumber(event) {
        let phoneNumber = event.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
        let formattedNumber = '';
        
        if (phoneNumber.length > 0) {
            if (phoneNumber.length <= 3) {
                formattedNumber = phoneNumber;
            } else if (phoneNumber.length <= 6) {
                formattedNumber = phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3);
            } else {
                formattedNumber = phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3, 6) + ' ' + phoneNumber.substring(6, 10);
            }
        }
        event.target.value = formattedNumber.trim();
    }
    
    // Định dạng CCCD và BHYT: 4-4-4
    if (cccdInput) {
        cccdInput.addEventListener('input', (event) => {
            let idNumber = event.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            let formattedNumber = '';
            if (idNumber.length > 0) {
                formattedNumber = idNumber.match(/.{1,4}/g).join(' ');
            }
            event.target.value = formattedNumber;
        });
    }

    if (bhytInput) {
        bhytInput.addEventListener('input', (event) => {
            let idNumber = event.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            let formattedNumber = '';
            if (idNumber.length > 0) {
                formattedNumber = idNumber.match(/.{1,4}/g).join(' ');
            }
            event.target.value = formattedNumber;
        });
    }
    
    // Định dạng Mã số sinh viên: 3-3-5-...
    if (studentIdInput) {
        studentIdInput.addEventListener('input', (event) => {
            let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
            let formatted = '';
            let pattern = [3, 3, 5];
            let patternIndex = 0;
            let totalLength = 0;
            
            for (let i = 0; i < value.length; i++) {
                formatted += value[i];
                totalLength++;
                
                if (totalLength === pattern[patternIndex] && i < value.length - 1) {
                    formatted += ' ';
                    totalLength = 0;
                    patternIndex = (patternIndex + 1) % pattern.length;
                }
            }
            event.target.value = formatted;
        });
    }

    // Định dạng Số tài khoản ngân hàng: 4-3-3-3-...
    document.addEventListener('input', (event) => {
        if (event.target.name === 'Số tài khoản ngân hàng') {
            let bankNumber = event.target.value.replace(/\s/g, '');
            let formattedNumber = '';
            
            if (bankNumber.length > 0) {
                formattedNumber = bankNumber.substring(0, 4);
                if (bankNumber.length > 4) {
                    const remaining = bankNumber.substring(4);
                    const groups = remaining.match(/.{1,3}/g);
                    if (groups) {
                        formattedNumber += ' ' + groups.join(' ');
                    }
                }
            }
            event.target.value = formattedNumber.trim();
        }
    });

    // Định dạng Email/SĐT đăng nhập: Nếu là số điện thoại thì định dạng 3-3-4
    document.addEventListener('input', (event) => {
        if (event.target.name === 'Email/SĐT đăng nhập' && /^\d+$/.test(event.target.value.replace(/\s/g, ''))) {
            let loginValue = event.target.value.replace(/\s/g, '');
            let formattedValue = '';
            if (loginValue.length > 0) {
                if (loginValue.length <= 3) {
                    formattedValue = loginValue;
                } else if (loginValue.length <= 6) {
                    formattedValue = loginValue.substring(0, 3) + ' ' + loginValue.substring(3);
                } else {
                    formattedValue = loginValue.substring(0, 3) + ' ' + loginValue.substring(3, 6) + ' ' + loginValue.substring(6, 10);
                }
            }
            event.target.value = formattedValue.trim();
        }
    });
    
    // Thêm dòng nhập liệu
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-more-btn')) {
            const container = event.target.closest('.dynamic-input-container');
            if (container) {
                if (container.id === 'emailContainer') {
                    addEmailRow();
                } else if (container.id === 'phoneContainer') {
                    addPhoneRow();
                } else if (container.id === 'emergencyContactContainer') {
                    addEmergencyContactRow();
                } else if (container.id === 'socialMediaContainer') {
                    addSocialMediaRow();
                } else if (container.id === 'bankAccountContainer') {
                    addBankAccountRow();
                }
            }
        }
    });

    // Hiển thị modal khi click nút Tải xuống
    downloadBtn.addEventListener('click', () => {
        const data = collectData();
        if (data === "") {
            showMessage("Vui lòng điền ít nhất một thông tin trước khi tải xuống.", "error");
            return;
        }
        downloadModal.style.display = 'flex';
        fileNameInput.value = 'Hồ sơ cá nhân';
        fileNameInput.focus();
    });

    // Xử lý khi xác nhận tải xuống từ modal
    confirmDownloadBtn.addEventListener('click', () => {
        let fileName = fileNameInput.value.trim();
        if (fileName === "") {
            fileName = "Hồ sơ cá nhân";
        }
        performDownload(fileName);
        downloadModal.style.display = 'none';
        profileForm.reset();
        addDefaultRows();
        showMessage("Hồ sơ đã được tạo và tải xuống thành công!", "success");
    });
    
    // Đóng modal
    closeBtn.addEventListener('click', () => {
        downloadModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === downloadModal) {
            downloadModal.style.display = 'none';
        }
    });

    // Hàm thực hiện tải xuống
    function performDownload(fileName) {
        const data = collectData();
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Xử lý sự kiện khi tải file lên
    uploadFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            clearBtn.style.display = 'none';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            populateForm(text);
            showMessage("Tải file lên thành công! Bạn có thể chỉnh sửa hồ sơ.", "success");
            clearBtn.style.display = 'block';
        };
        reader.readAsText(file);
    });

    // Xử lý sự kiện khi click nút Xóa hồ sơ
    clearBtn.addEventListener('click', () => {
        profileForm.reset();
        addDefaultRows();
        clearBtn.style.display = 'none';
        showMessage("Hồ sơ đã được xóa trắng.", "success");
    });

    // Hàm thêm các dòng mặc định
    function addDefaultRows() {
        emailContainer.innerHTML = '';
        phoneContainer.innerHTML = '';
        emergencyContactContainer.innerHTML = '';
        socialMediaContainer.innerHTML = '';
        bankAccountContainer.innerHTML = '';
        
        // Thêm các dòng mặc định
        addEmailRow();
        addPhoneRow();
        addEmergencyContactRow();
        addSocialMediaRow();
        addBankAccountRow();
    }

    // Hàm cập nhật nút Thêm/Xóa
    function updateAddRemoveButtons(container) {
        const rows = container.querySelectorAll('.input-row');
        
        rows.forEach((row, index) => {
            const removeBtn = row.querySelector('.remove-btn');
            const addBtn = row.querySelector('.add-more-btn');
            
            // Ẩn nút xóa nếu chỉ có một dòng
            if (rows.length <= 1) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'flex';
            }
            
            // Ẩn nút thêm ở tất cả các dòng, trừ dòng cuối
            if (index === rows.length - 1) {
                addBtn.style.display = 'flex';
            } else {
                addBtn.style.display = 'none';
            }
        });
    }

    // Hàm thu thập dữ liệu
    function collectData() {
        let data = "";
        const elements = profileForm.querySelectorAll('input, select, textarea');
        
        elements.forEach(el => {
            if (el.closest('.input-row')) {
                return; // Xử lý riêng các trường động
            }
            const name = el.name || el.id;
            const value = el.value.trim();
            if (value && el.type !== 'submit' && el.type !== 'button' && el.type !== 'file') {
                data += `${name}: ${value}\n`;
            }
        });
        
        // Thu thập dữ liệu Email
        const emails = emailContainer.querySelectorAll('.input-row');
        emails.forEach((div, index) => {
            const email = div.querySelector('input[name="Email cá nhân"]').value;
            if (email) {
                data += `Email ${index + 1}: ${email}\n`;
            }
        });
        
        // Thu thập dữ liệu Số điện thoại
        const phones = phoneContainer.querySelectorAll('.input-row');
        phones.forEach((div, index) => {
            const phone = div.querySelector('input[name="Số điện thoại cá nhân"]').value;
            if (phone) {
                data += `Số điện thoại cá nhân ${index + 1}: ${phone}\n`;
            }
        });
        
        // Thu thập dữ liệu liên hệ khẩn cấp
        const emergencyContacts = emergencyContactContainer.querySelectorAll('.input-row');
        emergencyContacts.forEach((div, index) => {
            const title = div.querySelector('input[name="Chức danh khẩn cấp"]').value;
            const phone = div.querySelector('input[name="Số điện thoại khẩn cấp"]').value;
            if (title && phone) {
                data += `Khẩn cấp ${index + 1} - Chức danh: ${title}\n`;
                data += `Khẩn cấp ${index + 1} - SĐT: ${phone}\n`;
            }
        });

        // Thu thập dữ liệu mạng xã hội
        const socialMediaAccounts = socialMediaContainer.querySelectorAll('.input-row');
        socialMediaAccounts.forEach((div, index) => {
            const socialName = div.querySelector('input[name="Tên mạng xã hội"]').value;
            const login = div.querySelector('input[name="Email/SĐT đăng nhập"]').value;
            const password = div.querySelector('input[name="Mật khẩu"]').value;
            if (socialName && login && password) {
                data += `Mạng xã hội ${socialName}: ${login} | ${password}\n`;
            }
        });
        
        // Thu thập dữ liệu tài khoản ngân hàng
        const bankAccounts = bankAccountContainer.querySelectorAll('.input-row');
        bankAccounts.forEach((div, index) => {
            const bankName = div.querySelector('input[name="Tên ngân hàng"]').value;
            const accountNumber = div.querySelector('input[name="Số tài khoản ngân hàng"]').value;
            if (bankName && accountNumber) {
                data += `Tài khoản ngân hàng ${index + 1} - Tên: ${bankName}\n`;
                data += `Tài khoản ngân hàng ${index + 1} - Số: ${accountNumber}\n`;
            }
        });

        return data;
    }

    // Hàm điền dữ liệu vào form
    function populateForm(text) {
        const lines = text.split('\n');
        profileForm.reset();
        addDefaultRows(); // Reset về các dòng mặc định
        
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length > 1) {
                const name = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                const element = document.querySelector(`[name="${name}"]`);
                
                if (element) {
                    element.value = value;
                } else if (name.startsWith('Khẩn cấp')) {
                    const type = name.split('-')[1].trim();
                    if (type === 'Chức danh') {
                        addEmergencyContactRow(value, '');
                    } else if (type === 'SĐT') {
                        const lastInput = emergencyContactContainer.lastElementChild.querySelector('input[name="Số điện thoại khẩn cấp"]');
                        if (lastInput) {
                            lastInput.value = value;
                        }
                    }
                } else if (name.startsWith('Mạng xã hội')) {
                    const socialName = name.replace('Mạng xã hội', '').trim();
                    const [login, password] = value.split('|').map(s => s.trim());
                    addSocialMediaRow(socialName, login, password);
                } else if (name.startsWith('Tài khoản ngân hàng')) {
                    const type = name.split('-')[1].trim();
                    if (type === 'Tên') {
                        addBankAccountRow(value, '');
                    } else if (type === 'Số') {
                        const lastInput = bankAccountContainer.lastElementChild.querySelector('input[name="Số tài khoản ngân hàng"]');
                        if (lastInput) {
                            lastInput.value = value;
                        }
                    }
                } else if (name.startsWith('Email')) {
                    addEmailRow(value);
                } else if (name.startsWith('Số điện thoại cá nhân')) {
                    addPhoneRow(value);
                }
            }
        });
        
        // Cập nhật lại các nút sau khi điền dữ liệu
        updateAddRemoveButtons(emailContainer);
        updateAddRemoveButtons(phoneContainer);
        updateAddRemoveButtons(emergencyContactContainer);
        updateAddRemoveButtons(socialMediaContainer);
        updateAddRemoveButtons(bankAccountContainer);
    }

    // Hàm tạo dòng Email mới
    function addEmailRow(email = '') {
        const newDiv = document.createElement('div');
        newDiv.className = 'input-row';
        newDiv.innerHTML = `
            <input type="email" name="Email cá nhân" value="${email}" placeholder="Email cá nhân" autocomplete="off">
            <button type="button" class="remove-btn">x</button>
            <button type="button" class="add-more-btn">+</button>
        `;
        emailContainer.appendChild(newDiv);
        updateAddRemoveButtons(emailContainer);
    }

    // Hàm tạo dòng Số điện thoại mới
    function addPhoneRow(phone = '') {
        const newDiv = document.createElement('div');
        newDiv.className = 'input-row';
        newDiv.innerHTML = `
            <input type="tel" name="Số điện thoại cá nhân" value="${phone}" placeholder="Số điện thoại" autocomplete="off">
            <button type="button" class="remove-btn">x</button>
            <button type="button" class="add-more-btn">+</button>
        `;
        phoneContainer.appendChild(newDiv);
        const newPhoneInput = newDiv.querySelector('input[type="tel"]');
        if (newPhoneInput) {
            newPhoneInput.addEventListener('input', formatPhoneNumber);
        }
        updateAddRemoveButtons(phoneContainer);
    }

    // Hàm tạo dòng liên hệ khẩn cấp mới
    function addEmergencyContactRow(name = '', phone = '') {
        const newDiv = document.createElement('div');
        newDiv.className = 'input-row';
        newDiv.innerHTML = `
            <input type="text" name="Chức danh khẩn cấp" value="${name}" placeholder="Chức danh" autocomplete="off">
            <input type="tel" name="Số điện thoại khẩn cấp" value="${phone}" placeholder="Số điện thoại" autocomplete="off">
            <button type="button" class="remove-btn">x</button>
            <button type="button" class="add-more-btn">+</button>
        `;
        emergencyContactContainer.appendChild(newDiv);
        const newPhoneInput = newDiv.querySelector('input[type="tel"]');
        if (newPhoneInput) {
            newPhoneInput.addEventListener('input', formatPhoneNumber);
        }
        updateAddRemoveButtons(emergencyContactContainer);
    }

    // Hàm tạo dòng mạng xã hội mới
    function addSocialMediaRow(socialName = '', login = '', password = '') {
        const newDiv = document.createElement('div');
        newDiv.className = 'input-row';
        newDiv.innerHTML = `
            <input type="text" name="Tên mạng xã hội" value="${socialName}" placeholder="Tên mạng xã hội" autocomplete="off">
            <input type="text" name="Email/SĐT đăng nhập" value="${login}" placeholder="Email hoặc SĐT" autocomplete="off">
            <input type="password" name="Mật khẩu" value="${password}" placeholder="Mật khẩu" autocomplete="new-password">
            <button type="button" class="remove-btn">x</button>
            <button type="button" class="add-more-btn">+</button>
        `;
        socialMediaContainer.appendChild(newDiv);
        updateAddRemoveButtons(socialMediaContainer);
    }
    
    // Hàm tạo dòng tài khoản ngân hàng mới
    function addBankAccountRow(bankName = '', accountNumber = '') {
        const newDiv = document.createElement('div');
        newDiv.className = 'input-row';
        newDiv.innerHTML = `
            <input type="text" name="Tên ngân hàng" value="${bankName}" placeholder="Tên ngân hàng" autocomplete="off">
            <input type="text" name="Số tài khoản ngân hàng" value="${accountNumber}" placeholder="Số tài khoản" autocomplete="off">
            <button type="button" class="remove-btn">x</button>
            <button type="button" class="add-more-btn">+</button>
        `;
        bankAccountContainer.appendChild(newDiv);
        updateAddRemoveButtons(bankAccountContainer);
    }

    // Xóa dòng nhập liệu
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const row = event.target.closest('.input-row');
            if (row) {
                const container = row.parentElement;
                row.remove();
                if (container) {
                    updateAddRemoveButtons(container);
                }
            }
        }
    });

    // Hàm hiển thị thông báo
    function showMessage(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = `status-message show ${type}`;
        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, 3000);
    }

    // Khởi tạo các dòng mặc định khi tải trang
    addDefaultRows();
});