# Thiệp cưới Hưng & Tuyết 💍

Website thiệp cưới tĩnh, tông hồng · trắng · be, có **2 giao diện cho khách tự chọn**: *Gen Y* (đám cưới Việt thập niên 80–90 — phông vải xanh, chữ cắt dán đỏ/vàng "Vui Tân Hôn", chăn con công, xe đạp chở hoa, lá cọ, đôi chim bồ câu, băng cassette, ảnh màu phim có dấu ngày) và *Gen Z* (tối giản fine-art tông ngà – hồng phấn, ảnh màu gốc), với hiệu ứng cuộn trang nhẹ nhàng và album ảnh dạng lưới. Lịch trình được tách rõ **Nhà trai / Nhà gái**.

Hiệu ứng cuộn dùng thư viện GSAP (tải từ CDN, cần mạng). Nếu không tải được hoặc máy khách bật "giảm chuyển động", trang vẫn hiển thị đầy đủ ở dạng tĩnh.

## Xem thiệp

Bấm đúp **`index.html`** để mở trên trình duyệt — không cần cài hay chạy gì thêm (cần mạng để tải font & hiệu ứng).

## Khách sẽ thấy gì

1. **Màn mở thiệp** — lời mời có tên khách (nếu link có `?ten=`), nút **Mở thiệp** và nút chọn phong cách **Gen Y | Gen Z**.
   - Gen Y: tấm thiệp đỏ chữ 囍 với cuộn băng cassette; bấm mở → **hai cánh thiệp mở ra**.
   - Gen Z: màn hình khoá điện thoại có thông báo lời mời; chạm thông báo → **màn khoá trượt lên** như mở khoá.
   - Màn này gọn gàng, không có dòng hướng dẫn nhạc (nút nhạc đã hiện rõ khi vào thiệp).
2. **Trong thiệp**: mở đầu (tên + ngày) → Lời ngỏ → Cô dâu & Chú rể → Ngày cưới & đếm ngược → Lịch trình **Nhà trai / Nhà gái** → Lưu ý cho khách → Album → Mừng cưới → Lời kết.
   - Bấm mục trên menu (máy tính) hoặc thanh điều hướng dưới đáy (điện thoại) → **cuộn mượt** tới đúng phần.
   - Bấm logo **✉ H & T** ở góc trái trên cùng → **đóng thiệp** (hiệu ứng ngược) và quay về màn mở thiệp.
   - Đổi Gen Y ↔ Gen Z bất cứ lúc nào bằng nút trên thanh trên cùng; link trên thanh địa chỉ tự cập nhật theo (`&giaodien=genz`), nên đang xem bản nào thì copy link gửi đi là đúng bản đó.
3. **Nhạc nền không tự phát** (và không tải trước) — khách bấm nút nhạc (cuộn băng ở Gen Y, thanh "Nhạc nền" ở Gen Z) để nghe. Mỗi phong cách một bài; đổi phong cách lúc đang phát thì tự chuyển bài.

## Thêm ảnh

1. Chép ảnh vào thư mục **`photos/`**.
2. Mở **`js/config.js`**, ghi **đúng tên file** (kể cả đuôi `.jpg` / `.jpeg` / `.png`, phân biệt hoa thường) vào mục `photos`:

```js
photos: {
  cover: "cover.jpg",        // ảnh hiện ra sau khi cuộn qua tên ở phần mở đầu
  groom: "chu-re.jpg",       // chân dung chú rể
  bride: "co-dau.jpeg",      // chân dung cô dâu
  bg: ["", "", ""],          // ảnh nền: [Lời ngỏ, Ngày cưới, Lời kết] — "" = dùng hình minh hoạ vẽ sẵn
  album: ["1.jpg", "2.jpg", "3.jpg"],   // album, hiện theo đúng thứ tự này
},
```

3. F5 (hoặc đẩy lên GitHub) là ảnh hiện.

- Trang **chỉ tải đúng các file ghi trong config** — không dò tên, không gọi API, không có request lỗi. Tên file đặt gì cũng được, miễn ghi khớp.
- Để `""` nếu chưa có ảnh. Không có `cover` thì dùng ảnh album đầu tiên.
- Album hiện 12 ảnh trước, bấm "Xem thêm ảnh" để hiện tiếp (đổi bằng `galleryPageSize`).
- Ảnh **HEIC của iPhone** cần chuyển sang JPG trước.
- **Nên thu nhỏ ảnh** còn khoảng 1600–2000px chiều dài (mỗi ảnh 200–400 KB) — đây là phần nặng nhất khi khách mở bằng điện thoại.

### Ảnh nền (`photos.bg`)

> **Ghi chú:** hiện chưa có ảnh nền thật, nên trang đang dùng **hình minh hoạ vẽ sẵn** (Gen Y: phông xanh, lá cọ, chữ 囍, đôi bồ câu, xe đạp; Gen Z: mảng màu hồng/be, hoa vẽ nét mảnh).
> Khi có ảnh cưới, chép vào `photos/` rồi ghi tên file vào `photos.bg` trong config là ảnh thay chỗ hình vẽ. Ô nào để `""` thì vẫn giữ hình vẽ.

| Ô trong `bg` | Vị trí | Gợi ý ảnh |
|------|--------|-----------|
| thứ 1 | Khung vòm cạnh Lời ngỏ | Ảnh **dọc**, hai bạn đứng cạnh nhau / nhìn nhau, bố cục gọn |
| thứ 2 | Nền mờ phần Ngày cưới | Ảnh **ngang, nhiều khoảng trống** (bầu trời, mặt hồ) |
| thứ 3 | Nền mờ phần Lời kết | Ảnh **ngang, cảm giác khép lại**: dắt tay đi xa, bóng lưng, ảnh gia đình |

## Sửa thông tin

Mọi nội dung (tên, cha mẹ, ngày giờ, địa điểm, link bản đồ, chuyện tình, số tài khoản mừng cưới…) nằm trong **`js/config.js`**.

- **Nhạc nền**: chép file mp3 vào `music/`, rồi sửa `music: { classic: "music/song.mp3", modern: "music/song_new.mp3" }` (Gen Y / Gen Z) và tên bài hiển thị ở `musicTitle`. Nên nén nhạc ~128 kbps (3–4 MB) cho nhẹ.
- **Mã QR mừng cưới**: chép ảnh vào `assets/` rồi điền đường dẫn vào `gift.accounts[].qr`.
- **Lịch trình**: mỗi lễ/tiệc trong `events` gồm `title`, `date`, `time`, `lunar` (ngày âm lịch, tuỳ chọn), `place`, `address`, `map`. Thêm `side: "trai"` hoặc `side: "gai"` nếu chỉ dành cho một bên (bỏ trống = hiện cho khách cả hai bên). Sự kiện có chữ "Tiệc" và hôn lễ (trùng ngày `date`) cũng được nhắc lại ở phần Lời kết.
- **Lưu ý cho khách** (trang phục, gửi xe, số liên hệ, xác nhận tham dự): sửa trong `guestInfo`.
- **Phong cách mặc định**: `theme: "classic"` (Gen Y) trong config — link không kèm `giaodien` luôn mở ra Gen Y. Gửi link kèm `&giaodien=genz` để khách mở sẵn Gen Z.
- **Gửi thiệp có tên khách**: thêm `?ten=Tên khách` vào cuối link, ví dụ
  `https://ten-mien-cua-ban/?ten=Anh%20Nam` → màn mở thiệp hiện "Trân trọng kính mời **Anh Nam**" (tên cũng xuất hiện ở lời kết).
  Không có `ten` thì thiệp xưng "bạn". Thêm `&ben=trai` hoặc `&ben=gai` để mở sẵn đúng bên và đánh dấu "Bạn được mời bên này".
- **Tạo link hàng loạt**: mở **`tao-link.html`**, dán danh sách khách (mỗi dòng một người), chọn bên / phong cách → mỗi khách có một link riêng kèm nút **Sao chép** / **Xem thử** / **Sao chép tất cả**. Khi thiệp đã đưa lên mạng, điền địa chỉ thiệp vào ô trên cùng.
  - Vào trang này từ thiệp: nút **"✉ Tạo link mời khách"** ở cuối màn mở thiệp. Nút **chỉ hiện với cô dâu chú rể** — khi bấm đúp `index.html` trên máy, hoặc khi mở link có `?quanly=1`. Khách mở link thiệp qua mạng sẽ không thấy nút này.
  - Trang tạo link có nút **"← Về thiệp"**. Không gửi đường dẫn `tao-link.html` cho khách.

## Tham số trên link (tóm tắt)

| Tham số | Tác dụng | Ví dụ |
|---------|----------|-------|
| `ten` | Tên khách mời (không có thì xưng "bạn") | `?ten=Anh%20Nam` |
| `ben` | Khách bên nào: `trai` / `gai` | `&ben=gai` |
| `giaodien` | Mở sẵn phong cách: `genz` (không ghi = Gen Y) | `&giaodien=genz` |
| `quanly` | Hiện nút sang trang tạo link (chỉ dùng cho cô dâu chú rể) | `?quanly=1` |

## Cấu trúc

```
index.html        trang chính (thiệp)
tao-link.html     tạo link mời riêng cho từng khách
css/style.css     giao diện
js/config.js      ← thông tin đám cưới (sửa ở đây)
js/main.js        xử lý
photos/           ← chép ảnh vào đây
music/            nhạc nền (tuỳ chọn)
assets/           ảnh QR, v.v. (tuỳ chọn)
```

## Tối ưu tốc độ (điện thoại)

- Chỉ tải font của phong cách đang xem, bỏ các font/độ đậm không dùng.
- Nhạc chỉ tải khi khách bấm nghe; ảnh album, chân dung tải dần khi cuộn tới.
- Hiệu ứng hạt phim (Gen Y) đứng yên trên điện thoại cho cuộn mượt.
- Phần còn nặng nhất là **ảnh** — nhớ thu nhỏ ảnh trước khi chép vào `photos/`.
