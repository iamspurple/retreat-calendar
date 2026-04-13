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

function getFixedHeaderAnchorOffsetPx() {
  const header = document.querySelector(".header");
  if (!header) return 0;
  const { position } = getComputedStyle(header);
  if (position !== "fixed" && position !== "sticky") return 0;
  return Math.round(header.getBoundingClientRect().height) + 10;
}

function alignDocumentToLocationHash() {
  const { hash } = window.location;
  if (!hash || hash === "#") return;
  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    id = hash.slice(1);
  }
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;

  const burger = document.getElementById("burger");
  if (burger) burger.classList.remove("active");

  const offset = getFixedHeaderAnchorOffsetPx();
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}

function scheduleAlignDocumentToHash() {
  alignDocumentToLocationHash();
  requestAnimationFrame(() => {
    alignDocumentToLocationHash();
    requestAnimationFrame(alignDocumentToLocationHash);
  });
  window.setTimeout(alignDocumentToLocationHash, 150);
}

function initHashScrollAlignment() {
  scheduleAlignDocumentToHash();
  window.addEventListener("hashchange", scheduleAlignDocumentToHash);
  window.addEventListener("load", scheduleAlignDocumentToHash);
  window.addEventListener("pageshow", (ev) => {
    if (ev.persisted) scheduleAlignDocumentToHash();
  });
}

function initModalControls() {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");
  if (!overlay || !modal) return;

  const setOpen = (open) => {
    overlay.classList.toggle("is-open", open);
    modal.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  setOpen(false);

  document.querySelectorAll(".open-modal").forEach((btn) => {
    btn.addEventListener("click", () => setOpen(true));
  });

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => setOpen(false));
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) setOpen(false);
  });

  const onKeydown = (e) => {
    if (e.key !== "Escape") return;
    if (!modal.classList.contains("is-open")) return;
    setOpen(false);
  };
  document.addEventListener("keydown", onKeydown);
}

document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.getElementById("burger");
  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      burgerBtn.classList.toggle("active");
    });
  }

  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const button = e.target.querySelector(".submit");
      const originalText = button.textContent;
      const successMessage = button.dataset.successMessage;

      // Показываем состояние загрузки

      button.disabled = true;

      try {
        await console.log("sent!");

        // Меняем на успешное сообщение
        button.textContent = successMessage;

        // Возвращаем исходное состояние
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      } catch (error) {
        button.textContent = "Ошибка!";
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }
    });
  });

  initFaqAccordions();
  initModalControls();
  initHashScrollAlignment();
});
