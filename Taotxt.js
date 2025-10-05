  let history = [];
  let historyIndex = -1;
  const maxHistory = 50;
  function saveState() {
    const textarea = document.getElementById('content');
    const currentState = textarea.value;
    
    // Only save if the content has changed
    if (historyIndex === -1 || currentState !== history[historyIndex]) {
      // Truncate history if we're not at the end
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }
      
      history.push(currentState);
      historyIndex++;
      
      // Limit history size
      if (history.length > maxHistory) {
        history.shift();
        historyIndex--;
      }
      
      updateButtons();
    }
  }
  function updateButtons() {
    document.getElementById('undoBtn').disabled = historyIndex <= 0;
    document.getElementById('redoBtn').disabled = historyIndex >= history.length - 1;
  }
  function updateLineNumbers() {
    const textarea = document.getElementById('content');
    const lineNumbers = document.getElementById('lineNumbers');
    const lines = textarea.value.split('\n').length || 1;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
      numbers += i + '\n';
    }
    lineNumbers.value = numbers;
    const maxDigits = lines.toString().length;
    lineNumbers.style.width = (maxDigits * 12 + 24) + "px";
    syncScroll();
  }
  function syncScroll() {
    const textarea = document.getElementById('content');
    const lineNumbers = document.getElementById('lineNumbers');
    lineNumbers.scrollTop = textarea.scrollTop;
  }
   
   
   
   
   function saveTxt() {
  const content = document.getElementById('content').value;
  let filename = document.getElementById('filename').value.trim();

  if (!filename) {
    filename = ".txt";
  } else {
    // Nếu người dùng không gõ đuôi .txt thì tự thêm vô
    if (!filename.toLowerCase().endsWith(".txt")) {
      filename += ".txt";
    }
  }

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

   
   
   
   
   
   
  function clearText() {
    const textarea = document.getElementById('content');
    textarea.value = '';
    saveState();
    updateLineNumbers();
  }
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      const textarea = document.getElementById('content');
      textarea.value = history[historyIndex] || '';
      updateLineNumbers();
      updateButtons();
    }
  }
  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      const textarea = document.getElementById('content');
      textarea.value = history[historyIndex] || '';
      updateLineNumbers();
      updateButtons();
    }
  }
  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      const textarea = document.getElementById('content');
      textarea.value = text;
      saveState();
      updateLineNumbers();
    } catch (err) {
      console.error('Failed to paste: ', err);
    }
  }
  async function copyText() {
    try {
      const textarea = document.getElementById('content');
      await navigator.clipboard.writeText(textarea.value);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
  window.onload = () => {
    updateLineNumbers();
    saveState(); // Initialize history with empty state
  };