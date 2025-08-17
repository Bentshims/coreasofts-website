
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

  // Ouvrir la première question par défaut
  const firstItem = faqItems[0];
  if (firstItem) {
    firstItem.classList.add("faq-open");
    const firstContent = firstItem.querySelector(".faq-content");
    if (firstContent) firstContent.style.maxHeight = firstContent.scrollHeight + "px";
  }
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
  const modalOverlay = document.getElementById("modalOverlay");
  const modalIcon = document.getElementById("modalIcon");
  const modalMessage = document.getElementById("modalMessage");
  const modalClose = document.getElementById("modalClose");

  const metaKey = document.querySelector('meta[name="emailjs-public-key"]');
  const PUBLIC_KEY = metaKey && metaKey.getAttribute("content") ? metaKey.getAttribute("content") : "";
  if (window.emailjs && typeof emailjs.init === "function" && PUBLIC_KEY) {
    emailjs.init({ publicKey: PUBLIC_KEY });
  }

  function showModal(message, isError) {
    if (!modalOverlay || !modalMessage || !modalIcon) return;
    modalMessage.textContent = message;
    modalIcon.innerHTML = isError
      ? '<i class="bi bi-x-circle-fill text-red-600"></i>'
      : '<i class="bi bi-check-circle-fill text-green-600"></i>';
      
    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("flex");
  }

  function hideModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("flex");
  }

  function setButtonLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.dataset.loading = isLoading ? "true" : "false";
    submitBtn.disabled = !!isLoading;
    submitBtn.classList.toggle("opacity-70", !!isLoading);
    submitBtn.classList.toggle("cursor-not-allowed", !!isLoading);
  }

  // Validation en temps réel
  function initRealTimeValidation() {
    const fields = {
      name: {
        element: form.querySelector('#name'),
        validate: (value) => {
          if (!value || !value.trim()) return 'Le nom est requis';
          if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
          if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Le nom ne doit contenir que des lettres';
          return null;
        }
      },
      email: {
        element: form.querySelector('#email'),
        validate: (value) => {
          if (!value || !value.trim()) return 'L\'email est requis';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) return 'Veuillez entrer un email valide';
          return null;
        }
      },
      subject: {
        element: form.querySelector('#subject'),
        validate: (value) => {
          if (!value || !value.trim()) return 'Le sujet est requis';
          if (value.trim().length < 5) return 'Le sujet doit contenir au moins 5 caractères';
          if (value.trim().length > 100) return 'Le sujet ne doit pas dépasser 100 caractères';
          return null;
        }
      },
      message: {
        element: form.querySelector('#message'),
        validate: (value) => {
          if (!value || !value.trim()) return 'Le message est requis';
          if (value.trim().length < 10) return 'Le message doit contenir au moins 10 caractères';
          if (value.trim().length > 1000) return 'Le message ne doit pas dépasser 1000 caractères';
          return null;
        }
      }
    };

    // Fonction pour afficher/masquer les messages d'erreur
    function showFieldError(fieldName, message) {
      const field = fields[fieldName];
      if (!field || !field.element) return;

      // Supprimer l'ancien message d'erreur s'il existe
      const existingError = field.element.parentNode.querySelector('.field-error');
      if (existingError) existingError.remove();

      // Ajouter le nouveau message d'erreur
      if (message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-xs mt-1';
        errorDiv.textContent = message;
        field.element.parentNode.appendChild(errorDiv);
        field.element.classList.add('ring-2', 'ring-red-500');
        field.element.classList.remove('ring-2', 'ring-green-500');
      } else {
        field.element.classList.remove('ring-2', 'ring-red-500');
        field.element.classList.add('ring-2', 'ring-green-500');
      }
    }

    // Fonction pour valider un champ
    function validateField(fieldName) {
      const field = fields[fieldName];
      if (!field || !field.element) return;

      const value = field.element.value;
      const error = field.validate(value);
      showFieldError(fieldName, error);
      return !error;
    }

    // Ajouter les événements de validation en temps réel
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      if (!field || !field.element) return;

      // Validation lors de la saisie
      field.element.addEventListener('input', () => {
        validateField(fieldName);
      });

      // Validation lors de la perte de focus
      field.element.addEventListener('blur', () => {
        validateField(fieldName);
      });

      // Validation lors du focus (supprimer l'erreur si le champ est vide)
      field.element.addEventListener('focus', () => {
        if (!field.element.value.trim()) {
          showFieldError(fieldName, null);
          field.element.classList.remove('ring-2', 'ring-red-500', 'ring-green-500');
        }
      });
    });

    // Retourner la fonction de validation globale
    return function validateAllFields() {
      let allValid = true;
      Object.keys(fields).forEach(fieldName => {
        if (!validateField(fieldName)) {
          allValid = false;
        }
      });
      return allValid;
    };
  }

  // Initialiser la validation en temps réel
  const validateAllFields = initRealTimeValidation();

  function validateRequiredFields() {
    return validateAllFields();
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
      if (!validateRequiredFields()) {
        const msg = t(
          "contact.form.status.invalid",
          currentLang === "en"
            ? "Please fill in all required fields."
            : "Veuillez remplir tous les champs obligatoires."
        );
        showModal(msg, true);
        return;
      }

      if (!window.emailjs) throw new Error("EmailJS not loaded");

      setButtonLoading(true);

      const formData = new FormData(form);
      const templateParams = {
        name: formData.get("name") ,
        email: formData.get("email") ,
        subject: formData.get("subject") ,
        message: formData.get("message") ,
      };

      // IDs de corea
      const SERVICE_ID = "service_m3q0p4q";
      const TEMPLATE_ID = "template_z7kbbpk";

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY ? { publicKey: PUBLIC_KEY } : undefined);

      const successMsg = t(
        "contact.form.status.success",
        currentLang === "en"
          ? "Your message has been sent successfully. We will get back to you soon."
          : "Votre message a été envoyé avec succès. Nous vous reviendrons rapidement."
      );
      showModal(successMsg, false);
      form.reset();
    } catch (err) {
      console.error(err);
      const errorMsg = t(
        "contact.form.status.error",
        currentLang === "en"
          ? "An error occurred while sending your message. Please try again later."
          : "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard."
      );
      showModal(errorMsg, true);
    } finally {
      setButtonLoading(false);
    }
  }

  form.addEventListener("submit", handleSubmit);
  modalClose && modalClose.addEventListener('click', hideModal);
  modalOverlay && modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });
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
    if (Math.abs(delta) < threshold) {
      lastY = currentY;
      ticking = false;
      return;
    }
    if (currentY <= 0) {
      header.style.transform = "translateY(0)";
      if (showTimeoutId) { clearTimeout(showTimeoutId); showTimeoutId = null; }
    } else if (delta > 0) {
      // Scroll down: hide header
      header.style.transform = "translateY(-100%)";
      if (showTimeoutId) clearTimeout(showTimeoutId);
    } else {
      // Scroll up: show header
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

//Section Services: effet swap au survol/touch entre la carte principale et la carte survolée
(function initServiceCardsHoverSwap() {
  const cards = Array.from(document.querySelectorAll('[data-service-card]'));
  if (!cards.length) return;
  const master = cards[0];

  function setActive(card) {
    card.classList.add('bg-primary');
    card.classList.remove('bg-white');
    card.classList.remove('text-white');
    const title = card.querySelector('h3');
    if (title) {
      title.classList.add('text-white');
      title.classList.remove('text-black');
    }
    card.querySelectorAll('[data-service-icon]').forEach((icon) => {
      icon.classList.add('text-white');
      icon.classList.remove('text-primary');
    });
    card.querySelectorAll('.text-gray-700').forEach((el) => {
      el.classList.add('text-white');
      el.classList.remove('text-gray-700');
    });
  }

  function setInactive(card) {
    card.classList.add('bg-white');
    card.classList.remove('bg-primary');
    card.classList.remove('text-white');
    const title = card.querySelector('h3');
    if (title) {
      title.classList.add('text-black');
      title.classList.remove('text-white');
    }
    card.querySelectorAll('[data-service-icon]').forEach((icon) => {
      icon.classList.add('text-primary');
      icon.classList.remove('text-white');
    });
    card.querySelectorAll('p').forEach((el) => {
      if (!el.classList.contains('text-white')) {
        el.classList.add('text-gray-700');
      } else {
        el.classList.remove('text-white');
        el.classList.add('text-gray-700');
      }
    });
  }

  // Utiliser pointer events pour compatibilité maximale
  cards.slice(1).forEach((card) => {
    function enter() {
      setInactive(master);
      setActive(card);
    }
    function leave() {
      setInactive(card);
      setActive(master);
    }
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    // Fallback pour anciens navigateurs
    card.addEventListener('mouseenter', enter);
    card.addEventListener('mouseleave', leave);
    card.addEventListener('touchstart', enter, { passive: true });
    card.addEventListener('touchend', leave, { passive: true });
    card.addEventListener('touchcancel', leave, { passive: true });
  });
})();

// Navigation smooth scroll pour tous les boutons
(function initSmoothScrollNavigation() {
  // Fonction pour faire défiler vers une section
  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // Fonction pour gérer les clics sur les liens de navigation
  function handleNavigationClick(e) {
    const href = e.target.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const sectionId = href.substring(1);
      scrollToSection(sectionId);
    }
  }

  // Sélectionner tous les liens qui pointent vers des sections
  const navigationLinks = document.querySelectorAll('a[href^="#"]');
  navigationLinks.forEach(link => {
    link.addEventListener('click', handleNavigationClick);
  });

  // Gérer spécifiquement les boutons "Nous contacter"
  const contactButtons = document.querySelectorAll('button, a');
  contactButtons.forEach(button => {
    const text = button.textContent?.toLowerCase() || '';
    if (text.includes('nous contacter') || text.includes('contact')) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('contact');
      });
    }
  });

  // Gérer spécifiquement les boutons "En savoir plus"
  const learnMoreButtons = document.querySelectorAll('a, button, span');
  learnMoreButtons.forEach(element => {
    const text = element.textContent?.toLowerCase() || '';
    if (text.includes('en savoir plus')) {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        // Déterminer vers quelle section faire défiler selon le contexte
        const parentSection = element.closest('section');
        if (parentSection && parentSection.id === 'services') {
          // Si on est dans la section services, faire défiler vers les cartes de services
          const servicesCards = document.querySelector('#services .grid');
          if (servicesCards) {
            servicesCards.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        } else {
          // Par défaut, faire défiler vers la section services
          scrollToSection('services');
        }
      });
    }
  });

  // Gérer spécifiquement les boutons "Nos services"
  const servicesButtons = document.querySelectorAll('a, button');
  servicesButtons.forEach(button => {
    const text = button.textContent?.toLowerCase() || '';
    if (text.includes('nos services') || text.includes('services')) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('services');
      });
    }
  });

  // Ajouter un offset pour compenser le header fixe
  function addScrollOffset() {
    const header = document.getElementById('siteHeader');
    if (header) {
      const headerHeight = header.offsetHeight;
      document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
    }
  }

  // Appeler la fonction au chargement et au redimensionnement
  addScrollOffset();
  window.addEventListener('resize', addScrollOffset);
})();