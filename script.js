document.querySelectorAll("[data-faq]").forEach(item => {
    const iconWrapper = item.querySelector("span");
    const icon = item.querySelector("i");
    const content = item.querySelector("div.mt-3");

    item.addEventListener("click", () => {
      const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";

      document.querySelectorAll("[data-faq]").forEach(el => {
        el.querySelector("div.mt-3").style.maxHeight = null;
        el.querySelector("span").style.transform = "rotate(0deg)";
        el.querySelector("i").className = "bi bi-arrow-up-right";
      });

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + "px";
        iconWrapper.style.transform = "rotate(0deg)";
        icon.className = "bi bi-arrow-down";
      }
    });

    function animateCarousel(id, direction = "left", speed = 0.5) {
      const carousel = document.getElementById(id);
      let scrollAmount = 0;

      function step() {
        scrollAmount += speed * (direction === "left" ? 1 : -1);
        if (direction === "left") {
          if (scrollAmount >= carousel.scrollWidth / 2) scrollAmount = 0;
        } else {
          if (scrollAmount <= 0) scrollAmount = carousel.scrollWidth / 2;
        }
        carousel.scrollLeft = scrollAmount;
        requestAnimationFrame(step);
      }
      step();
    }

    animateCarousel("carousel1", "left", 0.5);
    animateCarousel("carousel2", "right", 0.5);

})    