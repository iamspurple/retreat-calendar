const FAQ_ACCORDION_DURATION_MS = 350;

function initFaqAccordions() {
  const accordions = document.querySelectorAll("details.faq-accordion");

  accordions.forEach((details) => {
    const summary = details.querySelector("summary");
    const content = details.querySelector(".faq-accordion-content");
    if (!summary || !content) return;

    let busy = false;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (busy) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        details.open = !details.open;
        return;
      }

      const clearHeight = () => {
        content.style.height = "";
      };

      const finishAfterMs = (fn) => {
        const t = window.setTimeout(fn, FAQ_ACCORDION_DURATION_MS + 80);
        return () => window.clearTimeout(t);
      };

      if (details.open) {
        busy = true;
        const h = content.scrollHeight;
        content.style.height = `${h}px`;
        content.getBoundingClientRect();
        content.style.height = "0px";

        let cancelFallback = finishAfterMs(() => {
          content.removeEventListener("transitionend", onEnd);
          details.removeAttribute("open");
          clearHeight();
          busy = false;
        });

        function onEnd(ev) {
          if (ev.propertyName !== "height") return;
          content.removeEventListener("transitionend", onEnd);
          cancelFallback();
          details.removeAttribute("open");
          clearHeight();
          busy = false;
        }

        content.addEventListener("transitionend", onEnd);
      } else {
        busy = true;
        details.setAttribute("open", "");
        content.style.height = "0px";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const h = content.scrollHeight;
            content.style.height = `${h}px`;

            let cancelFallback = finishAfterMs(() => {
              content.removeEventListener("transitionend", onEnd);
              content.style.height = "auto";
              busy = false;
            });

            function onEnd(ev) {
              if (ev.propertyName !== "height") return;
              content.removeEventListener("transitionend", onEnd);
              cancelFallback();
              content.style.height = "auto";
              busy = false;
            }

            content.addEventListener("transitionend", onEnd);
          });
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById("burger");
  burgerBtn.addEventListener("click", () => {
    burgerBtn.classList.toggle("active");
  });

  initFaqAccordions();
});
