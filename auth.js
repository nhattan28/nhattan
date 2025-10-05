let currentPage = window.location.pathname.split('/').pop() || 'index.html';
function getMeaningfulPassword() {
  const today = new Date();
  const day = today.getDate().toString();
  return day; // Chỉ lấy ngày, ví dụ: '28'
}

function setPasswordExpiration() {
  const password = getMeaningfulPassword();
  const expirationTime = new Date();
  expirationTime.setHours(23, 59, 59, 999); // Hết hạn vào cuối ngày

  localStorage.setItem(`authPassword_${currentPage}`, password);
  localStorage.setItem(`authExpiration_${currentPage}`, expirationTime.getTime());
  localStorage.removeItem(`isAuthenticated_${currentPage}`);

  let codeSet = false;
  Object.defineProperty(window, 'Tân', {
    set: function (value) {
      if ((value === password || value === parseInt(password)) && !codeSet) {
        console.log(`Mật khẩu cho ${currentPage}: ${password}`);
        console.log(`Hết hạn: ${expirationTime.toLocaleString('vi-VN')}`);
        codeSet = true;
      } else if (!codeSet) {
        console.log('Mã không đúng!');
      }
    },
    get: function () {
      return undefined;
    }
  });
}

function isPasswordValid(inputPassword) {
  const storedPassword = localStorage.getItem(`authPassword_${currentPage}`);
  const expiration = parseInt(localStorage.getItem(`authExpiration_${currentPage}`));
  const now = Date.now();

  return (inputPassword === storedPassword && now < expiration);
}

function showPasswordPrompt() {
  const overlay = document.createElement('div');
  overlay.id = 'passwordOverlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); display: flex; justify-content: center;
    align-items: center; z-index: 1000;
  `;

  const promptBox = document.createElement('div');
  promptBox.style.cssText = `
    background: white; padding: 20px; border-radius: 8px;
    text-align: center; max-width: 400px; width: 90%;
  `;

  // Sử dụng type="text" để tránh gợi ý mật khẩu tự động
  promptBox.innerHTML = `
    <input type="text" id="passwordInput" placeholder="Nhập mật khẩu..." style="width: 100%; padding: 8px; margin: 10px 0;" autofocus autocomplete="off">
    <p id="errorMessage" style="color: red; display: none;">Mật khẩu không đúng hoặc đã hết hạn!</p>
  `;

  overlay.appendChild(promptBox);
  document.body.appendChild(overlay);

  document.body.style.overflow = 'hidden';
  const mainContent = document.body.children;
  for (let element of mainContent) {
    if (element !== overlay && element.tagName !== 'SCRIPT') {
      element.style.display = 'none';
    }
  }

  const passwordInput = document.getElementById('passwordInput');
  passwordInput.focus();

  // Chuyển lại type thành "password" sau khi đã focus
  passwordInput.setAttribute('type', 'password');

  passwordInput.addEventListener('input', () => {
    const inputPassword = passwordInput.value;
    const errorMessage = document.getElementById('errorMessage');

    if (inputPassword.length > 0) {
      if (isPasswordValid(inputPassword)) {
        localStorage.setItem(`isAuthenticated_${currentPage}`, 'true');
        overlay.remove();
        document.body.style.overflow = 'auto';
        for (let element of mainContent) {
          if (element !== overlay && element.tagName !== 'SCRIPT') {
            element.style.display = '';
          }
        }
      } else {
        errorMessage.style.display = 'block';
      }
    } else {
      errorMessage.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setPasswordExpiration();

  if (localStorage.getItem(`isAuthenticated_${currentPage}`) === 'true' && isPasswordValid(localStorage.getItem(`authPassword_${currentPage}`))) {
    document.body.style.overflow = 'auto';
  } else {
    showPasswordPrompt();
  }
});