import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    signInWithPopup, 
    GithubAuthProvider 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

// --- Cấu hình Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyAMwN6o53q6nUeimA8arZSi7pSevFJxdiw",
    authDomain: "website-tan.firebaseapp.com",
    projectId: "website-tan",
    storageBucket: "website-tan.firebasestorage.app",
    messagingSenderId: "907440668433",
    appId: "1:907440668433:web:3b52aea9e8bca0b63696b0",
    measurementId: "G-DP0TNSTCR0"
};

// --- Khởi tạo Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// --- Lấy các phần tử DOM ---
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('loginMessage');
const resetPasswordLink = document.getElementById('resetPasswordLink');
const githubLoginBtn = document.getElementById('githubLoginBtn');

// Captcha
const captchaCanvas = document.getElementById("captchaCanvas");
const captchaInput = document.getElementById("captchaInput");
const refreshCaptchaBtn = document.getElementById("refreshCaptcha");
let captchaText = "";

// --- Hàm sinh Captcha ---
function generateCaptcha3D() {
  const ctx = captchaCanvas.getContext("2d");

  // đặt kích thước canvas = width khung cha
  captchaCanvas.width = captchaCanvas.parentElement.clientWidth - 55; // trừ chỗ nút refresh
  captchaCanvas.height = 60;

  ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);

  captchaText = Math.random().toString(36).substring(2, 7).toUpperCase();

  for (let i = 0; i < captchaText.length; i++) {
    const x = 30 + i * 40;
    const y = 40 + Math.random() * 5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.4);

    const gradient = ctx.createLinearGradient(0, 0, 0, 40);
    gradient.addColorStop(0, "#ff0000");
    gradient.addColorStop(1, "#0000ff");

    ctx.font = "bold 32px Arial";
    ctx.fillStyle = gradient;

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }

  // thêm nhiễu
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
    ctx.lineTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.stroke();
  }
}
    generateCaptcha3D();

refreshCaptchaBtn.addEventListener("click", () => {
    generateCaptcha3D();
    captchaInput.value = "";
});

// --- Chức năng 1: Đăng nhập bằng Email + Mật khẩu + Captcha ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = usernameInput.value;
    const password = passwordInput.value;
    const captchaValue = captchaInput.value.toUpperCase();

    // Kiểm tra captcha
    if (captchaValue !== captchaText) {
        messageElement.textContent = "❌ Mã captcha không chính xác.";
        messageElement.style.color = "red";
        captchaInput.value = "";
        generateCaptcha3D();
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        messageElement.textContent = 'Đăng nhập thành công!';
        messageElement.style.color = 'green';
        
        setTimeout(() => {
            window.location.href = 'trangchu.html';
        }, 500);

    } catch (error) {
        let errorMessage = 'Sai tên người dùng hoặc mật khẩu.';
        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Định dạng email không hợp lệ.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Tài khoản của bạn đã bị vô hiệu hóa.';
        }
        
        messageElement.textContent = errorMessage;
        messageElement.style.color = 'red';
        captchaInput.value = "";
        generateCaptcha3D();
    }
});

// --- Chức năng 2: Đặt lại mật khẩu ---
resetPasswordLink.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = usernameInput.value;

    if (!email) {
        messageElement.textContent = 'Vui lòng nhập email của bạn để đặt lại mật khẩu.';
        messageElement.style.color = 'orange';
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        messageElement.textContent = 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.';
        messageElement.style.color = 'green';
    } catch (error) {
        let errorMessage = 'Lỗi khi gửi email đặt lại mật khẩu.';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Không tìm thấy tài khoản nào với email này.';
        }
        messageElement.textContent = errorMessage;
        messageElement.style.color = 'red';
    }
});

// --- Chức năng 3: Đăng nhập bằng GitHub ---
if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', async () => {
        const provider = new GithubAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            messageElement.textContent = 'Đăng nhập bằng GitHub thành công!';
            messageElement.style.color = 'green';
        } catch (error) {
            let errorMessage = "Đã xảy ra lỗi khi đăng nhập bằng GitHub.";
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Tài khoản đã tồn tại với một phương thức đăng nhập khác.';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Cửa sổ đăng nhập đã bị đóng. Vui lòng thử lại.';
            }
            messageElement.textContent = errorMessage;
            messageElement.style.color = 'red';
        }
    });
}
