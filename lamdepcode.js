function detectParser(code) {
  const trimmed = code.trim();
  try {
    if (/^\s*</.test(trimmed)) return { parser: "html", prism: "markup" };
    if (/^\s*{\s*".*"\s*:.*/.test(trimmed)) return { parser: "json", prism: "json" };
    if (/^\s*(let|const|function|var)\s/.test(trimmed)) return { parser: "babel", prism: "javascript" };
    if (/^\s*(import|export|interface|type)\s/.test(trimmed)) return { parser: "typescript", prism: "typescript" };
    if (/^\s*[-\w]+:\s/.test(trimmed)) return { parser: "yaml", prism: "yaml" };
    if (/^\s*(query|mutation)\s/.test(trimmed)) return { parser: "graphql", prism: "graphql" };
    if (/^\s*(#|[*_])/.test(trimmed)) return { parser: "markdown", prism: "markdown" };
  } catch {}
  return { parser: "babel", prism: "javascript" };
}

async function beautifyCode() {
  const input = document.getElementById("codeInput").value;
  const output = document.getElementById("outputCode");
  if (!input.trim()) {
    alert("⚠️ Vui lòng nhập mã để làm đẹp.");
    return;
  }

  const { parser, prism } = detectParser(input);
  try {
    const formatted = await prettier.format(input, {
      parser,
      plugins: prettierPlugins
    });
    output.className = `language-${prism}`;
    output.textContent = formatted;
    Prism.highlightElement(output);
  } catch (err) {
    output.textContent = "❌ Lỗi format: " + err.message;
  }
}

function copyResult() {
  const code = document.getElementById("outputCode").textContent;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code)
      .then(() => alert("✅ Đã copy!"))
      .catch(() => fallbackCopy(code));
  } else {
    fallbackCopy(code);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const success = document.execCommand("copy");
    alert(success ? "✅ Đã copy!" : "❌ Không thể copy.");
  } catch (err) {
    alert("❌ Lỗi copy: " + err.message);
  }

  document.body.removeChild(textarea);
}

function clearAll() {
  document.getElementById("codeInput").value = "";
  document.getElementById("outputCode").textContent = "";
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("codeInput").value = text; // đúng ID rồi
  } catch (err) {
    alert("❌ Không thể dán. Trình duyệt không hỗ trợ hoặc bị chặn.");
    console.error("Clipboard read failed: ", err);
  }
}
