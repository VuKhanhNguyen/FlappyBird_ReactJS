<p align="center">
	<img src="FlappyBird/public/images/background-day.png" alt="Flappy Bird - Background" width="720" />
</p>

<h1 align="center">Flappy Bird (ReactJS)</h1>

<p align="center">
	Một bản remake nhỏ gọn của <b>Flappy Bird</b> chạy trên trình duyệt, viết bằng <b>React + Vite</b>.
</p>

<p align="center">
	<img alt="React" src="https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=000" />
	<img alt="Vite" src="https://img.shields.io/badge/Vite-5+-646CFF?logo=vite&logoColor=fff" />
	<img alt="Styled Components" src="https://img.shields.io/badge/styled--components-5+-DB7093?logo=styled-components&logoColor=fff" />
</p>

<p align="center">
	<a href="#demo">Demo</a> ·
	<a href="#t%C3%ADnh-n%C4%83ng">Tính năng</a> ·
	<a href="#c%C3%A0i-%C4%91%E1%BA%B7t--ch%E1%BA%A1y-local">Cài đặt</a> ·
	<a href="#c%C3%A1ch-ch%C6%A1i">Cách chơi</a> ·
	<a href="#scripts">Scripts</a>
</p>

---

## Demo

- Chưa có link demo public. Nếu bạn deploy (ví dụ Netlify), dán URL ở đây.

## Tính năng

- Điều khiển mượt: click/tap hoặc `Space`/`ArrowUp`
- Nhiều mức độ khó (Easy → Asian)
- Tự co giãn theo màn hình (responsive)
- Lưu **Best score** bằng `localStorage`

## Công nghệ

- React + Vite
- styled-components

## Cài đặt & chạy local

**Yêu cầu**

- Node.js (khuyến nghị Node 18+)
- npm (đi kèm Node.js)

**Quick start**

```bash
cd FlappyBird
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173` (hoặc URL hiển thị trong terminal).

## Cách chơi

**Mục tiêu**

- Điều khiển chim bay qua các ống (pipes) và tránh va chạm.
- Mỗi lần vượt qua một cặp ống bạn được +1 điểm.

**Điều khiển**

| Hành động       | Trên máy tính          | Trên điện thoại  |
| --------------- | ---------------------- | ---------------- |
| Bay lên (flap)  | `Space` hoặc `ArrowUp` | Tap vào màn hình |
| Bắt đầu ván mới | Flap lần đầu           | Tap lần đầu      |

**Mẹo**

- Chọn mức độ khó trước khi bắt đầu (các nút Difficulty).
- Khi thua, màn hình sẽ hiển thị điểm hiện tại và **Best** (lưu tự động).

## Độ khó

Thông số mang tính tham khảo (tốc độ ống: px/giây, khoảng trống: px).

| Mức     | Speed | Gap |
| ------- | ----: | --: |
| Easy    |   120 | 230 |
| Medium  |   150 | 200 |
| Hard    |   180 | 180 |
| Hell    |   230 | 140 |
| Classic |   140 | 170 |
| Asian   |   260 | 120 |

Ghi chú: mức **Classic** sẽ tăng tốc dần theo điểm.

## Scripts

Chạy trong thư mục `FlappyBird/`.

| Lệnh              | Mục đích             |
| ----------------- | -------------------- |
| `npm run dev`     | Chạy dev server      |
| `npm run build`   | Build bản production |
| `npm run preview` | Preview bản build    |

## Cấu trúc thư mục

```text
FlappyBird/
	src/          # Code chính của game
	public/       # Asset tĩnh (ảnh, manifest...)
```
