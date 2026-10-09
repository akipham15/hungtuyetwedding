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
    map: "https://maps.app.goo.gl/XLHSxUYqzPjkLBGY7", // vị trí chấm tay trên Google Maps (địa chỉ chưa tìm được)
  },
  bride: {
    name: "Tuyết",
    fullName: "Nguyễn Minh Tuyết",
    father: "Nguyễn Văn Dũng",
    mother: "Trịnh Thị Thủy",
    address: "Số nhà 9 ngõ 255 đường Vĩnh Khang, Đội 4, Ngọc Hồi, Hà Nội",
    map: "https://www.google.com/maps/search/?api=1&query=20.92542266845703,105.83877563476562", // vị trí chấm tay trên Google Maps (địa chỉ chưa tìm được)
  },

  // Tên miền riêng cho từng bên: mở từ tên miền nào thì thiệp cố định bên đó (không hỏi khách),
  // thiệp nhà gái ghi tên cô dâu trước. Tên miền khác (vd hungtuyetwedding.date) vẫn hỏi khách như cũ.
  domains: {
    "hungtuyet.thiepcuoi.date": "trai",
    "tuyethung.thiepcuoi.date": "gai",
  },

  // Thời điểm hôn lễ mặc định (đếm ngược, ngày trên bìa). Định dạng: YYYY-MM-DDTHH:mm (giờ Việt Nam)
  // Khách nhà gái (link có &ben=gai) sẽ tự thấy giờ hôn lễ của nhà gái (sự kiện "Hôn Lễ" có side: "gai" bên dưới).
  date: "2026-11-16T15:00",             // Thứ Hai, 16/11/2026 — hôn lễ nhà trai
  lunarDate: "Nhằm ngày 8 tháng 10 năm Bính Ngọ",

  // Thư ngỏ ở trang đầu
  quote: "Có những điều không cần nói thành lời, chỉ cần cùng nhau đi qua đủ lâu để hiểu. Sau những năm tháng bên nhau, chúng mình quyết định viết tiếp câu chuyện ấy dưới một mái nhà. Và trong trang đẹp nhất của câu chuyện, chúng mình rất mong có bạn ở đó.",

  // Các lễ & tiệc. side: "trai" (chỉ nhà trai) | "gai" (chỉ nhà gái) | bỏ trống = hiện cho khách cả hai bên.
  // lunar: ngày âm lịch hiện dưới ngày (tuỳ chọn).
  // map: link Google Maps — bỏ trống dòng map thì nút "Chỉ đường" tự tìm theo address; ghi map: "" để ẩn nút.
  events: [
    // ---- Nhà trai ----
    {
      side: "trai",
      title: "Tiệc Cưới",
      date: "2026-11-15",               // Chủ Nhật
      time: "10:00",
      lunar: "Tức ngày 7 tháng 10 năm Bính Ngọ",
      place: "Tư gia nhà trai",
      address: "Số nhà 19 đường Hoàng Mai, Thọ Am, Nam Phù, Hà Nội",
      map: "https://maps.app.goo.gl/XLHSxUYqzPjkLBGY7",
    },
    {
      side: "trai",
      title: "Hôn Lễ",
      date: "2026-11-16",               // Thứ Hai
      time: "15:00",
      lunar: "Nhằm ngày 8 tháng 10 năm Bính Ngọ",
      place: "Tư gia nhà trai",
      address: "Số nhà 19 đường Hoàng Mai, Thọ Am, Nam Phù, Hà Nội",
      map: "https://maps.app.goo.gl/XLHSxUYqzPjkLBGY7",
    },
    // ---- Nhà gái ----
    {
      side: "gai",
      title: "Tiệc Cưới",
      date: "2026-11-15",               // Chủ Nhật
      time: "18:00",
      lunar: "Tức ngày 7 tháng 10 năm Bính Ngọ",
      place: "Tư gia nhà gái",
      address: "Số nhà 9 ngõ 255 đường Vĩnh Khang, Đội 4, Ngọc Hồi, Hà Nội",
      map: "https://www.google.com/maps/search/?api=1&query=20.92542266845703,105.83877563476562",
    },
    {
      side: "gai",
      title: "Hôn Lễ",
      date: "2026-11-16",               // Thứ Hai
      time: "14:00",
      lunar: "Nhằm ngày 8 tháng 10 năm Bính Ngọ",
      place: "Tư gia nhà gái",
      address: "Số nhà 9 ngõ 255 đường Vĩnh Khang, Đội 4, Ngọc Hồi, Hà Nội",
      map: "https://www.google.com/maps/search/?api=1&query=20.92542266845703,105.83877563476562",
    },
  ],

  // Lưu ý cho khách mời — mục nào để trống ("" hoặc []) sẽ tự ẩn
  guestInfo: {
    dressCode: null,                    // mục "Trang phục": null = ẩn. Mẫu: { text: "…", colors: ["#f5dbe0", …] }
    parking: "",                        // ví dụ: "Có chỗ để xe máy ngay tại tư gia." — để trống thì ẩn mục này
    contacts: [
      { role: "Chú rể", name: "Quốc Hưng", phone: "0333353360" },
      { role: "Cô dâu", name: "Minh Tuyết", phone: "0961026599" },
    ],
    // mục "Xác nhận tham dự": null = ẩn. Mẫu: { text: "…", url: "" } — url trống thì nút mở Zalo nhắn chú rể/cô dâu
    rsvp: null,
  },

  // Hộp mừng cưới (show: false để ẩn). qr: đường dẫn ảnh QR (tuỳ chọn), vd "assets/qr-chure.jpg"
  gift: {
    show: true,
    accounts: [
      { label: "Mừng cưới chú rể", bank: "MB Bank", number: "683456793333", owner: "NGUYEN QUOC HUNG", qr: "assets/qr-chure.png" },
      { label: "Mừng cưới cô dâu", bank: "Techcombank", number: "19036822910012", owner: "NGUYEN MINH TUYET", qr: "assets/qr-codau.png" },
    ],
  },

  // Nhạc nền: danh sách phát lần lượt (hết danh sách thì quay lại bài đầu), dùng chung cho Gen Y & Gen Z.
  // Chép file mp3 vào music/ đúng tên bên dưới. Bài nào chưa có file thì tự bỏ qua.
  // Nhạc không tự phát: khách bấm nút nhạc để nghe.
  // (Muốn mỗi phong cách một danh sách: music: { classic: [ … ], modern: [ … ] })
  music: [
    { src: "music/1-i-love-you-3000.mp3", title: "I Love You 3000 · Stephanie Poetri" },   // youtu.be/iC_u38PeHak
    { src: "music/2-i-love-you-baby.mp3", title: "I Love You Baby · Frank Sinatra" },      // youtu.be/NEKy1Y0hXa8
    { src: "music/3-to-the-moon.mp3",     title: "To The Moon · hooligan." },               // youtu.be/nmKTlmByng0
    { src: "music/4-sao-cung-duoc.mp3",   title: "Sao Cũng Được · Binz" },                  // youtu.be/z35r-OeqLgQ
    { src: "music/5-ban-doi.mp3",         title: "Bạn Đời · Karik ft. GDUCKY" },            // youtu.be/Nf-5r1BbWPk
  ],

  // Ảnh — chép ảnh vào thư mục photos/ rồi ghi ĐÚNG tên file (kể cả đuôi .jpg/.jpeg/.png) vào đây.
  // Để "" nếu chưa có. Trang chỉ tải đúng các file ghi ở đây.
  photos: {
    cover: "cover.webp",        // ảnh hiện ra sau khi cuộn qua tên ở phần mở đầu ("" = dùng ảnh album đầu tiên)
    groom: "chu-re.webp",       // chân dung chú rể
    bride: "co-dau.webp",      // chân dung cô dâu
    bg: ["", "", ""],          // ảnh nền: [Lời ngỏ, Ngày cưới, Lời kết] — "" = dùng hình minh hoạ vẽ sẵn
    album: [                   // album ảnh cưới, hiện theo đúng thứ tự này
      // "album/a (1).webp",
      // "album/a (2).webp",
      // "album/a (3).webp",
      // "album/a (8).webp",
      // "album/a (9).webp",
      "album/a (6).webp",
      "album/a (11).webp",
      "album/a (14).webp",
      "album/a (5).webp",
      "album/a (10).webp",
      "album/a (13).webp",
      "album/a (21).webp",
      "album/a (4).webp",
      // "album/a (12).webp",
      // "album/a (15).webp",
      // "album/a (16).webp",
      // "album/a (17).webp",
      // "album/a (18).webp",
      // "album/a (19).webp",
      // "album/a (20).webp",
    ],
  },

  // Phong cách mặc định: "classic" (Gen Y — đám cưới Việt thập niên 80–90) hoặc "modern" (Gen Z — tối giản fine-art).
  // Khách vẫn đổi được bằng nút "Gen Y | Gen Z"; có thể gửi link kèm &giaodien=geny hoặc &giaodien=genz.
  theme: "modern",

  // Số ảnh hiển thị ban đầu trong album (bấm "Xem thêm" để hiện tiếp)
  galleryPageSize: 12,
};
