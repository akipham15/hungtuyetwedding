# Thiệp cưới Hưng & Tuyết 💍

Website thiệp cưới tĩnh, tông hồng · trắng · be, có **2 giao diện cho khách tự chọn**: *Gen Y* (đám cưới Việt thập niên 80–90 — phông vải xanh, chữ cắt dán đỏ/vàng "Vui Tân Hôn", chăn con công, xe đạp chở hoa, lá cọ, đôi chim bồ câu, băng cassette, ảnh màu phim có dấu ngày) và *Gen Z* (tối giản fine-art tông ngà – hồng phấn, ảnh màu gốc), với hiệu ứng cuộn trang nhẹ nhàng và album ảnh dạng lưới. Lịch trình được tách rõ **Nhà trai / Nhà gái**.

Hiệu ứng cuộn dùng thư viện GSAP (tải từ CDN, cần mạng). Nếu không tải được hoặc máy khách bật "giảm chuyển động", trang vẫn hiển thị đầy đủ ở dạng tĩnh.

## Xem thiệp

Bấm đúp **`index.html`** để mở trên trình duyệt — không cần cài hay chạy gì thêm (cần mạng để tải font & hiệu ứng).

## Thêm ảnh

Chép ảnh vào thư mục **`photos/`** rồi **F5** là ảnh hiện lên.
Vì trình duyệt không cho trang đọc danh sách file trong thư mục, trang **tìm ảnh theo tên file** — hãy đặt tên đúng như bảng dưới (đuôi `.jpg`, `.jpeg`, `.png`, `.webp` đều được, hoa thường đều được):

| Tên file | Dùng làm |
|----------|----------|
| `cover`  | Ảnh mở đầu (hiện ra sau khi cuộn qua tên) |
| `chu-re` | Ảnh chân dung chú rể |
| `co-dau` | Ảnh chân dung cô dâu |
| `nen-1`, `nen-2`, `nen-3` | Ảnh nền cho Lời ngỏ, Ngày cưới, Lời kết — xem mục "Ảnh nền" bên dưới |
| `1`, `2`, `3`, … | **Album ảnh cưới**, hiện theo thứ tự số |

- Ví dụ: `cover.jpg`, `chu-re.jpg`, `co-dau.jpeg`, `1.jpg`, `2.jpg`, `3.png`…
- Ảnh album **phải đặt tên bằng số** (ảnh tên khác như `DSC08578.JPG` sẽ không hiện). Bỏ trống vài số vẫn được (ví dụ có `1`, `2`, `5`), nhưng đừng bỏ trống quá 8 số liên tiếp.
- Album hiện 12 ảnh trước, bấm "Xem thêm ảnh" để hiện tiếp (đổi bằng `galleryPageSize` trong config).
- Nếu không có ảnh `cover`, ảnh `1` sẽ được dùng làm ảnh mở đầu.
- Ảnh **HEIC của iPhone** cần chuyển sang JPG trước.
- **Nên thu nhỏ ảnh** còn khoảng 1600–2000px chiều dài (mỗi ảnh vài trăm KB) để khách mở bằng điện thoại cho nhanh.

### Ảnh nền (`nen-1`, `nen-2`, `nen-3`)

> **Ghi chú:** hiện chưa có ảnh nền thật, nên trang đang dùng **hình minh hoạ vẽ sẵn** (Gen Y: phông xanh, lá cọ, chữ 囍, đôi bồ câu, xe đạp; Gen Z: mảng màu hồng/be, hoa vẽ nét mảnh).
> Khi có ảnh cưới, chỉ cần chép vào `photos/` đúng tên là ảnh tự thay chỗ hình vẽ. Thiếu file nào thì chỗ đó vẫn giữ hình vẽ.

| File | Vị trí | Gợi ý ảnh |
|------|--------|-----------|
| `nen-1` | Khung vòm cạnh Lời ngỏ | Ảnh **dọc**, hai bạn đứng cạnh nhau / nhìn nhau, bố cục gọn |
| `nen-2` | Nền mờ phần Ngày cưới | Ảnh **ngang, nhiều khoảng trống** (bầu trời, mặt hồ) |
| `nen-3` | Nền mờ phần Lời kết | Ảnh **ngang, cảm giác khép lại**: dắt tay đi xa, bóng lưng, ảnh gia đình |

## Sửa thông tin

Mọi nội dung (tên, cha mẹ, ngày giờ, địa điểm, link bản đồ, chuyện tình, số tài khoản mừng cưới…) nằm trong **`js/config.js`**.

- **Nhạc nền**: chép file vào `music/song.mp3` (hoặc sửa đường dẫn `music` trong config), tên bài hiện trên cuộn băng cassette sửa ở `musicTitle`. Nhạc **không tự phát**: khách bấm nút nhạc (cuộn băng / thanh "Nhạc nền") để nghe.
- **Mã QR mừng cưới**: chép ảnh vào `assets/` rồi điền đường dẫn vào `gift.accounts[].qr`.
- **Lịch trình hai bên**: mỗi lễ/tiệc trong `events` có `side: "trai"` hoặc `side: "gai"` (bỏ trống = hiện ở cả hai bên).
- **Lưu ý cho khách** (trang phục, gửi xe, số liên hệ, xác nhận tham dự): sửa trong `guestInfo`.
- **Giao diện mặc định**: `theme: "classic"` hoặc `"modern"` trong config. Khách đổi bằng nút "Gen Y | Gen Z" (trình duyệt nhớ lựa chọn); gửi link kèm `&giaodien=geny` hoặc `&giaodien=genz` để chọn sẵn. Mỗi phong cách có nhạc nền riêng (`music` trong config).
- **Gửi thiệp có tên khách**: thêm `?to=Tên khách` vào cuối link, ví dụ
  `https://ten-mien-cua-ban/?to=Anh%20Nam` → màn mở thiệp hiện "Trân trọng kính mời **Anh Nam**".
  Thêm `&ben=trai` hoặc `&ben=gai` để trang mở sẵn đúng bên và đánh dấu "Bạn được mời bên này", ví dụ
  `https://ten-mien-cua-ban/?to=Anh%20Nam&ben=gai`.

## Cấu trúc

```
index.html        trang chính
css/style.css     giao diện
js/config.js      ← thông tin đám cưới (sửa ở đây)
js/main.js        xử lý
photos/           ← chép ảnh vào đây
music/            nhạc nền (tuỳ chọn)
assets/           ảnh QR, v.v. (tuỳ chọn)
```
