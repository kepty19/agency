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

document.getElementById("contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const lang = html.dataset.lang || "ja";
  const dict = COPY[lang];

  statusEl.hidden = false;
  statusEl.textContent = dict.formSending;
  button.disabled = true;

  const payload = new FormData(form);
  payload.set("_subject", "Kepty website inquiry");
  payload.set("_template", "table");
  payload.set("_captcha", "false");
  payload.set("replyto", payload.get("email") || "");

  try {
    const response = await fetch("https://formsubmit.co/ajax/contact@kepty.co", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
    });

    const result = await response.json().catch(() => ({}));
    const message = `${result.message || ""} ${result.success || ""}`;
    const needsActivate = /activat|confirm|verify/i.test(message);

    if (!response.ok || result.success === false || result.success === "false") {
      if (needsActivate) {
        statusEl.textContent = dict.formActivate;
        return;
      }
      throw new Error("send failed");
    }

    statusEl.textContent = needsActivate ? dict.formActivate : dict.formOk;
    if (!needsActivate) form.reset();
  } catch (error) {
    statusEl.textContent = dict.formError;
  } finally {
    button.disabled = false;
  }
});

const params = new URLSearchParams(window.location.search);
const saved = localStorage.getItem("pb-lang");
let initial = "ja";
if (params.get("lang") === "en" || params.get("lang") === "ja") initial = params.get("lang");
else if (saved === "en" || saved === "ja") initial = saved;
applyLang(initial);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
