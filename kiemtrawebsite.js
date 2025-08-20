const canvas = document.querySelector('.bg-animation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];

function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.size = Math.random() * 3 + 1;
  this.speedX = Math.random() * 2 - 1;
  this.speedY = Math.random() * 2 - 1;
}

Particle.prototype.update = function() {
  this.x += this.speedX;
  this.y += this.speedY;
  if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
  if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
};

Particle.prototype.draw = function() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
  ctx.fill();
};

function init() {
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

async function analyzeLink() {
  const input = document.getElementById('inputLink').value.trim();
  const output = document.getElementById('output');
  output.innerHTML = "Analyzing... - Đang phân tích...";

  const index = input.lastIndexOf("http");
  let realLink = index !== -1 ? decodeURIComponent(input.slice(index)) : "";
  if (!realLink || !realLink.startsWith("http")) {
    output.innerHTML = '<div class="danger">Invalid link! - Link không hợp lệ!</div>';
    return;
  }

  const urlObj = new URL(realLink);
  const domain = urlObj.hostname.replace('www.', '');
  const protocol = urlObj.protocol;
  const params = urlObj.searchParams;

  const safetyReport = await checkSafety(realLink);
  let manualWarnings = checkManualRisk(realLink, domain, params);
  let utmSection = parseUTMParams(urlObj);

  let message = `
    <strong>Link: - Link:</strong> <span class="link-container"><span class="hidden-text">${shortenText(realLink, 50)}</span></span>
    <button class="show-btn" onclick="toggleLink(this, '${realLink}', true)">Show - Hiện</button>
    <button class="hide-btn" onclick="toggleLink(this, '${realLink}', false)">Hide - Ẩn</button><br>
    <strong>Domain: - Miền:</strong> ${domain}<br>
    <strong>HTTPS: - Bảo mật:</strong> ${protocol === "https:" ? '<span class="safe">Yes - Có</span>' : '<span class="danger">No! - Không!</span>'}<br>
    <strong>Warnings: - Cảnh báo:</strong> ${[...safetyReport.warnings, ...manualWarnings].join('<br>')}${utmSection}
  `;
  output.innerHTML = message;
}

async function checkSafety(url) {
  const API_KEY = "YOUR_API_KEY_HERE";
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
  const body = {
    client: { clientId: "soi-link", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "PHISHING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    let warnings = [];
    if (data.matches) {
      data.matches.forEach(match => {
        switch (match.threatType) {
          case "MALWARE": warnings.push('<span class="danger">⚠ Malware detected! - Malware phát hiện!</span>'); break;
          case "PHISHING": warnings.push('<span class="danger">⚠ Phishing detected! - Lừa đảo (Phishing)!</span>'); break;
          case "SOCIAL_ENGINEERING": warnings.push('<span class="warn">⚠ Social engineering! - Kỹ thuật xã hội!</span>'); break;
          case "UNWANTED_SOFTWARE": warnings.push('<span class="warn">⚠ Unwanted software! - Phần mềm không mong muốn!</span>'); break;
          case "POTENTIALLY_HARMFUL_APPLICATION": warnings.push('<span class="warn">⚠ Potentially harmful app! - Ứng dụng có hại!</span>'); break;
        }
      });
      return { overall: '<span class="danger">Dangerous! - Nguy hiểm!</span>', warnings };
    }
    return { overall: '<span class="safe">Safe - An toàn</span>', warnings: [] };
  } catch {
    return { overall: '<span class="warn">Check failed - Kiểm tra thất bại</span>', warnings: ['<span class="warn">Cannot verify safety. - Không thể xác minh an toàn.</span>'] };
  }
}

function checkManualRisk(url, domain, params) {
  let warnings = [];
  const scamDomains = ["bit.ly", "tinyurl.com", "scamlink.co", "phishingsite.com"];
  if (scamDomains.includes(domain)) {
    warnings.push('<span class="danger">⚠ Possible scam/fraud! - Có dấu hiệu scam/lừa đảo!</span>');
  }

  const adDomains = ["ad.doubleclick.net", "googleadservices.com"];
  if (adDomains.includes(domain) || params.has("utm_source") || params.has("utm_campaign")) {
    warnings.push('<span class="danger">⚠ May contain ads! - Có thể chứa quảng cáo!</span>');
  }

  if (url.includes("short") || url.includes("link/")) {
    warnings.push('<span class="danger">⚠ Shortened link, be cautious! - Link rút gọn, cần cẩn thận!</span>');
  }

  return warnings.length > 0 ? warnings : ['<span class="safe">No manual risks detected. - Không phát hiện rủi ro thủ công.</span>'];
}

function parseUTMParams(urlObj) {
  const params = urlObj.searchParams;
  const utmKeys = [
    { key: "utm_source", vi: "Nguồn" },
    { key: "utm_medium", vi: "Kênh" },
    { key: "utm_campaign", vi: "Chiến dịch" },
    { key: "utm_content", vi: "Nội dung" },
    { key: "utm_term", vi: "Từ khóa" }
  ];
  let html = "";
  let found = false;
  for (let item of utmKeys) {
    if (params.has(item.key)) {
      if (!found) html += "<br><strong>UTM: - UTM:</strong><br><table class='utm-table'><tr><th>Parameter - Tham số</th><th>Value - Giá trị</th></tr>";
      html += `<tr><td>${item.key} (${item.vi})</td><td>${shortenText(params.get(item.key), 20)}</td></tr>`;
      found = true;
    }
  }
  html += found ? "</table>" : "<br><em>No UTM found. - Không có UTM.</em>";
  return html;
}

function shortenText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function toggleLink(btn, fullText, show) {
  const linkContainer = btn.parentElement.querySelector('.link-container');
  const linkSpan = linkContainer.querySelector('.hidden-text');
  const showBtn = linkContainer.parentElement.querySelector('.show-btn');
  const hideBtn = linkContainer.parentElement.querySelector('.hide-btn');

  if (show) {
    linkSpan.textContent = fullText;
    linkSpan.classList.add('active');
    showBtn.style.display = 'none';
    hideBtn.style.display = 'inline-block';
  } else {
    linkSpan.textContent = shortenText(fullText, 50);
    linkSpan.classList.remove('active');
    showBtn.style.display = 'inline-block';
    hideBtn.style.display = 'none';
  }
}

function clearLink() {
  document.getElementById('inputLink').value = '';
  document.getElementById('output').innerHTML = '';
}

async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById("inputLink").value = text;
    } catch (err) {
      alert("Không thể dán. Trình duyệt không hỗ trợ hoặc bị chặn.");
      console.error("Clipboard read failed: ", err);
    }
  }