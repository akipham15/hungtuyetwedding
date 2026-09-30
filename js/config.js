/* =========================================================================
 *  CẤU HÌNH THIỆP CƯỚI — chỉ cần sửa file này.
 *  Những chỗ đánh dấu (mẫu) là dữ liệu giả, hãy thay bằng thông tin thật.
 * ========================================================================= */
window.WEDDING = {
  groom: {
    name: "Hưng",                       // tên ngắn, hiển thị trên bìa
    fullName: "Nguyễn Quốc Hưng",
    father: "Nguyễn Văn An",            // (mẫu)
    mother: "Trần Thị Bình",            // (mẫu)
    address: "Hà Nội",                  // (mẫu)
  },
  bride: {
    name: "Tuyết",
    fullName: "Nguyễn Minh Tuyết",
    father: "Nguyễn Văn Cường",         // (mẫu)
    mother: "Phạm Thị Dung",            // (mẫu)
    address: "Hà Nội",                  // (mẫu)
  },

  // Thời điểm chính (dùng cho đếm ngược). Định dạng: YYYY-MM-DDTHH:mm (giờ Việt Nam)
  date: "2026-12-20T11:00",             // (mẫu)
  lunarDate: "Tức ngày 12 tháng 11 năm Bính Ngọ", // (mẫu — hãy kiểm tra lại)

  // Thư ngỏ ở trang đầu
  quote: "Có những điều không cần nói thành lời, chỉ cần cùng nhau đi qua đủ lâu để hiểu. Sau những năm tháng bên nhau, chúng mình quyết định viết tiếp câu chuyện ấy dưới một mái nhà. Và trong trang đẹp nhất của câu chuyện, chúng mình rất mong có bạn ở đó.",

  // Các lễ & tiệc, chia theo từng bên. side: "trai" (nhà trai) | "gai" (nhà gái) | bỏ trống = hiện ở cả hai bên.
  // map: link Google Maps (có thể để trống). Khi gửi link cho khách, thêm &ben=trai hoặc &ben=gai để trang mở sẵn đúng bên.
  events: [
    // ---- Nhà gái (mẫu) ----
    {
      side: "gai",
      title: "Tiệc cưới nhà gái",
      date: "2026-12-19",
      time: "18:00",
      place: "Nhà hàng Hoa Hồng — Sảnh Tầng 2",
      address: "Số 12, phố Hoa Hồng, Hà Nội",
      map: "https://maps.google.com/?q=Hà+Nội",
    },
    {
      side: "gai",
      title: "Lễ Vu Quy",
      date: "2026-12-20",
      time: "08:00",
      place: "Tư gia nhà gái",
      address: "Số 34, ngõ 5, phố Hoa Hồng, Hà Nội",
      map: "https://maps.google.com/?q=Hà+Nội",
    },
    // ---- Nhà trai (mẫu) ----
    {
      side: "trai",
      title: "Lễ Thành Hôn",
      date: "2026-12-20",
      time: "10:00",
      place: "Tư gia nhà trai",
      address: "Số 56, đường Mộc Lan, Hà Nội",
      map: "https://maps.google.com/?q=Hà+Nội",
    },
    {
      side: "trai",
      title: "Tiệc cưới nhà trai",
      date: "2026-12-20",
      time: "11:00",
      place: "Trung tâm tiệc cưới Hoa Sen — Sảnh Ngọc Trai",
      address: "Số 78, đại lộ Thăng Long, Hà Nội",
      map: "https://maps.google.com/?q=Hà+Nội",
    },
  ],

  // Lưu ý cho khách mời — mục nào để trống ("" hoặc []) sẽ tự ẩn
  guestInfo: {
    dressCode: {
      text: "Chúng mình rất vui nếu bạn chọn trang phục tông nhẹ nhàng như hồng pastel, be hoặc trắng.", // (mẫu)
      colors: ["#f5dbe0", "#eadccb", "#ffffff", "#cf8195"],
    },
    parking: "Trung tâm tiệc cưới có bãi gửi xe máy và ô tô miễn phí ngay tại sảnh.", // (mẫu)
    contacts: [
      { role: "Chú rể", name: "Quốc Hưng", phone: "0900000001" },  // (mẫu)
      { role: "Cô dâu", name: "Minh Tuyết", phone: "0900000002" }, // (mẫu)
    ],
    rsvp: {
      text: "Bạn nhắn giúp chúng mình trước ngày 10.12 để chuẩn bị chỗ ngồi chu đáo nhé.", // (mẫu)
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
  // Nhạc sẽ bật ở lần chạm/click đầu tiên của khách (trình duyệt không cho tự phát).
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
