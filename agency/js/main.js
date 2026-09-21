const html = document.documentElement;
const statusEl = document.getElementById("form-status");
const menuBtn = document.querySelector(".menu-btn");
const mobileNav = document.getElementById("mobile-nav");

function applyLang(lang) {
  const dict = COPY[lang] || COPY.en;
  html.lang = lang === "ja" ? "ja" : "en";
  html.dataset.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (dict[key]) el.innerHTML = dict[key];
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  localStorage.setItem("pb-lang", lang);
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});

menuBtn.addEventListener("click", () => {
  const open = mobileNav.hasAttribute("hidden") === false;
  if (open) {
    mobileNav.setAttribute("hidden", "");
    menuBtn.setAttribute("aria-expanded", "false");
  } else {
    mobileNav.removeAttribute("hidden");
    menuBtn.setAttribute("aria-expanded", "true");
  }
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.setAttribute("hidden", "");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const body = [
    `Name / Company: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Brand: ${data.get("brand")}`,
    "",
    data.get("message"),
  ].join("\n");

  const mailto = `mailto:partnerships@pitchbridge.jp?subject=${encodeURIComponent(
    "Japan distribution inquiry: " + data.get("brand")
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  statusEl.hidden = false;
  const lang = html.dataset.lang || "en";
  statusEl.textContent = COPY[lang].formOk;
});

const params = new URLSearchParams(window.location.search);
const saved = localStorage.getItem("pb-lang");
const initial = params.get("lang") === "ja" || saved === "ja" ? "ja" : "en";
applyLang(initial);
