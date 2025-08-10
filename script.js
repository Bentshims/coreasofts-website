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