const flowerIcons = ['🌸', '🌼', '❀', '✿'];

const createPetal = () => {
    const petal = document.createElement('div');
    petal.className = 'petal';
    
    // 🌸 Lấy ngẫu nhiên 1 biểu tượng hoa
    petal.innerText = flowerIcons[Math.floor(Math.random() * flowerIcons.length)];

    // 🌼 Style ngẫu nhiên để rơi đa dạng
    petal.style.position = 'fixed';
    petal.style.top = '-10px';
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = 5 + Math.random() * 5 + 's';
    petal.style.opacity = Math.random();
    petal.style.fontSize = Math.random() * 10 + 15 + 'px';
    petal.style.zIndex = 1;
    petal.style.pointerEvents = 'none';
    petal.style.animationName = 'fall';
    petal.style.animationTimingFunction = 'linear';

    document.body.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, 5000); // xoá sau 10 giây
};

// 🌸 Tạo nhiều hoa mỗi lần để hiệu ứng dày hơn
setInterval(() => {
    const count = Math.floor(Math.random() * 3) + 2; // 2–4 hoa mỗi 300ms
    for (let i = 0; i < count; i++) {
        createPetal();
    }
}, 300);

// 🎋 Keyframe hiệu ứng rơi
const style = document.createElement('style');
style.textContent = `
@keyframes fall {
    to {
        transform: translateY(100vh) rotate(360deg);
    }
}
`;
document.head.appendChild(style);