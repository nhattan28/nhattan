let state = {questions: [], answers: [], order: [], userAns: [], index:0, mode:'untimed', customTime:5, timeLeft:300, timer:null, totalTime: 300}; // Thêm totalTime
const popup = document.getElementById('popupGuide');
function showGuide(){ popup.classList.add('show'); }
function hideGuide(){ popup.classList.remove('show'); }
document.getElementById('closeGuide').onclick = hideGuide;
showGuide();
renderUpload();

function renderUpload(){
  state = {...state, questions:[], answers:[], order:[], userAns:[], index:0, timeLeft:300, timer:null};
  document.getElementById('mainCard').innerHTML = `
    <h2>📝 Kiểm tra tự luận</h2>
    <div style="margin-bottom:18px;">
      <div style="border:2.8px dashed #1877f2;border-radius:32px;padding:36px 4vw;text-align:center;width:96%;margin:auto;">
        <input type="file" id="fileInput" accept=".docx" style="display:none">
        <button class="main-btn" onclick="document.getElementById('fileInput').click()">Chọn tệp</button>
        <div id="fileName" style="margin:10px 0;font-size:15.5px;color:#1877f2;font-weight:500;"></div>
        <span style="font-size:15.5px;color:#3e5177">Kéo và thả tệp Word (.docx) vào đây hoặc chọn tệp</span>
      </div>
    </div>
    <div class="radio-group" style="margin:13px 0 16px;">
      <b>Chế độ thời gian:</b><br>
      <label><input type="radio" name="mode" value="untimed" checked> Không giới hạn</label>
      <label>
        <input type="radio" name="mode" value="timed"> Giới hạn
        <input type="number" id="customTime" min="1" max="9999" placeholder="" value="" style="width:56px;margin-left:7px;"> phút
      </label>
      <div id="timeAlert"></div>
    </div>
    <div class="btn-row">
      <button class="main-btn" id="startBtn" disabled>Bắt đầu</button>
      <button class="func-btn" onclick="showGuide()">HDSD</button>
    </div>
    <div class="btn-row2">
      <button class="func-btn" onclick="renderUploadFormat()">Định dạng mẫu</button>
      <button class="home-btn" onclick="window.location.href='kiemtra.html'">Trang chủ</button>
    </div>
  `;
  document.getElementsByName('mode').forEach(r=>r.onchange = e => {
    state.mode = e.target.value;
    const timeInput = document.getElementById('customTime');
    if(state.mode==='timed') {
      timeInput.disabled=false;
      timeInput.value='';
      timeInput.focus();
    } else {
      timeInput.disabled=true;
      document.getElementById('timeAlert').style.display="none";
    }
  });
  document.getElementById('customTime').oninput = function(){
    let numeric = this.value.replace(/[^\d]/g,'');
    this.value = numeric;
    this.style.width = Math.max(56,Math.min(56 + 16*(this.value.length-3), 300)) + "px";
    if(this.value.length > 3) {
      document.getElementById('timeAlert').textContent = "Thời gian quá dài!";
      document.getElementById('timeAlert').style.display="block";
      setTimeout(()=>{document.getElementById('timeAlert').style.display="none"},2000);
    }
    state.customTime = Math.min(999, Math.max(1,parseInt(this.value)||1));
  };
  document.getElementById('customTime').disabled = true;
  document.getElementById('fileInput').onchange = handleFile;
  document.getElementById('startBtn').onclick = toQuiz;
  const dropBox = document.querySelector('.card .main-btn').parentElement;
  dropBox.ondragover = e=>{e.preventDefault();dropBox.style.background="#e6f1ff"};
  dropBox.ondragleave = e=>{e.preventDefault();dropBox.style.background=""};
  dropBox.ondrop = function(e){
    e.preventDefault();dropBox.style.background="";
    if(e.dataTransfer.files.length) {
      document.getElementById('fileInput').files=e.dataTransfer.files;
      handleFile({target:{files:e.dataTransfer.files}});
    }
  }
}
function handleFile(e){
  const file = e.target.files[0]; if (!file) return;
  document.getElementById('fileName').textContent = file.name;
  const reader = new FileReader();
  reader.onload = function(ev){
    mammoth.convertToHtml({arrayBuffer:ev.target.result}).then(res=>{
      let qa=parseDocx(res.value);
      state.questions = qa.map(x=>x.question);
      state.answers = qa.map(x=>x.answer);
      state.order = Array.from(qa.keys()).sort(()=>Math.random()-0.5);
      state.userAns=Array(qa.length).fill("");
      document.getElementById('startBtn').disabled = qa.length<1;
    });
  };
  reader.readAsArrayBuffer(file);
}

// FIX: Cải thiện logic parseDocx để giữ HTML/xuống dòng của đáp án
function parseDocx(html){
  let out=[], div=document.createElement('div');
  div.innerHTML=html.replace(/<p><\/p>/g, '').replace(/<p><strong.*?><\/strong><\/p>/g, '');
  let ps=[...div.querySelectorAll('p')], i=0;

  while(i < ps.length){
    let question_text = "", answer_html = "";
    
    // BƯỚC 1: Lấy câu hỏi (các đoạn KHÔNG in đậm liền nhau)
    while(i < ps.length && !ps[i].querySelector('b,strong')){
        question_text += (question_text ? "\n":"") + ps[i].innerText.trim();
        i++;
    }
    
    // BƯỚC 2: Lấy đáp án (các đoạn IN ĐẬM liền nhau)
    while(i < ps.length && ps[i].querySelector('b,strong')){
        let paragraph_html = ps[i].innerHTML;
        // Loại bỏ thẻ in đậm b/strong bên ngoài để CSS kết quả xử lý
        paragraph_html = paragraph_html.replace(/<\/?(strong|b)>/g, '').trim(); 
        
        // Nối các đoạn đáp án bằng <br> để tạo xuống dòng rõ ràng trong kết quả HTML
        answer_html += (answer_html ? "<br>" : "") + paragraph_html;
        i++;
    }
    
    if(question_text && answer_html){
      out.push({question: question_text.trim(), answer: answer_html.trim()});
    }
  }
  return out;
}

function toQuiz(){
  state.index=0;
  // Cập nhật totalTime
  state.totalTime = state.mode==='timed' ? state.customTime*60 : 300; 
  state.timeLeft = state.totalTime;
  renderQuiz();
  if(state.mode==='timed'){startTimer();}
}
function renderQuiz(){
  let idx=state.order[state.index];
  let html=`
    <div class="timer-container">
        <div class="quiz-header">
            <div class="question-count">Câu ${state.index+1}/${state.questions.length}:</div>
            <div id="timer"></div>
        </div>
        ${state.mode === 'timed' ? '<div class="progress-bar"><div class="progress-bar-fill" id="timerBar"></div></div>' : ''}
    </div>

    <div class="answer-block">
      <div style="margin:0 0 13px 0;white-space:pre-line;font-size:18px;">${state.questions[idx]}</div>
      <textarea id="ans" autocomplete="off" spellcheck="false" rows="7" placeholder="Nhập đáp án của bạn..."></textarea>
    </div>
    
    <div class="quiz-control-row">
      <button class="nav-btn" id="btnPrev" ${state.index==0?'disabled':''}>◀ Quay lại</button>
      <button class="main-btn" id="btnNext">${state.index==state.questions.length-1?'Nộp bài':'Tiếp theo ▶'}</button>
    </div>
  `;
  document.getElementById('mainCard').innerHTML = html;
  const ans=document.getElementById('ans');
  ans.value=state.userAns[idx]||"";
  ans.focus();
  ["paste","drop","copy","cut","contextmenu"].forEach(ev=>ans.addEventListener(ev,e=>e.preventDefault()));
  ans.addEventListener('input',()=>state.userAns[idx]=ans.value);
  document.getElementById('btnNext').onclick = ()=>{
    state.userAns[idx]=ans.value;
    if(state.index<state.questions.length-1){state.index++;renderQuiz();}
    else{if(state.timer)clearInterval(state.timer);renderResult();}
  };
  document.getElementById('btnPrev').onclick = ()=>{
    state.userAns[idx]=ans.value;
    if(state.index>0){state.index--;renderQuiz();}
  };
  updateTimer(); // Cập nhật bar ngay khi render
}

function startTimer(){
  if(state.timer) clearInterval(state.timer);
  state.timer=setInterval(()=>{
    state.timeLeft--;
    updateTimer();
    if(state.timeLeft<=0){clearInterval(state.timer);renderResult();}
  },1000);
}
function updateTimer(){
  const timerDisplay = document.getElementById('timer');
  if(timerDisplay)
    timerDisplay.textContent=`Thời gian còn lại: ${formatTime(state.timeLeft)}`;
    
  // Cập nhật Progress Bar và màu liên tục
  const timerBar = document.getElementById('timerBar');
  if(timerBar && state.mode === 'timed'){
      let percentage = (state.timeLeft / state.totalTime) * 100;
      let clampedPercentage = Math.max(0, percentage);
      
      // Tính toán Hue (Màu): 120 (Green) khi 100% -> 0 (Red) khi 0%
      let hue = Math.min(100, clampedPercentage) * 1.2; 
      
      timerBar.style.width = `${clampedPercentage}%`;
      // Màu: Hue 120 (Green) ở 100% -> Hue 0 (Red) ở 0%
      timerBar.style.backgroundColor = `hsl(${hue}, 80%, 45%)`;
  }
}
function formatTime(sec){
  let m=String(Math.floor(sec/60)).padStart(2,"0"),s=String(sec%60).padStart(2,"0");
  return `${m}:${s}`;
}
function renderResult(){
  let html=`<h2>Kết quả tự luận</h2><div class="result-block"><ul>`;
  let correct=0;
  state.order.forEach((idx,i)=>{
    let ua=(state.userAns[idx]||"").trim(),ca_html=(state.answers[idx]||"").trim(); // ca_html là đáp án dưới dạng HTML
    
    // Chuỗi text để so sánh (loại bỏ thẻ HTML và thay <br> bằng \n)
    let ca_text=ca_html.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, "").trim(); 
    let sim=calcSim(ua,ca_text);
    
    if(sim>=95){html+=`<li><span class="correct">Câu ${i+1}: Đúng (${Math.round(sim)}%)</span></li>`;correct++;}
    else{
        // Chèn HTML thô của đáp án vào <i>
        html+=`<li><span class="incorrect">Câu ${i+1}: Sai (${Math.round(sim)}%)<br>Đáp án: <i style="color:#444">${ca_html}</i></span></li>`;
    }
  });
  html+=`</ul><b>Tổng: ${correct}/${state.questions.length} câu đúng (${Math.round(100*correct/state.questions.length)}%)</b></div>
  <button class="main-btn" onclick="renderUpload()">Làm lại bài khác</button>`;
  document.getElementById('mainCard').innerHTML=html;
}
function calcSim(a,b){
  if(!a||!b)return 0;
  a=a.replace(/\s+/g,'').toLowerCase();b=b.replace(/\s+/g,'').toLowerCase();
  let match=0;for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]===b[i])match++;
  return 100*match/b.length;
}
// tuluan.js

// tuluan.js

function renderUploadFormat(){
  document.getElementById('mainCard').innerHTML=`
    <h3>Định dạng file Word:</h3>
    <div style="background:#f1f5fa;border-radius:14px;padding:19px 16px 13px;border:2px dashed #1877f2; width: 90%; max-width: 600px; margin: 0 auto 30px;">
      Câu 1. Thơ hay về cậu?<br>
      <b>Đủ nắng hoa sẽ nở
      <br>Đủ yêu thương hạnh phúc sẽ đong đầy</b><br>
      Câu 2. JavaScript là gì?<br>
      <b>JavaScript là ngôn ngữ lập trình được nhà phát triển sử dụng để tạo trang web tương tác.</b>
    </div>
    
    <div class="btn-row" style="margin-top: 0;"> 
        <button class="main-btn" onclick="renderUpload()">Quay lại</button>
    </div>
  `;
}