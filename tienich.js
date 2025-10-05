const utilities =
  [
    {
        url: "https://luvvoice.com/vn", 
        title: "Chuyển văn bản thành giọng nói",
        desc: "Miễn phí, hơn 200 giọng nói và 70 ngôn ngữ."
    },
    {
        url: "https://suno.com/",
        title: "Tạo nhạc từ văn bản", 
        desc: "Dùng AI để biến ý tưởng thành bài hát." 
    },
    {
        url: "https://chromewebstore.google.com/detail/nlipoenfbbikpbjkfpfillcgkoblgpmj", 
        title: "Ảnh chụp màn hình và ghi màn hình", 
        desc: "Tiện ích chụp và quay màn hình - cần xác định thêm công dụng."
    },
    {
        url: "https://chromewebstore.google.com/detail/chụp-ảnh-màn-trang-web-ho/mcbpblocgmgfnpjjppndjkmgjaogfceg",
        title: "Chụp ảnh màn hình",
        desc: "Tiện ích chụp ảnh màn hình toàn bộ trang web." 
    },
    { 
        url: "https://chromewebstore.google.com/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl", 
        title: "GoFullPage",
        desc: "Chụp toàn bộ trang web chỉ với một cú nhấp chuột." 
    },
    /*{
        url: "https://onecompiler.com/", 
        title: "One Compiler", 
        desc: "Nền tảng lập trình trực tuyến cho nhiều ngôn ngữ." 
    },*/
    {
        url: "https://carbon.now.sh/?bg=rgba%28171%2C+184%2C+195%2C+1%29&t=seti&wt=none&l=auto&width=680&ds=true&dsyoff=20px&dsblur=68px&wc=true&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false",
        title: "Carbon", 
        desc: "Chụp code với giao diện đẹp và tuỳ chỉnh cao." 
    },
    {
        url: "https://id.traodoisub.com/",
        title: "Chuyển thành ID Facebook",
        desc: "Công cụ tra ID Facebook từ liên kết hoặc username." 
    },
    { 
        url: "https://www.blackbox.ai/", 
        title: "Blackbox AI", 
        desc: "Trợ lý AI hỗ trợ lập trình viên viết và hiểu code." 
    },
    { 
        url: "https://www.drawio.com/",
        title: "draw.io", 
        desc: "Công cụ vẽ sơ đồ bảo mật và kiến trúc hệ thống miễn phí."
    },
    { 
        url: "https://betterimage.ai/vi/upload", 
        title: "Làm nét hình ảnh",
        desc: "Dùng AI để tăng độ nét và cải thiện chất lượng hình." 
    },
    { 
        url: "https://www.google.com/android/find/about",
        title: "Tìm điện thoại Android", 
        desc: "Dịch vụ hỗ trợ định vị và bảo vệ thiết bị Android."
    },
    { 
        url: "https://grok.com/", 
        title: "Grok AI", 
        desc: "Trí tuệ nhân tạo từ xAI của Elon Musk - dành cho phân tích và tương tác." 
    },
    {
        url: "https://aisonggenerator.io/vi",
        title: "AI Song Generator",
        desc: "Tạo bài hát với AI, hỗ trợ ngôn ngữ tiếng Việt."
    },
    { 
        url: "http://192.168.1.1/", 
        title: "Đăng nhập modem WiFi", 
        desc: "Cổng truy cập mặc định cho cài đặt modem tại nhà." 
    },
    {
        url: "https://chatgpt.com/",
        title: "ChatGPT",
        desc: "Trò chuyện và làm việc cùng AI mạnh mẽ, hỗ trợ đa ngôn ngữ." 
    },
    { 
        url: "https://chromewebstore.google.com/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg",
        title: "AdGuard AdBlocker",
        desc: "Chặn quảng cáo hiệu quả, giúp duyệt web nhanh và an toàn hơn."
    },
    { 
        url: "https://chromewebstore.google.com/detail/trình-chặn-quảng-cáo-và-p/hipncndjamdcmphkgngojegjblibadbe?hl=vi&utm_source=ext_sidebar", 
        title: "Trình chặn quảng cáo & Popup", 
        desc: "Loại bỏ quảng cáo phiền phức và cửa sổ bật lên chỉ với một cú nhấp."
    },
    { 
        url: "https://chromewebstore.google.com/detail/auto-refresh-plus-page-mo/hgeljhfekpckiiplhkigfehkdpldcggm?hl=vi&utm_source=ext_sidebar", 
        title: "Auto Refresh Plus", 
        desc: "Tự động làm mới trang web định kỳ – cực hữu ích khi theo dõi tin tức, dữ liệu, kết quả." 
    },
    { 
        url: "https://chromewebstore.google.com/detail/chrome-remote-desktop/inomeogfingihgjfjlpeplalcfajhgai?hl=vi&utm_source=ext_sidebar", 
        title: "Chrome Remote Desktop", 
        desc: "Điều khiển máy tính từ xa qua trình duyệt Chrome – dễ dùng và an toàn."
    },
    { 
        url: "https://chromewebstore.google.com/detail/mobile-simulator-responsi/ckejmhbmlajgoklhgbapkiccekfoccmk?hl=vi&utm_source=ext_sidebar", 
        title: "Mobile Simulator", 
        desc: "Giả lập thiết bị di động để kiểm tra giao diện website – siêu tiện cho dev."
    },
    { 
        url: "https://chromewebstore.google.com/detail/just-a-clock-the-hours/agglgohcegmeeaccikjfmehncfomccpg?hl=vi&utm_source=ext_sidebar", 
        title: "Just a Clock – The Hours", 
        desc: "Đồng hồ đơn giản hiển thị giờ hiện tại ngay trên thanh công cụ." 
    },
    {
        url: "https://chromewebstore.google.com/detail/just-a-clock-the-minutes/pgmgkfgcnigcopcjhilfabbdgmjmkogj?hl=vi&utm_source=ext_sidebar",
        title: "Just a Clock – The Minutes",
        desc: "Đồng hồ đơn giản hiển thị phút – phù hợp khi cần theo dõi thời gian chi tiết."
    },
    {
        url: "https://chromewebstore.google.com/detail/chatgpt-tóm-tắt-trang-web/cbgecfllfhmmnknmamkejadjmnmpfjmp?hl=vi&utm_source=ext_sidebar",
        title: "ChatGPT – Tóm tắt trang web",
        desc: "Tóm tắt nội dung web bằng AI – tiết kiệm thời gian đọc lướt."
      
    },
    /*{
        url: "https://mydtu.duytan.edu.vn/Signin.aspx",
        title: "Mydtu",
        desc: "Cổng thông tin sinh viên Duy Tân."
    },
    {
        url: "https://pdaotao.duytan.edu.vn/home/Default.aspx?lang=VN",
        title: "Phòng đào tạo",
        desc: "Thông tin học vụ và đào tạo."
    },
    {
        url: "https://kcntt.duytan.edu.vn/",
        title: "Khoa CNTT",
        desc: "Trang chính thức Khoa Công nghệ Thông tin."
    },
    {
        url: "https://gdtcqp.duytan.edu.vn/",
        title: "TTGD thể chất - Quốc phòng",
        desc: "Thông tin về các môn thể chất và quốc phòng."
    }*/
];
const itemsPerPage = 15;
let currentPage = 1;
let filteredUtilities = [...utilities];

function normalizeString(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function displayCards(page) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredUtilities.slice(start, end);

    pageItems.forEach(utility => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h2>${utility.title}</h2>
            <p>${utility.desc}</p>
        `;
        card.onclick = () => window.open(utility.url, '_blank');
        container.appendChild(card);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredUtilities.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

function searchCards() {
    const query = normalizeString(document.getElementById('searchBar').value);
    filteredUtilities = utilities.filter(utility =>
        normalizeString(utility.title).includes(query) ||
        normalizeString(utility.desc).includes(query)
    );
    currentPage = 1;
    displayCards(currentPage);
}

document.getElementById('searchBar').addEventListener('input', searchCards);
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayCards(currentPage);
    }
});
document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(filteredUtilities.length / itemsPerPage)) {
        currentPage++;
        displayCards(currentPage);
    }
});

displayCards(currentPage);
