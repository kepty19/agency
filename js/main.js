const html = document.documentElement;
const statusEl = document.getElementById("form-status");
const menuBtn = document.querySelector(".menu-btn");
const mobileNav = document.getElementById("mobile-nav");

function dict() {
  const lang = html.lang === "en" ? "en" : "ja";
  return COPY[lang] || COPY.ja;
}

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (link.hreflang) return;
    mobileNav.setAttribute("hidden", "");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

if (menuBtn) {
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
}

document.querySelectorAll(".lang-btn[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!location.hash) return;
    event.preventDefault();
    const next = new URL(link.getAttribute("href"), location.href);
    next.hash = location.hash;
    location.href = next.pathname + next.search + next.hash;
  });
});

const params = new URLSearchParams(window.location.search);
const onEnglishPage = /\/en\.html$/i.test(location.pathname);
if (params.get("lang") === "en" && !onEnglishPage) {
  location.replace(`en.html${location.hash}`);
} else if (params.get("lang") === "ja" && onEnglishPage) {
  location.replace(`./${location.hash}`);
}

function clearFieldError(field) {
  field.classList.remove("is-invalid");
  const note = field.parentElement.querySelector("[data-error]");
  if (note) {
    note.textContent = "";
    note.classList.remove("is-on");
  }
}

function setFieldError(field, message) {
  field.classList.add("is-invalid");
  const note = field.parentElement.querySelector("[data-error]");
  if (note) {
    note.textContent = message;
    note.classList.add("is-on");
  }
}

function validateForm(form) {
  const copy = dict();
  let firstInvalid = null;
  const email = form.elements.email;
  const checks = [
    [form.elements.company, copy.formRequired],
    [form.elements.name, copy.formRequired],
    [email, copy.formRequired],
    [form.elements.message, copy.formRequired],
  ];

  checks.forEach(([field, emptyMessage]) => {
    clearFieldError(field);
    const value = (field.value || "").trim();
    if (!value) {
      setFieldError(field, emptyMessage);
      if (!firstInvalid) firstInvalid = field;
      return;
    }
    if (field === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldError(field, copy.formInvalidEmail);
      if (!firstInvalid) firstInvalid = field;
    }
  });

  return firstInvalid;
}

const form = document.getElementById("contact-form");
if (form) {
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
  });

  form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  const copy = dict();
  const invalid = validateForm(form);
  if (invalid) {
    invalid.focus();
    return;
  }

  statusEl.hidden = false;
  statusEl.textContent = copy.formSending;
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
        statusEl.textContent = copy.formActivate;
        return;
      }
      throw new Error("send failed");
    }

    statusEl.textContent = needsActivate ? copy.formActivate : copy.formOk;
    if (!needsActivate) form.reset();
  } catch (error) {
    statusEl.textContent = copy.formError;
  } finally {
    button.disabled = false;
  }
  });
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
