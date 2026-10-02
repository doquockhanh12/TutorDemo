const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn?.addEventListener("click", () => {
  const opened = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(opened));
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
  });
});

const finderBtn = document.getElementById("finderBtn");
const level = document.getElementById("level");
const goal = document.getElementById("goal");
const district = document.getElementById("district");
const finderResult = document.getElementById("finderResult");
const finderButtonLabel = finderBtn?.textContent;

function updateFinder() {
  finderResult.textContent = `Đang chọn: ${level.value} · ${goal.value} · ${district.value}`;
}

[level, goal, district].forEach((el) => el?.addEventListener("change", updateFinder));

finderBtn?.addEventListener("click", () => {
  finderResult.textContent = `Demo tìm kiếm: ${level.value} · ${goal.value} · ${district.value}`;
  finderBtn.textContent = "Đã chọn";
  setTimeout(() => (finderBtn.textContent = finderButtonLabel), 1200);
});

document.querySelectorAll(".save-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const saved = btn.classList.toggle("is-saved");
    btn.textContent = saved ? "♥" : "♡";
    btn.setAttribute("aria-pressed", String(saved));
    btn.setAttribute("aria-label", saved ? "Bỏ lưu gia sư" : "Lưu gia sư");
  });
});

const tooltip = document.getElementById("mapTooltip");
document.querySelectorAll(".map-pin").forEach((pin) => {
  pin.addEventListener("click", () => {
    document.querySelectorAll(".map-pin").forEach((p) => p.classList.remove("active"));
    pin.classList.add("active");
    tooltip.textContent = pin.dataset.tutor || "Gia sư";
  });
});

const consultForm = document.getElementById("consultForm");
consultForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("formSuccess")?.classList.add("show");
});

const backdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalEyebrow = document.getElementById("modalEyebrow");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");

const modalContent = {
  login: {
    eyebrow: "TUTORNEARME",
    title: "Đăng nhập",
    text: "Bản V2 này chỉ minh họa giao diện. Luồng đăng nhập thật sẽ được nối sau."
  },
  register: {
    eyebrow: "BẮT ĐẦU",
    title: "Bạn muốn tham gia với vai trò nào?",
    text: "Ở sản phẩm thật, người dùng có thể chọn Người học / Phụ huynh hoặc Gia sư trước khi đăng ký."
  },
  tutor: {
    eyebrow: "DÀNH CHO GIA SƯ",
    title: "Trở thành gia sư TutorNearMe",
    text: "Luồng tiếp theo có thể dẫn tới hồ sơ chuyên môn, xác minh và lịch rảnh."
  },
  consult: {
    eyebrow: "TƯ VẤN",
    title: "Nhận gợi ý tìm gia sư",
    text: "Prototype chỉ mô phỏng trải nghiệm. Form thật có thể được nối backend ở giai đoạn sau."
  }
};

function openModal(type) {
  const data = modalContent[type] || modalContent.register;
  modalEyebrow.textContent = data.eyebrow;
  modalTitle.textContent = data.title;
  modalText.textContent = data.text;
  backdrop.classList.add("show");
  backdrop.setAttribute("aria-hidden", "false");
  modalClose.focus();
}

function closeModal() {
  backdrop.classList.remove("show");
  backdrop.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-modal]").forEach((el) => {
  el.addEventListener("click", () => openModal(el.dataset.modal));
});

modalClose?.addEventListener("click", closeModal);
modalCancel?.addEventListener("click", closeModal);

backdrop?.addEventListener("click", (event) => {
  if (event.target === backdrop) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && backdrop.classList.contains("show")) closeModal();
});


// V3: make the header visibly translucent/blurred after scrolling.
const topbar = document.querySelector(".topbar");
function syncHeaderState() {
  if (!topbar) return;
  topbar.classList.toggle("scrolled", window.scrollY > 18);
}
syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });
