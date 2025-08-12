
// FAQ rotation des icon
(function initFaqAccordion() {
  const faqItems = document.querySelectorAll("[data-faq]");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const toggle = item.querySelector(".faq-toggle");
    const content = item.querySelector(".faq-content");
    if (!toggle || !content) return;

    function closeAll() {
      faqItems.forEach((el) => {
        const c = el.querySelector(".faq-content");
        if (c) c.style.maxHeight = null;
        el.classList.remove("faq-open");
      });
    }

    item.addEventListener("click", () => {
      const isOpen = item.classList.contains("faq-open");
      closeAll();
      if (!isOpen) {
        item.classList.add("faq-open");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
})();

// Témoignages - auto défilement infini
function animateCarousel(id, direction = "left", speed = 0.5) {
  const carousel = document.getElementById(id);
  if (!carousel) return;
  let scrollAmount = carousel.scrollLeft || 0;

  function step() {
    scrollAmount += speed * (direction === "left" ? 1 : -1);
    const half = carousel.scrollWidth / 2;
    if (direction === "left") {
      if (scrollAmount >= half) scrollAmount = 0;
    } else {
      if (scrollAmount <= 0) scrollAmount = half;
    }
    carousel.scrollLeft = scrollAmount;
    requestAnimationFrame(step);
  }
  step();
}

animateCarousel("carousel1", "left", 0.5);
animateCarousel("carousel2", "right", 0.5);

//section projet

function initProjectsCarousel() {
  const track = document.getElementById("projectsCarousel");
  if (!track) return;

  const prevBtn = document.getElementById("projectsPrev");
  const nextBtn = document.getElementById("projectsNext");
  const progressFill = document.getElementById("projectsProgressFill");
  const autoIntervalMs = 3500;
  let autoTimer = null;

  function getGapPx() {
    const style = getComputedStyle(track);
    const gapStr = style.columnGap || style.gap || "24px";
    const num = parseInt(gapStr.replace("px", ""), 10);
    return Number.isFinite(num) ? num : 24;
  }

  function computeScrollBy() {
    const firstSlide = track.querySelector("[data-project-slide]");
    if (!firstSlide) return track.clientWidth;
    return firstSlide.offsetWidth + getGapPx();
  }

  function updateProgress() {
    const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
    const ratio = Math.min(1, Math.max(0, track.scrollLeft / maxScroll));
    if (progressFill) progressFill.style.width = `${ratio * 100}%`;
  }

  function goPrev() {
    track.scrollBy({ left: -computeScrollBy(), behavior: "smooth" });
  }

  function goNext() {
    const by = computeScrollBy();
    const nearingEnd = track.scrollLeft + track.clientWidth + by >= track.scrollWidth - 2;
    if (nearingEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: by, behavior: "smooth" });
    }
  }

  prevBtn && prevBtn.addEventListener("click", () => {
    stopAuto();
    goPrev();
    startAuto();
  });
  nextBtn && nextBtn.addEventListener("click", () => {
    stopAuto();
    goNext();
    startAuto();
  });

  track.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(goNext, autoIntervalMs);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  track.addEventListener("mouseenter", stopAuto);
  track.addEventListener("mouseleave", startAuto);
  track.addEventListener("touchstart", stopAuto, { passive: true });
  track.addEventListener("touchend", startAuto, { passive: true });

  startAuto();
}

initProjectsCarousel();

//Gestion des contact avec EmailJS 

(function initEmailJsForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");

  const metaKey = document.querySelector('meta[name="emailjs-public-key"]');
  const PUBLIC_KEY = metaKey && metaKey.getAttribute("content") ? metaKey.getAttribute("content") : "";
  if (window.emailjs && typeof emailjs.init === "function" && PUBLIC_KEY) {
    emailjs.init({ publicKey: PUBLIC_KEY });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const currentLang = document.documentElement.getAttribute("lang") || "fr";
    const t = (key, fallback) => {
      try {
        const dict = window.__lastDict || {};
        const parts = key.split(".");
        let cur = dict;
        for (const p of parts) cur = cur && cur[p] != null ? cur[p] : undefined;
        return typeof cur === "string" ? cur : fallback;
      } catch (_) {
        return fallback;
      }
    };

    function setStatus(message, isError) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.remove("hidden");
      statusEl.classList.toggle("text-green-600", !isError);
      statusEl.classList.toggle("text-red-600", !!isError);
    }

    try {
      if (!window.emailjs) throw new Error("EmailJS not loaded");

      submitBtn && (submitBtn.disabled = true);
      submitBtn && submitBtn.classList.add("opacity-70", "cursor-not-allowed");

      const formData = new FormData(form);
      const templateParams = {
        name: formData.get("name") || "",
        email: formData.get("email") || "",
        subject: formData.get("subject") || "",
        message: formData.get("message") || "",
      };

      // IDs de corea
      const SERVICE_ID = "service_m3q0p4q";
      const TEMPLATE_ID = "template_z7kbbpk";

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY ? { publicKey: PUBLIC_KEY } : undefined);

      setStatus(
        t(
          "contact.form.status.success",
          currentLang === "en"
            ? "Your message has been sent successfully. We will get back to you soon."
            : "Votre message a été envoyé avec succès. Nous vous reviendrons rapidement."
        ),
        false
      );
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus(
        t(
          "contact.form.status.error",
          (document.documentElement.getAttribute("lang") || "fr") === "en"
            ? "An error occurred while sending your message. Please try again later."
            : "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard."
        ),
        true
      );
    } finally {
      submitBtn && (submitBtn.disabled = false);
      submitBtn && submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  }

  form.addEventListener("submit", handleSubmit);
})();

//animations au Scroll 

(function initScrollAnimations() {
  const elements = document.querySelectorAll("[data-animate]");
  if (!elements.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  elements.forEach((el) => observer.observe(el));
})();


// i18n:  tranduction automatique et sauvegarde avec le localStorage


(function initI18n() {
  const STORAGE_KEY = "lang";
  const DEFAULT_LANG = "fr";
  const htmlEl = document.documentElement;

  const langToggleBtn = document.getElementById("langToggle");
  const langMenu = document.getElementById("langMenu");
  const langCurrentLabel = document.getElementById("langCurrentLabel");

  function detectInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en") return saved;
    const nav = (navigator.language || navigator.userLanguage || "fr").toLowerCase();
    return nav.startsWith("en") ? "en" : "fr";
  }

  async function loadDictionary(lang) {
    const res = await fetch(`./lang/${lang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load translations for ${lang}`);
    return res.json();
  }

  function applyTextTranslations(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = getByPath(dict, key);
      if (typeof value === "string") el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = getByPath(dict, key);
      if (typeof value === "string") el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-attr-content]").forEach((el) => {
      const key = el.getAttribute("data-i18n-attr-content");
      const value = getByPath(dict, key);
      if (typeof value === "string") el.setAttribute("content", value);
    });
    document.querySelectorAll("[data-i18n-attr-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-attr-placeholder");
      const value = getByPath(dict, key);
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj);
  }

  async function setLanguage(lang) {
    try {
      const dict = await loadDictionary(lang);
      applyTextTranslations(dict);
      window.__lastDict = dict;
      htmlEl.setAttribute("lang", lang);
      localStorage.setItem(STORAGE_KEY, lang);
      if (langCurrentLabel) langCurrentLabel.textContent = lang === "en" ? "🇬🇧" : "🇫🇷";
    } catch (e) {
      console.error(e);
    }
  }

  function setupMenuInteractions() {
    if (!langToggleBtn || !langMenu) return;

    function closeMenu() {
      langMenu.classList.add("hidden");
      langToggleBtn.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      langMenu.classList.remove("hidden");
      langToggleBtn.setAttribute("aria-expanded", "true");
    }

    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !langMenu.classList.contains("hidden");
      if (isOpen) closeMenu(); else openMenu();
    });

    document.addEventListener("click", (e) => {
      if (!langMenu.contains(e.target) && e.target !== langToggleBtn) {
        closeMenu();
      }
    });

    langMenu.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lang = btn.getAttribute("data-lang");
        await setLanguage(lang);
        closeMenu();
      });
    });
  }

  // Initialisation de la langue
  const initial = detectInitialLang();
  setLanguage(initial);
  setupMenuInteractions();
})(); 

// Header  effet au scroll
(function initHeaderScrollBehavior() {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  let lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let ticking = false;
  let showTimeoutId = null;

  function onScroll() {
    const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const delta = currentY - lastY;
    const threshold = 4;
    if (Math.abs(delta) < threshold) return;

    if (currentY <= 0) {
      header.style.transform = "translateY(0)";
      if (showTimeoutId) { clearTimeout(showTimeoutId); showTimeoutId = null; }
    } else if (delta > 0) {
      header.style.transform = "translateY(-100%)";
      if (showTimeoutId) clearTimeout(showTimeoutId);
      showTimeoutId = setTimeout(() => {
        header.style.transform = "translateY(0)";
      }, 1000);
    } else {
      header.style.transform = "translateY(0)";
      if (showTimeoutId) { clearTimeout(showTimeoutId); showTimeoutId = null; }
    }
    lastY = currentY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
})();

// Menu mobile
(function initMobileDrawer() {
  const btn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileDrawer");
  const overlay = document.getElementById("mobileOverlay");
  const closeBtn = document.getElementById("mobileCloseBtn");
  if (!btn || !drawer || !overlay) return;

  function open() {
    drawer.classList.remove("-translate-x-full");
    drawer.classList.add("translate-x-0");
    overlay.classList.remove("pointer-events-none");
    overlay.classList.add("opacity-100");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("overflow-hidden");
  }

  function close() {
    drawer.classList.add("-translate-x-full");
    drawer.classList.remove("translate-x-0");
    overlay.classList.add("pointer-events-none");
    overlay.classList.remove("opacity-100");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("overflow-hidden");
  }

  btn.addEventListener("click", open);
  overlay.addEventListener("click", close);
  closeBtn && closeBtn.addEventListener("click", close);

  drawer.querySelectorAll("[data-mobile-nav]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();