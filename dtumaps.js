    const destinations = [
      { name: "137 Nguyễn Văn Linh", place: "137 Đ. Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng 550000, Việt Nam" },
      { name: "254 Nguyễn Văn Linh", place: "254 Đ. Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng 550000, Việt Nam" },
      { name: "209 Phan Thanh", place: "209 Phan Thanh, Thạc Gián, Thanh Khê, Đà Nẵng 550000, Việt Nam" },
      { name: "Hòa Khánh Nam", place: "120 Hoàng Minh Thảo, Hoà Khánh Nam, Liên Chiểu, Đà Nẵng 550000, Việt Nam" },
      { name: "Phan Văn Trị", place: "78 Phan Văn Trị, Khuê Trung, Cẩm Lệ, Đà Nẵng 55000, Việt Nam" },
      { name: "03 Quang Trung", place: "3 Quang Trung, Hải Châu, Đà Nẵng 550000, Việt Nam" },
      { name: "K7/25 Quang Trung", place: "03 Quang Trung, Hải Châu, Đà Nẵng 550000, Việt Nam" },
    ];

    const select = document.getElementById('destinationSelect');
    const navigateButton = document.getElementById('navigateButton');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('buttonText');
    const errorMessage = document.getElementById('errorMessage');

    destinations.forEach((dest, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = dest.name;
      select.appendChild(option);
    });

    let currentPosition = null;

    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.classList.remove('hidden');
      setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }

    function getCurrentLocation(callback) {
      if (navigator.geolocation) {
        navigateButton.disabled = true;
        spinner.style.display = 'inline-block';
        buttonText.textContent = 'Đang lấy vị trí...';
        navigator.geolocation.getCurrentPosition(
          position => {
            currentPosition = `${position.coords.latitude},${position.coords.longitude}`;
            navigateButton.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Chỉ đường (Mở Google Maps)';
            callback(true);
          },
          error => {
            let message = 'Không thể lấy vị trí. Vui lòng thử lại.';
            if (error.code === error.PERMISSION_DENIED) {
              message = 'Vui lòng cấp quyền truy cập vị trí để tiếp tục.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              message = 'Không thể xác định vị trí của bạn.';
            }
            showError(message);
            navigateButton.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Chỉ đường (Mở Google Maps)';
            callback(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        showError('Trình duyệt không hỗ trợ lấy vị trí.');
        navigateButton.disabled = false;
        spinner.style.display = 'none';
        buttonText.textContent = 'Chỉ đường (Mở Google Maps)';
        callback(false);
      }
    }

    function openGoogleMaps() {
      const destIndex = select.value;
      if (destIndex === "") {
        showError('Vui lòng chọn địa điểm đến.');
        return;
      }

      getCurrentLocation(success => {
        if (success) {
          const destination = destinations[destIndex].place;
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentPosition}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
          window.open(mapsUrl, '_blank');
        }
      });
    }