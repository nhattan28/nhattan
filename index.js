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

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'dangnhap.html';
    }
});


// ==========================================================
// 2. LOGIC CHAT AI (NON-STREAMING + FORMATTING)
// ==========================================================

// BẮT BUỘC: ĐẢM BẢO 3 KHÓA NÀY LÀ KHÓA API GEMINI THẬT CỦA BẠN!
const API_KEYS = [
    'AIzaSyCHzVct9IpP5zSJYOqn7k5BeJxDAy_nV9o', 
    'AIzaSyDIHiB4VM2l6hk8VJbzrHeTc7CExLnlOrE', 
    'AIzaSyDcdRpuI6SlwPS1Fyp7kdJpMgLm7Jzpp5I'  
];
let currentKeyIndex = 0;
const chatHistory = [];

/**
 * Chuyển đổi Markdown cơ bản sang HTML (In đậm và Xuống dòng)
 * @param {string} text - Văn bản Markdown thô từ API
 * @returns {string} - Văn bản đã chuyển đổi sang HTML
 */
function convertMarkdownToHtml(text) {
    // 1. Xử lý ký tự xuống hàng (\n) thành thẻ <br>
    let html = text.replace(/\n/g, '<br>');

    // 2. Xử lý In đậm: chuyển *văn bản* thành <strong>văn bản</strong>
    html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // (Có thể mở rộng thêm cho Danh sách, tiêu đề nếu cần)

    return html;
}

function switchToNextKey() {
  currentKeyIndex++;
  if(currentKeyIndex >= API_KEYS.length) {
    currentKeyIndex = 0; 
    return false; 
  }
  return true; 
}

/**
 * Gửi tin nhắn đến Gemini API (NON-STREAMING - Ổn định nhất)
 */
async function sendMessageToGemini(message, aiResponseDiv) {
  const apiKey = API_KEYS[currentKeyIndex];
  
  if (apiKey.includes('YOUR_ACTUAL_GEMINI_API_KEY')) {
      aiResponseDiv.textContent = "AI: Lỗi cấu hình: Vui lòng thay thế các khóa API mẫu bằng khóa Gemini thật của bạn trong index.js.";
      chatHistory.pop();
      return;
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
  
  chatHistory.push({ role: "user", parts: [{ text: message }] });
  let fullResponseText = "";

  try {
    const payload = { contents: chatHistory };
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Bắt lỗi HTTP (429, 400, 403)
    if(!response.ok) {
        // KIỂM TRA CẢ 429 (Quá giới hạn) VÀ 503 (Quá tải máy chủ)
        if((response.status === 429 || response.status === 503) && switchToNextKey()) {
            console.warn(`Lỗi ${response.status}. Đang chuyển sang khóa ${currentKeyIndex} và thử lại...`);
            chatHistory.pop(); 
            // Thêm một độ trễ nhỏ (ví dụ: 1-2 giây) khi gặp lỗi 503 để tránh spam máy chủ
            if(response.status === 503) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            return await sendMessageToGemini(message, aiResponseDiv); 
        }
        
        // Nếu chuyển hết key hoặc gặp lỗi khác, hiển thị lỗi
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error?.message || `Lỗi HTTP: ${response.status} ${response.statusText}`;
        aiResponseDiv.textContent = `AI: Lỗi API: ${errorMessage}. (Code: ${response.status})`;
        chatHistory.pop();
        return;
    }
    // XỬ LÝ PHẢN HỒI JSON
    const result = await response.json();
    fullResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (fullResponseText) {
      // SỬ DỤNG HÀM CHUYỂN ĐỔI MARKDOWN
      const formattedHtml = convertMarkdownToHtml(fullResponseText);
      aiResponseDiv.innerHTML = "AI: " + formattedHtml; 
      
      chatHistory.push({ role: "model", parts: [{ text: fullResponseText }] });
    } else {
       aiResponseDiv.textContent = "AI: Xin lỗi, tôi không thể tạo phản hồi lúc này.";
       chatHistory.pop(); 
    }
    
  } catch(e) {
    console.error("Lỗi khi gọi Gemini API:", e);
    chatHistory.pop(); 
    aiResponseDiv.textContent = `AI: Đã xảy ra lỗi hệ thống: Failed to fetch. (Vui lòng chạy trên Live Server)`;
  }
}

// Hàm gửi tin nhắn thực tế (Gắn vào nút Gửi)
async function sendAIMessage() {
  const inputElement = document.getElementById('aiInput');
  const message = inputElement.value.trim();
  const messagesDiv = document.getElementById('aiMessages');

  if (!message) return;
  
  // 1. Chuẩn bị giao diện
  inputElement.value = '';
  inputElement.disabled = true;

  // Tin nhắn Người dùng
  const userMsgDiv = document.createElement('div');
  userMsgDiv.style.margin = '10px 0';
  userMsgDiv.style.padding = '8px';
  userMsgDiv.style.borderRadius = '8px';
  userMsgDiv.style.background = '#0f0'; 
  userMsgDiv.style.color = '#1a1a1a';
  userMsgDiv.style.textAlign = 'right';
  userMsgDiv.textContent = 'Bạn: ' + message;
  messagesDiv.appendChild(userMsgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Khung phản hồi AI (Báo hiệu đang chờ)
  const aiResponseDiv = document.createElement('div');
  aiResponseDiv.style.margin = '10px 0';
  aiResponseDiv.style.padding = '8px';
  aiResponseDiv.style.borderRadius = '8px';
  aiResponseDiv.style.background = '#2a2a2a'; 
  aiResponseDiv.style.color = '#f0f0f0';
  aiResponseDiv.textContent = 'AI: Đang nghĩ...';
  messagesDiv.appendChild(aiResponseDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // 2. GỌI HÀM API
  await sendMessageToGemini(message, aiResponseDiv);

  // 3. Hoàn tất và định dạng lỗi
  const isError = aiResponseDiv.textContent.includes('Lỗi') || aiResponseDiv.textContent.includes('Xin lỗi') || aiResponseDiv.textContent.includes('Failed to fetch');
  aiResponseDiv.style.background = isError ? '#cc0000' : '#2a2a2a';
  aiResponseDiv.style.color = isError ? '#fff' : '#f0f0f0';
  
  inputElement.disabled = false;
  inputElement.focus();
}
window.sendAIMessage = sendAIMessage;

// HÀM XÓA LỊCH SỬ CHAT (Gắn vào nút Xóa)
function clearChatHistory() {
  const messagesDiv = document.getElementById('aiMessages');
  if (messagesDiv) {
    chatHistory.length = 0; 
    
    // Hiển thị thông báo xóa
    messagesDiv.innerHTML = '<div id="clearMessage" style="color: #999; font-style: italic; text-align: center; padding: 10px;">Lịch sử trò chuyện đã được xóa.</div>';
    
    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => {
      const clearMsg = document.getElementById('clearMessage');
      if (clearMsg) {
        clearMsg.remove();
      }
    }, 3000); 
  }
}
window.clearChatHistory = clearChatHistory;

// Hàm mở và đóng popup
function openAIPopup() {
  const popup = document.getElementById('aiPopup');
  const input = document.getElementById('aiInput');
  
  if (popup) {
      popup.style.display = 'block';
  }
  
  // ĐẶT CON TRỎ CHUỘT
  if (input) {
      input.focus();
  }
}
window.openAIPopup = openAIPopup;

function closeAIPopup() {
  document.getElementById('aiPopup').style.display = 'none';
}
window.closeAIPopup = closeAIPopup;

// ==========================================================
// 3. CODE TƯƠNG TÁC DOM KHÁC (SIDEBAR, CLOCK, LOGOUT, FILTER)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Gắn sự kiện cho nút AI 
    const btnAI = document.getElementById('btnAI');
    if(btnAI){
      btnAI.addEventListener('click', openAIPopup);
    } 
    
    // Gắn sự kiện Enter cho input chat
    const aiInput = document.getElementById('aiInput');
    if(aiInput){
      aiInput.addEventListener('keypress', function(e){
        if(e.key === 'Enter') sendAIMessage();
      });
    }

    // Gắn sự kiện cho nút Logout
    document.getElementById('signOutButton').addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("Đăng xuất thành công");
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    });

    function updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString('vi-VN');
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('date').textContent = now.toLocaleDateString('vi-VN', options);
    }
    setInterval(updateClock, 1000);
    updateClock();

    window.showSidebar = function() {
        document.getElementById('sidebar').classList.add('show');
        document.getElementById('overlay').classList.add('show');
        document.getElementById('toggleBtn').classList.add('hide');
    }

    window.hideSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const toggleBtn = document.getElementById('toggleBtn');
        const searchInput = document.getElementById('search-input');

        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        toggleBtn.classList.remove('hide');
        
        // Tắt bộ lọc khi đóng sidebar
        if(searchInput) searchInput.value = '';
        window.filterMenu();
    }

    window.loadPage = function(event, pageUrl) {
        document.getElementById('iframeView').src = pageUrl;

        // Xử lý trạng thái active
        document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sidebar details').forEach(detail => detail.classList.remove('active-parent'));

        const clickedBtn = event.target;
        const parentDetail = clickedBtn.closest('details');
        if (parentDetail) parentDetail.classList.add('active-parent');
        clickedBtn.classList.add('active');

        hideSidebar();
    }

    // Đảm bảo chỉ mở một Details
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

    window.filterMenu = function() {
        const input = document.getElementById('search-input');
        const filter = input.value.toLowerCase();
        const sidebar = document.getElementById('sidebar');
        if(!sidebar) return;
        
        const detailsElements = sidebar.getElementsByTagName('details');
        const allButtons = sidebar.querySelectorAll('button');

        // Logic lọc menu
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
// Biến toàn cục (đã có)
window.aiPopupMaximized = false;

// Hàm toggle phóng to/thu nhỏ popup
window.toggleAIPopupMaximize = function() {
  var popup = document.getElementById('aiPopup');
  var btn = document.getElementById('toggleSizeBtn');
  var messagesDiv = document.getElementById('aiMessages');

  if (!window.aiPopupMaximized) {
    popup.style.top = '42px'; 
    popup.style.left = '12px';
    popup.style.right = '12px';
    popup.style.bottom = '12px';
    popup.style.width = 'auto';
    popup.style.height = 'auto';
    
    // Áp dụng Flexbox cho Popup
    popup.style.display = 'flex'; 
    popup.style.flexDirection = 'column'; 
    
    // #aiMessages chiếm hết không gian còn lại
    messagesDiv.style.flexGrow = '1';
    // Đảm bảo không có max-height thừa và overflow là auto
    messagesDiv.style.maxHeight = 'none'; 
    messagesDiv.style.overflowY = 'auto';
    
    btn.textContent = '🗗';
    window.aiPopupMaximized = true;
  } else {
    // === THU NHỎ (MINIMIZE) ===
    popup.style.top = '';
    popup.style.left = '';
    popup.style.right = '30px';
    popup.style.bottom = '30px';
    popup.style.width = '400px';
    popup.style.height = '';
    
    // Xóa Flexbox cho Popup
    popup.style.display = 'block'; 
    popup.style.flexDirection = 'row'; 
    
    // Đặt lại thuộc tính cho #aiMessages (chế độ mặc định)
    messagesDiv.style.flexGrow = '0';
    messagesDiv.style.maxHeight = '200px'; 
    messagesDiv.style.overflowY = 'auto';
    
    btn.textContent = '⛶';
    window.aiPopupMaximized = false;
  }
};

window.closeAIPopup = function() {
  document.getElementById('aiPopup').style.display = 'none';
};
window.sendAIMessage = sendAIMessage; // đã export ra window
window.clearChatHistory = clearChatHistory; // đã export ra window
window.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('toggleSizeBtn');
  if (btn) btn.textContent = '⛶';
  window.aiPopupMaximized = false;
});
