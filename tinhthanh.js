const provinces = {
  "Hòa Bình": { region: "Tây Bắc Bộ", domain: "https://hoabinh.gov.vn", newName: "Phú Thọ", adminCenter: "Phú Thọ" },
  "Sơn La": { region: "Tây Bắc Bộ", domain: "https://sonla.gov.vn", newName: "Sơn La", adminCenter: "Sơn La" },
  "Điện Biên": { region: "Tây Bắc Bộ", domain: "https://dienbien.gov.vn", newName: "Điện Biên", adminCenter: "Điện Biên" },
  "Lai Châu": { region: "Tây Bắc Bộ", domain: "https://laichau.gov.vn", newName: "Lai Châu", adminCenter: "Lai Châu" },
  "Lào Cai": { region: "Tây Bắc Bộ", domain: "https://laocai.gov.vn", newName: "Lào Cai", adminCenter: "Yên Bái" },
  "Yên Bái": { region: "Tây Bắc Bộ", domain: "https://yenbai.gov.vn", newName: "Lào Cai", adminCenter: "Yên Bái" },
  "Phú Thọ": { region: "Đông Bắc Bộ", domain: "https://phutho.gov.vn", newName: "Phú Thọ", adminCenter: "Phú Thọ" },
  "Hà Giang": { region: "Đông Bắc Bộ", domain: "https://hagiang.gov.vn", newName: "Tuyên Quang", adminCenter: "Tuyên Quang" },
  "Tuyên Quang": { region: "Đông Bắc Bộ", domain: "https://tuyenquang.gov.vn", newName: "Tuyên Quang", adminCenter: "Tuyên Quang" },
  "Cao Bằng": { region: "Đông Bắc Bộ", domain: "https://caobang.gov.vn", newName: "Cao Bằng", adminCenter: "Cao Bằng" },
  "Bắc Kạn": { region: "Đông Bắc Bộ", domain: "https://backan.gov.vn", newName: "Thái Nguyễn", adminCenter: "Thái Nguyên" },
  "Thái Nguyên": { region: "Đông Bắc Bộ", domain: "https://thainguyen.gov.vn", newName: "Thái Nguyễn", adminCenter: "Thái Nguyên" },
  "Lạng Sơn": { region: "Đông Bắc Bộ", domain: "https://langson.gov.vn", newName: "Lạng Sơn", adminCenter: "Lạng Sơn" },
  "Bắc Giang": { region: "Đông Bắc Bộ", domain: "https://bacgiang.gov.vn", newName: "Bắc Ninh", adminCenter: "Bắc Giang" },
  "Quảng Ninh": { region: "Đông Bắc Bộ", domain: "https://quangninh.gov.vn", newName: "Quảng Ninh", adminCenter: "Quảng Ninh" },
  "Hà Nội": { region: "Đồng Bằng Sông Hồng", domain: "https://hanoi.gov.vn", newName: "Hà Nội", adminCenter: "Hà Nội" },
  "Bắc Ninh": { region: "Đồng Bằng Sông Hồng", domain: "https://bacninh.gov.vn", newName: "Bắc Ninh", adminCenter: "Bắc Giang" },
  "Hà Nam": { region: "Đồng Bằng Sông Hồng", domain: "https://hanam.gov.vn", newName: "Ninh Bình", adminCenter: "Ninh Bình" },
  "Hải Dương": { region: "Đồng Bằng Sông Hồng", domain: "https://haiduong.gov.vn", newName: "Hải Phòng", adminCenter: "Hải Phòng" },
  "Hải Phòng": { region: "Đồng Bằng Sông Hồng", domain: "https://haiphong.gov.vn", newName: "Hải Phòng", adminCenter: "Hải Phòng" },
  "Hưng Yên": { region: "Đồng Bằng Sông Hồng", domain: "https://hungyen.gov.vn", newName: "Hưng Yên", adminCenter: "Hưng Yên" },
  "Nam Định": { region: "Đồng Bằng Sông Hồng", domain: "https://namdinh.gov.vn", newName: "Ninh Bình", adminCenter: "Ninh Bình" },
  "Thái Bình": { region: "Đồng Bằng Sông Hồng", domain: "https://thaibinh.gov.vn", newName: "Hưng Yên", adminCenter: "Hưng Yên" },
  "Vĩnh Phúc": { region: "Đồng Bằng Sông Hồng", domain: "https://vinhphuc.gov.vn", newName: "Phú Thọ", adminCenter: "Phú Thọ" },
  "Ninh Bình": { region: "Đồng Bằng Sông Hồng", domain: "https://ninhbinh.gov.vn", newName: "Ninh Bình", adminCenter: "Ninh Bình" },
  "Thanh Hóa": { region: "Bắc Trung Bộ", domain: "https://thanhhoa.gov.vn", newName: "Thanh Hóa", adminCenter: "Thanh Hóa" },
  "Nghệ An": { region: "Bắc Trung Bộ", domain: "https://nghean.gov.vn", newName: "Nghệ An", adminCenter: "Nghệ An" },
  "Hà Tĩnh": { region: "Bắc Trung Bộ", domain: "https://hatinh.gov.vn", newName: "Hà Tĩnh", adminCenter: "Hà Tĩnh" },
  "Quảng Bình": { region: "Bắc Trung Bộ", domain: "https://quangbinh.gov.vn", newName: "Quảng Trị", adminCenter: "Quảng Bình" },
  "Quảng Trị": { region: "Bắc Trung Bộ", domain: "https://quangtri.gov.vn", newName: "Quảng Trị", adminCenter: "Quảng Bình" },
  "Thừa Thiên - Huế": { region: "Bắc Trung Bộ", domain: "https://thuathienhue.gov.vn", newName: "Huế", adminCenter: "Huế" },
  "Đà Nẵng": { region: "Nam Trung Bộ", domain: "https://danang.gov.vn", newName: "Đà Nẵng", adminCenter: "Đà Nẵng" },
  "Quảng Nam": { region: "Nam Trung Bộ", domain: "https://quangnam.gov.vn", newName: "Đà Nẵng", adminCenter: "Đà Nẵng" },
  "Quảng Ngãi": { region: "Nam Trung Bộ", domain: "https://quangngai.gov.vn", newName: "Quảng Ngãi", adminCenter: "Quảng Ngãi" },
  "Bình Định": { region: "Nam Trung Bộ", domain: "https://binhdinh.gov.vn", newName: "Gia Lai", adminCenter: "Bình Định" },
  "Phú Yên": { region: "Nam Trung Bộ", domain: "https://phuyen.gov.vn", newName: "Đắk Lắk", adminCenter: "Đắk Lắk" },
  "Khánh Hòa": { region: "Nam Trung Bộ", domain: "https://khanhhoa.gov.vn", newName: "Khánh Hòa", adminCenter: "Khánh Hòa" },
  "Ninh Thuận": { region: "Nam Trung Bộ", domain: "https://ninhthuan.gov.vn", newName: "Khánh Hòa", adminCenter: "Khánh Hòa" },
  "Bình Thuận": { region: "Nam Trung Bộ", domain: "https://binhthuan.gov.vn", newName: "Lâm Đồng", adminCenter: "Lâm Đồng" },
  "Kon Tum": { region: "Tây Nguyên", domain: "https://kontum.gov.vn", newName: "Quảng Ngãi", adminCenter: "Quảng Ngãi" },
  "Gia Lai": { region: "Tây Nguyên", domain: "https://gialai.gov.vn", newName: "Gia Lai", adminCenter: "Bình Định" },
  "Đắk Lắk": { region: "Tây Nguyên", domain: "https://daklak.gov.vn", newName: "Đắk Lắk", adminCenter: "Đắk Lắk" },
  "Đắk Nông": { region: "Tây Nguyên", domain: "https://daknong.gov.vn", newName: "Lâm Đồng", adminCenter: "Lâm Đồng" },
  "Lâm Đồng": { region: "Tây Nguyên", domain: "https://lamdong.gov.vn", newName: "Lâm Đồng", adminCenter: "Lâm Đồng" },
  "TP. Hồ Chí Minh": { region: "Đông Nam Bộ", domain: "https://hochiminhcity.gov.vn", newName: "Hồ Chí Minh", adminCenter: "Hồ Chí Minh" },
  "Bà Rịa - Vũng Tàu": { region: "Đông Nam Bộ", domain: "https://baria-vungtau.gov.vn", newName: "Hồ Chí Minh", adminCenter: "Hồ Chí Minh" },
  "Bình Dương": { region: "Đông Nam Bộ", domain: "https://binhduong.gov.vn", newName: "Hồ Chí Minh", adminCenter: "Hồ Chí Minh" },
  "Bình Phước": { region: "Đông Nam Bộ", domain: "https://binhphuoc.gov.vn", newName: "Đồng Nai", adminCenter: "Đồng Nai" },
  "Đồng Nai": { region: "Đông Nam Bộ", domain: "https://dongnai.gov.vn", newName: "Đồng Nai", adminCenter: "Đồng Nai" },
  "Tây Ninh": { region: "Đông Nam Bộ", domain: "https://tayninh.gov.vn", newName: "Tây Ninh", adminCenter: "Long An" },
  "An Giang": { region: "Đồng Bằng Sông Cửu Long", domain: "https://angiang.gov.vn", newName: "An Giang", adminCenter: "Kiên Giang" },
  "Bạc Liêu": { region: "Đồng Bằng Sông Cửu Long", domain: "https://baclieu.gov.vn", newName: "Cà Mau", adminCenter: "Cà Mau" },
  "Bến Tre": { region: "Đồng Bằng Sông Cửu Long", domain: "https://bentre.gov.vn", newName: "Vĩnh Long", adminCenter: "Vĩnh Long" },
  "Cà Mau": { region: "Đồng Bằng Sông Cửu Long", domain: "https://camau.gov.vn", newName: "Cà Mau", adminCenter: "Cà Mau" },
  "Cần Thơ": { region: "Đồng Bằng Sông Cửu Long", domain: "https://cantho.gov.vn", newName: "Cần Thơ", adminCenter: "Cần Thơ" },
  "Đồng Tháp": { region: "Đồng Bằng Sông Cửu Long", domain: "https://dongthap.gov.vn", newName: "Đồng Tháp", adminCenter: "Tiền Giang" },
  "Hậu Giang": { region: "Đồng Bằng Sông Cửu Long", domain: "https://haugiang.gov.vn", newName: "Cần Thơ", adminCenter: "Cần Thơ" },
  "Kiên Giang": { region: "Đồng Bằng Sông Cửu Long", domain: "https://kiengiang.gov.vn", newName: "An Giang", adminCenter: "Kiên Giang" },
  "Long An": { region: "Đồng Bằng Sông Cửu Long", domain: "https://longan.gov.vn", newName: "Tây Ninh", adminCenter: "Long An" },
  "Sóc Trăng": { region: "Đồng Bằng Sông Cửu Long", domain: "https://soctrang.gov.vn", newName: "Cần Thơ", adminCenter: "Cần Thơ" },
  "Tiền Giang": { region: "Đồng Bằng Sông Cửu Long", domain: "https://tiengiang.gov.vn", newName: "Đồng Tháp", adminCenter: "Tiền Giang" },
  "Trà Vinh": { region: "Đồng Bằng Sông Cửu Long", domain: "https://travinh.gov.vn", newName: "Vĩnh Long", adminCenter: "Vĩnh Long" },
  "Vĩnh Long": { region: "Đồng Bằng Sông Cửu Long", domain: "https://vinhlong.gov.vn", newName: "Vĩnh Long", adminCenter: "Vĩnh Long" }
};

function searchProvince() {
  const input = document.getElementById("provinceInput").value.trim().toLowerCase();
  const result = document.getElementById("result");
  const region = document.getElementById("region");
  const domain = document.getElementById("domain");
  const newName = document.getElementById("newName");
  const adminCenter = document.getElementById("adminCenter");

  if (input === "") {
    result.style.display = "none";
    return;
  }

  for (let province in provinces) {
    if (province.toLowerCase().includes(input)) {
      region.textContent = provinces[province].region;
      domain.href = provinces[province].domain;
      domain.textContent = provinces[province].domain;
      newName.textContent = provinces[province].newName;
      adminCenter.textContent = provinces[province].adminCenter;
      result.style.display = "block";
      return;
    }
  }
  result.style.display = "none";
  alert("Không tìm thấy tỉnh/thành phố!");
}

function autocomplete() {
  const input = document.getElementById("provinceInput");
  const val = input.value.trim().toLowerCase();
  const suggestions = document.getElementById("suggestions");
  if (!suggestions) {
    const div = document.createElement("div");
    div.id = "suggestions";
    div.className = "autocomplete-items";
    input.parentNode.appendChild(div);
  }
  const suggestionsDiv = document.getElementById("suggestions");
  suggestionsDiv.innerHTML = "";

  if (val.length === 0) {
    suggestionsDiv.style.display = "none";
    document.getElementById("result").style.display = "none";
    return;
  }

  const matches = Object.keys(provinces).filter(province => province.toLowerCase().startsWith(val));
  if (matches.length > 0) {
    suggestionsDiv.style.display = "block";
    matches.forEach(match => {
      const div = document.createElement("div");
      div.textContent = match;
      div.addEventListener("click", () => {
        input.value = match;
        suggestionsDiv.style.display = "none";
        searchProvince();
      });
      suggestionsDiv.appendChild(div);
    });
  } else {
    suggestionsDiv.style.display = "none";
  }
}

document.getElementById("provinceInput").addEventListener("input", function() {
  if (this.value.trim() === "") {
    document.getElementById("result").style.display = "none";
    document.getElementById("suggestions").style.display = "none";
  } else {
    autocomplete();
  }
});

document.addEventListener("click", function(e) {
  const suggestions = document.getElementById("suggestions");
  if (e.target !== document.getElementById("provinceInput")) {
    suggestions.style.display = "none";
  }
});