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

})    