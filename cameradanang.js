     const videos = [
        { id: 'xCNRP131kNY', name: '📍 Cổng Trường Nguyễn Huệ' },
        { id: 'muijHPW82vI', name: '📍 Cổng Sau Bệnh viện C' },
        { id: 'CaMkzNXwVcE', name: '📍 PTZ Trang Phục Phương Trần' },
        { id: 'AcndFyZebdc', name: '📍 View Công Trình BV Đà Nẵng' },
        { id: 'VHxNpNjKurU', name: '📍 Nút giao Tây Cầu Rồng' }
      ];

      function createVideoElement(videoId, title, index) {
        const block = document.createElement('div');
        block.className = 'video-block';

        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';

        const iframe = document.createElement('iframe');
        iframe.id = `player-${index}`;
        iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1`;
        iframe.allow = "autoplay; encrypted-media";
        iframe.allowFullscreen = true;

        const btn = document.createElement('button');



        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.textContent = title;

        wrapper.appendChild(iframe);
        wrapper.appendChild(btn);
        block.appendChild(wrapper);
        block.appendChild(caption);

        return block;
      }

      function unmuteVideo(index) {
        // Mute tất cả
        videos.forEach((_, i) => {
          const player = document.getElementById(`player-${i}`);
          if (player) {
            player.contentWindow.postMessage(JSON.stringify({
              event: "command",
              func: "mute",
              args: []
            }), "*");
          }
        });

        // Unmute video được chọn
        const target = document.getElementById(`player-${index}`);
        if (target) {
          target.contentWindow.postMessage(JSON.stringify({
            event: "command",
            func: "unMute",
            args: []
          }), "*");
        }
      }

      window.onload = () => {
        const grid = document.getElementById('videoGrid');
        videos.forEach((v, i) => {
          const videoEl = createVideoElement(v.id, v.name, i);
          grid.appendChild(videoEl);
        });
      };

