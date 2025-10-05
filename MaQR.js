   function generateQRCode() {
     const text = document.getElementById('text').value.trim();
     const qrcodeContainer = document.getElementById('qrcode');
     qrcodeContainer.innerHTML = ""; // Clear old QR
     if (text === "") {
       alert("Nhập gì đi má ơi!");
       return;
     }
     new QRCode(qrcodeContainer, {
       text: text,
       width: 360,
       height: 360
     });
   }
   async function pasteText() {
     try {
       const text = await navigator.clipboard.readText();
       document.getElementById('text').value = text;
     } catch (err) {
       alert("Không lấy được clipboard! Trình duyệt có chặn không?");
     }
   }
   function clearText() {
     document.getElementById('text').value = "";
     document.getElementById('qrcode').innerHTML = "";
   }
