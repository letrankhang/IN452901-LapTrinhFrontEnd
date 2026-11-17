// Câu 2: viết JavaScript tại đây

const API_URL = "http://localhost:4000";

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// a) Hàm formatSeats(event) trả về "Còn 12/40 chỗ", hoặc "Hết chỗ" khi đã đủ.
const formatSeats = (event) => {
  if (event.registeredCount >= event.capacity) {
    return "Hết chỗ";
  }
  const remainingSeats = event.capacity - event.registeredCount;
  return `Còn ${remainingSeats}/${event.capacity} chỗ`;
};

// DOM elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("keyword");
const statusElement = document.getElementById("status");
const eventList = document.getElementById("event-list");

// b) Hàm renderEvents(events) tạo card giống Câu 1 bằng createElement,
// gán dữ liệu bằng textContent/setAttribute, rồi thay nội dung cũ của #event-list bằng replaceChildren.
const renderEvents = (events) => {
  const cards = events.map((event) => {
    const article = document.createElement("article");
    article.className = "event-card";

    const img = document.createElement("img");
    img.setAttribute("src", "img/event.svg");
    img.setAttribute("alt", event.name);

    const h2 = document.createElement("h2");
    const a = document.createElement("a");
    a.setAttribute("href", `event-detail.html?id=${event.id}`);
    a.textContent = event.name;
    h2.appendChild(a);

    const pTime = document.createElement("p");
    const time = document.createElement("time");
    time.setAttribute("datetime", event.startTime);
    time.textContent = formatDateTime(event.startTime);
    pTime.appendChild(time);

    const pLocation = document.createElement("p");
    pLocation.textContent = event.location;

    const pSeats = document.createElement("p");
    if (event.registeredCount >= event.capacity) {
      const badge = document.createElement("span");
      badge.className = "sold-out";
      badge.textContent = "Hết chỗ";
      pSeats.appendChild(badge);
    } else {
      pSeats.textContent = formatSeats(event);
    }

    article.append(img, h2, pTime, pLocation, pSeats);
    return article;
  });

  eventList.replaceChildren(...cards);
};

// c) Hàm async loadEvents(keyword), gọi khi mở trang và khi gửi form
const loadEvents = async (keyword = "") => {
  // Hiện trong #status: “Đang tải…” trước khi gọi
  statusElement.textContent = "Đang tải…";

  // Dựng URL bằng URLSearchParams, luôn có pageSize=50, chỉ thêm q khi từ khoá khác rỗng
  const trimmed = typeof keyword === "string" ? keyword.trim() : "";
  const params = new URLSearchParams({ pageSize: "50" });
  if (trimmed !== "") {
    params.set("q", trimmed);
  }

  try {
    const response = await fetch(`${API_URL}/api/events?${params.toString()}`);
    // Kiểm tra response.ok
    if (!response.ok) {
      throw new Error("Lỗi phản hồi máy chủ");
    }

    const data = await response.json();
    const items = data.items || [];

    if (items.length === 0) {
      // “Không có sự kiện nào khớp từ khoá.”
      statusElement.textContent = "Không có sự kiện nào khớp từ khoá.";
      renderEvents([]);
    } else {
      // “Tìm thấy n sự kiện”
      statusElement.textContent = `Tìm thấy ${data.totalCount ?? items.length} sự kiện`;
      renderEvents(items);
    }
  } catch (error) {
    // “Không tải được dữ liệu, vui lòng thử lại.” khi lỗi máy chủ hoặc mất kết nối
    statusElement.textContent = "Không tải được dữ liệu, vui lòng thử lại.";
    renderEvents([]);
  }
};

// Gửi form thì chặn tải lại trang và cắt khoảng trắng từ khoá
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = searchInput.value.trim();
  loadEvents(keyword);
});

// Gọi khi mở trang
loadEvents();
