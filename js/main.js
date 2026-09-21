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

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (!reduceMotion) {
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-in");
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

const chapters = [...document.querySelectorAll(".chapter[id], .open[id]")];
const indexLinks = [...document.querySelectorAll(".index a")];
const progress = document.querySelector(".rail-progress");

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.height = `${Math.min(1, Math.max(0, ratio)) * 100}%`;

  const marker = window.scrollY + window.innerHeight * 0.32;
  let current = "top";
  chapters.forEach((section) => {
    if (section.offsetTop <= marker) current = section.id;
  });
  indexLinks.forEach((link) => {
    link.classList.toggle("is-current", link.getAttribute("href") === `#${current}`);
  });
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (finePointer && !reduceMotion) {
  const pointer = document.querySelector(".pointer");
  if (pointer) {
    document.body.classList.add("has-pointer");
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;

    window.addEventListener(
      "pointermove",
      (event) => {
        x = event.clientX;
        y = event.clientY;
      },
      { passive: true }
    );

    const hoverables = "a, button, input, textarea, label";
    document.querySelectorAll(hoverables).forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("is-hovering"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("is-hovering"));
    });

    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      pointer.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
  }
}
