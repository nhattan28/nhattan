// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyAMwN6o53q6nUeimA8arZSi7pSevFJxdiw",
    authDomain: "website-tan.firebaseapp.com",
    projectId: "website-tan",
    storageBucket: "website-tan.firebasestorage.app",
    messagingSenderId: "907440668433",
    appId: "1:907440668433:web:3b52aea9e8bca0b63696b0",
    measurementId: "G-DP0TNSTCR0"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Lắng nghe trạng thái đăng nhập để bảo vệ trang
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Người dùng chưa đăng nhập, chuyển hướng ngay lập tức
        window.location.href = 'dangnhap.html';
    }
});

// Bao bọc tất cả code tương tác DOM trong sự kiện 'DOMContentLoaded'
document.addEventListener('DOMContentLoaded', () => {
    // Thêm sự kiện cho nút đăng xuất
    document.getElementById('signOutButton').addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("Đăng xuất thành công");
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    });

    // ⏰ Hiển thị đồng hồ
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString('vi-VN');
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('date').textContent = now.toLocaleDateString('vi-VN', options);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ☰ Mở sidebar
    window.showSidebar = function() {
        document.getElementById('sidebar').classList.add('show');
        document.getElementById('overlay').classList.add('show');
        document.getElementById('toggleBtn').classList.add('hide');
    }

    // ❌ Đóng sidebar + collapse thẻ cha
    window.hideSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const toggleBtn = document.getElementById('toggleBtn');
        const searchInput = document.getElementById('search-input');

        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        toggleBtn.classList.remove('hide');
        
        // Xóa nội dung tìm kiếm và reset menu
        searchInput.value = '';
        filterMenu();
    }

    // 🔁 Chuyển trang + tô màu
    window.loadPage = function(event, pageUrl) {
        document.getElementById('iframeView').src = pageUrl;

        document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sidebar details').forEach(detail => detail.classList.remove('active-parent'));

        const clickedBtn = event.target;
        const parentDetail = clickedBtn.closest('details');
        if (parentDetail) parentDetail.classList.add('active-parent');
        clickedBtn.classList.add('active');

        hideSidebar();
    }

    // 🔄 Chỉ cho mở 1 thẻ cha cùng lúc
    document.querySelectorAll('.sidebar details').forEach((detail) => {
        detail.addEventListener('toggle', () => {
            if (detail.open) {
                document.querySelectorAll('.sidebar details').forEach((d) => {
                    if (d !== detail) {
                        d.removeAttribute('open');
                    }
                });
            }
        });
    });

    // Lọc menu
    window.filterMenu = function() {
        const input = document.getElementById('search-input');
        const filter = input.value.toLowerCase();
        const sidebar = document.getElementById('sidebar');
        const detailsElements = sidebar.getElementsByTagName('details');
        const allButtons = sidebar.querySelectorAll('button');

        if (filter === "") {
            for (let i = 0; i < allButtons.length; i++) {
                allButtons[i].style.display = 'block';
            }
            for (let i = 0; i < detailsElements.length; i++) {
                detailsElements[i].open = false;
                detailsElements[i].style.display = 'block';
            }
            return;
        }

        for (let i = 0; i < allButtons.length; i++) {
            allButtons[i].style.display = 'none';
        }

        for (let i = 0; i < detailsElements.length; i++) {
            const details = detailsElements[i];
            const summary = details.querySelector('summary');
            const summaryText = summary.textContent.toLowerCase();
            let hasMatch = false;

            if (summaryText.includes(filter)) {
                details.style.display = 'block';
                details.open = true;
                hasMatch = true;
                const childButtons = details.querySelectorAll('button');
                for (let j = 0; j < childButtons.length; j++) {
                    childButtons[j].style.display = 'block';
                }
            } else {
                const childButtons = details.querySelectorAll('button');
                for (let j = 0; j < childButtons.length; j++) {
                    const button = childButtons[j];
                    const buttonText = button.textContent.toLowerCase();
                    if (buttonText.includes(filter)) {
                        button.style.display = 'block';
                        details.style.display = 'block';
                        details.open = true;
                        hasMatch = true;
                    } else {
                        button.style.display = 'none';
                    }
                }
            }
            if (!hasMatch) {
                details.style.display = 'none';
            }
        }
    }
});