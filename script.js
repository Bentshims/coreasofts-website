// FAQ accordion
const faqItems = document.querySelectorAll("[data-faq]");
faqItems.forEach((item) => {
  const iconWrapper = item.querySelector("span");
  const icon = item.querySelector("i");
  const content = item.querySelector("div.mt-3");

  item.addEventListener("click", () => {
    const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";

    faqItems.forEach((el) => {
      const elContent = el.querySelector("div.mt-3");
      const elIcon = el.querySelector("i");
      elContent.style.maxHeight = null;
      el.querySelector("span").style.transform = "rotate(0deg)";
      elIcon.className = "bi bi-arrow-up-right";
    });

    if (!isOpen) {
      content.style.maxHeight = content.scrollHeight + "px";
      iconWrapper.style.transform = "rotate(0deg)";
      icon.className = "bi bi-arrow-down";
    }
  });
});

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

// i18n:  tranduction automatique


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
      htmlEl.setAttribute("lang", lang);
      localStorage.setItem(STORAGE_KEY, lang);
      if (langCurrentLabel) langCurrentLabel.textContent = lang.toUpperCase();
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

  // Initialisation
  const initial = detectInitialLang();
  setLanguage(initial);
  setupMenuInteractions();
})();