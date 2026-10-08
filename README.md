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
3. **Hiệu ứng riêng mỗi phong cách**
   - Gen Y: **xác pháo đỏ** bay khắp màn hình khi hai cánh thiệp mở và khi cuộn tới lời kết; **dây đèn nháy** nhiều màu như rạp cưới ở phần mở đầu và lời kết; đếm ngược **lật số như đồng hồ lật**.
   - Gen Z: emoji bung ra khi mở khoá; **chạm 2 lần vào màn hình để thả tim** (như Instagram); hai **dải chữ chạy** bắt chéo; lời ngỏ hiện như **tin nhắn** ("đang nhập…" rồi bong bóng chat); chữ nhấn đổi màu hologram; **thẻ mừng cưới hologram** (máy tính: nghiêng theo chuột); mưa emoji ở lời kết; máy tính có vệt lấp lánh theo con trỏ.
   - Máy bật "giảm chuyển động" thì các hiệu ứng này tự tắt.
   - **Cào số tài khoản** (phần Mừng cưới): mỗi tài khoản là một **phong bì mừng cưới** (Gen Y: phong bì đỏ, dấu sáp 囍; Gen Z: phong bì hồng phấn, dấu sáp ♡) có lá thư rút lên một nửa; số tài khoản trên lá thư được phủ một dải cào — Gen Y là dải bạc kiểu vé số cào, Gen Z là dải hologram. Cào xong thì Gen Y nổ pháo, Gen Z bung emoji. Nút **Sao chép số tài khoản** vẫn chép được ngay (và tự mở dải cào), nên khách không bắt buộc phải cào.
   - **Photobooth** (sau Album): khách bật camera (đếm ngược 3-2-1, có đèn flash) hoặc chọn ảnh có sẵn → ảnh tự gắn **khung thiệp** (Gen Y: thiệp đỏ "Vui Tân Hôn", bồ câu, dấu ngày phim; Gen Z: sticker, chữ hologram) kèm tên khách nếu link có `?ten=`. Tải ảnh về hoặc chia sẻ thẳng (điện thoại). Đổi Gen Y/Gen Z là ảnh đổi khung ngay. Ảnh xử lý hoàn toàn trên máy khách, không tải lên đâu. Camera cần trang chạy qua `https://` (GitHub Pages là được).
4. **Toàn màn hình trên điện thoại**: bấm "Mở thiệp" là thiệp tự vào chế độ toàn màn hình (ẩn thanh địa chỉ) trên Android. iPhone (Safari) chưa cho trang web làm việc này — khách chọn **Chia sẻ → Thêm vào MH chính** thì mở từ biểu tượng sẽ hiện toàn màn hình (nhờ `manifest.webmanifest` và các thẻ meta trong `index.html`; biểu tượng ở `assets/icon-*.png`).
5. **Thiệp tự đổi theo ngày** (giờ Việt Nam):
   - **Đúng ngày có lễ/tiệc**: ngay dưới phần mở đầu hiện khối **"Hôm nay"** — giờ, địa điểm, trạng thái trực tiếp (còn bao lâu / đang diễn ra / đã xong), nút **Chỉ đường** lớn và nút **Gọi** chú rể/cô dâu; mục đầu thanh dưới đáy đổi thành "Hôm nay".
   - **Sau ngày cuối cùng**: lời mời đổi thành lời cảm ơn, album chuyển lên ngay sau phần mở đầu, lịch trình chỉ còn để lưu niệm, ẩn phần lưu ý/xác nhận tham dự.
   - Xem trước bằng link có `?ngay=2026-11-16` (ngày cưới) hoặc `?ngay=2026-11-20` (sau cưới).
6. **Xem được khi mạng yếu**: mở thiệp một lần (qua mạng) là trang tự lưu lại; lần sau mạng chập chờn hoặc mất sóng vẫn xem được thiệp, địa chỉ, số điện thoại (`sw.js`). Có mạng thì luôn lấy bản mới nhất. Nhạc không được lưu.
7. **Ảnh xem trước khi gửi link** (Zalo, Messenger, Facebook): `assets/og-image.jpg` (1200×630). Thẻ meta trong `index.html` ghi link đầy đủ `https://akipham15.github.io/hungtuyetwedding/` — đổi tên miền thì sửa các dòng `og:url`, `og:image`, `twitter:image`. Zalo/Facebook lưu ảnh xem trước một thời gian; muốn làm mới trên Facebook dùng [Sharing Debugger](https://developers.facebook.com/tools/debug/).
8. **Nhạc nền tự phát khi bấm "Mở thiệp"** — phát lần lượt 5 bài, bài nào phát mới tải bài đó. Bấm nút ☰ trên nút nhạc (cuộn băng ở Gen Y, thanh "Nhạc nền" ở Gen Z) để chọn bài; bấm nút nhạc để tắt/bật. Đổi phong cách lúc đang phát thì nhạc vẫn chạy tiếp.

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
- **Ảnh bìa (`cover`) nên là ảnh dọc tỉ lệ 9:16** (ví dụ 1080×1920), chủ thể đặt ở khoảng 1/3 – 1/2 phía trên: thiệp hiển thị dạng một cột như màn hình điện thoại (rộng tối đa 448px, kể cả trên máy tính), nên ảnh ngang sẽ bị cắt mất hai bên và phần dưới bị thẻ tên che. Ảnh bìa hiện tại là hình minh hoạ vẽ sẵn (vòng hoa đào trái tim, đôi nhẫn) — có ảnh cưới thật thì thay vào.
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

- **Nhạc nền**: danh sách phát trong `music` (mỗi bài `{ src, title }`), phát lần lượt, hết thì quay lại bài đầu; dùng chung cho Gen Y & Gen Z. Chép file mp3 vào `music/` **đúng tên** đã khai báo:
  `1-i-love-you-3000.mp3`, `2-i-love-you-baby.mp3`, `3-to-the-moon.mp3`, `4-sao-cung-duoc.mp3`, `5-ban-doi.mp3`.
  Bài nào chưa có file thì tự bỏ qua. Nên nén ~128 kbps (3–4 MB/bài) cho nhẹ. Muốn mỗi phong cách một danh sách: `music: { classic: [ … ], modern: [ … ] }`.
- **Mã QR mừng cưới**: chép ảnh vào `assets/` rồi điền đường dẫn vào `gift.accounts[].qr`.
- **Lịch trình**: mỗi lễ/tiệc trong `events` gồm `side` (`"trai"` / `"gai"`, bỏ trống = chung hai bên), `title`, `date`, `time`, `lunar` (ngày âm lịch, tuỳ chọn), `place`, `address`, `map`.
  - Không ghi `map` thì nút **Chỉ đường** tự tìm theo `address` trên Google Maps; ghi `map: ""` để ẩn nút.
  - **Khách nhà gái** (link có `&ben=gai`) thấy giờ **hôn lễ & tiệc của nhà gái** ở bìa, đếm ngược, ô ngày cưới và Lời kết; nút nhắn Zalo xác nhận tham dự gửi tới **cô dâu**. Khách nhà trai hoặc link không có `ben` thấy theo nhà trai (`date` trong config).
  - Sự kiện có chữ "Hôn lễ" và "Tiệc" của bên đang xem được nhắc lại ở phần Lời kết.
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
| `ben` | Khách bên nào: `trai` / `gai` — mở sẵn đúng bên, hiện giờ lễ/tiệc của bên đó | `&ben=gai` |
| `giaodien` | Mở sẵn phong cách: `genz` (không ghi = Gen Y) | `&giaodien=genz` |
| `ngay` | Giả lập ngày để xem trước chế độ "Hôm nay" / sau cưới (chỉ để kiểm tra, không gửi cho khách) | `?ngay=2026-11-16` |
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
