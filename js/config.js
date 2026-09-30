/* =========================================================================
 *  CẤU HÌNH THIỆP CƯỚI — chỉ cần sửa file này.
 *  Những chỗ đánh dấu (mẫu) là dữ liệu giả, hãy thay bằng thông tin thật.
 * ========================================================================= */
window.WEDDING = {
  groom: {
    name: "Hưng",                       // tên ngắn, hiển thị trên bìa
    fullName: "Nguyễn Quốc Hưng",
    father: "Nguyễn Văn Tuấn",
    mother: "Nguyễn Thị Tươi",
    address: "Số nhà 19 đường Hoàng Mai, Thọ Am, Nam Phù, Hà Nội",
  },
  bride: {
    name: "Tuyết",
    fullName: "Nguyễn Minh Tuyết",
    father: "Nguyễn Văn Dũng",
    mother: "Trịnh Thị Thủy",
    address: "Số nhà 9 ngõ 255 đường Vĩnh Khang, Lạc Thị, Ngọc Hồi, Hà Nội",
  },

  // Thời điểm hôn lễ (dùng cho đếm ngược, ngày trên bìa). Định dạng: YYYY-MM-DDTHH:mm (giờ Việt Nam)
  date: "2026-11-16T15:00",             // Thứ Hai, 16/11/2026
  lunarDate: "Nhằm ngày 8 tháng 10 năm Bính Ngọ",

  // Thư ngỏ ở trang đầu
  quote: "Có những điều không cần nói thành lời, chỉ cần cùng nhau đi qua đủ lâu để hiểu. Sau những năm tháng bên nhau, chúng mình quyết định viết tiếp câu chuyện ấy dưới một mái nhà. Và trong trang đẹp nhất của câu chuyện, chúng mình rất mong có bạn ở đó.",

  // Các lễ & tiệc. side: "trai" (chỉ nhà trai) | "gai" (chỉ nhà gái) | bỏ trống = hiện cho khách cả hai bên.
  // lunar: ngày âm lịch hiện dưới ngày (tuỳ chọn). map: link Google Maps (có thể để trống).
  events: [
    {
      title: "Tiệc Chung Vui",
      date: "2026-11-15",               // Chủ Nhật
      time: "10:00",
      lunar: "Tức ngày 7 tháng 10 âm lịch",
      place: "Tư gia nhà trai",
      address: "Số nhà 19 đường Hoàng Mai, Thọ Am, Nam Phù, Hà Nội",
      map: "https://www.google.com/maps/search/?api=1&query=S%E1%BB%91%2019%20%C4%91%C6%B0%E1%BB%9Dng%20Ho%C3%A0ng%20Mai%2C%20Th%E1%BB%8D%20Am%2C%20Nam%20Ph%C3%B9%2C%20H%C3%A0%20N%E1%BB%99i",
    },
    {
      title: "Hôn Lễ",
      date: "2026-11-16",               // Thứ Hai
      time: "15:00",
      lunar: "Nhằm ngày 8 tháng 10 âm lịch",
      place: "Tư gia nhà trai",
      address: "Số nhà 19 đường Hoàng Mai, Thọ Am, Nam Phù, Hà Nội",
      map: "https://www.google.com/maps/search/?api=1&query=S%E1%BB%91%2019%20%C4%91%C6%B0%E1%BB%9Dng%20Ho%C3%A0ng%20Mai%2C%20Th%E1%BB%8D%20Am%2C%20Nam%20Ph%C3%B9%2C%20H%C3%A0%20N%E1%BB%99i",
    },
  ],

  // Lưu ý cho khách mời — mục nào để trống ("" hoặc []) sẽ tự ẩn
  guestInfo: {
    dressCode: {
      text: "Chúng mình rất vui nếu bạn chọn trang phục tông nhẹ nhàng như hồng pastel, be hoặc trắng.", // (mẫu)
      colors: ["#f5dbe0", "#eadccb", "#ffffff", "#cf8195"],
    },
    parking: "",                        // ví dụ: "Có chỗ để xe máy ngay tại tư gia." — để trống thì ẩn mục này
    contacts: [
      { role: "Chú rể", name: "Quốc Hưng", phone: "0900000001" },  // (mẫu)
      { role: "Cô dâu", name: "Minh Tuyết", phone: "0900000002" }, // (mẫu)
    ],
    rsvp: {
      text: "Bạn nhắn giúp chúng mình trước ngày 08.11 để chuẩn bị chỗ ngồi chu đáo nhé.",
      url: "", // link Google Form (nếu có). Để trống: nút sẽ mở Zalo nhắn cho người liên hệ đầu tiên.
    },
  },

  // Hộp mừng cưới (show: false để ẩn). qr: đường dẫn ảnh QR (tuỳ chọn), vd "assets/qr-chure.jpg"
  gift: {
    show: true,
    accounts: [
      { label: "Mừng cưới chú rể", bank: "Vietcombank", number: "0123456789", owner: "NGUYEN QUOC HUNG", qr: "" },  // (mẫu)
      { label: "Mừng cưới cô dâu", bank: "Techcombank", number: "9876543210", owner: "NGUYEN MINH TUYET", qr: "" }, // (mẫu)
    ],
  },

  // Nhạc nền (tuỳ chọn): đặt file vào music/ rồi ghi đường dẫn. Để "" nếu không dùng.
  // Nhạc không tự phát: khách bấm nút nhạc để nghe.
  // Mỗi phong cách một bài: classic = Gen Y, modern = Gen Z. (Có thể ghi một chuỗi nếu dùng chung một bài.)
  music: { classic: "music/song.mp3", modern: "music/song_new.mp3" },
  musicTitle: { classic: "Cheri Cheri Lady · Modern Talking", modern: "Beautiful In White · Shane Filan" },

  // Ảnh — chép ảnh vào thư mục photos/ rồi ghi ĐÚNG tên file (kể cả đuôi .jpg/.jpeg/.png) vào đây.
  // Để "" nếu chưa có. Trang chỉ tải đúng các file ghi ở đây.
  photos: {
    cover: "cover.jpg",        // ảnh hiện ra sau khi cuộn qua tên ở phần mở đầu ("" = dùng ảnh album đầu tiên)
    groom: "chu-re.jpg",       // chân dung chú rể
    bride: "co-dau.jpeg",      // chân dung cô dâu
    bg: ["", "", ""],          // ảnh nền: [Lời ngỏ, Ngày cưới, Lời kết] — "" = dùng hình minh hoạ vẽ sẵn
    album: [                   // album ảnh cưới, hiện theo đúng thứ tự này
      "anh_1.jpg",
      "anh_2.jpeg",
    ],
  },

  // Phong cách mặc định: "classic" (Gen Y — đám cưới Việt thập niên 80–90) hoặc "modern" (Gen Z — tối giản fine-art).
  // Khách vẫn đổi được bằng nút "Gen Y | Gen Z"; có thể gửi link kèm &giaodien=geny hoặc &giaodien=genz.
  theme: "classic",

  // Số ảnh hiển thị ban đầu trong album (bấm "Xem thêm" để hiện tiếp)
  galleryPageSize: 12,
};
