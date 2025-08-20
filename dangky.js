import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMwN6o53q6nUeimA8arZSi7pSevFJxdiw",
    authDomain: "website-tan.firebaseapp.com",
    projectId: "website-tan",
    storageBucket: "website-tan.firebasestorage.app",
    messagingSenderId: "907440668433",
    appId: "1:907440668433:web:3b52aea9e8bca0b63696b0",
    measurementId: "G-DP0TNSTCR0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

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

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const captchaValue = captchaInput.value.toUpperCase();
    const messageElement = document.getElementById('registerMessage');

    // Kiểm tra captcha
    if (captchaValue !== captchaText) {
        messageElement.textContent = "❌ Mã captcha không chính xác.";
        messageElement.style.color = "red";
        captchaInput.value = "";
        generateCaptcha3D();
        return;
    }

    if (password !== confirmPassword) {
        messageElement.textContent = 'Mật khẩu và xác nhận mật khẩu không khớp.';
        messageElement.style.color = 'red';
        return;
    }
    
    if (password.length < 6) {
        messageElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        messageElement.style.color = 'red';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            username: username,
            createdAt: serverTimestamp()
        });

        messageElement.textContent = 'Đăng ký thành công! Vui lòng quay lại trang đăng nhập.';
        messageElement.style.color = 'green';
        document.getElementById('registerForm').reset();
        generateCaptcha3D();
    } catch (error) {
        let errorMessage = 'Lỗi đăng ký: ' + error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Tên người dùng này đã được sử dụng.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Tên người dùng không hợp lệ.';
        }
        
        messageElement.textContent = errorMessage;
        messageElement.style.color = 'red';
        generateCaptcha3D();
    }
});
